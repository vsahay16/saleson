# Product visuals and page consistency

The homepage leads with a cleaner version of the existing laptop-and-phone product image. DMS and Field Sales use dashboard assets instead of scene photography. Target Meter has a new composition based on the existing target record and mobile achievement screen. Invoicing, Production, Tally and Inventory also have image-led heroes. Useful HTML examples remain below the hero with their IDs and event bindings preserved.

The shared header now defines its own brand colours, fixing the invisible demo button. Feature headings use the same serif family as the homepage and industry pages. Order-taking trial and demo actions align, with subscription links beneath. Feature heroes have one compact setup/minimum-users/monthly-billing/support strip. Tracking copy is shortened; Target Meter visible and metadata copy includes distributors and manufacturers.

Captions are reduced to short labels where needed to distinguish recreated imagery. Zoom remains accessible through a compact button. Specialist pages no longer repeat the eight-logo strip; the general roster remains on the homepage and core overview pages. The supplied client-to-module mapping was not recoverable in this session, so no module-specific customer usage was inferred.

Industry lower sections explain supported processes directly, with a relevant product image per industry. Images illustrate workflows, not sector-specific customer adoption. The footer covers all 12 industries, buyer pages, Inventory, partner enquiries and comparisons.

## Validation

- `npm run check` passed for 77 HTML pages, 87 JSON-LD blocks, local references, sitemap, pricing, navigation, FAQs and product interactions.
- Browser inspection confirmed a blue demo button, serif headings and loaded hero imagery on the feature pages, with no desktop page-wide overflow.
- The homepage and 15 feature pages had no page-wide horizontal overflow in 390px frames (375px content viewport). Homepage, Order Taking and DMS phone layouts were inspected visually.
- Temporary QA files were removed before commit.

## New image assets

Both images use the built-in image editing tool and WebP export. Source files remain unchanged. Full prompts/provenance are next to each asset.

- `assets/img/homepage/laptop-mobile-clear.webp`: preserve the existing laptop, phone and source interface; remove badge/circles; improve clarity on a pale blue-white background.
- `assets/img/target/target-meter-hero.webp`: compose existing monthly target and mobile achievement records; preserve names/values and label points as points.

Recreated imagery carries a concise illustrative label. Fresh product captures can replace these assets when available.
