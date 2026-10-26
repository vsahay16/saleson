# SalesOn website changes — 26 October 2026

Prepared against the supplied 8131e00f9444 repository and fixes workbook. This package contains source changes; nothing was published or pushed to a remote repository.

See REPOSITORY_COMPLETION.md for the latest completion pass and FEATURE_INTEGRATION.md for the supplied eight-page integration.

## Verification completed

- 78 HTML documents, each with one absolute canonical.
- 115 valid JSON-LD blocks, including repairs on 11 previously broken pages.
- 5,898 local HTML references resolve; CSS image/font references checked after 107 path repairs.
- 76 unique final canonical sitemap URLs.
- 54 remaining inline JavaScript blocks compile. All eight feature-page scripts and their shared scripts pass syntax/behaviour checks.
- 48 INR/USD pricing cases and invalid-seat boundaries pass. 10 annual Pro seats: INR 25,000 with INR 5,000 savings; Enterprise: INR 40,000 with INR 8,000 savings.
- All modifications to pre-existing files are confined to saleson/. Distributor React files are unchanged.

Browser verification was unavailable because the binary was absent and its download failed. No mobile screenshots/layout, live Apache responses, external host recovery, completed booking/signup, CRM receipt or GSC results are claimed. The npm minifier build was not run; source checks and directly deployable static assets are supplied. See DEPLOYMENT.md.

## Checklist status

Source repairs are not a claim that production acceptance has passed. Business decisions and access-dependent work are explicit.

