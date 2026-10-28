# Tools, articles and industry imagery

All 12 interactive tools plus the tools directory use the same serif headings, DM Sans body type, SalesOn blue/white palette, buttons, focus styles, panels and spacing as the marketing site. The controls and calculator/document logic retain their existing IDs and scripts. Tool styling changes are screen-only, preserving the print/export templates.

All 12 articles use a common image-led introduction, readable text measure, semantic section headings, desktop contents navigation, sharing controls and a restrained product next step. The blog index uses compact cards, ordered by the actual publication date, with the same image as each corresponding article. Article body text is preserved; publication dates are retained, with month-name spelling/capitalisation corrected.

There are 24 new images: one distinct industry scene for each of the 12 industry pages and one distinct editorial illustration for each article. They were created with the built-in image generation tool and exported as dimensioned WebP files. Industry scenes carry a short illustrative label and do not portray actual customers. Product evidence remains distinct from editorial imagery. Repeated generic screenshots were removed from industries with customer evidence; four sectors without published customer examples retain separate, relevant product records.

## Assets and rebuilds

- Images: `assets/img/editorial/industries/` and `assets/img/editorial/articles/`.
- Full prompt set and source filenames: `assets/img/editorial/provenance.json`.
- Page/image assignments: `assets/data/editorial-images.json`.
- Article metadata and original dates: `assets/data/article-index.json`.
- `scripts/build-editorial-assets.py` applies industry heroes after the existing generators, updates article/index artwork and social images, and runs before client-showcase generation. No image generation is needed during builds.
- Shared styles: `css/tools-family.css` and `css/editorial-pages.css`; industry artwork rules are scoped in `css/guide-pages.css`.

## Validation

- The complete `npm run check` suite passes for 77 HTML pages, local assets/links, canonical metadata, schemas, pricing, FAQs, client/module assignments and tool/product logic.
- The editorial check verifies 24 unique, valid WebP assets, dimensioned priority hero images, lazy-loaded index images and the shared tool/article styles.
- All 38 affected pages were checked in 390px frames with 375px content viewports: no page-wide horizontal overflow.
- All 13 tool routes were inspected in the desktop browser for heading-family consistency, overflow and workspace-title contrast. Key article, directory and industry layouts were inspected visually.
- A live local calculator edit returned ₹3,600 GST and ₹23,600 total for ₹20,000 at 18%.
- A normalised comparison confirmed the body text of all 12 articles was retained.
- Temporary browser QA files were removed before commit.

The work updates the existing PR/preview branch. It does not merge into `main`.

## Standalone utilities

The sales-leakage calculator and multilingual field-sales quiz outside `/tools` also use the matching palette, typography, cards and controls through `css/utility-pages.css`. Existing language fonts remain as fallbacks and no calculator/quiz JavaScript is changed. Together with the 38 pages above, these bring the responsive review to 40 pages.
