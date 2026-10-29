# Help video metadata — 29 October 2026

## Prepared
- Eight local WebP thumbnails from the actual public Drive video thumbnails. Each is 10–21 KB, with native aspect ratio preserved. They are visible on the matching Help cards, dimensioned and lazy loaded. No video loads until selected.
- Seven source MP4 durations measured with ffprobe. Durations are visible beside their matching guide titles. No estimated duration for Review your business: its 407,443,381-byte MP4 exceeds the connector's 268,435,456-byte limit.
- Source provenance in assets/data/help-videos.json: Drive source ID, Drive upload/copy timestamp, measured duration and evidence descriptions.
- scripts/prepare-help-video-metadata.py refreshes visible previews and produces VideoObject entries only when a confirmed first-publication timestamp and its evidence are present. Asset preparation invokes it before CSS/JS fingerprinting.
- Schema targets only the corresponding visible Help cards. It uses the real Drive player embedUrl, stable local thumbnailUrl and optional measured duration. No expiring download URLs, made-up ratings, view counts or completion events.

## Publication status confirmed by owner
On 29 October 2026 the owner confirmed these videos are not published yet and are only on Drive. Publicly readable Drive permissions do not, by themselves, establish the intended publication date. All eight records have publicationStatus=unpublished; publishedAt and publicationEvidence remain null.

No earlier date needs to be supplied. When the videos are first published, record the actual publication timestamp with timezone and release evidence, set publicationStatus=published, then regenerate metadata. Do not automatically assign build time or a preview-deployment date. Existing public Help markup in Git history does not override the owner's clarification about these video assets; verify the production video mapping before assigning release evidence.

## Limits
No VideoObject is emitted until dates are verified. Google requires uploadDate (first publication), name and thumbnailUrl; reference: https://developers.google.com/search/docs/appearance/structured-data/video . This Help library is not a dedicated watch page, so adding valid metadata does not guarantee a video search result. No extra watch pages created.

Source checks and the full automated website suite are run locally. Google Rich Results validation of emitted markup, live thumbnail retrieval and Search Console indexing remain post-publication checks. Playback through completion, captions and every frame of the recordings are not certified by these metadata checks.
