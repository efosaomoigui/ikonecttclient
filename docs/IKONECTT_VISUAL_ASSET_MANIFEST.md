# Ikonectt visual asset manifest

Phase 3 · 17 October 2026. Active designs: A+C Hybrid, D and E.

The library contains **13 logical visuals**: three previously approved hero stories, five supporting photographs and five original SVG treatments. Responsive exports and the existing desktop/tablet/mobile hero compositions are variants, not additional logical assets. No official client campaign photography has been supplied.

## Central references and replacement workflow

- `shared/visual-assets.js`: supporting asset metadata, accessible descriptions, responsive paths, licence credits and `visualSlots` route assignments.
- `shared/visuals.js`: presentation adapter fills only the existing editorial reservations; adds D/E homepage backgrounds. The router, navigation, content and form engines remain unchanged.
- `option-a/src/components/pages/HomePage.tsx`: audience photographs use those same central references.
- `option-a/src/components/ui/hero-slides.js`: existing, unchanged approved slideshow references.
- `assets/visual-library/`: deployed photographs organised by residential, business, infrastructure, city and abstract.
- `assets/visual-library/campaign/`: reserved for future client images. Its README is a reservation, not an image asset.
- `assets/review/phase-3/`: source photographs, generated masters, prompts and `exports.json` with exact native dimensions, SHA-256 and export dimensions/bytes. Review masters are excluded from deployment by the existing build.

To replace an image, obtain the approved original and its rights record, export widths at or below its native size, then update the relevant logical entry and alt text. Keep route assignments and page structure. Remove an old credit only after all uses of that licensed photo have been replaced. Keep approved A hero references separate unless a hero replacement is explicitly authorised.

## Inventory and provenance

