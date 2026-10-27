# Van Sales page review — 28 October 2026

## Search Console evidence

Source: supplied saleson.co.in Performance on Search exports dated 26 October 2026, extracted from the unnumbered, (4) and (8) ZIPs. The twelve ZIPs contain three unique comparison periods; duplicates were not counted again. These are export-relative periods, not dates inferred from the download filename.

| Period | Current period | Previous period |
| --- | --- | --- |
| Last 28 days, /van-sales clicks | 8 | 19 |
| Last 28 days, /van-sales impressions | 760 | 1,290 |
| Last 28 days, /van-sales CTR | 1.05% | 1.47% |
| Last 28 days, /van-sales average position | 6.25 | 6.73 |
| Last 3 months, /van-sales clicks / impressions | 36 / 2,678 | 0 / 48 |
| Last 3 months, /van-sales.html clicks / impressions | 1 / 11 | 46 / 3,658 |
| Last 6 months, /van-sales clicks / impressions | 36 / 2,726 | 0 / 0 |
| Last 6 months, /van-sales.html clicks / impressions | 47 / 3,669 | 68 / 23,123 |

The latest 28-day clicks fell about 58% and impressions about 41%, while average position improved slightly. This does not establish that design caused the decline. Across the six-month comparison, the current and legacy URLs together have 83 versus 68 clicks, with 6,395 versus 23,123 impressions; judging only the legacy .html row would misrepresent the migration. These periods tell different stories and should not be collapsed into one trend claim.

Sitewide query evidence, not page-filtered query evidence:

- “van sales software”: latest 28 days 1 click / 163 impressions / position 4.12, versus 1 / 324 / 5.23.
- “van sales app”: latest 28 days 1 / 78 / 1.94, versus 0 / 96 / 5.00.
- “van sale software oman”: six months 0 clicks / 57 impressions / position 44.68, versus 0 / 60 / 41.85.
- “van sales software uae”: six months 0 / 43 / 34.21, versus 0 / 350 / 61.99; no current three-month impressions in this exported query row.

Country/device exports are sitewide. They do not prove Van Sales country shares. The India, UAE/Dubai, Oman and Saudi audience brief comes from the user’s customer knowledge. Query exports do not establish keyword cannibalization between two feature pages.

## Competitor research

Primary vendor pages reviewed:

- Trio-S Van POS: https://www.trio-s.com/van-sales-billing-software/ — van stock, load movements, outlet sales, receipts and separate stock/cash verification.
- eWAY Van Sales: https://eway-innovations.com/app/van-sales — load-in/out, stock, outlet billing and closing summary; serves India and Gulf markets.
- TABSYST Sellbee: https://www.tabsyst.com/products/sellbee/ — UAE route-selling narrative, warehouse/van stock, customer actions and end-of-day review.
- Eastern Software Systems: https://www.essindia.com/van-sales.php — mobile van inventory, sales and returns.

Useful category pattern: treat the van as a stock location and make the day’s goods and money explainable. Competitor claims about offline capability, AI, automatic route optimization, geofencing, statutory certification or guaranteed gains were not adopted as SalesOn facts.

## Content and search decisions

- Preserve /van-sales and its saleson.co.in canonical, self-referencing en-IN / x-default alternates and index-follow directive.
- Retain “Van Sales Software” as the primary category term, with India and Middle East relevance. Broaden the India-only positioning without creating country doorway pages.
- Manager-first promise: know the loaded stock, outlet sales, returns and closing balance for each van.
- Three substantive sections: loading record, outlet work and end-of-day review. Avoid the old repeated pain cards, metric strips, workflow recaps, anonymous quotes and broad capability grid.
- No unverified 1–2-day setup, timed settlement, universal printer compatibility, zero mismatch or one-click accounting guarantees. No new pricing or trial terms.
- Online-only answer is explicit. Country-specific currency, document, language, printer and e-invoicing questions belong in the relevant FAQ/demo validation, not repeated qualifications throughout the main pitch.

## Scope boundaries

| Page | Main intent |
| --- | --- |
| Van Sales | Sell carried ready stock, track van movements and review the route’s stock/collections |
| Order Taking | Catalogue, customer pricing, schemes and capture of demand for later fulfilment |
| Delivery Management | Shipments and trips for confirmed orders, delivery status and proof |
| Invoicing | Billing document, tax/total review, print/share and credit adjustments |
| Payment Collection | Dues, receipts, ageing and follow-up |
| DMS | Wider warehouse/distribution controls and customer accounts |
| Tally Integration | Accounting connection, master mappings and posting review |

Some operational nouns necessarily appear on several pages. This change avoids reproducing their detailed explanations; it does not claim zero lexical overlap.

## Visuals and interaction

- Two AI-assisted enhanced recreations from existing SalesOn source images, labelled as enhanced rather than fresh captures. Originals preserved. All page raster assets are WebP.
- Van stock view: /assets/img/van-dashboard.webp → /assets/img/van-sales/van-stock-enhanced.webp. Selected Items panel retains VS-0011 and seven source item rows. Laptop, surrounding panels and summary metrics removed.
- Mobile customer view: /assets/img/van-feature-img.webp → /assets/img/van-sales/customer-actions-enhanced.webp. Preserves the five existing customer actions. Device hardware and overlapping map/transactions removed.
- The native closing-stock example is expressly illustrative. It calculates saleable stock as 120 loaded − 78 sold + 4 saleable returns − 2 damaged = 44. The input demonstrates count variance and saves no records.
- Client band uses the approved general SalesOn logos without implying Van Sales-specific case studies.

## Validation

- Full npm run check passed, including nine feature-page structure/FAQ checks and new Van Sales calculator boundary checks.
- Browser desktop and a 390px iframe preview inspected. All ten main images (eight logos plus two enhanced views) loaded. Narrow-page scroll width equals its client width; the stock screenshot has its own deliberate horizontal scroll region.
- Browser tested stock shortage, surplus and reset, offline FAQ and image enlargement.
- Standalone preview embeds the WebP images and enlargement assets, plus CSS/JavaScript, to avoid the missing-logo problem in the earlier Tally preview.
- No main-branch publication in this change; prepared for user review.