| ID | Priority | Scope | Status and evidence |
|---|---|---|---|
| T01 | P0 | /pricing/us | Source repaired: root-relative pricing CTAs/product links. |
| T02 | P0 | All missing routes; /404 | Source repaired and reviewed: explicit homepage mapping, true 404/ErrorDocument rules and existing-route-only slash/index redirects. Actual Apache acceptance remains pending. |
| T03 | P0 | /payment-collection | Source repaired: new payment-collection page with demo CTA and links to billing/collection tools. |
| T04 | P0 | /inventory-management | Source repaired: new inventory-management page with demo CTA and links to DMS/van-sales/reorder. |
| T05 | P0 | Legacy templates; see Assets tab | Source repaired: broken JS/CSS includes and CSS font/image paths resolve locally. Live MIME checks pending. |
| T06 | P0 | /pricing | Exact existing annual prices in shared configuration: INR 2500/4000, USD 90/120. Rounding only for display; 48 pricing cases pass. Business sign-off pending. |
| T07 | P1 | / and /index and /index.html | Source repaired: homepage root links/canonical and direct legacy redirects. Apache response QA pending. |
| T08 | P1 | /calculators/sales-leakage-calculator | Source repaired: extensionless calculator canonical and .html redirect rule. Live response QA pending. |
| T09 | P1 | 11 documents; see Page content tab | Source repaired: 99 JSON-LD blocks parse. Removed unsubstantiated rating/review markup; removed SoftwareApplication from demo page. |
| T10 | P1 | /pricing and /pricing/us | Source repaired: explicit saved INR/USD choice works in shared header/footer links. Currency metadata/offers align with pages; business/SEO sign-off and live checks remain. |
| T11 | P1 | www.saleson.co.in; blog.saleson.co.in | Hosting access required: DNS/TLS, origin errors and external blog recovery. Source www path-preserving rule supplied. |
| T12 | P1 | Shared header and footer | Source completed: all 78 HTML pages use the same shared header/footer. Legacy component references replaced; root-relative navigation, one /blogs hub and static fallback links retained. |
| T13 | P1 | Industry templates and GST calculator | Source repaired: nested industry product destinations and GST invoice CTA. |
| T14 | P1 | /field-sales | Source repaired: final feature URLs, Attendance destination and local targets. |
| T15 | P1 | Audience, blog, industry, comparison templates | Source repaired: exactly one absolute canonical per retained document; retailer and Delta comparison titles corrected. |
| T16 | P1 | /sitemap.xml | Source repaired: 76 unique canonical sitemap URLs; redirect/error documents excluded; unreliable lastmod omitted. |
| T17 | P1 | Pages flagged for hreflang | Source validated: corrected the remaining pricing language conflict. All 72 declared alternate links pass language syntax, canonical/indexable target, mapping conflict and reciprocal checks. Google-selected canonical checks remain in V03. |
| T18 | P1 | /request-demo | Partial: 30-minute copy, calendar fallback and selected-role session persistence completed. The selected focus is displayed for booking notes. Actual scheduler fields, sales sign-off and booking/CRM QA remain. |
| T19 | P1 | App signup and demo journey | Account access required: no sanctioned signup, OTP, confirmation or CRM test performed. |
| T20 | P2 | CSS/JS delivery | Source repaired: content-hashed CSS/JS, manifest, repeatable build step, revalidation and gzip rules. Actual compression/cache response QA pending. |
| T21 | P2 | All commercial templates | Partial: shared layout, labels, FAQ ARIA, keyboard dropdowns, print-safe table wrappers and mobile image/overflow changes implemented. Browser/mobile/zoom acceptance remains pending. |
| T22 | P1 | Analytics across site, app and scheduler | Partial: phone removed from analytics; allowlisted parameters, distinct local/HTTP-accepted events and response checks. Completed trial/booking, deduplication, attribution and CRM linkage require account access. |
| C01 | P1 | / | Partial: links/schema and conflicting homepage refund summary repaired. Proof/onboarding claims need owner evidence. |
| C02 | P1 | /field-sales | Partial: current workflow positioning preserved; broken screenshot/include paths repaired. Screenshot and capability confirmation pending. |
| C03 | P1 | /salesman-tracking | Source repaired: editorial label removed and device-permission/connectivity/battery caveat added without claiming a fixed update interval. |
| C04 | P1 | /order-taking-app | Partial: JSON-LD repaired. Workflow/offline claims need product confirmation. |
| C05 | P1 | /distribution-management-system | Partial: JSON-LD repaired. Page-filtered GSC query loss and DMS/plan review remain. |
| C06 | P1 | /tally-integration | Partial: JSON-LD repaired, unsupported 0.4s/50L+ proof and official-API wording removed. Versions, sync, retries and other capability claims need product evidence. |
| C07 | P1 | /delivery-management | Partial: JSON-LD repaired. Query-loss diagnosis and delivery capability sign-off remain. |
| C08 | P1 | /target-meter | Partial: JSON-LD repaired. Lost queries and target calculation rules need GSC/product review. |
| C09 | P1 | /invoicing | Partial: collection link repaired. IRN/e-way bill integration claims need product sign-off. |
| C10 | P1 | /van-sales | Partial: JSON-LD repaired. Van-sales plan entitlement remains a business decision. |
| C11 | P2 | /production | Partial: JSON-LD repaired. BOM, batches, costing and scrap boundaries need product review. |
| C12 | P2 | /attendance | Partial: JSON-LD repaired. Attendance guarantees and privacy controls need product review. |
| C13 | P2 | /expense-management | Partial: JSON-LD and fraud-free headline repaired. Accounting/approval workflow confirmation remains. |
| C14 | P1 | /mobile-app | Partial: collection links repaired. Platform parity and permissions need product evidence. |
| C15 | P0 | /pricing; /pricing/us | Partial: exact calculator and first-paint totals, region/schema consistency and billing-table wording repaired. Taxes, seat minimums/changes, renewals, commitment and the complete feature matrix need business approval. |
| C16 | P0 | /request-demo | Partial: demo duration/timeline/fallback aligned to existing scheduler. Sales sign-off and test booking remain. |
| C17 | P1 | /about | Partial: commercial refund wording defers to policy. Company history and customer claims need owner evidence. |
| C18 | P1 | /privacy-policy | Partial: support contact and privacy title repaired; tools explain browser draft storage. Substantive policy/data-flow review still needs owner approval. |
| C19 | P1 | /terms | Partial: trial/subscription/refund links appear before entering signup on commercial pages. Legal terms and trial/export/cancellation behaviour still require owner/product review. |
| C20 | P0 | /refund and all promise summaries | Partial: commercial summaries now defer to existing refund policy. Legal eligibility and conflicting phone/WhatsApp request instructions need owner decision. |
| C21 | P1 | /user/software-for-retailers | Source repaired: distinct concise retailer order/billing/stock/payment page replaces manufacturer copy. Product review pending. |
| C22 | P2 | /user/software-for-distributors | Partial: distinct distributor workflow, product links, canonical and retained Lapcare story link added. Customer-proof approval remains. |
| C23 | P2 | /user/software-for-manufacturers | Partial: manufacturer-specific production/distribution workflow, metadata, canonical and existing story link added. Page-filtered query-loss review and product proof remain. |
| C24 | P2 | 12 industry pages | Partial: 12 distinct workflow sections, contextual product links, demo CTAs, specific title/H1/social metadata and one H1 per page. Specialised capability/evidence review remains. |
| C25 | P2 | /blogs and blog articles | Partial: shared blog layout, contextual product/demo links on 12 articles, canonical/assets and share markup repaired. Original publication information retained; author confirmation, external-host recovery and migration mapping remain. |
| C26 | P2 | Comparison hub + six comparison pages | Source completed: six sourced comparison guides and hub rebuilt with official provider references and review date. Unsupported competitor claims and stale comparative prices removed; workflow/setup/quote checks provided. |
| C27 | P1 | /tools and tool result screens | Partial: commercial destinations and non-personal tool events repaired. Tool-to-qualified-lead measurement needs analytics/CRM setup. |
| C28 | P1 | /tools/van-loading-sheet-generator | Source repaired: van-sheet exports, print/save, extra SKUs, outlet features and transfers no longer require contact capture. Browser export/handoff QA remains. |
| V01 | P1 | Six declining/important pages | GSC access required: page-filtered queries/devices not supplied. |
| V02 | P1 | Deployment timeline | Release history required: production change timeline not supplied. |
| V03 | P1 | URL Inspection | GSC access required: Google-selected canonical and indexing cannot be proven from source. |
| V04 | P1 | Release regression | Partial: source crawl, shared layouts, schemas/canonicals/alternates, pricing, tool-core and interaction logic checks pass. Actual Apache responses, rendered browser crawl, printing and signup/booking remain. |
| V05 | P2 | /tools/delivery-challan-generator | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| V06 | P2 | /tools/e-way-bill-checker | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| V07 | P2 | /tools/gst-calculator | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| V08 | P2 | /tools/gst-invoice-generator | Partial: mixed-line invoice total, round-off, partial/overpaid balance and currency-word checks pass. Browser incoming handoff and print/PDF acceptance remain. |
| V09 | P2 | /tools/hsn-sac-gst-rate-finder | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| V10 | P2 | /tools/outstanding-payment-tracker | Partial: local-date overdue/ageing, paid/partial statuses and paise display checked. Full browser persistence, credits and receipt-transfer flow remain. |
| V11 | P2 | /tools/payment-receipt-generator | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| V12 | P2 | /tools/purchase-order-generator | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| V13 | P2 | /tools/quotation-generator | Partial: quotation totals, charges, advance bounds/paise rounding, balances and currency words tested. Browser print/validity/transfer acceptance remains. |
| V14 | P2 | /tools/stock-reorder-level-calculator | Partial: MOQ/pack-size logic, zero-demand and negative-stock cases repaired/tested; handoff helper data preservation checked. Full CSV/PO handoff and browser acceptance remain. |
| V15 | P2 | /tools/van-loading-sheet-generator | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| V16 | P2 | /tools/whatsapp-payment-reminder-generator | Browser/product QA required: no end-to-end export/print/handoff or tax/rule certification. Existing tax rules were not rewritten without authoritative review. |
| A01 | P0 | /assets/js/app.min.js | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A02 | P0 | /assets/js/footer.min.js | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A03 | P0 | /assets/js/header.min.js | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A04 | P0 | /assets/js/min/industry.js | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A05 | P0 | /assets/js/min/testimonial.js | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A06 | P0 | /css/bootstrap-icons.min.css | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A07 | P0 | /css/common.min.css | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A08 | P0 | /css/dms.min.css | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A09 | P0 | /css/field-sales.min.css | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A10 | P0 | /user/css/bootstrap-icons.min.css | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
| A11 | P0 | /css/saleson-vs-other-field-sales.min.css | Source repaired: include paths point to existing correct JS/CSS files. Local references and syntax checked. Live response MIME/HTTP and visual verification remain. |
