# Audit fixes prepared for review

Base: main `248b514e43b89056afb941f40792038d44e60201`.

## Implemented

- One shared DM Sans / DM Serif font stylesheet per content page; shared header/footer reuse it. The quiz retains its separate Indic-language font stylesheet. Legacy Inter CSS declarations use the shared body family.
- Extracted Order Taking, leakage calculator and 404 CSS into cacheable fingerprinted files. Order Taking HTML: 70,335 → 39,612 bytes; calculator: 23,436 → 15,906 bytes; 404: 6,262 → 3,958 bytes. CSS still needs loading on the first visit; this is not a claimed Lighthouse improvement.
- Measured image findings addressed with 25 display-logo derivatives and two 768px video posters. Originals retained. Combined source assets 534,192 bytes → display derivatives 188,732 bytes; actual savings depend on which page loads them. Homepage posters now load near the viewport; MP4 sources remain click-to-load.
- Preparation scripts retain these changes through future builds. The scoped fingerprint helper updates asset references without regenerating unrelated page content.
- Lapcare title, description and OG/Twitter metadata now describe the Lapcare story. The unapproved quotation is removed until an approval/source record is supplied; no customer results invented. Added logo dimensions.
- Replaced unsupported leadership wording in the shared footer and absolute error-elimination/invoice claims in the affected articles.
- CSV exports preserve zero values and escape quotes/newlines. Download anchors are attached before clicking and Blob URLs are cleaned up after the browser has time to consume them. Copy remains “download requested,” not proof of file saving; events remain intent-only.
- Added GitHub Actions `Website checks` → job **Website regression checks** on PRs, main pushes and manual runs. Official actions are pinned to verified commit SHAs; Node 24, Python 3.12, locked npm dependencies, pinned BeautifulSoup, full Git history for historical metadata guards, read-only token permissions. No deployment secrets or publishing steps are included.

## Verification

- Full `npm run check` passes, including 155 tool scenarios and new font/content/download checks.
- All 12 tools inspected in a 375px content viewport using a 390px browser iframe harness: body width equals viewport width on each, one shared font request per page. This is responsive browser simulation, not physical-phone certification. Temporary harness removed.
- Actual CSV downloads saved and parsed: Stock Reorder 568 bytes / 4 rows / 14 columns, Van Loading 590 bytes / 4 rows / 17 columns, Outstanding Payments 1,119 bytes / 6 rows / 16 columns. Saved Stock Reorder contains a preserved numeric zero. CSV samples were used; no business/customer data transmitted.
- Desktop Order Taking and Lapcare layouts inspected. Real PDF saves, print dialogs/hardware and physical phone workflows remain unverified. Existing print-flow tests are mocked and are not printer certification.
- PageSpeed API returned 429, but the public PageSpeed UI produced real mobile lab baselines on current pre-change Vercel production:
  - Homepage: performance 79, accessibility 94, best practices 100, SEO 100; FCP 3.3s, LCP 4.2s, TBT 0ms, CLS 0.03.
  - Request Demo: performance 61, accessibility 100, best practices 92, SEO 100; FCP/LCP 2.7s, TBT 2,010ms, CLS 0.045.
  - Emulated Moto G Power, Lighthouse 13.5.0, slow 4G. Single lab runs, no field data. These are baselines, not after-change scores. The scheduler remains eager to preserve the booking flow.

## GitHub enforcement still requires administrator access

The new workflow completed successfully in GitHub Actions: https://github.com/vsahay16/saleson/actions/runs/40873284142 (the code revision uploaded in PR #32).

The connected GitHub integration returned 403 for branch-protection access (`Resource not accessible by integration`). Adding a workflow creates checks; it does not make them required. After its first successful remote run, an administrator should edit the existing main rule/ruleset and require **Website regression checks** before merge, preserving other established settings. Verify with a deliberately failing PR. Do not claim enforcement until that setting is confirmed.

## Custom-domain diagnosis and remaining access

The main domain still serves the old AWS-hosted site. Public DNS on 29 October 2026 returned:

- `saleson.co.in A 52.66.139.240` (TTL 60).
- Authoritative nameservers: `ns-1120.awsdns-12.org`, `ns-1957.awsdns-52.co.uk`, `ns-871.awsdns-44.net`, `ns-11.awsdns-01.com` — AWS Route 53.
- Vercel `/help` is the new hub; `saleson.co.in/help` still redirects to `/404` with HTTP 200. This is not fixed by a repository-only change.

The user installed Vercel during this task. Authenticated Vercel tools subsequently became available and located project `saleson` (`prj_WZlqs0s5BAsL9g5LrxxIOi4Ko4St`) under the `viv24` team. Project/domain inspection returned HTTP 403 requiring approval of this connection for that existing team. A one-time team-access link was generated. The CLI login state is separate from this connection. No tokens were requested or read, and domain/DNS settings were not changed.

To use Vercel as the primary release:

1. In the intended Vercel project (`viv24/saleson`), inspect the production release and add/verify `saleson.co.in` and `www.saleson.co.in`; set www to redirect to the apex if that remains the approved canonical host.
2. Use the exact expected A/CNAME/verification values returned by that project's Domains screen. No universal DNS target is guessed here.
3. In the existing Route 53 hosted zone, update only the relevant website records. Preserve MX, email verification TXT records, `app.saleson.co.in` and unrelated records. Do not change nameservers.
4. Verify propagation and HTTPS, then run `python3 scripts/check-live-release.py --base https://saleson.co.in` from the approved checkout. Confirm that unknown routes return a real 404, and test www/HTTPS redirects.

Alternatively, retain the existing AWS host and deploy the same approved `saleson/` artifact to its website document root with its `.htaccess`. That needs access to the existing hosting deployment rather than a DNS move. Choose one authoritative production release; do not maintain two independently edited copies.

This task prepares the code on a review branch. Production release, DNS cutover, branch enforcement and customer approval are separate from source edits and require verified access/state.
