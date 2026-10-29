# Help & onboarding hub — review branch

New canonical page: `/help`. One hub, not a separate page for every video or question.

## Included

Eight supplied task videos: Setup, Review your business, Get Help, Mark attendance, Forgot password, Accidental attendance checkout, Missing product, Missing route. The first three form Getting started; attendance is Daily work; the remaining four are Troubleshooting. Descriptions are bounded by the supplied file titles, not invented UI instructions.

Drive metadata checked all eight files on 29 October 2026: `anyone:reader`. No sharing permissions changed. `assets/data/help-videos.json` records the titles, groups and source IDs. Seven promotional feature videos are omitted from this support workflow to avoid duplicate overview content.

Search and category filters operate locally. Each video has an explicit Watch guide action and a direct Drive link usable without JavaScript. A single native dialog creates the Drive player only on request; closing removes the iframe and returns focus. Loading text and fallback stay visible. Opening a player is not treated as playback or a conversion. Cross-origin Drive playback milestones cannot be certified by the site's existing native-video tracker.

Uses the approved dashboard as orientation evidence and a cropped, real Reports workspace from Batch 03. New Reports inline variants are approximately 22 KB and 46 KB; the full-size enlargement is about 102 KB. Originals are unchanged. No generated images needed, no fabricated report outputs.

Support actions use the existing WhatsApp number, telephone and support email. No promised response times. Shared navigation retains existing links, adding Help in the Solutions dropdown, mobile menu and footer; homepage returning-user line also links to Help. Shared component fingerprints updated throughout the site.

## SEO and tracking

Unique title, description, self-canonical and social metadata; CollectionPage and BreadcrumbList. No speculative VideoObject durations, upload dates, ratings or FAQ schema. Adds only `/help` to the sitemap. Existing metadata and routes remain checked. New-page baseline exception is limited to `help.html`; existing-page comparisons remain active. Tracking/consent gate copied from the current shared implementation. Clarity, LinkedIn and existing release controls unchanged.

## Verification

Full `npm run check`, including 155 tool-flow scenarios, plus `check-help.cjs`: eight IDs/links, all player targets, deferred iframe, local/literal search, filters, empty state, close cleanup and focus return. Source checks cover 78 pages and existing links/metadata.

Desktop browser inspected hero/library; password search reduced the list to one guide. Setup and Forgot password Drive preview players loaded. Setup playback attempt remained black in this browser: actual playback, complete footage, spoken instructions, captions, privacy of every video frame and phone runtime layouts remain unverified. Direct links remain available. No video transcripts or invented durations are presented. Full-page screenshot capture timed out; two viewport captures saved instead.

Prepared on `feature/help-onboarding`. Not merged, pushed or deployed in this task.
