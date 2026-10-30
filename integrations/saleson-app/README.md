# SalesOn app integration handover

The connected repository contains the marketing website, not the signed-in app or its database. These modules are executable integration code, not a deployed app integration. No account data has been accessed and no CRM messages are sent.

## Onboarding checklist and contextual help

Import `mountOnboarding` from `onboarding.mjs` into the actual app. Supply two host adapters:

- `loadMilestones()` reads the authenticated account's milestone state from your backend. It returns the contract below, without customer names or document data.
- `openTask(key)` navigates through your existing app router for products, invitations or orders. No app routes have been guessed in this kit.

```js
const widget = mountOnboarding(container, {
  loadMilestones: () => yourExistingAccountApi.readOnboarding(),
  openTask: key => yourExistingRouter.openOnboardingTask(key)
});
// Refresh after the backend confirms an action, or when the user returns.
widget.refresh();
// On unmount: widget.destroy();
```

Required response example (contract only):

```json
{
  "source": "server",
  "milestones": {
    "products_added": {"completedAt": null},
    "salesperson_invited": {"completedAt": null},
    "first_order": {"completedAt": null}
  }
}
```

Replace null with the actual UTC timestamp when that successful operation first occurred. The backend must authorize tenant and role access. The `source` field is a UI contract, not a security mechanism. Server records remain authoritative. Keep product-added history even if the item is later deleted. An invitation counts only after successful creation/sending according to the app's actual process; a button click does not count. The first order counts only after a successful committed real order, excluding demo/test data. Use idempotent first-occurrence writes so retries do not move timestamps or double-count milestones. Do not let a client checkbox write these records.

For contextual help outside the checklist, call `mountTaskHelp(element, task)` with `setup`, `review`, `attendance`, `password`, `checkout`, `product`, `route` or `help`. Place it beside the relevant app action. All eight mappings use the supplied Drive recordings, with direct fallbacks. Players load after a click; closing cleans up the iframe and restores focus. No playback or completion is inferred from iframe loading. Style the controls with the app's existing design system.

## Customer health follow-up queue

`assessCustomerHealth` accepts an internally authorized account snapshot. It returns reason codes, never a churn probability. Rule defaults are starting assumptions for the customer-success team to review: incomplete onboarding after 3 days, no core activity for 7 days, or fewer than half the account's own average weekly active days when a prior baseline exists.

Required snapshot keys: `snapshotComplete: true`, `createdAt`, `firstProductAt`, `firstSalespersonInviteAt`, `firstOrderAt`, `lastCoreActivityAt`. Missing events use null; unknown or unavailable data must NOT be represented as a complete snapshot. Optional activity counts are `prior28ActiveDays` and `recent7ActiveDays`, using disjoint windows and the same UTC day definition. Baseline comparison requires 35 account-age days and at least 8 prior active days. Only committed business actions count as core activity; exclude login, page views, bot/system jobs, training and test records. Invalid or incomplete data returns `insufficient_data` rather than an alarming flag.

Run the rules in your backend job, never with a publicly shipped account export. Apply your tenant and support-role permissions. Put resulting reasons and a suggested human follow-up into the internal CRM. Review paused or seasonal accounts, weekends and agreed usage before contacting a customer. Suppress acknowledged cases to avoid repeated outreach. Automatic messages, TeleCRM writes and contact lists are not part of this change.

## Measurement

Use server milestone timestamps to calculate registration-to-products, invitation and first-order completion rates and elapsed time. Choose denominators by signup cohort and report incomplete cohorts separately. Keep business data, account identifiers, invitation addresses, form contents and document records out of GTM/GA4/advertising payloads. Do not treat these UI states as signup or demo conversions. Existing consent, Clarity, LinkedIn and GTM release controls remain unchanged.

## Remaining acceptance checks

Connect the adapters in the actual app; verify two separate tenants and role restrictions, successful actions, failed actions, duplicate retries, existing records, refresh and API errors. Verify the CRM queue against actual account history before enabling scheduled follow-up. No migration or app deployment is claimed by this handover.
