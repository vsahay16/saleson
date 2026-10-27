# Payment Collection and Attendance review — 28 October 2026

Review drafts based on main commit 15288728d7f58a7634e3845495eec4d4fd874041. No changes to approved Order Taking or Salesman Tracking.

## Search Console
Supplied 26 October exports reviewed: unnumbered six-month ZIP, (4) three-month ZIP, (8) 28-day ZIP. Duplicate exports were not counted again. Query exports are sitewide; they do not establish query-to-page attribution or prove cannibalization.

Attendance: latest 28 days 4 clicks versus 0, 201 impressions versus 25, CTR 1.99% versus 0%, average position 6.72 versus 6.12. Three- and six-month page comparisons both show 4 clicks and 226 impressions versus zero. This is a small sample, not evidence of established large traffic. Preserve its existing title, canonical URL and section anchors. Primary H1 category retained; absolute anti-fraud wording corrected.

Payment Collection: no page row in these exports. Do not attribute receipt-generator or reminder-tool queries to the collection feature. Sitewide `payment collection app with tally integration` had 5 impressions, 0 clicks in the latest 28 days; `sales attendance` had 5 impressions, 0 clicks. This is discovery evidence, not search-volume or ranking proof.

## Current public content and hosting
https://saleson.co.in/attendance serves the older attendance page. https://saleson.co.in/payment-collection redirects to https://saleson.co.in/404. The repository/Vercel collection page exists. The main-domain routing/deployment gap must be fixed on its separate host; publishing Vercel alone does not resolve it. No change to canonicals is proposed.

## Primary competitor sources reviewed
Collections:
- https://deltasalesapp.com/features/payment-collection — customer balances, payment entry, invoice/receipt history, overdue reporting.
- https://distributo.com/receivable-and-collection-management — invoice-wise dues, collection modes, receipts and office receipt review.
Attendance:
- https://deltasalesapp.com/features/attendance-leave — check-in/out, hours and attendance reports.
- https://www.fieldassist.com/attendance-management-system — photo/GPS attendance, rule exceptions and HR review.
- https://fieldassistsupport.freshdesk.com/support/solutions/articles/14000091385-attendance-daily-summary — date-wise daily summary.
Competitor offline, leave, shift-planning, gateway settlement, post-dated cheque scheduling and other capabilities are not imported into SalesOn claims.

## Focused changes
Existing typography, layout foundation, section order/anchors, shared shell, title and URL retained. New scoped CSS improves body/supporting text, image presentation and mobile layout. The approved general SalesOn client band is reused; it does not imply module-specific customer endorsement.

Attendance: remove unverified testimonial and absolute anti-spoof/territory guarantees. Keep photo/GPS/odometer check-ins, work hours and late/partial-hours review. Export supports HR review; do not imply guaranteed direct integration with every payroll system. Add online-only and paid-trial FAQs. Replace device-heavy hero with a source-based enhanced dashboard excerpt. Keep the existing mobile check-in screen. Correct native example: 09:52 against 09:00 is 52 minutes late; missing checkout does not become a fabricated completed day.

Collections: keep invoice-wise dues, receipts and customer follow-up. Remove unsubstantiated 30–40% recovery promise, fixed alert schedules, arbitrary rollout guarantees and absolute credit blocking/override claims. Replace invalid example (`₹84,200 exceeds ₹1,00,000`) with an illustrative balance comparison: ₹84,200 − ₹80,000 = ₹4,200. Unpaid invoices sum ₹44,200 + ₹28,000 + ₹12,000 = ₹84,200. Distinguish recorded payment from verified bank settlement. Keep external accounting mapping on Tally; separate one-off receipt/reminder tools from live business records. Remove repetitive top promotional strip; retain page navigation.

## Asset provenance
Existing originals preserved. Source public Vercel URLs returned HTTP 200 and matched local bytes before enhancement:
- attendance.jpg SHA256 3c995c9b55770de6533de187141895ea93bc2510d295acd46c38dd61c802ef87
- attendance-mobile.webp SHA256 4db1d12181bdfe7e9d8cf3ab251c70aadb54a91e7789aaacac5be52c1e70444c
- payment-collection-hero.webp SHA256 81dbe98786d80fb57f243c84f08b5a1b28ff396bf14099a9f14c4d1e53c93dfc
- total-payment.webp SHA256 91eb41e4cc7d84887b3a4ee6d400eddb45ef12516380496b2c82b67d3a18b48c
Enhanced images use built-in image generation to clarify public source excerpts; they are labelled enhanced recreations/illustrations, not fresh live captures. Prompt summaries are recorded in asset-provenance files. Raster deliverables are WebP.

## Verification
Full site checks pass after initial implementation. Desktop and 390px iframe review performed. Initial small overflow in existing cards was located and fixed; both document widths equal the 375px inner viewport. Online-only FAQ expansion and accessible image enlargement verified. Final build checks include FAQ/schema equality, title/anchor preservation and the corrected financial examples. No ranking guarantee.

Standalone previews were browser checked with embedded images, no shared header/footer and working FAQ controls. Both hero images and the enhanced mobile-entry excerpt use WebP assets with in-page provenance captions. Final full npm check passed.
