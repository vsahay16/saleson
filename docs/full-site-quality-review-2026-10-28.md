# SalesOn repository quality review — 28 October 2026

## Main conclusion

The repository deployment is substantially healthier than the site described by the earlier audits. **The highest-priority outstanding issue is deployment: `saleson.co.in` was observed serving the older website, while the reviewed repository is served at `https://saleson-eta.vercel.app/`.** The brand-domain homepage still showed the old navigation and “No Minimum Users” copy. Repository fixes do not close production-domain findings until the domain serves the intended release and is rechecked.

## Scope and evidence

Reviewed the two supplied workbooks and the newer CSV, then checked all **77 repository routes** at requested desktop width 1280px and phone width 390px. This includes the 404 page and two retired regional routes. Their available content widths were 1265px and 375px because the iframe has a vertical scrollbar. All 13 tools/hub routes were additionally checked at 360px (345px content width).

Every route received rendered-DOM checks for page overflow, visible H1 count, shared component initialization, broken loaded images, active preloaders and unnamed visible form controls. Screenshots were inspected across homepage, feature, industry, comparison, company/legal, article/hub, customer, pricing, quiz and tool layouts. Screenshot sampling is distinct from the per-route structural checks; this is not an exhaustive screenshot approval of every section or a real-device/cross-browser certification.

HTTP checks cover content routes, retired redirects and random missing-page/missing-script probes. Required local resources referenced directly by HTML were requested separately. Another 25 local assets referenced from delivered CSS (including fonts/backgrounds) returned 200. Local broad filesystem checks cannot fully run in this recovered source workspace because unchanged binary assets were not downloaded; live requests are the evidence for those files, rather than invented local placeholders.

## Changes in this review

- Replaced the public homepage “Review” title and added useful description/social metadata.
- Added a proper blog hub title, description, H1 and introduction; improved all 12 article descriptions.
- Added one shared article stylesheet, removed repeated article titles, kept subtitle information, and replaced fixed-height article title blocks with content-led spacing.
- Corrected About and Refund headers that appeared after main content. Added a regression check requiring every shared header to precede its H1 and footer to follow it.
- Contained wide tool tables within their own scroll regions, allowed grid children to shrink, and wrapped narrow-screen controls. Fixed the HSN search/results grid separately.
- Named generated table inputs and filters, including rows restored from saved drafts. Prevented duplicate injected skip links.
- Corrected uploaded logo/signature URLs in six document/report tools. Complete data URLs are no longer prefixed with tool page paths; empty signatures no longer request the page as an image.
- Moved quiz metadata into the document head and its executable JavaScript/CSS into dedicated folders. Added language/description metadata.
- Added main landmarks to tools, quiz and legacy article/calculator content. Fixed extra closing divs in the customer hero and made its main landmark valid.
- Prevented the customer company card from covering quote attribution on phones; moved that page's inline styles into a dedicated CSS file.
- Corrected heading hierarchy in the leakage calculator, customer section and van loading handoff cards; added the missing Lapcare logo alt text.
- Guarded optional legacy slider initialization so articles do not throw `slick is not a function` when the plugin is absent.
- Verified immutable one-year caching for content-fingerprinted CSS/JS. Regional pricing remains `private, no-store`; HTML continues to revalidate.
- Removed the temporary noindex review harness from the final source. It was never included in the sitemap.

Implementation uses `css/`, `css/tools/`, `assets/js/`, `assets/js/tools/` and existing shared components. Changed assets receive new content fingerprints; old deployed fingerprints are retained for cached pages. Existing INR/regional USD tiers and minimum-two-user rules are preserved.

## Validation results

