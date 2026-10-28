# SalesOn tracking and SEO review — 29 October 2026

## Review status

Prepared locally against the latest design branch tree `fa056c6b691fe5885709e831efead283c25d0975` (remote PR #25 head `48e29b4d6e322571805ed2298081360341c60ce7`). GitHub main was checked and remains `68ad44e52b58cd7bdeeb849140052ceff6ee245c`. No website deployment, remote tag edit, container publish, merge, account setting change or test lead submission was performed. Do not push this branch to a deployment-connected remote until release is authorised.

**Not production-ready until account verification.** `assets/js/tracking-config.js` deliberately has `releaseApproved: false`. This blocks GTM even on production after consent. Deploying this draft as-is would pause tracking, not complete a migration. Keep it for review. Retained direct vendor implementations are quarantined with `if (false)` and original pixel markup is commented; do not delete that audit trail until their GTM replacements pass runtime tests. Existing reporting properties/accounts have not been changed.

## Implemented

- WhatsApp float is a 44px circular button with the normal 22px mark, accessible label/focus and no text pill. Existing encoded greeting is decoded/re-encoded once.
- Pricing amounts, billing calculations, currencies, trial and seat minimum unchanged. Targets/incentives moved to Enterprise only in all three region configs, cards and comparison. Tally JSON export is included in both. Auto-sync is a separate subscription plus a one-time setup fee for both; no price invented. Setup FAQ distinguishes the optional integration from free account setup.
- One shared GTM head loader per HTML document, before other executable code; one fallback reference immediately after body. Redundant GTM bootstraps removed from app/common/header; unrelated UI code kept. The fallback is intentionally inert inside a template: unconditional noscript cannot obey JavaScript consent, host and release checks. A fully active standard noscript fallback needs a consent-aware server-rendered response. Static HTML cannot meet both requirements. No-JavaScript visitors receive no optional tracking.
- Basic consent: analytics and advertising default denied; essential/security granted. Separate choices, reject/save/accept, persistent 180-day preference and a reopen control. GTM starts at most once after an optional grant, on exact HTTPS production hosts only, and only after release approval. Revocation sends denied state then reloads to unload SDKs; account-side revocation/cookie deletion still needs verification.
- Previews, localhost and lookalike hosts cannot load this container. `app.saleson.co.in` is intentionally not claimed as implemented by this marketing repo. Internal testers set `localStorage.setItem('saleson-internal','1')` **before their first production visit/consent**, then reload. Remove with `localStorage.removeItem('saleson-internal')`. Flag is browser-specific; GA4 internal traffic rules are an additional account control. There is no URL parameter that enables production telemetry on a preview.
- Enum-only data-layer events. Canonical repository path/location; no query, hash, page title, form values, email, phone number, link target, document, invoice, generated filename, customer or user identity is copied. No events buffered for replay after refusal. Removed the old consent-unaware `tool_opened` enqueue. Printing/downloads remain usable without analytics.
- Added a single BlogPosting node to each of 12 articles using its visible headline, original date and editorial image; added missing homepage Organization. Existing 18 BreadcrumbList nodes and relevant software schemas preserved. No reviews, ratings or new FAQ schema added. VideoObject deferred: reliable original upload dates are absent; file modification time is not a publishing date. Obtain source video dates before adding compliant video metadata.
- Existing page-specific title/description/canonical/social tags, 74 sitemap URLs, robots, redirects, routes, internal links and indexability preserved. Preview noindex remains a hosting/environment responsibility; never put blanket noindex into production source.

## Account IDs and access required

| System | Repository observation | Still required |
|---|---|---|
| GTM | `GTM-WQNBHFQS` | Owner confirms this container belongs to SalesOn web; read/export access to current published version and workspace, plus separate test workspace. Container reference alone does not verify ownership/intended destination. |
| GA4 | No verified Measurement ID found | Existing property and web stream `G-…`, access to Admin/DebugView and current event/key-event settings. Do not create a replacement property. |
| Meta | Direct source pixel `24368712786163410` | Events Manager confirms dataset/pixel ID, business ownership, current browser/CAPI setup and Test Events. Numeric source ID is not proof of correctness. |
| Google Ads | No verified conversion identifiers/labels found | Existing Ads customer and conversion action IDs `AW-…`, exact labels for confirmed demo/signup, current counting/import settings and diagnostics access. |
| Clarity | Direct source project `xg2o1hk1wt` | Project owner verification, project settings, masking/exclusion controls and recording inspection access. |
| LinkedIn | Direct source partner `10538113` | Campaign Manager confirms partner/account and any existing conversion rule IDs. |
| App | Trial links lead to `app.saleson.co.in` | App code owner/access and backend signup-success hook. This repo contains no account-creation handler. |
| Booking | `https://zcal.co/i/bkJXrTMK` iframe and direct fallback | zcal owner/settings, documented confirmed-booking callback or signed webhook, supported tracking/linker capabilities and test booking procedure. No arbitrary postMessage listener added. |

No supported connected analytics/advertising account tools were available in this session. Remote GTM tags and the reported malformed Meta value could not be inspected. Repository edits do not fix a malformed value inside GTM.

## Exact GTM preparation steps — save a workspace, do not publish

1. Open GTM, select the account owning SalesOn, and confirm web container ID `GTM-WQNBHFQS`. Export the published version and current workspace separately. Record version number and all tag destinations. Check each tag's firing/exception triggers, consent and any HTML variables. Preserve IDs associated with historical reporting.
2. Create a workspace named `SalesOn consent and confirmed conversions review`. Inventory Google tag/GA4, Ads, Meta, Clarity and LinkedIn tags, including community templates, custom HTML, legacy UA, Google tag destinations and duplicated automatic events. Keep a mapping of old -> replacement. Do not publish or delete live tags during this task.
3. **Investigate Meta:** open every Meta tag and all variables supplying Pixel/Dataset ID. Inspect resolved value in Tag Assistant. Compare byte-for-byte with Events Manager > Data Sources > correct dataset > Settings. Look for a pasted full script/URL, whitespace, non-digit characters, quotes embedded in the value, multiple comma-separated IDs or an ID from another dataset. Set a single constant containing the account-verified numeric ID; use that constant in base and event tags. Check custom HTML for duplicate `fbq('init')`/PageView and any browser/CAPI overlap. Do not substitute the repository's observed ID unless Events Manager confirms it. Save workspace only; test after release is authorised. Capture the actual malformed old/resolved value in the change log.
4. Create Data Layer Variables, Version 2: `page_location`, `page_path`, `page_referrer`, `saleson_production`, `saleson_analytics`, `saleson_advertising`, `video_kind`, `video_percent`, `file_type`. Do not use auto-event element text, click URL, form fields or filenames as parameters. Never register personal data as GA4 custom dimensions.
5. Create a constant verified GA4 Measurement ID; other vendor IDs come only from their verified accounts. Keep these destinations in GTM, not new direct loaders in the website.
6. Create a **Consent Initialization** custom template using GTM's native consent APIs (not a Custom HTML `gtag` consent tag). Read the current `SalesOnTracking.getConsent` through permitted `callInWindow`. Default missing values to false. Call `setDefaultConsentState` with analytics/ad storage, ad user data and ad personalisation denied, and functionality/security granted. Then call `updateConsentState` with the current choices. Add a second instance of the template on custom event `saleson_consent_update` using `updateConsentState`, so updates are applied before later marketing events. Required APIs: `setDefaultConsentState`, `updateConsentState`, `callInWindow`; grant only the necessary global function access. This complements the website's pre-bootstrap consent queue and avoids asynchronous consent ordering in GTM.

   Template core (use an action dropdown `default`/`update`):

   ```js
   const callInWindow = require('callInWindow');
   const setDefaultConsentState = require('setDefaultConsentState');
   const updateConsentState = require('updateConsentState');
   if (data.action === 'default') {
     setDefaultConsentState({analytics_storage:'denied', ad_storage:'denied',
       ad_user_data:'denied', ad_personalization:'denied',
       functionality_storage:'granted', security_storage:'granted'});
   }
   const c = callInWindow('SalesOnTracking.getConsent') || {};
   updateConsentState({analytics_storage:c.analytics === true ? 'granted' : 'denied',
     ad_storage:c.advertising === true ? 'granted' : 'denied',
     ad_user_data:c.advertising === true ? 'granted' : 'denied',
     ad_personalization:c.advertising === true ? 'granted' : 'denied'});
   data.gtmOnSuccess();
   ```

7. All measurement triggers require Page Hostname matching `^(www\.)?saleson\.co\.in$` **and** DLV `saleson_production` equals true. Exclude internal-test browsers. In GA4 additionally define office/VPN internal IP traffic; initially keep its exclusion filter in Testing, review, then Activate only with approval. Leave debug traffic out of primary reports through approved developer filters. Do not loosen the source hostname gate to debug against production accounts on preview hosts.
8. Create Custom Event triggers for the exact `saleson_…` names in the table below, with analytics boolean true. Make Google tag setup once per document and configure `send_page_view=false`. Pass sanitised `page_location`, `page_referrer` and `page_path` before the first event. Send a GA4 `page_view` only on `saleson_page_view`; no All Pages auto page view and no GA4 “create event” rule that duplicates these. Use an event-name lookup table to map the remaining prefixed events to the unprefixed GA4 names; unmapped values must not fire. Turn off Enhanced Measurement form interactions, outbound/download/video duplication, history pageviews and automatic user-provided data collection. Keep only explicitly reviewed measurement. No user_id, user properties or enhanced conversions in this patch.
9. Meta: verified pixel base once, consent-required for all advertising types, automatic advanced matching OFF and automatic events/event-setup form/click rules OFF. Explicit PageView can run once on `saleson_page_view` when advertising consent is also true. Do not create Lead/CompleteRegistration tags for any click/download. This conservative setup requires analytics + advertising for page/engagement signals; advertising-only consent loads no activity events.
10. Google Ads: verified Google tag destination and Conversion Linker through GTM, with advertising consent required; no click-based lead conversion trigger. Review linked Google tag destinations so a separate auto pageview/tag doesn't duplicate the explicit flow. Turn off automatic user-provided data collection/enhanced conversions until separately approved.
11. Clarity: verified project through GTM, analytics consent required. **Exclude `/tools`, `/calculators`, `/guide`, and any app/form/document workspace from Clarity entirely**, including recording, DOM/snapshot and cookies. Keep strict masking on remaining pages; do not unmask contact/form fields. Bridge each consent update through a GTM-managed tag calling `clarity('consentv2', {analytics_Storage: …, ad_Storage: …})` with the actual granted/denied choices. On withdrawal invoke the documented denied/revocation behavior before reload and verify cookie/recording cessation. Clarity is not an exception to consent.
12. LinkedIn: verified partner via reviewed InsightTag 2.0 template, advertising consent required, once per page on explicit pageview (analytics + advertising). No auto-click leads, no personal data, no default Lead event. Verify existing conversion rules do not treat `/request-demo` or a scheduler opening as success. Keep tool/document workspaces excluded from advertising SDKs until their URL/automatic-data collection settings are audited.
13. Add vendor-specific revocation handlers on `saleson_consent_update`: Meta consent grant/revoke and Clarity ConsentV2; reload unloads SDKs after a grant is withdrawn. Validate vendor cookie deletion according to project requirements; don't assume Consent Mode alone controls non-Google vendors. Disable tags that cannot honour withdrawal.
14. Save/export this workspace for review. Keep source `releaseApproved:false`. Only after separate approval and account/runtime QA: validate replacements, remove the quarantined direct implementations, approve the release gate and coordinate the site/container cutover. Do not leave both active. Retain rollback exports and old reporting IDs. No cutover is authorised by this document.

## Event and conversion mapping

| Website data-layer event | GA4 event | Type / source |
|---|---|---|
| `saleson_page_view` | `page_view` | Once after analytics consent per full page load |
| `saleson_pricing_view` | `pricing_view` | Pricing visit; not a lead |
| `saleson_demo_click` | `demo_click` | Demo link or zcal fallback; not a booking |
| `saleson_trial_click` | `trial_click` | App trial navigation; login excluded; not account creation |
| `saleson_whatsapp_click` / `saleson_phone_click` / `saleson_email_click` | `whatsapp_click` / `phone_click` / `email_click` | Contact intent only |
| `saleson_video_start` / `saleson_video_progress` / `saleson_video_complete` | `video_start` / `video_progress` / `video_complete` | Native videos only; start, 25/50/75 percent, end; deduplicated per video/document. YouTube iframe engagement requires a separately reviewed player integration, not iframe load. |
| `saleson_tool_download` | `tool_download` | CSV export or print/save-PDF initiation; not proof a file was saved; never a lead |
| Not implemented here | `demo_booked` | Only verified booking success from zcal/backend; future integration |
| Not implemented here | `sign_up` | Only successful company account creation from app/backend; future integration |

GA4: Admin > Events/Key events: only verified `demo_booked` and `sign_up` should become lead/signup key events. Inspect and remove erroneous key-event definitions based on clicks, pricing visits, scheduler visits and downloads **only after reviewing historical account settings**. Keep those events as engagement. Do not erase historical data.

Meta: after confirmation integration, map confirmed demo to Lead and successful account creation to CompleteRegistration, with existing verified dataset and event IDs. If sending both browser and CAPI, use the same opaque event_id to deduplicate; do not send contact details in this scope. This implementation sends neither event.

Google Ads: Goals > Conversions > Summary: inspect existing confirmed-demo/signup actions. Choose one measurement path per goal: native Ads tag **or** imported GA4 key event, not both Primary. Use existing IDs/labels, count One for leads, retain appropriate account-approved attribution/window settings. Make intent/download actions Secondary or remove them from bidding goals after review. Never change a current conversion action just to match a guessed label. Use opaque completion ID/transaction_id for deduplication when the approved integration exists.

LinkedIn: existing confirmed conversion rule IDs must also use the actual completion trigger, never request-demo page visits. Do not invent rule IDs.

## Confirmed completion and attribution integration still needed

- zcal iframe is a cross-origin boundary. A load event, opening its fallback, visiting request-demo, a button click or an unauthenticated URL parameter is not confirmation. Obtain zcal's supported callback/webhook documentation. Use a verified successful-booking callback with strict origin, schema and event validation, or a backend verifying the provider's signed webhook and idempotently recording a booking. Do not expose provider secrets in browser code. No general postMessage “success” detector is installed.
- The application must emit `sign_up` only after its backend confirms a new company account was successfully created. Do not emit on submit, validation failure, login or employee login/download. An app success hook/server-side integration and its consent state are required; marketing source cannot provide this.
- Store one opaque non-personal completion identifier per real booking/signup and deduplicate **server-side across retries, reloads, callback/webhook and browser/server delivery**. Client/session storage alone is insufficient. No hashes of emails, phone numbers or generated document data.
- GA4 Admin > Data streams > existing Web stream > Configure tag settings > Configure your domains: use the same verified stream/tag across `saleson.co.in` and `app.saleson.co.in` with compatible cookie-domain settings. Implement matching consent controls in app; localStorage on the marketing origin does not share consent with the app automatically.
- Add `zcal.co` to cross-domain settings only if the booking service actually supports the same tag/linker and preserves `_gl`. Test both embedded and direct scheduling. If it does not, use an approved consented attribution handoff and backend booking confirmation. Unwanted-referral exclusions alone do not stitch identities or prove attribution. Do not blindly exclude all booking traffic.
- Configure approved Ads auto-tagging and Conversion Linker. Test UTM, gclid/wbraid/gbraid where supported, redirects, `_gl` preservation, app success and direct/embedded zcal flows. The new custom payload intentionally omits raw queries and referrers; original query-based attribution must be verified in the approved native tag/linker configuration. Review a sanitised, allowlisted campaign mapping if required; never reintroduce unrestricted URLs/form values to regain attribution. Cross-domain/campaign continuity is **unverified** in this review.

## Validation results and remaining checks

**Local/source tests passed:** full `npm run check` suite; 77 HTML documents, 100 valid JSON-LD blocks, 6,213 local asset/page references, 74 unchanged sitemap URLs; one head loader and one inert fallback per page; 1,728 internal links and fragments; unchanged page-specific metadata/robots/hosting routes. Pricing calculator cases and existing tool logic still pass. Seventeen network-stubbed tracking scenarios cover consent rejection/grant, analytics-only/advertising-only, repeat grants/loader/pageview dedup, release gate, exact production hostname exclusions, internal flag, withdrawal, saved/expired/versioned consent, storage failure, payload filtering and rejected fabricated conversion names. Event-handler tests cover click deduplication, contact intent without contact values, and video milestones.

**Local browser checks:** pricing reflects Enterprise-only targets and both Tally distinctions; WhatsApp link preserves original greeting and float is icon-only. Reject closes the consent panel. Accept-all persists across reload and does not load a GTM script on the local host. Reopen restores checked choices; withdrawal/reject persists. No real lead/account was created.

**Not verified:** GTM account ownership, published/workspace content, malformed remote Meta value, GA4/Ads IDs and labels, SDK consent/cookie behaviour, actual vendor network payloads, Meta Pixel Helper, LinkedIn/Clarity diagnostics, Google Tag Assistant/GA4 DebugView, Rich Results Test/Search Console indexing, confirmed booking/signup, cross-domain identity/campaign attribution or production runtime. No production tracking was exercised.

**Runtime acceptance checklist, after separate test/cutover approval:**

1. Use a separate test container/property/dataset or an explicitly approved isolated test hostname; never simply allow previews to send production data. The source gate remains closed in this deliverable. For production Tag Assistant, use an approved controlled rollout, not fabricated browsing traffic.
2. In Tag Assistant Consent tab verify all four Google optional signals denied before choice, analytics-only grants only analytics, advertising-only grants only ads, accept grants both, reject loads none, withdrawal revokes SDKs/cookies and no subsequent measurement requests. Repeat new/returning/expired/blocked-storage cases.
3. In Network and vendor helpers confirm one GTM request, one GA4 page_view, one Meta PageView when both consents allow it, no direct duplicate GA4/Ads/Meta/Clarity/LinkedIn installs, one tool action event and no SDK calls on previews/internal or refused consent. Inspect each actual request for query/referrer/contact/form/document leakage. Disable any SDK failing this check.
4. GA4 DebugView/Realtime: pricing, demo/trial/contact, native video thresholds and exports appear as engagement only, without PII. No key event when a scheduler opens or trial link is clicked. Confirm automatic form/click/scroll/download/video rules do not duplicate the controlled events. Inspect YouTube separately; iframe loads are not video starts.
5. Book a clearly identified test demo and create a test company account through authorised test systems; verify provider/backend confirmation, one conversion across reload/retry/duplicate webhook, and zero conversion on failed/abandoned flow. Check Ads diagnostics/Meta Test Events/LinkedIn diagnostics and conversion dedup IDs. These tests are blocked until integrations/access exist.
6. Verify consent and original campaign source across site -> app and direct/embedded zcal; test `_gl`, redirects and approved ad click parameters. Confirm completion belongs to original campaign, not a self-referral. Do not claim attribution until observed.
7. Run Rich Results Test on the prepared pages once an approved test URL exists; validate Article dates/headlines/images, Organization and existing Breadcrumb/Software graphs. No promise of rich results, ratings or FAQ eligibility.
8. Compare crawl URLs/robots/sitemap/canonicals against this baseline; ensure host-level preview `X-Robots-Tag: noindex` applies only to preview environments. Approve source and container together before cutover.

References: [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent), [GTM native consent template APIs](https://developers.google.com/tag-platform/tag-manager/templates/consent-apis), [cross-domain setup](https://support.google.com/analytics/answer/10071811), [Clarity ConsentV2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2), [LinkedIn Insight Tag](https://business.linkedin.com/advertise/ads/insight-tag), [software structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app).
