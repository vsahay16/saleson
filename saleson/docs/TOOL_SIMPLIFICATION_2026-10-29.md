# Free tool simplification — 29 October 2026

## Scope and status

Implemented on `review/quiet-tools-and-safety`, based on the source tree deployed by main commit `7a1e2b7`. This pass changes the 12 business tools, Tools hub, standalone sales-leakage calculator and Field Sales Quiz. Unrelated marketing pages retain their published content/layout; shared asset references update as needed. The shared footer has a compact variant used only by utilities.

No production deployment, main merge, remote GTM edit, account-setting change or real customer-message send was performed in this pass. Clarity and LinkedIn have **not** been removed: their source IDs, consent categories and GTM migration instructions remain. Tracking is still paused by the existing `releaseApproved:false` gate until the account/container checks in the earlier tracking review are completed. This work does not certify or enable remote tags.

## Removed and retained

Every business tool now follows: shared header → existing H1 and one sentence → workspace toolbar → working tool/result → collapsed task help → three related tools → compact shared footer.

Removed the hero badges, audience strips, duplicate “free/no signup” copy, paid-software promotion, repeated demo/trial pitches, long generic FAQs and large related-tool grids. Removed FAQ schema corresponding to deleted visible FAQs. The original source remains recoverable in Git; `tool-content-removals.json` records the removed sections' opening text.

Kept the actual forms, calculation/state functions, document layouts, tax splits, dates, draft keys, import/export controls, print roots, transfer payloads and relevant limitations. Document/print typography remains separate from the site's body font. Wide tables retain their own scroll areas. All 12 established tool URLs remain unchanged.

Static main-content text across the 12 business tools dropped from **14,507 to 4,837 words (66.7%)**. This count includes field labels and select options, not just editorial paragraphs, and is not a traffic/SEO metric.

| Tool | Main change |
|---|---|
| GST Invoice | Compact toolbar, optional groups, prominent PDF action, enlarged preview, safer imported text and fractional rates |
| Quotation | Same utility layout; optional terms/design; repaired incoming HSN/calculator transfer |
| Delivery Challan | Moved the introductory callout into help; removed repeated dispatch promotion and explainers |
| Payment Receipt | Payer/payment task first; Appearance moved below core details; duplicate save/reset actions removed |
| Purchase Order | Optional schedules/approvals/design collapsed; vendor/items/total retained |
| GST Calculator | One accessible calculation selector replaces five large mode cards; original modes retained |
| HSN Lookup | Accurate goods-only scope; eight compact candidates initially, Show more, detail view and manual rate confirmation |
| Van Loading | Optional business/route/collection/outlet/damage groups collapsed; stock entry and result jump retained |
| Stock Reorder | Explicit readable result-header colours; method settings collapsed; planning/import/export retained |
| Outstanding Payments | One draft toolbar; invoice table and balances retained; CSV import/export and reminder/receipt transfers kept |
| WhatsApp Reminder | Editable message, three named variants rather than five tabs repeating three variants; edited message survives save/restore |
| E-Way Checker | Compact movement form/results; essential limitation retained; corrected dynamic transfer URLs |

The Tools hub now has a short introduction, search/categories and compact cards with a name, useful sentence and visible Open tool action. The standalone calculator loses its promotional lower sections, keeps a concise assumptions note and gains an accurate three-step indicator. The quiz loses the redundant SalesOn masthead while retaining multilingual fonts and language controls.

## Workspace and accessibility behaviour

- One toolbar distinguishes Load sample, Start blank, Save draft, Restore draft and Reset. Replacements require confirmation. Reset returns to the currently chosen sample/blank/restored-draft mode; saved drafts are retained.
- Restoring malformed saved rows is rejected visibly rather than silently applying partial data. Existing draft keys remain compatible. Blocked/full browser storage keeps in-tab work and displays an honest warning; saving is not reported as persistent success.
- Optional sections use native details/summary. Label associations and dynamic item-cell labels are supplied. Document export validates fields and opens a collapsed group containing an invalid field.
- Document PDF/print actions remain browser print actions, not proof that a file was saved. CSV notices say a download was requested. Clipboard success appears only after the Clipboard API or copy fallback reports success.
- Document previews can be enlarged in a keyboard-accessible native dialog, with a close control and focus return. A View result link supports stacked phone layouts.
- WhatsApp floating buttons are removed from utilities; the shared footer keeps contact navigation. Cookie preferences are in normal document flow on tools and standalone utilities. Initial consent presentation no longer focuses a control at the page bottom and scrolls the user away from the task.

## Safety and transfer fixes

