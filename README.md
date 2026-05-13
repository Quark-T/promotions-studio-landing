# Promotions Studio Landing

Landing page for the Shopify app `Promotions Studio`, with:

- Italian version: `index.html`
- English version: `index-en.html`
- Shared styles: `style.css`
- Shared interactions: `script.js`

## Local preview

Open either HTML file directly in the browser:

- `index.html`
- `index-en.html`

## Cloudflare Pages

Recommended settings:

- Framework preset: `None`
- Build command: leave empty
- Build output directory: `/`
- Production branch: `main`

## Tracking setup

Edit `tracking-config.js` and fill the values you need:

- `siteUrl`: final production URL, for example `https://promotions.yourdomain.com`
- `ga4MeasurementId`: for example `G-XXXXXXXXXX`
- `googleAdsId`: for example `AW-123456789`
- `googleAdsConversionLabel`: optional conversion label for install CTA clicks
- `gtmId`: optional Google Tag Manager container, for example `GTM-XXXXXXX`
- `debug`: set to `true` if you want browser console logs while testing

By default the project currently points to:

- `https://promotions-studio-landing.quarkteam00.workers.dev`

If you connect a custom Cloudflare domain, update:

- `tracking-config.js`
- `robots.txt`
- `sitemap.xml`

The landing already supports:

- CTA click tracking
- Google Ads conversion firing on install CTAs
- scroll depth tracking
- FAQ open tracking
- UTM / `gclid` pass-through from the landing URL to Shopify listing links
- IT / EN alternate links
- basic Open Graph / Twitter cards
- Cloudflare Pages `_headers` and `_redirects`

## Google Ads API bootstrap

If you want to create the first Search campaigns via API, the repo now includes:

- `google-ads-campaign-config.example.json`
- `scripts/create-google-ads-search-campaigns.mjs`

Recommended flow:

1. Copy `google-ads-campaign-config.example.json` to `google-ads-campaign-config.json`
2. Add your Google Ads values:
   - `developerToken`
   - `customerId`
   - `loginCustomerId` if you manage the account from an MCC
   - `serviceAccountKeyPath`
3. Put the Google service account JSON key in a local path ignored by git
4. Grant the service account access to the Google Ads account
5. Run a non-destructive check:
   - `node scripts/create-google-ads-search-campaigns.mjs --config google-ads-campaign-config.json --dry-run`
6. Execute the real creation:
   - `node scripts/create-google-ads-search-campaigns.mjs --config google-ads-campaign-config.json --execute`

What the script creates:

- paused Search campaigns
- one budget per campaign
- location and language targeting
- campaign-level negative keywords
- search ad groups
- keyword criteria
- paused responsive search ads

Current example campaigns included in the template:

- `PS | Search | NonBrand | EN | Subs`
- `PS | Search | NonBrand | IT | Subs`

## Notes

- Real screenshots used in the landing are stored in `assets/real/`
- Pricing and feature copy were aligned with the live Shopify listing and verified app implementation
- `scripts/render-social-assets.py` regenerates `assets/social-card.png` and `assets/favicon.png`