- All **25 targeted regression checks passed**, covering pricing, minimum users, regional routing/fallbacks, shared shell/order, feature interactions, tool money/date/reorder arithmetic, draft/handoff behavior, FAQ/schema alignment and internal fragments. See [validation results](quality-review-2026-10-28/checks.json).
- Each reviewed route ended with one visible H1, initialized shared header/footer and no active loading overlay.
- Rendered overflow checks passed at 1280px and 390px after targeted fixes; tools additionally passed at 360px. Wide tables intentionally retain local horizontal scrolling.
- No broken loaded images or unnamed visible tool fields remained in the tested initial tool states after fixes. Uploaded-image source correction was source-validated; upload/export combinations still benefit from owner acceptance on supported browsers.
- The customer attribution ended 48px before the next content card in the tested phone layout. About/Refund headers were measured at y=0, with main content starting below the 70px header.
- A fresh article console check after the slider fix showed no slider exception. The separately managed Meta/GTM warning remains open below. Browser-extension errors were excluded from site findings.
- Missing random page and script probes returned true 404. The dedicated `/404` page itself returns 200 with noindex; that is separate from missing-URL behavior.
- `/pricing/in` and `/pricing/us` redirect directly to `/pricing`; the retired Growth route redirects directly to `/`.

These checks support the observed deployment and tested states. They do not establish legal/tax compliance, actual app capabilities, submitted leads, field performance or SEO recovery.

## Remaining work in priority order

1. **Hosting owner: connect the intended release to `saleson.co.in`.** Confirm the intended Vercel project, production branch and root directory before changing domain routing. The repository supports both repository-root and nested `saleson/` hosting configurations. Then verify the apex, www, blog host, redirects, sitemap, assets, geo pricing, signup and booking on the real domain.
2. **Analytics owner: fix the malformed Meta Pixel tag in GTM.** The live warning includes a page URL inside the Pixel ID. Use the verified business Pixel ID; do not guess it from the invalid string. Check duplicate pageviews/conversion events and consent behavior after publishing.
3. **Sales/product owner: complete controlled signup and demo bookings.** Verify confirmation, CRM/calendar delivery and one correctly attributed conversion. No test bookings or customer accounts were submitted during this review.
4. **Business owner: approve claims, customer evidence and policy details.** Confirm case-study identity/photo/quotes/outcomes, legal company details, supported integration behavior, trial data access and refund conditions.
5. **SEO owner: inspect Search Console after cutover.** Compare query/page/device/country data and Google-selected canonicals; submit the correct sitemap. Fixing source errors alone does not prove a ranking recovery or establish the cause of earlier traffic decline.

## Latest deep-audit disposition

“Repository checks pass” below means the present implementation addresses the described source/routing issue and relevant regression checks passed. It does **not** mean the old brand-domain deployment has changed or that third-party/business acceptance is complete. Findings requiring wider acceptance are stated separately.