| ID / central key | Current asset | Source / rights | Native dimensions | Status / replacement priority |
| --- | --- | --- | --- | --- |
| A-H01 | Residential woman; existing `a-h01-residential-woman-*` | Previously generated and approved, source register `assets/review/template-a/asset-register.json` | Desktop 1672×941; medium 1448×1086; mobile 941×1672 | Approved; low |
| A-H02 | Connected family; existing `a-h02-connected-family-*` | Previously generated and approved; same source register | Same three source sizes | Approved; low |
| A-H03 | Business with smartphone / display; existing `a-h03-business-collaboration-*` | Previously generated and approved; same source register | Same three source sizes | Approved; low |
| P3-R01 / `home` | `residential/connected-home-{480,800,1280}.webp` | Built-in image_gen, this project; illustrative interior, not documentary company/customer property | 1536×1024 | Provisional; high for client residential campaign |
| P3-B01 / `workplace` | `business/contemporary-workplace-{480,800,1280}.webp` | Built-in image_gen, this project; illustrative workplace, not an Ikonectt office | 1536×1024 | Provisional; high for approved business campaign |
| P3-N01 / `infrastructure` | `infrastructure/network-patch-panel-{480,800,1280}.webp` | Built-in image_gen, this project; generic network equipment, not verified company infrastructure | 1536×1024 | Provisional; high for genuine authorised infrastructure |
| P3-C01 / `lagos` | `city/lagos-skyline-{480,800,1280,1600}.webp` | Clara Sanchiz, [Lagos skyline](https://commons.wikimedia.org/wiki/File:Lagos_skyline.jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/), source photographed 28 February 2015 | 3726×1970 | Licensed contextual photograph; medium |
| P3-C02 / `dusk` | `city/eko-atlantic-dusk-{480,800,1280}.webp` | Mrnyben1313, [Sunset at Eko Atlantic Victoria Island Lagos](https://commons.wikimedia.org/wiki/File:Sunset_at_Eko_Atlantic_Victoria_Island_Lagos.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), 17 December 2022 | 1280×720 | Licensed contextual photograph; medium, replace for higher-resolution campaigns |
| P3-V01 / `network` | `abstract/network-grid.svg` | Original project-authored SVG; project ISC licence | 1200×800 viewBox; vector | Original artwork; low |
| P3-V02 / `flow` | `abstract/fibre-flow.svg` | Original project-authored SVG; project ISC licence | 1200×800 viewBox; vector | Original artwork; low |
| P3-V03 / `signal` | `abstract/signal-arcs.svg` | Original project-authored SVG; project ISC licence | 1200×800 viewBox; vector | Original artwork; low |
| P3-V04 / `architecture` | `abstract/city-grid.svg` | Original project-authored SVG; project ISC licence | 1200×800 viewBox; vector | Original artwork; low |
| P3-V05 / `spaces` | `abstract/connected-spaces.svg` | Original project-authored SVG; project ISC licence | 1200×800 viewBox; vector | Original artwork; low |

The two Commons photographs have been downloaded and installed locally, resized, converted to WebP and cropped through CSS; visible linked attribution and licence appear at each use. Their source and derivatives retain their respective CC BY-SA licences. These photo licences do not relicense unrelated website code. No photographer endorsement, verified coverage, ownership of buildings or current city condition is implied. No retouching or synthetic geographic additions were applied.

The generated network panel resembles general patch cabling. It is deliberately described as network connectors, not as a verified fibre-optic product. Fibre imagery is represented by abstract flowing paths. Generated images are clearly identified in this manifest and informative alt text. Full prompts and built-in tool provenance are in `assets/review/phase-3/generation-prompts.json`; no external image API or fallback CLI was used.

## Placement map

| Page / section | A+C Hybrid | D | E |
| --- | --- | --- | --- |
| Homepage hero | Existing A-H01–03 slideshow unchanged | `lagos` silhouette + `network`, burgundy scrims | `lagos` + `flow`, warm charcoal scrims; existing horizon retained |
| Homepage audience sections | `home` / `workplace`; replaces two remote Unsplash references | Existing text/tile structure retained | `home` / `dusk`, full-bleed in existing panes |
| Residential overview | `home` | `home`, softly masked | `home`, soft top/bottom blend |
| Business overview | `workplace` | `lagos`, softly masked; visible credits | `workplace`, cinematic blend |
| Business connectivity detail | `infrastructure` | `infrastructure` | `infrastructure` |
| SME detail | `workplace` | `signal` | `workplace` |
| Enterprise detail | `lagos`, visible credits | `network` | `dusk`, visible credits |
| About Ikonectt | `spaces` | `architecture` | `flow` |
| Solutions index | No imagery: navigation and service pathways remain clean | Same | Same |
| Plans / compare / plan details | No added imagery | Same | Same |
| Coverage / results / verification | No added imagery; no invented map | Same | Same |
| Installation / quote / contact / account / support / FAQs | No added imagery | Same | Same |

About uses explicitly abstract artwork because authorised photographs of company people, offices or facilities are still missing. The SVG architectural shapes are generic geometry, not company sites. All network nodes are non-geographic decorative diagrams.

## Crops, overlays and delivery

- Bright A: editorial photos use existing 4:3 residential, 16:9 business and 3:2 solution/About fields; audience tiles retain their existing full-bleed layout and dark text scrims. Text content, copy hierarchy and CTA positions are unchanged.
- D: existing theme tokens are retained, including adaptive light/dark surfaces. The dark hero uses a muted city silhouette on the right with fine static red nodes. Internal fields use soft masks at their edges against the active background rather than opaque rectangular frames.
- E: city hero fills the existing immersive field. A warm dark gradient protects white copy and dissolves into `#12070a`; existing horizon motion remains governed by existing reduced-motion rules. Audience panes use stronger lower scrims, with text separated from the most detailed image areas.
- Internal mobile slots become 4:3 below 768px. Interior crops preserve television/tablet and central furnishings; people are confined to the already approved hero compositions. E sunset panes favour the waterfront/right-side skyline; E city hero keeps the central streetscape.
- New rasters use 480/800/1280px WebP variants, with an additional 1600px skyline export. No exported file exceeds native source dimensions. `<img width height>` and existing slot/section aspect ratios reserve layout space. SVGs scale without raster enlargement.
- Below-fold photos are lazy-loaded and asynchronously decoded. D/E first hero rasters are eager/high-priority; A keeps its existing hero preload and controller. Abstract overlays contain no new animation or filters requiring a canvas/WebGL runtime.
- New photograph variants total 957,936 bytes (about 936 KiB), across 16 exports. Five SVG files add only a few KiB. Browsers request an appropriate variant, not the full collection. Approved A hero files are reused unchanged, not duplicated into the new library.

## Outstanding official assets

Residential campaign originals, business campaign originals and genuine company people/place/network photographs await client supply and rights confirmation. Existing hero assets remain approved. New generated and licensed contextual photos are installed under Phase 3 authorisation and remain replaceable; they are not labelled as newly approved client campaign materials.
