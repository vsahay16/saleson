# Single pricing page — review draft

- Based on main 1b6d98f; no separate company/policies, tools or Request Demo draft included.
- One canonical /pricing page, one INR price list. Existing /pricing/in and /pricing/us routes permanently redirect to /pricing. Both old HTML documents also provide canonical/refresh fallbacks, with no noindex.
- Preserve published rates: Pro ₹250/user/month or ₹2,500/user/year; Enterprise ₹400/user/month or ₹4,000/user/year. Annual monthly equivalents are labelled and rounded to two decimals; annual invoices use exact annual prices.
- Two-user paid minimum: Pro from ₹500/month or ₹5,000/year; Enterprise from ₹800/month or ₹8,000/year, before applicable taxes.
- Van sales is Enterprise-only. Cards, table and FAQ agree. Trial described as seven days of Pro features; not a free ongoing plan.
- Structure: plans, calculator, comparison, one FAQ. Remove repeated plan-fit cards, three quick-answer blocks, onboarding timeline, repeated sales reassurance, competitor price chart and broad feature-link section.
- Pricing configuration in assets/js/pricing-config.js drives cards, table, generated FAQ rules/schema and the interactive calculator. scripts/generate-pricing.py runs during prepare-assets. No independent USD configuration remains.
- Header/footer and enhancement code no longer changes pricing destinations based on saved regional preference. Other HTML changes are asset-fingerprint references to these shared components/scripts, not feature-page content edits.
- Calculator clamps seats to integer 2–10,000; lower inputs show minimum-cost explanation and normalize on change. Billing controls sync both ways. Monthly projected twelve-month spending is not described as annual upfront payment.
- GST is excluded from estimates; no unsupported universal international tax/payment claim added.
- Cancellation/refund links point to existing policies; no new refund promise.
- Title revised to avoid an unlabeled rounded annual-equivalent price. H1/category intent and canonical retained. USD URL removed from sitemap and regional hreflang removed from pricing.
- Automated suite passes, including 40 calculator boundaries and UI state/synchronization plus preserved shared navigation under stale USD preferences and blocked storage. Browser visual QA unavailable in this session.
- No publication in this draft. Permanent redirects and sitemap take effect when published to Vercel; separate saleson.co.in hosting requires its own deployment.
