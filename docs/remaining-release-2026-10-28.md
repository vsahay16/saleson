# Remaining website release — 28 October 2026

Integrated `SalesOn-Remaining-Changes-Only.zip` over main commit `44de34c8d89d66d3ceea15eeb9a8b53e2a642740`, preserving shared components, regional pricing, minimum-user terms, main feature copy and legal pages.

- Published the package's 12 industry workflows, three buyer/audience pages, inventory page, six competitor comparisons and comparison hub, and pre-launch partner email enquiry page.
- Published the tools update with separate styles/scripts, blank/example workspace controls, storage fallback and tool handoffs. Unconnected lead dialogs are removed. HSN results are classification candidates with verification guidance, not a certified rate database.
- Applied the outstanding screenshot draft's Field Sales, DMS and Production visuals into the current page bodies. Kept the existing Target Meter visual and current interactive workflows. Images were decoded and inspected; captions distinguish enhanced/illustrative examples.
- The open Tally draft's substantive page and executable code were already present on main. Kept the newer current illustration, styles, shared-component references and breadcrumb cleanup rather than restoring older draft files.
- Removed the obsolete Growth HTML and retained its historical URL redirects. Updated sitemap and manifests. Corrected the homepage's missing canonical and relative asset paths without changing its design or copy.

The release retains one shared header/footer per page, CSS in `css/`, scripts in `assets/js/` (tool-specific scripts in `assets/js/tools/`), and source plus fingerprinted asset copies. The source-image draft's original provenance is included under `assets/img/screenshots-refined/`.

Validation: all 25 individual non-broad checks in `package.json` passed, plus syntax checks for 74 tool/runtime scripts. The 24 redesigned guide pages passed image dimensions/design-dependency checks; 12 industry workflows and all internal fragments passed; six comparisons passed FAQ/schema and source-link checks. All referenced JS/CSS fingerprints match their source bytes. Checked 2,631 local references against the current GitHub file inventory plus release files, with no missing references; 87 JSON-LD blocks parse. The broad filesystem-only website check was not claimed as a full pass because large unchanged repository assets were not all downloaded locally. Production browser checks and deployment status are recorded after publishing.

No completed booking, checkout charge, CRM delivery or tax classification has been inferred from source checks. The partner page accepts email enquiries only; no live commission programme is promised. Manufacturer overview and manufacturing workflow remain separate canonical URLs.

Production verification: PR #18 deployed successfully on Vercel. Public browser checks confirmed the FMCG shared layout, loaded DMS screenshot and GST invoice blank/example modes, including zero totals in blank mode and restored sample totals. Follow-up link polish supplies a WhatsApp message on revised guide pages and corrects two Tally links. Open drafts #4 and #7 were closed as reconciled/already delivered. Full mobile-device, print-dialog and booking completion tests remain outside these smoke checks.
