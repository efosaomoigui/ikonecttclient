# Phase 1.5 visual refinement

Completed 15 October 2026. Scope: finish the existing five designs; retain all 30 routes per template, homepage compositions, imagery, content and demonstration journeys. No dependency or backend changes. Phase 2 imagery has not started.

## Confirmed defects and corrections

| Area | Established cause / finding | Correction | Templates |
| --- | --- | --- | --- |
| Footer | Two independent grids placed Residential/Business and Coverage/Support/Company on different column axes, particularly at tablet widths. | One brand block and one five-group link grid. Equal columns, aligned headings, consistent 44px link targets, natural wrapping and a wrapping legal bar. Brand moves above the groups below 1100px; content-driven mobile columns avoid crowding. | A–E |
| Residential typography | C's homepage heading jumped from 30px to 48px at a single breakpoint. D's remote font declaration omitted 700; E's omitted 600 despite usage. No heading transform or text animation was found in C. | Fluid heading scales, deliberate line height/tracking and balanced wrapping; disable synthetic weights. Preserve existing SF Pro/Inter stacks, C's Plus Jakarta Sans display fallback, D's Manrope and E's Outfit. | A–E; targeted C homepage rule |
| Font delivery | All templates depended on remote Google font CSS; required weights were incomplete in D/E. Browser APIs did not expose individual loaded faces reliably, so a specific prior font network failure was not established. | Self-host unchanged variable WOFF2 Latin/Latin Extended subsets, preload the template's Latin fonts, retain swap behavior, and include four OFL licenses plus source URLs/checksums. | A–E |
| Audience control | No persistent selected audience; separator and uneven control treatment. | Equal-height aligned labels, restrained template-specific active background/colour, keyboard focus and no positional hover movement. Business/residential routes set state; shared journeys retain the last audience. | Existing controls in A–C; D/E retain their original header structure |
| Menus | Text-character arrows; fixed column count left sparse menus confined to one part of the panel. Hover followed by click immediately closed the menu. | Consistent 14px SVG chevrons rotating with `aria-expanded`; group-aware layouts. First click retains a hover-open menu; second click closes it. Escape, outside dismissal, keyboard navigation and mobile accordion remain intact. | A–E |
| Logo | D always used the red variant even in its supported dark theme. All active transparent PNGs have transparent corners; no active white rectangle was reproduced. | Select the existing white transparent variant in D's dark theme, retain red for light. Preserve image proportions and explicitly remove logo container backgrounds/borders/shadows. No logo pixels were edited. | D theme correction; shared presentation A–E |
| Page proportions | Shared 1200px container and narrow heading measure were applied across different identities; card actions and empty field hints could space inconsistently. | Containers A/C/E 1280px, B 1360px, D 1200px with fluid gutters; bounded paragraph measures, aligned card actions and removal of empty hint spacing. | A–E |
| Help search | A/B homepage `.ik-search` styles leaked a large pill border and padding around internal stacked fields. | Rename only the internal wrapper to `.ik-help-search`; preserve homepage search and existing result IDs/filtering. | A/B defect; shared wrapper A–E |

## Files modified

- `shared/public-site.js`: footer markup, audience state, accessible SVG indicators, menu click handling and D logo selection.
- `shared/public-site.css`: responsive footer, typography, widths, field/card spacing and targeted template overrides.
- `shared/pages.js`: internal help-search wrapper class only; website text unchanged.
- `shared/fonts.css`, `assets/fonts/`: unchanged font binaries, licenses and provenance.
- `option-a/index.html` through `option-e/index.html`: local font preloads replace remote font links.
- `tests/public-site.test.mjs`: audience/footer/chevron coverage, hover-click regression assertions and event-based navigation waits replacing timing assumptions.
- `public_html/`: regenerated production distribution; this report and `docs/evidence/phase-1-5/`.

## Responsive and browser verification

Screenshots and DOM measurements were captured for Residential/header/footer in all five templates at requested widths **1440, 1280, 1024, 900, 768, 600, 390, 375 and 320px**. Browser viewport scaling yields actual widths within 1px of the target; scrollbars reduce available content width. Exact values are retained in [responsive measurements](evidence/phase-1-5/responsive-measurements.json).

At wide sizes the brand and links align in parallel; tablet places the brand above three equal link columns; small mobile uses two columns, then a single column when space is insufficient. Checks included heading wrapping, group alignment, link spacing, footer legal flow, menu composition, form stacking and control boundaries, beyond overflow alone. No horizontal document overflow was found in the 45 responsive checks.

