#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const REQUIRED_SCOPE = "https://www.googleapis.com/auth/adwords";
const DEFAULT_API_VERSION = "v24";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configPath = path.resolve(
    process.cwd(),
    args.config || "google-ads-campaign-config.json",
  );
  const configDir = path.dirname(configPath);
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  const runtime = normalizeConfig(config, configDir, args);

  validateConfig(runtime);

  const serviceAccount = JSON.parse(
    await fs.readFile(runtime.serviceAccountKeyPath, "utf8"),
  );

  const accessToken = await fetchAccessToken(serviceAccount);
  const context = {
    accessToken,
    apiVersion: runtime.apiVersion,
    customerId: normalizeCustomerId(runtime.customerId),
    developerToken: runtime.developerToken.trim(),
    loginCustomerId: runtime.loginCustomerId
      ? normalizeCustomerId(runtime.loginCustomerId)
      : null,
  };

  const languageCache = new Map();
  const countryCache = new Map();

  for (const campaign of runtime.campaigns) {
    const resolvedLanguages = [];
    const resolvedCountries = [];

    for (const code of campaign.languages) {
      resolvedLanguages.push(
        await resolveLanguageConstant(context, languageCache, code),
      );
    }

    for (const countryName of campaign.countries) {
      resolvedCountries.push(
        await resolveCountryConstant(context, countryCache, countryName),
      );
    }

    if (runtime.dryRun) {
      printDryRun(campaign, resolvedLanguages, resolvedCountries);
      continue;
    }

    const budgetResourceName = await createCampaignBudget(context, campaign);
    const campaignResourceName = await createCampaign(
      context,
      campaign,
      budgetResourceName,
    );

    await attachCampaignCriteria(
      context,
      campaignResourceName,
      resolvedLanguages,
      resolvedCountries,
      campaign.negativeKeywords,
    );

    for (const adGroup of campaign.adGroups) {
      const adGroupResourceName = await createAdGroup(
        context,
        campaignResourceName,
        adGroup,
      );

      await createKeywords(context, adGroupResourceName, adGroup.keywords);
      await createResponsiveSearchAd(
        context,
        adGroupResourceName,
        campaign.landingPageUrl,
        adGroup.ad || campaign.defaultAd,
      );
    }

    console.log(`Created campaign ${campaign.name}`);
    console.log(`  Budget: ${budgetResourceName}`);
    console.log(`  Campaign: ${campaignResourceName}`);
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--config" && argv[index + 1]) {
      parsed.config = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--execute") {
      parsed.execute = true;
      continue;
    }
    if (token === "--dry-run") {
      parsed.dryRun = true;
    }
  }

  return parsed;
}

function normalizeConfig(config, configDir, args) {
  return {
    apiVersion: config.apiVersion || DEFAULT_API_VERSION,
    developerToken: config.developerToken,
    customerId: config.customerId,
    loginCustomerId: config.loginCustomerId,
    serviceAccountKeyPath: path.resolve(
      configDir,
      config.serviceAccountKeyPath || "./google-ads-service-account.json",
    ),
    dryRun: args.execute ? false : args.dryRun ? true : Boolean(config.dryRun),
    campaigns: config.campaigns || [],
  };
}

function validateConfig(config) {
  const missing = [];
  if (!config.developerToken) {
    missing.push("developerToken");
  }
  if (!config.customerId) {
    missing.push("customerId");
  }
  if (!config.serviceAccountKeyPath) {
    missing.push("serviceAccountKeyPath");
  }
  if (!Array.isArray(config.campaigns) || config.campaigns.length === 0) {
    missing.push("campaigns");
  }
  if (missing.length > 0) {
    throw new Error(`Missing config fields: ${missing.join(", ")}`);
  }

  for (const campaign of config.campaigns) {
    const ad = campaign.defaultAd || {};
    if (!campaign.name) {
      throw new Error("Each campaign needs a name");
    }
    if (!campaign.landingPageUrl) {
      throw new Error(`Campaign ${campaign.name} is missing landingPageUrl`);
    }
    if (!Array.isArray(campaign.countries) || campaign.countries.length === 0) {
      throw new Error(`Campaign ${campaign.name} needs at least one country`);
    }
    if (!Array.isArray(campaign.languages) || campaign.languages.length === 0) {
      throw new Error(`Campaign ${campaign.name} needs at least one language`);
    }
    if (!Array.isArray(campaign.adGroups) || campaign.adGroups.length === 0) {
      throw new Error(`Campaign ${campaign.name} needs at least one ad group`);
    }
    if (!Number.isFinite(Number(campaign.dailyBudget))) {
      throw new Error(`Campaign ${campaign.name} needs a numeric dailyBudget`);
    }
    validateAdPayload(campaign.name, ad);
    for (const adGroup of campaign.adGroups) {
      if (!adGroup.name) {
        throw new Error(`Campaign ${campaign.name} has an ad group without name`);
      }
      if (!Array.isArray(adGroup.keywords) || adGroup.keywords.length === 0) {
        throw new Error(
          `Ad group ${adGroup.name} in ${campaign.name} needs keywords`,
        );
      }
      if (adGroup.ad) {
        validateAdPayload(`${campaign.name} / ${adGroup.name}`, adGroup.ad);
      }
    }
  }
}