1. Invoice, Quotation, Purchase Order, receipt reference rows and calculator item rows now assign imported input values through DOM `.value`, rather than interpolating them into input HTML. Preview text is escaped; document HTML is additionally sanitised with vendored DOMPurify (licence included). User-entered `<b>…</b>` is displayed literally.
2. Document GST selectors include the fractional rates already accepted by the HSN tool. Valid explicitly supplied numeric rates are preserved; invalid rates stop the import visibly. Zero quantities are retained instead of being replaced with one.
3. Quotation previously had no incoming HSN/calculator reader despite those tools offering transfers. It now reads the latest valid handoff or HSN URL fallback and preserves description/code/rate. Used query parameters are removed after successful import. Invoice also rejects an unconfirmed HSN rate instead of treating it as zero.
4. HSN recent searches are bounded strings and built as DOM elements with textContent. Stored objects/null/oversized terms do not become HTML chips. The lookup no longer offers unsupported service/SAC categories. It does not invent or automatically supply tax rates.
5. Repaired the Van Loading → Outstanding Tracker fallback invoice number, which referenced an undefined `VAN` variable when an outlet lacked its own invoice number.
6. Corrected E-Way transfer links that omitted `/tools/`. No existing public route was moved.

## SEO and internal links

Titles, H1s, descriptions, canonicals, social metadata, sitemap, robots, redirects and indexing behaviour are preserved **except one intentional correction**: HSN's title/H1/descriptions now describe its actual goods-heading lookup scope, and its hub/footer labels agree. The existing `/tools/hsn-sac-gst-rate-finder` URL is retained. The old title promised a service/rate finder that the data did not provide.

No Search Console connection/export was available. Therefore this pass makes no claim about organic traffic, rankings or Google-selected canonicals. It removes repeated marketing material, retains unique task guidance and keeps removed text recoverable. Review landing-page/query data before any future URL migration or further deletion of useful unique guidance.

The final local checks validate **77 pages**, **87 JSON-LD blocks**, **74 sitemap URLs** and **1,609 internal links/anchors**. Existing page-specific metadata is regression-checked, with the HSN scope correction explicitly allowed. FAQ markup was removed rather than left inconsistent with deleted FAQs.

## Validation

**Passed:** complete `npm run check`, including existing pricing/arithmetic/transfer checks and the new full-DOM `scripts/check-tool-flows.cjs` suite. The new suite executes all 12 tools with third-party requests blocked and covers **155 scenarios**: initialization, sample/blank/reset, replacement cancellation, draft save/restore, blocked storage, malformed saved data, supported CSV imports, export/print preparation, fractional GST, literal imported text, HSN URL transfers, pagination, editable message/copy and copy failures. These are local programmatic tests, not real account/vendor tests.

**Browser observations:**

- All 15 utility routes (hub + 12 tools + calculator + quiz) checked at both **360px and 390px** content widths: **30 checks, no page-wide overflow and no initial scroll-to-footer**.
- Input/preview columns and screen/print separation inspected on desktop. Hub Open tool actions confirmed white on blue.
- Invoice entry: quantity 2 × ₹1,000 at 0.1% gives **₹2,002.00**; `<b>literal</b>` stays literal with no interpreted bold element.
- Enlarged preview opens and closes via keyboard. The shared phone menu opens/closes; help expands; cookie preferences fit the phone width and reject optional tracking.

**Still unverified:**

- The browser's native download-event check timed out, then its tab connection timed out. CSV content generation and export invocation passed locally, but actual browser file saving is **not certified**. Browser print roots/invocation passed; no physical printer or final Save as PDF output was certified.
- Real iPhone/Android browsers, operating-system keyboards, keyboard-open viewport resizing, assistive-technology reading and cross-browser rendering are not certified by desktop iframe width checks.
- Full tax/legal correctness, exhaustive HSN coverage and current statutory applicability remain outside these tools' stated limitations.
- Search Console impact, live custom-domain routing/indexing and remote GTM/GA4/Ads/Meta/Clarity/LinkedIn behaviour remain separate account/deployment checks.

## Broader attached audit

The old audit's header contrast, one-GTM coverage and consent findings were already addressed in the deployed base; the remote malformed Meta configuration still needs account access. The request to remove Clarity/LinkedIn is explicitly superseded by the user's instruction to keep them.

General-site recommendations about Production/Attendance layouts, Lapcare claims/photography, broader marketing typography and real company imagery were not treated as permission to redesign those pages in this tool-only pass. Their content is unchanged. This report does not mark those recommendations or unverified customer outcomes as resolved.

## GitHub review preparation

The verified changes were rebased onto main `7a1e2b7` without conflicts. Both Vercel configuration roots disable automatic deployment for `review/quiet-tools-and-safety` only, so pushing this review branch does not request a preview deployment. Other hosting settings, routes and main deployment behaviour remain unchanged. No merge or deployment is authorised by this PR.
