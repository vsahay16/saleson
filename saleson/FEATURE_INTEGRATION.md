## Field Sales and DMS refresh — 27 October 2026

The approved refined Field Sales and DMS designs now replace their existing page bodies. Their standalone headers and footers are removed; existing shared site components and analytics remain. CSS and JavaScript use the established page source paths. WebP assets are extracted under `assets/img/field-sales/` and `assets/img/distribution-management-system/`, reusing identical files across both pages. Preview `noindex` directives are not carried into production.

DMS uses six management capability cards. Field Sales includes a compact customer preview with Overview/Activity tabs. Both pages use native HTML details for FAQs and preserve the dashboard view switch and image-enlargement dialog. Narrow dashboard regions scroll locally instead of overflowing the page. The Field Sales FAQ and JSON-LD explicitly state that SalesOn requires internet and does not support offline use.

`npm run check` validates these implementations along with the existing site. Local browser rendering remains unverified because the browser download failed. GitHub publication does not by itself verify the external hosting rollout.

---

# Feature page integration — 26 October 2026

Subsequent template, tool and comparison work is documented in REPOSITORY_COMPLETION.md. The validation counts below describe the feature-integration stage.

The eight supplied feature pages are integrated into the existing repository. They retain the root URLs used by the current website, including field-sales.html rather than the standalone field-sales-final.html filename.

| URL | CSS source | JavaScript source |
|---|---|---|
| /delivery-management | /css/delivery-management-page.css | /assets/js/delivery-management-page.js |
| /attendance | /css/attendance-page.css | /assets/js/attendance-page.js |
| /expense-management | /css/expense-management-page.css | /assets/js/expense-management-page.js |
| /salesman-tracking | /css/salesman-tracking-page.css | /assets/js/salesman-tracking-page.js |
| /field-sales | /css/field-sales-page.css | /assets/js/field-sales-page.js |
| /payment-collection | /css/payment-collection-page.css | /assets/js/payment-collection-page.js |
| /distribution-management-system | /css/distribution-management-system-page.css | /assets/js/distribution-management-system-page.js |
| /tally-integration | /css/tally-integration-page.css | /assets/js/tally-integration-page.js |

## Shared structure

Each page uses one site-header, one site-footer and one whatsapp-float from components/. Navigation and footer fallback links are available in initial HTML. Supplied standalone navigation, footers and floating WhatsApp copies have been removed. The shared components now expose payment collection consistently, correct the delivery link markup and identify the current page.

Page CSS is in css/. Page behaviour and extracted click handlers are in assets/js/. There are no inline style attributes, style blocks, event attributes or executable script blocks on these eight pages; JSON-LD remains inline as structured data. Existing tracking snippets have been moved to shared deferred files, preserving which pages previously used the advertising integrations. Existing minification scripts can process the new flat CSS/JS sources. The fingerprint manifest/build step supplies versioned asset URLs.

Supplied screenshots are in assets/img/. Important hero images have explicit dimensions and high fetch priority; other images use lazy loading. The new reusable screenshot viewer is in css/feature-media.css and assets/js/feature-media.js.

## Mobile hero changes

- Delivery management: desktop keeps the complete dashboard/device composition. Up to 600px, a proportioned CSS viewport focuses on the driver phone interface. A full-dashboard button opens the supplied image in a modal with fit/zoom controls and scrollable detail.
- DMS: desktop keeps the full dashboard. Up to 600px, the dashboard uses a contained, labelled, keyboard-focusable scroll region at readable image scale. A swipe hint and full-image viewer make the rest of the dashboard accessible without page-wide overflow.
- The delivery (about 71 KB) and DMS (about 55 KB) WebP files are preserved byte-for-byte. Mobile views reuse these assets; no additional mobile bitmap needs downloading.
- Shared hero grid constraints, sub-navigation offsets, scroll margins and anchored-scroll offsets account for the repository's sticky header.

## Verification

`npm run check` passes:

- 78 HTML documents, 108 JSON-LD blocks, 4,806 local references and 76 canonical sitemap URLs.
- 48 INR/USD calculator cases and invalid-seat boundaries; previous pricing repairs retained.
- All eight integrated pages have exactly one shared header/footer and separate CSS/JavaScript.
- Page scripts initialize and their actual extracted FAQ bindings pass open/switch/close checks in a small DOM model; Tally technical details also toggle correctly.
- Image viewer open/fit/zoom/close/focus-return behaviour passes the same source-level DOM-model checks.
- Shared header/footer anchor nesting is valid. All screenshot files match their supplied originals.

These are source/behaviour checks, not browser-layout certification. The remote browser could not access the local preview server, and a local browser binary is unavailable. Verify the pages at 360, 390, 600, 768 and desktop widths before production rollout, including swipe/keyboard scrolling, modal Escape handling, fixed widgets and booking CTAs. See DEPLOYMENT.md for server and account-dependent checks.

## Scope and deployment

Deploy the complete saleson/ directory, including the current generated fingerprinted assets and assets-manifest.json, following DEPLOYMENT.md. The distributor application files are unchanged. Other tools, calculators and case-study drafts from the larger source ZIP were not substituted for the existing repository pages in this feature-page update. Nothing has been published or pushed to a remote repository.

The earlier source repairs (routes, schema cleanup, refund-policy references, exact pricing and ungated van-sheet actions) are retained. Outstanding business-policy decisions and live GSC/CRM/hosting checks are listed in CHANGE_REPORT.md.
