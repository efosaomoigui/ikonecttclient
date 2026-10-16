# Client design shortlist consolidation

16 October 2026. The active presentation is **Option 1 — A+C Hybrid**, **Option 2 — Template D**, **Option 3 — Template E**. This is a consolidation, not a redesign or photography stage.

## Preservation and explicit homepage boundary

The original five designs are preserved at commit `21b060e41aafa5bff7f2cab8e3a2a03df3911637` on `codex/preserve-five-templates-2026-10-16`. Source files, assets, prior reports and archived B/C URLs remain available. Four untracked superseded A-H 03 exploration images stay local and untouched; approved originals are already tracked. [Preservation inventory](evidence/shortlist/preservation.json) records the original hashes.

The owner's additional instruction is controlling: **do not change Option A's landing page when combining designs**. A's HomePage component, content, typography stylesheet, hero controller/styles, all approved originals/delivery images, CTA behaviour and preloads remain unchanged. The only A entry-point addition loads a stylesheet whose every selector requires `#ik-main`, the sibling inner-page outlet. It cannot select `.ik-home`, the header, footer or assistant. No switcher or extra banner is added to any website homepage.

## Inspection and A-versus-C comparison

A/B/C are React/Vite adapters; D/E are standalone HTML adapters. All five call the same `mountSite` and render the same shared route/content/catalogue/forms/assistant implementation. Dormant React page components are not alternative active inner pages. The selector is the root presentation hub, not a website navigation control. Vercel serves the `public_html` build. The corrected 14-page architecture blueprint was checked, along with design/content documentation and completed Phase 1–2D reports: staff-managed onboarding, shared plans/coverage and read-only demonstration boundaries are retained.

| Element | Retain from A | C contribution / decision |
| --- | --- | --- |
| Homepage, hero, imagery, transitions | Entire approved landing page and three-scene slideshow | No contribution; explicitly protected |
| Inner title hierarchy | Existing font family, weight, red accents, copy and pearl surface | Adopt C's left-aligned editorial headings, 64px desktop maximum and calmer title spacing |
| Inner section rhythm | Existing section order and readable text measures | Adapt C's 100px desktop breathing room to 96px; retain A's 52px narrow-mobile spacing |
| Editorial image/text layout | Existing A placement, imagery reservations and responsive stacking | Use a fluid 32–64px gap; no column reversal, photograph replacement or added overlay |
| Cards, buttons, plans | A's cards, pill actions and existing plan presentation | Already share core construction; retain rather than duplicate or change business-facing components |
| Navigation, menus, assistant and forms | Entire existing A implementation | No change; both templates already use shared engines |
| Colour and visual storytelling | A's light editorial identity | Do not transplant C's near-black palette, dark cards, pearl-on-dark alternation or panoramic crops |

These small inner-page presentation changes are the implemented hybrid. Entire page replacements, dark inner hero fields, reversed editorial sections and further card/image treatments are deferred to the individual review. Shared content and business rules are not copied. The result uses one light editorial language instead of mixing unrelated page designs.

## Selector and routing

`shared/design-shortlist.js` is the presentation manifest: active IDs `a`, `d`, `e`; archived IDs `b`, `c`; preservation reference. Stable website URLs remain `/option-a/`, `/option-d/`, `/option-e/`. Labels distinguish A+C Hybrid from the original A name. D/E are independent and their sources are untouched.

The existing hub keeps its card, comparison and iframe arrangements; it now has exactly three cards, three preview buttons and three comparison columns. `shared/design-preview.js` handles the existing controls. On same-origin packaged/live previews, switching retains the iframe hash path and query, including selected plan/comparison/help context. It updates direct-open links and the hub's `?design=…&route=…` query so refreshing/reopening retains the selection. Unknown or old hub `b`/`c` choices fall back to A+C; original `/option-b/` and `/option-c/` deep links still render their preserved sites without redirects. Separate localhost dev-server origins retain the last supported host route where child state cannot be read; production is same-origin.

All five originals are still built/packaged for compatibility. Only A+C, D and E are advertised in the client selector. Internal hashes remain beneath their selected option pathname, and full public journeys retain their shared source of truth. No portal, live customer system, provider or backend changes are included.

## Revised imagery direction — documentation only

Balance Nigerian human stories with abstract connectivity (nodes, paths, fibre/light language), Nigerian urban/architectural environments, and credible technology/infrastructure compositions. Avoid repetitive smiling-person/laptop scenes and exaggerated science-fiction effects. Blend shadows/edges into the actual template palette while preserving text readability and natural skin tones; dark templates need palette-compatible integration rather than a universal black overlay.

Client campaign assets are pending and must be reviewed before future selection. The abstract direction does not replace those materials by default. No images are generated, installed, removed or replaced in this consolidation. A's working photography is preserved; D/E imagery is unchanged. Authentic company/infrastructure claims still require verified material.

## Validation and publication

- `npm run build`: passed; three active designs and two archived compatibility websites packaged. Existing Vite future-loader warnings are non-blocking.
- `npm run lint --prefix option-a`: passed.
- `npm test`: **122 passed, 0 failed**, including all existing public/assistant/slideshow checks and four new shortlist/context/preservation tests.
- Browser: all 30 routes × three active designs × desktop/mobile = **180 inspected views**, no missing headings or document horizontal overflow. See [route evidence](evidence/shortlist/routes.json).
- Same-origin switching preserved the iBasic detail page and audience/plan query through A+C → D → E → A+C, updated direct-open links, and survived hub refresh. See [switching evidence](evidence/shortlist/switching.json).
- All three mobile menus opened, navigated to plans and closed; native support dialogs opened with the expected three fields and template-specific headings. See [interaction evidence](evidence/shortlist/interactions.json).
- Hub: exactly three cards/buttons and three comparison design columns; 390px and requested 320px checks had no document horizontal overflow (321px actual at the narrow check due browser scaling).
- Homepage preservation: 44 elements at desktop plus 44 at mobile, comparing typography, colours, padding and untransformed layout dimensions against the checkpoint build: **88 matching records, zero differences**. The first transformed-card measurement caught the existing plan-scale animation mid-transition; the final [checkpoint comparison](evidence/shortlist/homepage-preservation-comparison.json) avoids that measurement artefact. Original homepage source, content, images, slideshow, stylesheet and preload hashes are unchanged. Only A's App stylesheet import is added; regenerated bundle hashes necessarily change.
- D/E and all previously existing shared source hashes match the checkpoint. Regenerated archived B/C output differences were not committed; their unchanged sources remain packaged by the established workflow.

Local presentation: [desktop selector](evidence/shortlist/selector-desktop.png), [mobile selector](evidence/shortlist/selector-mobile.png), [hybrid inner page](evidence/shortlist/after-hybrid-residential.png), [original A](evidence/shortlist/before-a-residential.png), [C reference](evidence/shortlist/reference-c-residential.png). Browser checks are desktop emulation, not physical-device certification.

Publication target: https://ikonecttclient-kappa.vercel.app/ . Live publication/verification is pending at this pre-deployment checkpoint and will be recorded after checking the deployed result.

Remaining decisions: individual inner-page review of the restrained A+C treatment; any larger C-derived visual changes; campaign-asset selection and later imagery refinements. No further design direction is implemented automatically.
