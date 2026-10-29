# Real product evidence update

Prepared on review/real-product-evidence, retaining the pending media-performance commit. Not deployed.

## Scope
- DMS: actual supplied dashboard in the hero with full-image enlargement. Replaced the two illustrative supporting views with actual inventory and warehouse transfers; labels/status copy now describe those views. Avoids repeating the hero dashboard.
- Attendance: actual attendance overview replaces recreated office screenshot. Existing mobile screen retained.
- Expenses: actual approval list replaces recreated office screenshot. Existing mobile screen retained.
- Delivery: actual shipment board replaces recreated shipment list. Existing driver trip retained because the new desktop trip history does not replace the mobile driver workflow.
- Stronger existing homepage, order-taking, invoicing, van-sales, target and production images remain in place. No new page or promotional section added.

## Asset preparation
Six focused views from the supplied 29 October screenshot ZIP. Native UI/data preserved apart from opaque redactions of employee/customer/warehouse identifiers and attendance time/date. Browser chrome and surrounding account navigation cropped out. Screenshot figures are operational records, not customer outcome claims. No invented records, generated UI or replacement names. Provenance/crop source IDs are in REAL_PRODUCT_EVIDENCE_2026-10-29.json.

Inline WebPs are all below 40 KB, with lossless full-resolution WebPs loaded only through the existing enlarge dialog. Original uploaded files and delivered screenshot pack are not modified. Captions distinguish product screenshots from remaining illustrative screens.

## Validation
Full npm run check passed, including 155 tool scenarios, metadata/canonical/schema and 1,614 internal links. The final DMS supporting-view refinement also passed the complete suite. Existing screenshot path assertions were updated to require the new actual asset/full-view paths rather than obsolete illustration paths.

Browser: DMS hero enlargement opens/closes; Stock transfers switch shows the matching status; desktop DMS and expense views inspected. All four pages tested at 375px content width with scrollWidth=clientWidth after their respective new-image elements appeared. Large source tables retain their existing internal scroll/enlarge route. Physical-phone and assistive-technology certification are not claimed.

This update includes the earlier un-deployed responsive-image optimisation work. Tracking setup, Clarity and LinkedIn remain unchanged; tracking release is still paused pending account verification.
