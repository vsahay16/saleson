# Deploying the website fixes

Start with REPOSITORY_COMPLETION.md for the latest changes and outstanding acceptance checks.

The deployable public website is this `saleson/` directory. The parent repository is also home to the distributor application; deploy the website separately.

1. Back up the current website and server configuration.
2. Deploy the complete contents of `saleson/`, including `.htaccess`, generated fingerprinted assets, `assets-manifest.json`, and the sitemap. Keep source assets alongside fingerprinted copies.
3. Apache 2.4 is assumed by `.htaccess` (`mod_rewrite`, `mod_dir`, `AllowOverride` for the directives used here). Headers and compression require the corresponding modules. Ensure HTTPS is correctly exposed to Apache behind any reverse proxy. These server rules were not executed in this environment.
4. Use valid TLS for both the bare domain and www host, then check the www path-preserving redirect. DNS, certificate and blog-origin work requires hosting access.
5. Verify the checks below against staging, then production. Do not declare routing tasks complete until real HTTP responses pass.

## Build and offline checks

The eight feature pages, shared components and mobile hero layouts are documented in FEATURE_INTEGRATION.md.

The website is static and the supplied assets can be served directly. The offline checks use Python 3 and Node built-ins and need no dependency install. Run `npm run check` for the complete suite. The core commands are:

```bash
python3 scripts/prepare-assets.py
python3 scripts/check-website.py
node scripts/check-pricing.cjs
python3 scripts/check-feature-pages.py
node scripts/check-feature-behaviour.cjs
```

When using the existing npm minifier workflow, install its declared dependencies with your normal process and run `npm run build`. The build now fingerprints referenced assets after minification and regenerates the sitemap. Do not deploy a `clean` output before rebuilding. The npm build was not run here because its dependencies are not installed.

## Live HTTP checks

- `/` returns 200 and declares `https://saleson.co.in/` as canonical.
- `/index`, `/index.html` and `www` variants redirect directly to the canonical destination. A nested legacy `.html` URL redirects to its extensionless equivalent.
- `/pricing/in` redirects to `/pricing`; `/pricing/us` is directly accessible with USD copy, canonical and offers.
- `/tools`, a tool URL, and their slash variants resolve to the same final extensionless routes.
- Random missing page and asset requests return 404 at the requested URL. `/404` returns 404. The error document must not be converted into a redirect to a 200 page.
- `/payment-collection` and `/inventory-management` return 200 and link to the demo.
- Referenced JS/CSS and their fonts/images return 200 with correct content types, not error HTML.
- HTML and unversioned assets revalidate; filenames containing a 12-character content hash receive long immutable caching. Check gzip after deployment.

## Human and account checks

Check at 360, 390 and 768px, with keyboard navigation and browser zoom. Confirm dropdowns, mobile drawer focus, tables, forms, pricing toggles, tool exports and CTA visibility. Browser verification could not run here: the browser binary is absent and its download failed.

Complete one sanctioned signup and one real test booking, verify required fields and CRM receipt, then remove or identify test records. The 30-minute demo wording follows the existing zcal meeting label; sales should confirm that this remains the intended duration. A direct calendar fallback is included.

Analytics events now distinguish tool opening, local lead storage, and a successful HTTP response from the configured backend; none is a completed booking or trial conversion. Confirm the backend's actual success contract, deduplication and CRM linkage before treating an accepted submission as a qualified lead. Configure booking/trial completion events in their own systems and test cross-domain attribution with analytics/CRM access. Do not add personal data to analytics parameters.

The refund policy's legal terms were retained. Commercial summaries now defer to that policy rather than inventing a new eligibility rule. The owner must still review the policy's conflicting phone/WhatsApp instructions, subscription terms, taxes, seat changes, plan entitlements and privacy scope.