All 150 template/route combinations were visited in the browser: A/C at 1280px, B/D at 375px, E at 600px. No missing heading or overflowing page/control was found in that sweep; see [route measurements](evidence/phase-1-5/route-measurements.json). Representative screenshots were inspected for overview, catalogue, details, comparison, solution, quote/address forms, results, support/search, troubleshooting, company/legal and account layouts. Final search and menu corrections were then specifically retested across affected templates. [Interaction measurements](evidence/phase-1-5/interaction-measurements.json) confirm open desktop/mobile menus in all five designs.

C's homepage Residential Experience was separately inspected at desktop, 600px and narrow mobile widths. Its existing photograph, layout and text remain unchanged. D's light and automatic dark themes were checked; a temporary light-theme fixture was removed from the distribution after verification.

## Before / after evidence

| View | Before | After |
| --- | --- | --- |
| D tablet footer | [Original independent grids](evidence/phase-1-5/before-d-footer-900.png) | [Aligned link groups](evidence/phase-1-5/after-d-footer-900.png) |
| C homepage Residential Experience | [Original heading](evidence/phase-1-5/before-c-residential-1280.png) | [Fluid heading](evidence/phase-1-5/after-c-home-residential-1280.png) |
| B mobile FAQ search | [Leaking pill styling](evidence/phase-1-5/before-b-faq-375.png) | [Clean stacked fields](evidence/phase-1-5/after-b-faq-375.png) |

The initial footer/heading captures used an earlier viewport calibration and differ slightly in available width/framing; they show the structural differences, not a pixel-perfect overlay.

Additional evidence: [desktop footer](evidence/phase-1-5/after-a-footer-1440.png), [desktop chevrons and active Business audience](evidence/phase-1-5/after-a-desktop-menu.png), [mobile menu](evidence/phase-1-5/after-c-mobile-menu.png), [D light logo](evidence/phase-1-5/after-d-light-logo.png), [D dark logo](evidence/phase-1-5/after-d-residential-1440.png), [C mobile Residential Experience](evidence/phase-1-5/after-c-home-residential-375.png), [E narrow mobile](evidence/phase-1-5/after-e-residential-320.png).

## Validation

- `npm run build`: passes; A/B/C compiled and all five options packaged. Existing non-blocking Vite warning about future native config loading remains.
- `npm test`: **61 passed, 0 failed**. Includes all 150 routes, links/aliases, six customer journeys, menus, audience state, forms, address hierarchy, five coverage result states, account preview, history and packaged assets.
- Fonts: eight WOFF2 signatures and all twelve font/license provenance hashes verified; all five built entrypoints preload local font assets and contain no Google font stylesheet dependency. Browser font-set status reports loaded.
- Browser: desktop hover/click/escape and mobile menu tested across A–E; rendered chevrons rotate 180 degrees while open. Search filtering was confirmed with “coverage” returning three answers.
- `git diff --check`: clean. Existing source photographs, SVGs and logo PNGs have no changes. Existing route definitions and content modules have no changes.

## Remaining limitations

The available transparent logo PNGs are only 200×75px. The red file contains pale semi-transparent edge pixels; no higher-resolution transparent official replacement was found. A genuinely improved source asset is needed to remove that residual fringe without redrawing/recolouring the mark. No active white rectangular background was reproduced.

Previously documented commercial/contact/legal content gaps and demonstration-only forms/authentication remain as recorded in Phase 1. Font-face iteration was unavailable through the browser inspection API; production delivery is therefore checked using served WOFF2 bytes, stylesheet references, computed font stacks, font-set readiness and rendered appearance rather than claiming per-face browser instrumentation.

## Production confirmation

Implementation commit `1250d16` was pushed to GitHub `main` and verified against the remote branch. The initial upload timed out; an HTTP/1.1 retry completed successfully.

[Live Vercel site](https://ikonecttclient-kappa.vercel.app/) checked after deployment: all five entrypoints contain the intended local font preloads. All **14 checked WOFF2 responses** (six preload URLs plus eight shared subsets) return valid WOFF2 bytes whose SHA-256 hashes match the source font files. The deployed shared stylesheet and script contain the footer, search and menu corrections.

The live C audience switcher and open desktop menu were inspected; the browser font set reports loaded. The live A footer was inspected at a measured 1440px viewport, with five link groups, no horizontal overflow and both logos fully loaded at their original 200×75 intrinsic size. See the [production footer screenshot](evidence/phase-1-5/production-a-footer-1440.png).