| ID | Earlier finding | Current disposition | Evidence / next action |
| --- | --- | --- | --- |
| F01 | Core field-sales page resolves to error page | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F02 | Soft 404 handling remains broken | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F03 | Payment collection destination still broken | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F04 | Inventory destination still broken | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F05 | Required JS/CSS still returns error HTML | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F06 | Loading overlay prevents page use | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F07 | Annual calculator underquotes advertised totals | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F08 | Van-sales entitlement and commitment contradict | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F09 | Refund promises still disagree | Copy aligned; owner acceptance open | Refund summaries link the policy. The business must approve eligibility and conditions; source consistency is not a refund-policy legal review. |
| F10 | Relative CTA/product links resolve under /pricing/ | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F11 | USD content retains INR metadata and India canonical | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F12 | Homepage routing disagrees with canonical | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F13 | Malformed JSON-LD persists | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F14 | Sitemap includes broken/redirecting routes | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F15 | Canonical signals remain absent | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F16 | Industry feature links resolve to wrong directory | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F17 | Invoice CTA resolves to missing root page | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F18 | Tally product link opens homepage | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F19 | Explore Live Tracking sends users to field-sales | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F20 | Internal editorial instructions appear in public copy | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F21 | Retailer page still talks about manufacturers/distributors | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F22 | Delta comparison title still names Bizom | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F23 | Comparison prices contradict current own pricing | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F24 | Unsubstantiated competitor judgments and generic copy | Reworked; evidence review open | Six comparisons have distinct workflows and official links. Competitor capabilities, editions and prices still need periodic owner verification. |
| F25 | Split blog destination and host failures need resolution | Open: hosting/domain | The repository deployment works. The main domain was observed serving the old site; www and blog host routing require hosting access and post-cutover checks. |
| F26 | Navigation still split between JS templates | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F27 | Malformed Meta Pixel ID | Open: GTM configuration | Browser console still reports a non-numeric Meta Pixel ID containing the current page URL. Correct the Meta tag/variable in GTM-WQNBHFQS using the verified business Pixel ID, publish and retest. Repository JS does not own that remote tag configuration. |
| F28 | Source has an empty lead endpoint hook | Re-scoped in source | Tools are browser-only and no longer imply a server lead submission. Any future CRM lead collection needs a real endpoint, consent, validation and delivery acceptance. |
| F29 | Placeholder analytics and unreliable success event | Source corrected; attribution acceptance open | Tool clicks/downloads are not treated as completed leads. Verify genuine completed demo/signup events in the actual analytics and CRM accounts. |
| F30 | Starter tax dataset contains stale entries | Risk reduced; tax acceptance open | HSN output is a candidate classification and requires a separately verified rate before transfer. This review does not certify a complete current tax dataset. |
| F31 | 40% results cannot be selected in rate filter | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F32 | Report date defaults lag local date after midnight | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F33 | Privacy scope still focused on mobile app | Coverage updated; owner review open | Policy now covers website analytics, browser drafts/tools and external scheduling. The business must confirm actual vendors, retention and handling practices. |
| F34 | Trial data access conditions need prominent agreement | Website copy aligned; app acceptance open | Terms/trial conditions are surfaced. Account creation, consent and actual trial data access need a controlled end-to-end app test. |
| F35 | Precise outcome/proof claims lack linked substantiation | Open: substantiation | Legacy testimonials/customer facts require permission and evidence. In particular, verify Lapcare quote attribution, photo and outcomes before treating the case study as approved proof. |
| F36 | Absolute accuracy/fraud/compliance promises remain | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F37 | Broken sentence and reversed meaning | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F38 | POD answer has counting contradiction | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F39 | Need real product evidence and clear sample labels | Presentation improved; owner acceptance open | Screenshots/illustrations are labelled and supporting views added. Confirm product-version accuracy with the product owner. |
| F40 | Secondary-sales vs retail sell-through data is unclear | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F41 | Sync timing and scope need one supported contract | Copy scoped; product acceptance open | Absolute sync promises were narrowed. Validate actual Tally version, direction, timing, mappings, returns and recovery against supported integrations. |
| F42 | Device/offline capability limits are unclear | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F43 | Minimum-user requirement still inconsistent | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F44 | Company location/support detail needs clarification | Open: company details | Confirm registered and operating addresses, customer support details and testimonial identities against authoritative business records. |
| F45 | Industry content hierarchy and usefulness remain weak | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F46 | Audience pages still use legacy templates and overlap | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F47 | Blog hub metadata and editorial routes need work | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F48 | Sample records can look like user documents | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F49 | User-facing message exposes implementation detail | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F50 | Accessibility/mobile acceptance remains incomplete | Checks improved; wider acceptance open | Shared navigation, table regions, generated field names and narrow layouts improved. Full assistive-technology, keyboard, real-device and cross-browser acceptance remains separate. |
| F51 | Desktop horizontal overflow | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F52 | Cache policy needs explicit verification/repair | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F53 | Large image candidates for optimization | Improved; performance measurement open | Recent product/audience images are lightweight and core phone layouts pass. Field Core Web Vitals and an exhaustive remaining media budget are not certified by this audit. |
| F54 | Completed sales journeys remain unverified | Open: completed journeys | Calendar renders and direct fallback exists. A real signup/booking, confirmation, CRM receipt and correctly attributed conversion have not been completed in this review. |
| F55 | Google-selected canonicals/ranking causes cannot be certified publicly | Open: Search Console | Google-selected canonicals, exclusions, historical query/page trends and ranking causes require the actual Search Console property. Public checks cannot prove traffic recovery. |
| F56 | Calculator canonical still points to redirected .html URL | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F57 | Legacy feature fragments may no longer exist | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |
| F58 | Comparison hub images have missing alt attributes | Repository checks pass | Implemented in the current source; verify the same behavior again on the brand domain after cutover. |