function validateAdPayload(label, ad) {
  if (!Array.isArray(ad.headlines) || ad.headlines.length < 3) {
    throw new Error(`${label} needs at least 3 headlines`);
  }
  if (!Array.isArray(ad.descriptions) || ad.descriptions.length < 2) {
    throw new Error(`${label} needs at least 2 descriptions`);
  }
}

async function fetchAccessToken(serviceAccount) {
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error(
      "Service account JSON must include client_email and private_key",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = [
    base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64UrlEncode(
      JSON.stringify({
        iss: serviceAccount.client_email,
        scope: REQUIRED_SCOPE,
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
      }),
    ),
  ].join(".");

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsignedToken)
    .end()
    .sign(serviceAccount.private_key);

  const assertion = `${unsignedToken}.${base64UrlEncode(signature)}`;
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Failed to obtain OAuth token: ${JSON.stringify(payload, null, 2)}`,
    );
  }

  return payload.access_token;
}

async function resolveLanguageConstant(context, cache, code) {
  const key = code.trim().toLowerCase();
  if (cache.has(key)) {
    return cache.get(key);
  }

  const query = [
    "SELECT language_constant.resource_name, language_constant.code",
    "FROM language_constant",
    `WHERE language_constant.code = '${escapeGaqlString(key)}'`,
    "LIMIT 1",
  ].join(" ");

  const rows = await search(context, query);
  const row = rows[0];
  const resourceName =
    row?.languageConstant?.resourceName ||
    row?.language_constant?.resource_name;

  if (!resourceName) {
    throw new Error(`Language constant not found for code "${code}"`);
  }

  const resolved = { code: key, resourceName };
  cache.set(key, resolved);
  return resolved;
}

async function resolveCountryConstant(context, cache, countryName) {
  const key = countryName.trim().toLowerCase();
  if (cache.has(key)) {
    return cache.get(key);
  }

  const query = [
    "SELECT geo_target_constant.resource_name, geo_target_constant.name",
    "FROM geo_target_constant",
    `WHERE geo_target_constant.name = '${escapeGaqlString(countryName)}'`,
    "AND geo_target_constant.target_type = 'Country'",
    "AND geo_target_constant.status = 'ENABLED'",
    "LIMIT 1",
  ].join(" ");

  const rows = await search(context, query);
  const row = rows[0];
  const resourceName =
    row?.geoTargetConstant?.resourceName ||
    row?.geo_target_constant?.resource_name;

  if (!resourceName) {
    throw new Error(`Country constant not found for "${countryName}"`);
  }

  const resolved = { name: countryName, resourceName };
  cache.set(key, resolved);
  return resolved;
}

async function search(context, query) {
  const payload = await googleAdsRequest(context, {
    path: `/customers/${context.customerId}/googleAds:search`,
    body: { query, pageSize: 1000 },
  });
  return payload.results || [];
}

async function createCampaignBudget(context, campaign) {
  const response = await googleAdsRequest(context, {
    path: `/customers/${context.customerId}/campaignBudgets:mutate`,
    body: {
      operations: [
        {
          create: {
            name: `${campaign.name} | Budget | ${timestampSuffix()}`,
            amountMicros: String(toMicros(campaign.dailyBudget)),
            deliveryMethod: "STANDARD",
            explicitlyShared: false,
          },
        },
      ],
    },
  });

  return firstResourceName(response, "budget");
}

async function createCampaign(context, campaign, budgetResourceName) {
  const response = await googleAdsRequest(context, {
    path: `/customers/${context.customerId}/campaigns:mutate`,
    body: {
      operations: [
        {
          create: {
            name: campaign.name,
            status: "PAUSED",
            advertisingChannelType: "SEARCH",
            campaignBudget: budgetResourceName,
            networkSettings: {
              targetGoogleSearch: true,
              targetSearchNetwork: true,
              targetContentNetwork: false,
              targetPartnerSearchNetwork: false,
            },
            containsEuPoliticalAdvertising:
              "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            startDate: tomorrowDateString(),
            ...buildBiddingStrategy(campaign.bidding),
          },
        },
      ],
    },
  });

  return firstResourceName(response, "campaign");
}

function buildBiddingStrategy(bidding = {}) {
  switch ((bidding.type || "MAXIMIZE_CONVERSIONS").toUpperCase()) {
    case "MANUAL_CPC":
      return { manualCpc: {} };
    case "TARGET_CPA":
      if (!Number.isFinite(Number(bidding.targetCpa))) {
        throw new Error("TARGET_CPA bidding requires targetCpa in account currency");
      }
      return {
        targetCpa: {
          targetCpaMicros: String(toMicros(bidding.targetCpa)),
        },
      };
    case "MAXIMIZE_CONVERSIONS":
    default:
      return { maximizeConversions: {} };
  }
}

async function attachCampaignCriteria(
  context,
  campaignResourceName,
  languages,
  countries,
  negativeKeywords = [],
) {
  const operations = [];

  for (const country of countries) {
    operations.push({
      create: {
        campaign: campaignResourceName,
        negative: false,
        location: {
          geoTargetConstant: country.resourceName,
        },
      },
    });
  }

  for (const language of languages) {
    operations.push({
      create: {
        campaign: campaignResourceName,
        negative: false,
        language: {
          languageConstant: language.resourceName,
        },
      },
    });
  }

  for (const keywordText of negativeKeywords) {
    operations.push({
      create: {
        campaign: campaignResourceName,
        negative: true,
        keyword: {
          text: keywordText,
          matchType: "BROAD",
        },
      },
    });
  }

  if (operations.length === 0) {
    return;
  }

  await googleAdsRequest(context, {
    path: `/customers/${context.customerId}/campaignCriteria:mutate`,
    body: { operations },
  });
}

async function createAdGroup(context, campaignResourceName, adGroup) {
  const response = await googleAdsRequest(context, {
    path: `/customers/${context.customerId}/adGroups:mutate`,
    body: {
      operations: [
        {
          create: {
            name: adGroup.name,
            campaign: campaignResourceName,
            status: "ENABLED",
            type: "SEARCH_STANDARD",
          },
        },
      ],
    },
  });

  return firstResourceName(response, "ad group");
}

async function createKeywords(context, adGroupResourceName, keywords) {
  await googleAdsRequest(context, {
    path: `/customers/${context.customerId}/adGroupCriteria:mutate`,
    body: {
      operations: keywords.map((keyword) => ({
        create: {
          adGroup: adGroupResourceName,
          status: "ENABLED",
          keyword: {
            text: keyword.text,
            matchType: (keyword.matchType || "PHRASE").toUpperCase(),
          },
        },
      })),
    },
  });
}

async function createResponsiveSearchAd(
  context,
  adGroupResourceName,
  landingPageUrl,
  ad,
) {
  await googleAdsRequest(context, {
    path: `/customers/${context.customerId}/adGroupAds:mutate`,
    body: {
      operations: [
        {
          create: {
            adGroup: adGroupResourceName,
            status: "PAUSED",
            ad: {
              finalUrls: [landingPageUrl],
              responsiveSearchAd: {
                headlines: ad.headlines.map((text) => ({ text })),
                descriptions: ad.descriptions.map((text) => ({ text })),
              },
            },
          },
        },
      ],
    },
  });
}

async function googleAdsRequest(context, { path: requestPath, body }) {
  const response = await fetch(
    `https://googleads.googleapis.com/${context.apiVersion}${requestPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        "Content-Type": "application/json",
        "developer-token": context.developerToken,
        ...(context.loginCustomerId
          ? { "login-customer-id": context.loginCustomerId }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(formatGoogleAdsError(response.status, payload));
  }

  return payload;
}

