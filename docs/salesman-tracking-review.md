# Salesman Tracking review — 28 October 2026

## Search Console

Reviewed the supplied 26 October exports: unnumbered ZIP (six months), (4) (three months) and (8) (28 days). Duplicate exports were not added together. Period labels are relative to the exports, not dates inferred from filenames.

| Page / period | Current | Previous |
| --- | --- | --- |
| /salesman-tracking, 28-day clicks | 35 | 45 |
| /salesman-tracking, 28-day impressions | 2,787 | 3,017 |
| /salesman-tracking, 28-day CTR | 1.26% | 1.49% |
| /salesman-tracking, 28-day average position | 7.97 | 9.51 |
| /salesman-tracking, three-month clicks / impressions | 127 / 8,668 | 0 / 54 |
| /salesman-tracking.html, three-month clicks / impressions | 1 / 10 | 81 / 4,060 |
| /salesman-tracking, six-month clicks / impressions | 127 / 8,722 | 0 / 0 |
| /salesman-tracking.html, six-month clicks / impressions | 82 / 4,070 | 167 / 11,798 |

Latest clicks fell 22% and impressions 8%, while average position improved. The two URL variants together have 209 versus 167 clicks over the six-month comparison and 128 versus 81 over three months. The migration makes the legacy URL’s decline misleading in isolation. None of this establishes that the page design caused a traffic change.

The query export is sitewide, not page-filtered. “salesman tracking app” has 4 versus 4 clicks over 28 days, 104 versus 133 impressions, and position 5.28 versus 3.40. “salesman tracking software” has 2 versus 0 clicks and 30 versus 21 impressions. Preserve the proven app/software category terms. Avoid broad “sales tracking” positioning that could blur pipeline or sales-performance intent. No country share or keyword-cannibalization conclusion is inferred from these sitewide rows.

## Competitors reviewed

- Delta Sales employee location tracking: https://deltasalesapp.com/features/employee-location-tracking — GPS location, distance, routes and daily activities.
- Lystloc live reporting: https://www.lystloc.com/live-reporting — field location and work-movement visibility.
- Distributo salesman tracking: https://distributo.com/salesman-tracking-software — team movement, date-wise location history and tracking-period controls.
- FieldAssist sales tracker: https://www.fieldassist.com/blog/sales-tracker — activity context around tracking.

Use the category’s strong distinction between current visibility and retrospective review. Do not import competitor offline, geofencing, AI, interval scheduling, perfect accuracy or other unverified capabilities into SalesOn copy.

## Content and design

- Preserve /salesman-tracking, the existing title “Salesman Tracking App & Software India | SalesOn”, saleson.co.in canonical, en-IN/x-default alternates and index-follow metadata.
- Manager-first hero: see the team now and understand the day. Original team map and daily route screen are switchable, accurately labelled screenshots rather than a live map simulation.
- Three sections: identify the employee and location timestamp; review route/time/activity; watch the existing two product walkthroughs.
- Preserve the original videos i5ypxxIW7TI and V99B-tyjqbg, with click-to-load privacy-enhanced YouTube embeds and direct links. No player request is made until the button is used.
- Remove repeated pain grids, generic GPS/WhatsApp comparison, repeated workflow recaps, customer-facing “page ownership”/cannibalization language and unverified pricing/setup/trial specifics.
- Keep device-update limitations, access setup, online-only behavior and paid-product questions in relevant FAQs. No perfect location, automatic route optimization or automatic compliance promise.
- Tracking retains location, date-wise routes, distance, total time and recorded customer-event context. Attendance rules/payroll, expense claims, detailed order capture, receipts and confirmed-order delivery stay in dedicated modules.

## Asset provenance

Both original JPEGs were publicly served on saleson-eta.vercel.app and verified byte-for-byte against the repository before use:

- /assets/img/live-location.jpg SHA256 48d948dad2913db1773e9d04a1297596cafdb3a16c95d53d2ce4fc1883d41fbc.
- /assets/img/activity-log.jpg SHA256 4bbd5c4df7021b0908c92a623890fc81d1ca5351c7c1c6bdace8d217aef5aee9.

The two complete screens are converted to WebP with map content unchanged. No invented geography or live GPS is introduced. The enlarged timeline-only image is an AI-assisted enhanced recreation retaining the original name, source date, values and events. It is labelled accordingly; original assets remain intact. The client band is the approved general SalesOn band, not module-specific customer evidence.

## Validation

- Full npm run check passed: shared components, local references, schemas, canonical/hreflang and fingerprint integrity, FAQs and all existing page behavior checks.
- New tracking checks cover screenshot selection/reset, selected ARIA state, allowlisted click-only video embeds, FAQ count, specialist links and indexable online-only copy.
- Browser desktop and 390px iframe inspected. Page width equals the narrow viewport; wide product screenshots have their own deliberate scroll areas. Both views load, image enlargement opens, the offline FAQ works and the video button creates the expected iframe.
- Native preview does not read GPS, create tracking records or request geolocation permission. External video playback/network availability is not guaranteed by testing iframe creation.
- Standalone HTML preview embeds all eleven page images and all three enlargement targets. No changes published to main; user review is required before publication under the established workflow.
