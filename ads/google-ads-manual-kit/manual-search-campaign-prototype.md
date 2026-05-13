# Promotions Studio Manual Search Campaign

## Goal

Acquire qualified Shopify merchants who are actively looking for:

- `scheduled discounts`
- `product badges`
- `compare-at price visibility`

Primary path:

- landing page

Secondary path:

- Shopify App Store install

Recommended launch phase:

1. `EN Search` first
2. `IT Search` second
3. `Product Feedback Search` only after first qualified clicks
4. `Social Proof Search` only after listing and screenshot alignment
5. `Brand Search` after first data

## Recommended campaign structure

### Campaign 1

- Name: `PS | Search | EN | Core | Subs`
- Goal: `Sales` or `Website traffic`
- Type: `Search`
- Final URL: `https://promotions-studio-landing.quarkteam00.workers.dev/index-en.html`
- Networks:
  - Google Search: `On`
  - Search partners: `Off` at launch
  - Display Network / Display Expansion: `Off`
- Locations:
  - `United States`
  - `United Kingdom`
  - `Canada`
  - `Australia`
- Languages:
  - `English`
- Location option:
  - prefer `Presence` if available: reach people in or regularly in targeted locations
- Bidding:
  - if conversion tracking is active: `Maximize conversions`
  - if conversion tracking is not active yet: `Maximize clicks` with a cautious max CPC
- Budget:
  - starting range: `20-35 USD/day`

Ad groups:

1. `Discounts & Badges`
2. `Product Feedback` only if the core ad group already shows qualified traffic

### Campaign 2

- Name: `PS | Search | IT | Core | Subs`
- Goal: `Sales` or `Website traffic`
- Type: `Search`
- Final URL: `https://promotions-studio-landing.quarkteam00.workers.dev/`
- Networks:
  - Google Search: `On`
  - Search partners: `Off`
  - Display Network / Display Expansion: `Off`
- Locations:
  - `Italy`
- Languages:
  - `Italian`
- Location option:
  - prefer `Presence`
- Bidding:
  - if conversion tracking is active: `Maximize conversions`
  - if conversion tracking is not active yet: `Maximize clicks`
- Budget:
  - starting range: `10-20 USD/day`

Ad groups:

1. `Sconti & Badge`
2. `Feedback Prodotto` solo dopo i primi segnali positivi dal gruppo core

### Campaign 3

- Name: `PS | Search | Brand | All`
- Use only after launch
- Budget: `5-10 USD/day`
- Keywords:
  - `[promotions studio]`
  - `[quark promotions studio]`
  - `"promotions studio shopify"`

## Keyword strategy

Start tight. Use `exact` and `phrase` first.

Recommended rule:

- exact match for the highest-intent keywords
- phrase match for adjacent discovery
- do not start with broad match unless conversion tracking is solid
- do not lead with `instagram feed app` style intent while the acquisition wedge is promotions-first

Google officially recommends starting with exact match for the most control, then expanding with phrase and broad after performance evidence.

## Conversion setup before launch

Minimum acceptable setup:

1. Google Ads conversion on install CTA click from the landing
2. secondary conversions:
   - pricing CTA click
   - 75 percent scroll
   - FAQ engagement
3. if possible later:
   - real Shopify install or subscription import

If conversion tracking is not active yet, launch with lower budgets and click-based bidding first.

## Listing alignment before scale

Before scaling spend, align the live Shopify listing with the traffic you are buying:

1. use `Promotions Studio` as the app name wherever editable
2. lead the first fold with `scheduled discounts + custom product badges`
3. keep `Product Feedback` and `Meta Social Carousel` as supporting modules
4. fix the `Instagam` typo in the live body copy
5. keep the campaign dashboard and discount visibility screenshots first

## Manual build checklist in Google Ads

1. Open `https://ads.google.com/aw/campaigns/new`
2. Choose `Sales` or `Website traffic`
3. Choose `Search`
4. Enter the landing URL
5. Disable `Search partners` at launch
6. Disable `Display Network` / `Display Expansion`
7. Set country and language
8. Set location option to `Presence` if the UI allows it
9. Choose bidding:
   - `Maximize conversions` only if real conversion tracking is configured
   - otherwise `Maximize clicks`
10. Create the ad groups from this file
11. Paste keywords from the txt files
12. Add the negative keywords list
13. Create at least one responsive search ad per ad group
14. Aim for `Good` or `Excellent` ad strength
15. Publish

## Budget model

Conservative launch:

- EN Core: `20 USD/day`
- IT Core: `10 USD/day`
- Brand: `5 USD/day`

Faster data launch:

- EN Core: `35 USD/day`
- IT Core: `15 USD/day`
- Brand: `5 USD/day`

## Bidding guidance

If no stable conversion signal exists yet:

- use `Maximize clicks`
- set a conservative max CPC if Google offers the option

If conversion signal exists:

- use `Maximize conversions`
- do not set target CPA on day 1
- only add target CPA after enough conversion volume

## Landing page assignment

Use language-matched destinations:

- EN traffic -> `/index-en.html`
- IT traffic -> `/`

Replace the `quarkteam00.workers.dev` URLs with `promotions-studio.art` once the Cloudflare Pages custom domain is active.

## What not to do on day 1

- do not mix EN and IT in one campaign
- do not enable Display expansion
- do not enable Search partners before you have data
- do not start with broad match on all keywords
- do not use generic terms like `marketing app` or `conversion app`
- do not lead with `Instagram feed` positioning before discounts and badges prove they can convert

## Review cadence

After launch:

1. review search terms after `3-4` days
2. add negatives aggressively, especially when terms drift into Shopify-native tools like `Email`, `Inbox`, `Flow`, `Forms`, `Bundles` or `Collabs`
3. pause keywords with cost and no quality traffic
4. split winners into their own ad groups if needed
5. only scale budget after valid conversion evidence

## Official references

- Create a Search campaign: https://support.google.com/google-ads/answer/9510373
- Keyword match types: https://support.google.com/google-ads/answer/7478529
- Build keyword lists: https://support.google.com/google-ads/answer/10039665
- Choose location and language settings: https://support.google.com/google-ads/answer/1722072
- Advanced location options: https://support.google.com/google-ads/answer/1722038
- Use Keyword Planner: https://support.google.com/google-ads/answer/7337243
- Set up web conversions: https://support.google.com/google-ads/answer/9119707
- Set up conversions manually: https://support.google.com/google-ads/answer/12718882
- Primary vs secondary conversions: https://support.google.com/google-ads/answer/11461796
- Maximize conversions bidding: https://support.google.com/google-ads/answer/7381968
- Create effective Search ads: https://support.google.com/google-ads/answer/6167122
- Create effective responsive search ads: https://support.google.com/google-ads/answer/10530456
