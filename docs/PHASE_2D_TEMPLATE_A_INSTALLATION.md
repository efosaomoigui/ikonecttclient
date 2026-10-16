# Template A — photography installation

16 October 2026. The owner explicitly authorised native-resolution installation, overriding the earlier requirement to wait for larger sources. No upscaling or additional image approval is required for this stage.

## Installed photography

All nine selected originals map to the homepage hero: A-H 01 residential woman, A-H 02 connected family, A-H 03 business collaboration; each has its own desktop, medium and portrait composition. They are delivered from `option-a/public/images/template-a/` to `/option-a/images/template-a/` as 18 WebP exports: native size plus one smaller size per original. See [export inventory](evidence/phase-2d-installation/exports.json).

**Supporting-image exception:** the approval report contains no additional approved supporting assets. The nine files are responsive hero variants, not nine separate section photographs. Existing audience photographs and internal image reservations remain in place; no placements were invented.

## Behaviour and responsive results

- Woman → family → business, seven-second dwell, 650ms opacity crossfade, no repeated headline animation.
- Previous/next wrap and pause automatic progression until Play. Circular progress shares the slide clock; Play/Pause, keyboard controls, hover/focus pause, hidden-tab/offscreen/hidden-homepage suspension are supported.
- Reduced-motion preference disables autoplay and makes manual changes instant. Image decode precedes transitions; outgoing images remain visible during loading/blending. Failed assets are skipped; zero/one usable frames retain readable copy and working CTAs.
- Original heading, description, CTA destinations, navigation, plans, assistant and journeys are retained. Template A component/styles are isolated; B–E and shared runtime sources are unchanged.
- All three scenes were inspected at 1440, 1280, 1024, 768, 390 and 320px. Desktop uses the approved full-bleed crop; tablet uses the fitted/faded medium view; mobile retains the 340px photo-above-copy layout. All 18 states loaded the expected image and had no horizontal overflow. Hero/copy geometry stays constant through slide changes. See [responsive evidence](evidence/phase-2d-installation/responsive.json).

## Delivery, performance and limits

Exports use WebP quality 88; sizes range from 50,824 to 220,038 bytes, 1,971,418 bytes across all 18 files. At 1× mobile the selected 640px exports are about 75–83 KB; native desktop exports are about 91–145 KB. Only the initial story is preloaded via mutually exclusive responsive media. Later images load on demand; existing below-fold audience images use lazy loading. Review originals/proofs are excluded from production packaging.

Source sizes remain 1672×941, 1448×1086 and 941×1672. They are below the preferred high-density targets; large/high-density display sharpness remains a later refinement. No enlargement conceals this. Browser checks are local desktop emulation, not physical-device or throttled field performance measurements. No formal Lighthouse/LCP/CLS score is asserted.

## Validation and deployment

Production `npm run build`, Template A TypeScript check and `npm test` passed: **118 tests, 0 failures**. Six new slideshow tests cover timing/blending, manual controls, persistent pause, visibility/navigation suspension, reduced motion, keyboard focus and failed assets. Existing tests cover public journeys and assistant privacy/functionality across A–E. Existing Vite `__dirname` future-loader warnings are non-blocking.

Deployment target: [live Template A](https://ikonecttclient-kappa.vercel.app/option-a/). Publication and live verification are pending at this pre-deployment record; the final verification entry will be appended after checking the production experience.

Visual follow-up: assess source sharpness on the owner's displays, review the mobile controls over the lower photographic band, and review existing supporting sections top to bottom before producing replacement imagery. No extra photography or Template B work is included.
