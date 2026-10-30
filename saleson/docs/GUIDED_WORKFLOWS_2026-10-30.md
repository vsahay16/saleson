# Guided workflows release

## Website implementation

- Homepage: a compact, collapsed workflow planner inside the existing product explorer. Distributor/manufacturer, team band and main task select an existing product screen, feature link and suggested demo agenda. The planner uses controlled enums; it sends no free text or business records to analytics or the scheduler.
- Help: three self-reported milestones for products, a salesperson invitation and a first real order. Checkmarks are stored only in this browser, with a visible distinction from verified app activity. Blocked storage remains usable; clearing saved progress requires confirmation.
- Contextual Help buttons open the corresponding supplied videos through the existing click-to-load dialog. Direct Drive fallbacks remain available. No iframe loading is counted as playback or conversion.
- Request Demo: selected workflow context appears beside the introduction, without changing the calendar or its direct fallback. The visitor is asked to mention the agenda to the team; no booking-service prefill or transmission is claimed.
- A collapsed sample workspace demonstrates order, invoice, payment and stock calculations, with staged actions, integer-paise arithmetic, validation, partial payment and reset confirmation. The label explicitly distinguishes it from the actual product and its configurable transaction sequence. No sample action writes SalesOn records or counts as a lead.
- No new page, pricing change, schema, canonical, sitemap URL, remote tag setting or advertising conversion is introduced. Clarity and LinkedIn remain preserved behind the existing release controls.

## App and CRM integration boundaries

Only the marketing repository is connected. The signed-in app source, database and TeleCRM integration are not available. `integrations/saleson-app` contains executable modules and an implementation contract for the app developer. No live account milestone, customer health dashboard, CRM write or outreach automation is claimed.

The app widget requires a tenant-authorized backend read and a host-router adapter. It has no manual completion controls. Unknown or failed data loads show unavailable status, not zero progress or success. The internal health module produces review reason codes from complete snapshots, not churn predictions. Its thresholds are initial assumptions for the customer-success team to review.

## Authentic workflow video

The existing homepage introduction was inspected and remains unchanged: it is a 68.544-second product introduction with animated content, not a verified recording of a connected transaction. The eight supplied Help recordings do not establish a complete order-to-stock demonstration. See WORKFLOW_VIDEO_BRIEF.md for a recording brief. No synthetic product UI or edited montage has been presented as an authentic live workflow.

## Validation

The guided-workflow check covers restored and cleared progress, cancellation, blocked and malformed storage, safe selector/query enums, sample steps, invalid quantities, overpayment, partial payment, paise rounding, app-adapter errors, contextual video cleanup and internal follow-up rules. The full website suite passed locally. Browser checks verified saved checklist restoration, contextual video opening/closing, homepage selection of the DMS panel, the suggested demo agenda, and a complete sample workflow with ₹590 invoice, ₹300 payment, ₹290 outstanding and 18 units remaining. Three 375px content-width checks showed body width equal to viewport width, with no page overflow. Keyboard expansion of the mobile planner also worked. The local static preview does not rewrite extensionless URLs, so the demo handoff used its .html preview path; verify the established clean URL on the hosted release. Physical phones, actual booking confirmation, signed-in app/backend/CRM integration and full video playback remain separate acceptance checks.