## Per-route rendered checks

Pass means no whole-page horizontal overflow, one visible H1, initialized shared header/footer, no active loader, and no broken loaded image in the inspected state. Columns show requested viewport widths. Table scrolling stays within the tool. Redirect pages are tested at their destination. About/Refund component order was corrected and separately verified.

| Route | Desktop 1280 | Phone 390 | Narrow phone 360 |
| --- | --- | --- | --- |
| `/404` | Pass | Pass | Not sampled |
| `/about` | Pass | Pass | Not sampled |
| `/attendance` | Pass | Pass | Not sampled |
| `/blogs/How-Online-Marketplaces-Are-Disrupting-Traditional-Distribution-Channels` | Pass | Pass | Not sampled |
| `/blogs/How-Real-Time-Sales-Tracking-Boosts-Productivity-and-Transparency` | Pass | Pass | Not sampled |
| `/blogs/How-to-Optimize-Your-Distribution-Channels-for-Maximum-Profit` | Pass | Pass | Not sampled |
| `/blogs/How-workflow-automation-enhances-team-collaboration-in-sales` | Pass | Pass | Not sampled |
| `/blogs/Reducing-Sales-Admin-Time-with-Automation-Tips-for-2024` | Pass | Pass | Not sampled |
| `/blogs/Sales-Force-Tracking-Privac-Performance-and-the-Path-to-Trust` | Pass | Pass | Not sampled |
| `/blogs/The-Tech-Behind-the-Wheel-Electronics-in-Modern-Van-Sales` | Pass | Pass | Not sampled |
| `/blogs/The-Top-5-Sales-Challenges-B2B-Companies-Face` | Pass | Pass | Not sampled |
| `/blogs/Top-Benefits-of-Automatic-Invoicing-for-B2B-Businesses` | Pass | Pass | Not sampled |
| `/blogs/Top-Sales-Strategies-for-Small-Businesses-in-2024` | Pass | Pass | Not sampled |
| `/blogs/Tracking-Industrial-Success-with-Target-Meters-and-Visual-KPIs` | Pass | Pass | Not sampled |
| `/blogs/Why-Van-Sales-Are-Essential-for-Modern-B2B-Supply-Chains` | Pass | Pass | Not sampled |
| `/blogs` | Pass | Pass | Not sampled |
| `/calculators/sales-leakage-calculator` | Pass | Pass | Not sampled |
| `/compare/beatroute-alternative` | Pass | Pass | Not sampled |
| `/compare/bizom-alternative` | Pass | Pass | Not sampled |
| `/compare/deltasales-alternative` | Pass | Pass | Not sampled |
| `/compare/freshsales-alternative` | Pass | Pass | Not sampled |
| `/compare/salesforce-alternative` | Pass | Pass | Not sampled |
| `/compare/zoho-alternative` | Pass | Pass | Not sampled |
| `/customers/Lapcare` | Pass | Pass | Not sampled |
| `/delivery-management` | Pass | Pass | Not sampled |
| `/distribution-management-system` | Pass | Pass | Not sampled |
| `/expense-management` | Pass | Pass | Not sampled |
| `/field-sales` | Pass | Pass | Not sampled |
| `/guide/quiz-pro` | Pass | Pass | Not sampled |
| `/` | Pass | Pass | Not sampled |
| `/industries/agriculture` | Pass | Pass | Not sampled |
| `/industries/automotive` | Pass | Pass | Not sampled |
| `/industries/cosmetic` | Pass | Pass | Not sampled |
| `/industries/electronics` | Pass | Pass | Not sampled |
| `/industries/fmcg` | Pass | Pass | Not sampled |
| `/industries/hardware` | Pass | Pass | Not sampled |
| `/industries/manufacturing` | Pass | Pass | Not sampled |
| `/industries/pharmacy` | Pass | Pass | Not sampled |
| `/industries/publishing` | Pass | Pass | Not sampled |
| `/industries/sport-and-fitness` | Pass | Pass | Not sampled |
| `/industries/telecommunication` | Pass | Pass | Not sampled |
| `/industries/transport` | Pass | Pass | Not sampled |
| `/inventory-management` | Pass | Pass | Not sampled |
| `/invoicing` | Pass | Pass | Not sampled |
| `/mobile-app` | Pass | Pass | Not sampled |
| `/order-taking-app` | Pass | Pass | Not sampled |
| `/partner` | Pass | Pass | Not sampled |
| `/payment-collection` | Pass | Pass | Not sampled |
| `/pricing/in` | Pass → /pricing | Pass → /pricing | Not sampled |
| `/pricing/us` | Pass → /pricing | Pass → /pricing | Not sampled |
| `/pricing` | Pass | Pass | Not sampled |
| `/privacy-policy` | Pass | Pass | Not sampled |
| `/production` | Pass | Pass | Not sampled |
| `/refund` | Pass | Pass | Not sampled |
| `/request-demo` | Pass | Pass | Not sampled |
| `/salesman-tracking` | Pass | Pass | Not sampled |
| `/saleson-vs-other-field-sales` | Pass | Pass | Not sampled |
| `/tally-integration` | Pass | Pass | Not sampled |
| `/target-meter` | Pass | Pass | Not sampled |
| `/terms` | Pass | Pass | Not sampled |
| `/tools/delivery-challan-generator` | Pass | Pass | Pass |
| `/tools/e-way-bill-checker` | Pass | Pass | Pass |
| `/tools/gst-calculator` | Pass | Pass | Pass |
| `/tools/gst-invoice-generator` | Pass | Pass | Pass |
| `/tools/hsn-sac-gst-rate-finder` | Pass | Pass | Pass |
| `/tools` | Pass | Pass | Pass |
| `/tools/outstanding-payment-tracker` | Pass | Pass | Pass |
| `/tools/payment-receipt-generator` | Pass | Pass | Pass |
| `/tools/purchase-order-generator` | Pass | Pass | Pass |
| `/tools/quotation-generator` | Pass | Pass | Pass |
| `/tools/stock-reorder-level-calculator` | Pass | Pass | Pass |
| `/tools/van-loading-sheet-generator` | Pass | Pass | Pass |
| `/tools/whatsapp-payment-reminder-generator` | Pass | Pass | Pass |
| `/user/software-for-distributors` | Pass | Pass | Not sampled |
| `/user/software-for-manufacturers` | Pass | Pass | Not sampled |
| `/user/software-for-retailers` | Pass | Pass | Not sampled |
| `/van-sales` | Pass | Pass | Not sampled |

## Changesets

[Metadata and review setup (PR 20)](https://github.com/vsahay16/saleson/pull/20) · [Tool repairs (PR 21)](https://github.com/vsahay16/saleson/pull/21) · [HSN/caching (PR 22)](https://github.com/vsahay16/saleson/pull/22) · [Header/customer/runtime fixes (PR 23)](https://github.com/vsahay16/saleson/pull/23). The final changeset adds article layout polish, this record and removes the temporary harness.
