# Free tools review — draft

Scope: tools hub and all 12 linked tools, based on main 1b6d98f. This draft does not include the separate About/policy or Request Demo work.

## Changes
- Keep the hub's primary 12-tool filterable directory; remove four duplicate category grids, the artificial all-12-tools workflow chain, and repeated general software explanations. Preserve the category anchor IDs.
- Across individual tools, remove repeated broad SalesOn platform pitches and “when to move” sections. Retain specialist instructions, formulas, worked examples and FAQs. Replace repeated full tool catalogues with three relevant related tools and one concise product link.
- Retain tool titles, H1s, canonical URLs, form fields and calculation/export code. Two Van Sales promotional buttons are replaced by the concise relevant product link; document controls remain intact.
- Clarify the hub's broad compliance FAQ rather than promising complete compliance.
- Correct the e-way guide's small-job-work implication: specified interstate job-work movements can require an e-way bill irrespective of value. This is a guide-text change; no tax-rule engine rewrite.

## Verification
- All 13 public URLs returned HTTP 200 with no noindex in their HTML at the time of review.
- Full existing repository checks pass. They cover paise rounding/currency words, cross-tool handoffs, invoice and quotation totals, reorder/MOQ/pack/stock cases, ageing and payment balances. These tests do not certify all tax rules, all HSN rates or rendered PDFs.
- Source comparison preserves inline executable scripts and all form controls; only two promotional Van Sales buttons are removed. Titles and H1s preserved. Local anchors checked.
- Browser layout and actual print/download rendering are not verified in this session.

## Findings requiring a separate functional/content pass
- HSN/SAC uses an embedded starter database, not a live official rate service. Confirm every used code/rate against current notifications; avoid presenting it as exhaustive.
- E-way checker is a general indication with incomplete coverage of state thresholds and exceptions. It is not an official portal/status lookup. Do not infer complete tax-compliance coverage from automated calculation tests.
- Lead capture hooks default to an empty salesonLeadEndpoint in the repository. Check whether the deployed site sets a working endpoint before treating locally saved details as CRM leads. No real visitor submission was sent during this audit.
- Some tool actions open lead modals although surrounding copy promises no contact-detail requirement. Review the end-to-end lead flow before promising all actions are ungated. This editorial pass preserves those interactions and does not remove your lead collection workflow.
- Browser storage can be denied or cleared. Local records are not a centrally backed-up business ledger. Export important data. Third-party share/download actions have their own behaviour.

References checked: https://docs.ewaybillgst.gov.in/html/faq1.html and official CBIC rate resources. Use current operative notifications for transaction-specific decisions; older government pages may display superseded rules.