function formatGoogleAdsError(status, payload) {
  const messages =
    payload?.error?.details
      ?.flatMap((detail) => detail?.errors || [])
      .map((error) => error?.message)
      .filter(Boolean) || [];

  if (messages.length > 0) {
    return `Google Ads API ${status}: ${messages.join(" | ")}`;
  }

  return `Google Ads API ${status}: ${JSON.stringify(payload, null, 2)}`;
}

function firstResourceName(response, entityLabel) {
  const resourceName = response?.results?.[0]?.resourceName;
  if (!resourceName) {
    throw new Error(`Google Ads did not return a ${entityLabel} resource name`);
  }
  return resourceName;
}

function normalizeCustomerId(value) {
  return String(value).replace(/-/g, "").trim();
}

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function escapeGaqlString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function toMicros(value) {
  return Math.round(Number(value) * 1_000_000);
}

function tomorrowDateString() {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + 1);
  return [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
}

function timestampSuffix() {
  const now = new Date();
  return [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ].join("");
}

function printDryRun(campaign, languages, countries) {
  console.log(`[dry-run] ${campaign.name}`);
  console.log(`  Landing: ${campaign.landingPageUrl}`);
  console.log(`  Budget/day: ${campaign.dailyBudget}`);
  console.log(`  Countries: ${countries.map((item) => item.name).join(", ")}`);
  console.log(`  Languages: ${languages.map((item) => item.code).join(", ")}`);
  console.log(
    `  Ad groups: ${campaign.adGroups.map((item) => item.name).join(", ")}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
