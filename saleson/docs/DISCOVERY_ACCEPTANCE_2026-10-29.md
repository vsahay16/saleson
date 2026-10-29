# Discovery and acceptance checks — 29 October 2026

## Prepared
- Refreshed llms.txt from the current canonical page titles and descriptions, including Help, customer stories and all 12 articles.
- Regenerated the 75-URL sitemap. No URL added or removed; Help is now sorted with the other URLs. No speculative lastmod dates.
- Verified robots.txt allows production crawling and references the canonical sitemap. Its contents remain unchanged. Preview noindex controls remain separate.
- Added scripts/prepare-discovery.py to the end of asset preparation so discovery descriptions follow final generated metadata. Regional pricing aliases do not replace the main pricing description.

## Video metadata decision
Updated video preparation: eight actual Drive thumbnails are now locally hosted and compressed to 10–21 KB each. Seven durations were measured from the source MP4 files with ffprobe; the 407 MB business-review video exceeds the connector limit, so its duration remains unset. Drive creation timestamps are stored separately from first-publication dates. First-publication dates remain unconfirmed, so no incomplete VideoObject is emitted. The generator enables each object only when publishedAt and publicationEvidence are supplied. Existing click-to-load players and direct links remain unchanged. See VIDEO_METADATA_2026-10-29.md.

## Validation and limits
The complete npm run check suite passed, including 155 scenarios across 12 tools, invalid inputs, blocked storage, copy, transfers, print invocation and download handling. The targeted tracking/SEO and download checks also passed after regeneration.
These automated checks mock print and download browser APIs; they do not certify physical devices, real print pagination, successful PDF saving or physical printing. Earlier release evidence includes 375px browser layout checks and three real CSV downloads, but those are not new physical-phone checks.

Still required for final device acceptance:
1. On actual Android Chrome and iPhone Safari, test each tool with sample, blank and restored draft; enter invalid and valid values, then inspect results.
2. Download/open each supported file, copy where applicable, and test the available tool-to-tool transfer. Check zero values, GST rates and quoted text.
3. Use Print/Save PDF on document tools; inspect all pages for clipped columns, totals and page breaks. Print a representative invoice and wide report if physical printing is used.
4. Test restricted storage/private browsing and narrow-screen horizontal table scrolling.
5. Play all Help videos through completion and confirm access without an owner's Google session.

No deployment, remote GTM changes or completed bookings performed for this task.
