# Order Taking: conservative refinement

Scope: `/order-taking-app` only. Salesman Tracking is unchanged. Draft for review; not a production release.

## Search Console evidence
Latest 28-day page comparison: 78 clicks versus 57; 4,079 impressions versus 4,514; CTR 1.91% versus 1.26%; average position 6.44 versus 7.16. This supports retaining the existing search positioning and making targeted improvements.

Three-month clean and .html URLs combined: 216 clicks versus 133. Six-month combined: 349 versus 430. The different URL variants reflect a migration; do not interpret one variant in isolation. Queries in the export are sitewide, not page-filtered. They do not establish which page received a query or prove cannibalization. Duplicate ZIP exports were not counted as independent datasets.

Preserve the primary order-taking app/salesman intent. Do not reposition this as parcel/order-status tracking.

## Current content and competitors
Reviewed the current main-domain page at https://saleson.co.in/order-taking-app and primary competitor pages https://distributo.com/salesman-order-app and https://bizom.com/order-management/ . The category emphasizes catalogue search, products/units, prices, schemes, order review and office handover. Competitor capabilities are not evidence that SalesOn supports those capabilities.

## Preserved
Exact title, H1 and meta description; canonical/hreflang and URL; existing section order and anchor IDs; shared header/footer; core catalogue, customer pricing, schemes, credit context, confirmation and office handover story. No route or sitemap changes. Index/follow retained.

## Targeted changes
Two source-based enhanced WebP product details in the existing image positions, with accurate captions and accessible enlargement. Original captures retained. Larger supporting text and local image scrolling keep details readable. Demo arithmetic corrected: 12 × ₹165 + 6 × ₹178 − ₹120 = ₹2,928. Illustrative demos labelled as samples. Unsupported speed/accuracy guarantees and inconsistent commercial promises removed. Added internet-required and paid-product/free-trial FAQ answers with matching structured data.

The page links to invoicing, DMS, tracking, field sales and Tally for specialist workflows instead of expanding those topics here. Natural shared vocabulary remains.

## Screenshot provenance
The source images `assets/img/item-dtls.webp` and `rep-info.webp` were verified publicly available on the existing Vercel site (HTTP 200) and byte-identical to the repository originals. SHA-256 respectively: d86bd7f5cfe20252bc1abc05cff0aa205c98624db19b1c34cea2a559f82139cd and a9f5f7bb4b812cf680bc99425f08cbbc108b0dc01d11d25048e107c75dbc9346. New images are enhanced recreations/excerpts of those public marketing examples, not new live product captures.

## Validation
Full npm check passes, including title/H1/anchor conservation, local references, schema, shared shell, indexability and example arithmetic. Desktop and 390px iframe inspected in browser; document width equals viewport width. FAQ open state verified. Screenshot enlargement and the standalone preview were verified in-browser. No ranking guarantee; monitor page-level GSC after a separately approved release. Vercel is separate from saleson.co.in, whose canonical hosting also needs the approved version deployed.

## Visual family and repetition follow-up — 28 October 2026
Based on production main 502c351. Removed the Quick Answers section whose first three answers duplicated the retained FAQ, the repeated capability proof strip, stacked hero badges and pulse message, the repeated trust strip and screenshot capability chips. No core catalogue, pricing/scheme, confirmation or customer-context section was removed. Industry content, plan information and all seven FAQs remain. The general approved client-logo band replaces the repeated business-count treatment.

Order Taking opts into the same existing feature-family.css as Attendance and Collection, with page-scoped adapters in order-taking-refinement.css. Typography, colours, buttons, cards, FAQ and final CTA follow the approved Tracking visual style; the two-column hero and existing product illustrations remain. The shared CSS source and all other feature pages are unchanged.

Exact title, H1 text/markup, meta description, canonical URL and section-anchor sequence are conserved. Full npm check passes, including sample arithmetic and index/follow metadata. Updated standalone preview embeds all product images and logos. Final browser visual verification remains unavailable following the earlier browser URL-policy block; do not claim that this last styling pass has been visually certified. Review draft only; not published.
