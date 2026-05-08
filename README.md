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

## Notes

- Real screenshots used in the landing are stored in `assets/real/`
- Pricing and feature copy were aligned with the live Shopify listing and verified app implementation
