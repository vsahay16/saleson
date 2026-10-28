# Country-based website pricing

India retains INR pricing. Other countries see rounded USD display prices derived from the INR plans; these are fixed commercial rates, not a daily foreign-exchange feed.

| Region | Pro monthly / annual | Enterprise monthly / annual |
| --- | --- | --- |
| India | ₹250 / ₹2,500 | ₹400 / ₹4,000 |
| US, UK, Canada, Australia, New Zealand, Ireland | $6 / $60 | $10 / $100 |
| All other countries | $3 / $30 | $5 / $50 |

Amounts are per user. Minimum 2 users. Taxes extra where applicable. Annual payment buys 12 months for the price of 10 monthly payments.

Vercel's IP-country header routes the same-origin `/api/pricing` request to a small tier JSON response using rewrites in both hosting configurations. No external geolocation API, browser-location permission, location cookie, URL redirect or saved country override is used. The endpoint and its JSON destinations use no-store response headers. No country-specific HTML URLs are created or added to the sitemap.

The shared resolver updates the pricing-page calculator/cards and homepage two-user example from the same pricing configuration. Unknown countries use standard USD. Network, invalid-response or timeout failures also show standard USD with a quote-confirmation notice. Without JavaScript, the pricing page identifies the static figures as India prices and directs international visitors to contact SalesOn.

IP-based country detection can be affected by VPNs and proxies. This change controls website display prices only; it does not alter the authenticated app's checkout or billing backend. Confirm a customer's billing country and agreed currency before charging.

References: https://vercel.com/docs/headers/request-headers and https://vercel.com/docs/project-configuration/vercel-json (country-header conditional rewrites).

Validation: `node scripts/check-regional-pricing.cjs` plus pricing calculator, FAQ/schema and shared-shell checks. Test real country routing on Vercel; local static serving does not supply Vercel's country header.
