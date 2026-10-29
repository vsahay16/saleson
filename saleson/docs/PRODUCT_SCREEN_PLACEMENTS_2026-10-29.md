# Product screen placements — review only

Based on main 5ba0dfc1db5cab9cf04627578b2021b5ffe349aa.

- Target Meter hero: actual achievement screen in a lightweight CSS laptop frame. Opaque masks hide staff names; source figures and UI otherwise unchanged. Sidebar cropped. 768/1280 WebP: 23,176 / 44,908 bytes; full-size lossless WebP: 85,146 bytes.
- Production supporting evidence: actual production order register replaces the repeated recreated BOM image. Sidebar and unused blank area cropped. 768/1280 WebP: 16,210 / 32,890 bytes; full-size lossless WebP: 69,388 bytes. Existing focused BOM hero retained.
- Homepage DMS workflow tab: uses the approved chart-rich DMS dashboard and its existing responsive variants/full-size image. Homepage laptop-and-phone hero retained.
- Shared image enlargement script and stylesheet added to Production and Target Meter (new controls require them). No new analytics or tracking changes.

Screens came from the previously refined Batch 02 and Batch 03 masters. No generative reconstruction, invented figures, or customer-outcome claims. Source uploads and private asset packs remain untouched.

Validation: full `npm run check` passed, including 155 tool flow scenarios, metadata/link checks (1614 links), schema and fingerprint integrity. Desktop browser verified Target Meter laptop appearance, all three changed placements, and all three full-size dialog targets. Target dialog close restored focus. Phone layout and physical devices not runtime verified in this environment. Existing responsive CSS and width-based image selection retained. No Lighthouse speed claim.

This branch is for review; not merged or deployed. Current DMS hero and Attendance are unchanged.
