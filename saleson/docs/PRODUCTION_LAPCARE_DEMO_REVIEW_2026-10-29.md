# Production, Lapcare and Request Demo review

Prepared on `review/production-case-demo` from production main e497047. Not merged or deployed.

## Changes
- Production: left-aligned copy, paragraph, topic labels and actions in a deliberate two-column hero. Wider evidence column uses a focused CSS crop of the existing recreated BOM asset. Full view supports zoom, scrolling, Escape/close and focus return through the existing image dialog. Secondary action stays alongside the primary where space permits.
- Lapcare: shared DM Sans body/DM Serif Display headings, SalesOn blue/ink palette, normal container and buttons. Context precedes the retained attributed quotation; original logo colours retained. Removed the unsupported portrait (`fujitec.jpeg`), precise outcome claims (20%, 100%, 50%), employee/retailer totals and extra quotations. No replacement results invented. Existing URLs, title, canonical and social metadata preserved.
- Demo: compact headline and one introductory paragraph, followed by booking. Existing four-client strip moved below booking; generator updated so future builds retain its placement. Visible loading/help status and a permanent “Open booking calendar” direct link next to the booking interface. Reasons to attend describe workflow relevance, questions/fit and practical next steps. Existing FAQ answers/schema remain aligned.

## Evidence and validation
- Reviewed saleson.co.in/request-demo: useful role-specific/fit content retained in concise form without carrying over unverified demo counts, refund promises or setup-time guarantees.
- Browser inspected the live zcal destination https://zcal.co/i/bkJXrTMK: SalesOn Demo, 30 min, Google Meet. This agrees with repository title, description, FAQ and booking label. The older live marketing page still says 15 minutes.
- Local browser QA: all three desktop layouts inspected; all three at 375px content width report scrollWidth=clientWidth. Production full-BOM dialog opened/closed successfully. The live scheduler loaded inside the mobile demo embed; direct scheduler also loaded.
- Full npm run check passed: 77 pages, schemas, routes/metadata/internal links, tracking regressions and all 155 tool scenarios.

## Still unverified
- No customer-approved evidence for the quotation, attribution/job title or old numerical outcomes was found. Retained quote needs Lapcare/customer-owner confirmation before publication. Portrait and precise metrics are omitted rather than treated as verified.
- Booking confirmation, recipient email/calendar invitation delivery and rescheduling/cancellation require a controlled real booking and an intended test recipient. No test appointment was submitted, and no booking/signup conversion was fabricated.
- No physical-phone, assistive-technology or cross-browser certification. Tracking configuration, Clarity and LinkedIn are unchanged; production tracking remains paused pending account verification.
