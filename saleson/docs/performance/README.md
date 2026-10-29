# Media performance review — 29 October 2026

Prepared on review/media-performance from main 4f48ffff. This branch is not deployed.

## Coverage and limits
- Audited all 77 HTML source files. page-source-weights.json lists their direct local asset weights, image counts and responsive-image counts. These are uncompressed source estimates, not browser transfer totals; they omit CSS/JS nested dependencies, remote assets and user-activated media.
- Probed 77 corresponding URLs on saleson-eta.vercel.app. 69 succeeded on the first pass; 8 timed out and then all 8 returned HTTP 200 on a lower-concurrency retry. Raw observations are in http-source-audit-2026-10-29.json. Timing includes this remote environment's network/proxy overhead. These are not Lighthouse, LCP, CLS, INP or real-user measurements and must not be presented as performance scores. Custom-domain routing was not changed or certified.

## Changes
- Added 56 WebP responsive derivatives for 21 oversized images across 19 pages. 53/56 derivatives are below 80,000 bytes; three exceptions remain around 82–88 KB rather than forcing more aggressive compression.
- Native srcset/sizes chooses a suitable resolution. Existing src fallback, full-size image files, enlargement targets, metadata, URLs and lazy-loading/priority attributes remain unchanged.
- Derivatives use Lanczos resizing and WebP quality 90. They are not mathematically lossless; visual comparison found the representative homepage/catalogue/DMS versions clear at their intended display sizes. Full-resolution originals remain available for inspection and high-density displays.
- Homepage hero: 106,640-byte original; 15,550-byte 480px version, 29,662-byte 768px version and 39,930-byte 960px version. Browser selected 960px on desktop and 480px inside the phone-width review.
- Aggregate original bytes for the 21 selected images: 2,423,782. Selecting the 768px derivative where available (otherwise the original) totals 1,026,550 bytes: approximately 58% less. This is an illustrative asset comparison, not a measured whole-page speed improvement.
- Added scripts/optimize-media.py to asset preparation, so regenerated pages retain responsive delivery. It requires Pillow (python3 -m pip install Pillow). Full source images are retained; it does not delete unused legacy assets.

## Videos
The two homepage MP4s total 19,072,868 bytes. They are already H.264/AAC with click-deferred source URLs and preload=none. Browser inspection confirmed neither currentSrc nor active source src was set before clicking play. Lossless remux/faststart trials produced the same byte sizes, so no video was replaced or recompressed. A meaningful further reduction would require lossy encoding or a streaming service; 80 KB is not a sensible budget for multi-minute video.

## Validation
- Full npm run check passed, including all 155 tool scenarios and existing tracking checks.
- Focused final HTML/reference/schema and metadata/link checks passed after markup cleanup: 77 pages, 87 JSON-LD blocks, 74 sitemap URLs and 1,614 internal links/fragments.
- Responsive candidate paths exist; original images verified against starting Git blobs. Generated candidates decode successfully with consistent aspect ratios.
- Reviewed homepage/catalogue/DMS image comparisons, desktop homepage and browser-selected phone-size hero. Existing page appearance remains intact. Screenshot: homepage-review.jpg.

## Remaining work
Run controlled mobile/desktop Lighthouse and real-user Core Web Vitals against the actual production domain after routing and release are confirmed. No per-page Lighthouse certification, measured LCP improvement or runtime tracking-account verification is claimed here.
