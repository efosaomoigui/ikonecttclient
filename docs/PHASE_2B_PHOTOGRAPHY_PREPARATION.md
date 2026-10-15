# Phase 2B — Carousel correction and photography preparation

Reviewed 15 October 2026 against the supplied Phase 2B prompt, actual A–E source/rendered homepages, shared internal routes and existing asset files. The implemented change is limited to hiding the native plan-carousel scrollbar. Photography, slideshow, overlays and headline animation below are proposals awaiting the owner's approval.

## 1. Carousel correction

The grey track was the browser's native scrollbar on `.ik-carousel-rail`. There is no third-party slider, custom track or progress component to remove.

`shared/plans.css` now uses `scrollbar-width:none`, `-ms-overflow-style:none` and a scoped `::-webkit-scrollbar` rule with `display:none` and zero dimensions. Horizontal `overflow-x:auto`, snap behavior, touch-action, focus styling and the carousel controller are unchanged. The rule affects Residential and Business rails in all five templates, not comparison-table or document scrollbars.

Native track space disappears automatically. Existing top/bottom rail padding is retained to protect the 1.06 enlarged card, border and shadow clearance; no empty custom-track element remains. Plan-card dimensions, names, prices, features, selected state, outline, arrows, movement, detail/coverage/enquiry actions and reduced-motion handling are unchanged.

Files changed: `shared/plans.css`; generated `public_html/shared/plans.css`; rebuilt A/B/C CSS/JS asset hashes and their HTML references; this report; `IMAGE_SLOTS.md`; QA evidence under `docs/evidence/phase-2b/`. D/E HTML content, catalogue, controllers, routes, forms, navigation, copy and existing photograph/logo files were not edited. No dependency was added.

## 2. Validation

- Production build passed for all five templates. Existing non-blocking Vite future-config warnings remain.
- Existing automated suite passed: **77 tests, 0 failures**. This includes 150 base route/template combinations, catalogue values, details/comparison, audience selection, arrows/keyboard/reduced motion, plan-specific coverage and enquiry, support/account demonstrations and navigation.
- Browser checks cover both Residential and Business rails in A–E at desktop 1440, tablet 900, mobile 375 and narrow 320 requested CSS widths. Device-pixel rounding can produce 376/321 actual CSS pixels. Computed native scrollbar styling is hidden while the rail remains horizontally scrollable; card centre and scale are measured, and document overflow checked. Saved metrics distinguish steady-state checks from screenshots taken during earlier navigation.
- Previous/next controls and Left/Right/Home/End were exercised. Native horizontal input remains available; selected detail/coverage/quote navigation is checked without entering real customer details.
- Touch swipe continues to use native overflow scrolling. **No physical touch-device test was performed.** Browser checks use Chromium; Firefox/Safari and legacy Microsoft styling are supplied but not claimed as separately device-tested.
- Photography inventory uses source inspection, actual image dimensions, visual inspection of local candidates and rendered-page image-load checks. No new imagery was downloaded, generated or installed.

QA results and publication evidence are recorded at the end after final verification.

## 3. Existing photography inventory

The asset key list is an inventory, not a rights or authenticity declaration. Nigerian nationality, location, employee identity, network ownership and permissions cannot be established by filenames or appearance. Existing files stay intact pending individual template review.

| Key | Source / actual dimensions | Visible subject / current use | Audit finding |
| --- | --- | --- | --- |
| A-H | Remote Unsplash `photo-1573496359142-b 8d 87734a 5a 2`, requested 2400px; browser loaded 2400×3595 | Woman portrait; full-bleed A home hero with left/bottom copy | Existing emotional reference, not verified Nigerian home/laptop context. Portrait loses context in panoramic crop |
| A-R | Remote Unsplash `photo-1609234656388-0ff 363383899`, loaded 1600×900 | Group/audience scene in A Residential tile | Preserve, but story and location need review; the current alt label alone does not establish a Nigerian household |
| A-B | Remote Unsplash `photo-1573497019940-1c 28c 88b 4f 3e`, loaded 1600× 2400 | Woman portrait in A Business tile | Not a collaborating team; review actual intended story before future selection |
| H | B/C `hero_nigerian_family_gigabit_1791941970852.jpg`,1376×768,944,591bytes | Adult and child sharing devices in a light home; C full-height home hero; intended B home hero | Wide scene, centred people; insufficient master resolution for a new 2520px panorama without review |
| R | B/C `residential_fibre_living_room_1791941971218.jpg`,1200×896,848,234bytes | Two people gaming on a sofa; B intended audience panel, C Residential connection panel | Supporting lifestyle reference; screen contains baked-in performance-style text, so do not treat it as verified product evidence or reuse automatically |
| B | B/C `business_enterprise_workspace_1791941971989.jpg`,1200×896,873,214bytes | Office workshop around screen/laptops; B intended Business panel, C Business connection panel | Useful collaboration composition reference; screens and location not independently verified |
| L | B/C `creative_creator_fibre_1791941972055.jpg`,1200×896,937,171bytes | Fashion entrepreneur posed beside workstation/materials; C Residential editorial | Actual scene is a studio/entrepreneur, not a person using laptop at home. Useful later business supporting reference if approved |
| C-P | C `nigerian_business_collaboration.jpg`,1600× 2400,646,331bytes | Single-person portrait in C Business editorial | Filename/alt describe collaboration, but the image is not a team. Flag for individual review; no substitution in this phase |
| D art | Inline fibre-line SVG 600×300 viewBox + radial burgundy CSS background | D compact Residential-oriented homepage hero | Procedural artwork, no photography. Preserve it |
| E art | CSS horizon/radial gradients and existing rise entrance | E centered 100svh hero and gradient audience panes | Procedural artwork, no photography. Preserve it |
| Root legacy | `assets/images/cityscape-night.jpg`, `coverage-map-bg.jpg`, `phone-in-hand.jpg`, `phone-mockup.jpg` (small 512× 286); `ikonect-full.png`512×341 | Not referenced by D/E homepages | Inventory only; not suitable approved panoramic masters. A map graphic is not authoritative coverage |

The four common B/C JPEGs are byte-identical copies across their two source directories. Preserve both locations and current C imports. Logos remain separate branding assets, not photographic story material.

### Pre-existing delivery issue found in B

`option-b/src/data/assets.ts` supplies root-absolute `/src/assets/images/...` strings. In the packaged static preview these request the domain's root source directory, rather than Vite-imported or correctly packaged template assets. All three B homepage images returned zero natural dimensions in browser checks; their referenced source files exist locally. This is an existing delivery-path issue, not missing photography production. Record it for the next bounded B review, then repair asset references using those same files before judging replacement photographs. This phase leaves the references and images unchanged as requested.

### Empty reservations and all internal pages

`shared/pages.js` renders six neutral reservations per template: Residential Overview, Business Overview, three Business solution/segment details (connectivity, SME, enterprise) and About. There are 30 rendered instances across A–E; logical optional introductory hero briefs in the manifest are not extra rendered image sections.

| Template | Residential / Business / Solution details / About desktop ratios | Mobile |
| --- | --- | --- |
| A |4:3 /16:9 /3:2 /3:2 | All 4:3 below 768px, copy outside |
| B |3:2 /21:9 /16:9 /16:9 | Same |
| C |4:3 /21:9 /3:2 /16:9 | Same |
| D |4:3 /16:9 /3:2 /4:3 | Same |
| E |16:9 /21:9 /16:9 /16:9 | Same |

`IMAGE_SLOTS.md` now corrects E-RS to its actual 16:9 rendered ratio and extends all 25 baseline logical briefs with subject, environment, light, grade, crop, overlay, animation and approval details. It adds 10 homepage export records across five story families. Shared approved masters can serve distinct crops on separate pages;35 logical records do not mean 35 new photographs are required.

Plans/details/comparison, quotation, installation, coverage/results/verification, support/search/FAQs/troubleshooting/request forms, contact, legal and account preview routes remain interface/text-first. Footer and mega-menu remain logo/navigation only. No filler photo, invented staff scene, coverage map or product-equipment differentiation is proposed for these routes.

## 4. Template-specific visual storytelling

| Template | Existing home composition | Proposed photographic mix | Text-led / image-only decisions | Hero recommendation and motion |
| --- | --- | --- | --- | --- |
| A | Full-bleed remote portrait hero → coverage launcher → two edge-to-edge photo tiles → plans → dark company story → portal | Warm Nigerian woman/laptop hero, natural household and workplace audience frames; integrated left/bottom scrims, current HTML copy positions retained | Coverage/plans/company/portal stay text-led. Existing internal reservations can carry image-only frames with text in its separate column; no new home photo band | Conditional 3 slides: woman → family → business. Restrained one-time 160–200ms fade/rise for headline; fixed readable text across images; no scramble |
| B | Panoramic photo-intended hero → coverage → two photo-intended audience panels → plans → company → portal | Wide family scene, wider collaborative office, active entrepreneur; static audience panels offset hero motion | Existing section order unchanged. No photograph inside coverage, plan cards, company or portal. Fix existing asset resolution only in later B review | Conditional 3 slides: family → business → entrepreneur.600–800ms image crossfade; fixed heading/CTAs; minimal lead fade only on initial entrance |
| C | Full-height family hero → equally weighted rounded audience panels → plans → pearl Residential editorial → dark Business editorial → coverage → portal → support | Keep panoramic restraint and pearl break. Selective photo cards suit audience selection; editorial images provide visual breathing room | Editorial image fields can communicate without extra caption/overlay after copy approval. Avoid repeating a hero image in the next panel. Utility sections stay clean | **Static first.** Existing single hero maintains restraint. If owner later chooses motion, assess 3 alternatives (family/business/city) in a new review; no current production order. Short soft entrance, no default scramble |
| D | Compact Residential hero with fibre SVG/radial field → section navigation → text tiles → plans → getting-connected → FAQs → final dark CTA | Keep home artwork. Start photography with approved internal D-RS/D-BH/SD; warm interiors, natural window light, no added photo cards | Home remains text-led; no current home image-only reservation or approved full-bleed insertion | **No slideshow recommended.** Static SVG; optional 100–180ms single fade only if later approved. Compact Manrope heading does not benefit from scramble |
| E | Centered full-height CSS horizon hero → coverage → equal gradient audience panes → plans → About text → portal | Preserve horizon now. Conditional photographic panes/hero use burgundy grading with natural skin and a calm central text area; no opaque black slab | Coverage/plans/About/portal stay text-led. Do not force a new image-only band. Existing internal reservations can show images with external copy | **Separate E approval required.** Conditional 3 slides: woman → business → Nigerian city. Fixed centered type; optional ≤300ms decorative scramble once, never continuous |

D and E are separate decisions; neither inherits A/B photographic direction automatically. The review sequence is A, B, C, D, E, with each examined from home through inner pages to footer before its own implementation.

## 5. Composition and overlay rules

Use believable modern Nigerian homes, entrepreneurs, offices and architecture, with Black Nigerian subjects as the preferred creative brief. Build stories around a specific action and environment. Do not require a smiling person in every frame; the environmental city/architecture story provides a useful change of pace. Avoid repeated laptop smiles, synthetic-looking gestures and generic fibre-beam stock motifs.

For A/B/C left-aligned hero copy, keep approximately 40–45% low-detail space on the text side and subjects in the right third/half. Preserve devices, hands and group relationships. Keep desktop headlines/CTAs clear of faces. E needs a **central** calm zone (about 55% width × middle 50% height) with lateral subjects; it cannot use the same left-safe panoramic crop. D retains its current artwork.

Every approved master needs separate desktop and mobile composition proofs. Suggested wide source 2520×1080 (21:9), A delivery 2400×1350 (16:9), portrait hero 1200×1500 (4:5), internal mobile 800×600 (4:3). A lower-resolution existing file is not automatically suitable for these targets. At narrow widths retain face/activity and allow the existing copy layout to govern; if no readable crop works, hold the photograph and bring the layout choice back for approval rather than covering the subject.

Overlay starting points for later proofing: A charcoal left 75%→40%→transparent; B charcoal left 80–85% fading broadly to clear with shallow bottom support; C charcoal edge 90%→55%→clear with dark grounding; E soft burgundy radial/vertical shading around centered text, independently tuned per frame. These percentages are starting recipes, not a contrast certification. Scrims should blend gradually, preserve the subject and avoid rectangular boundaries. Text-outside internal images need no legibility overlay. Check actual text/background contrast at all crops and throughout a crossfade, with the approved copy in place; if readability fails, reject/recompose that frame.

Selective cards remain appropriate in C's audience choices and existing supporting reservations. Full-bleed images belong to existing hero/audience fields. No layout changes or new image-only sections are installed during preparation.

## 6. Cinematic slideshow architecture — specification only

No runtime slideshow code or dependency has been added. The future system should be an optional lightweight enhancement mounted only in a specifically approved hero, separate from `catalogue.js` and the plan-carousel controller.

### Data and rendering boundary

Use an ordered per-template configuration: `enabled` (default false), `slides` containing stable asset ID, story, approved desktop/mobile sources, `srcset/sizes`, intrinsic dimensions, alt decision, desktop/mobile focal points, overlay recipe and dwell duration. Include approved title/description/CTA context only if text genuinely changes; the first implementation should keep existing semantic headline, supporting line and destinations fixed across image transitions.

Reuse existing template colours, type and controls. Two absolute image layers inside the current hero perform an opacity crossfade; reserve the hero's current height/aspect to avoid layout shift. Keep one stable HTML heading and links outside the animated layers. Background images that merely illustrate unchanged visible copy can have empty alt; meaningful images need concise scene descriptions. Do not repeat a long heading via alt or describe fictional company ownership.

### State and timing

Keep `activeIndex`, `pendingIndex`, `elapsedMs`, `durationMs`, `userPaused` and a set of temporary pause reasons (`hover`, `focus-within`, `pointer-interaction`, `document-hidden`, `offscreen`, `image-loading`, `reduced-motion`). Run a single `requestAnimationFrame` clock only when enabled, visible, in view, decoded and unpaused. Do not use independent timers for image and progress ring. Use timestamp deltas, not frame counts, so refresh rate does not alter dwell time.

Proposed starting rhythm:7-second dwell and 650ms opacity crossfade for A/B,8-second dwell and 750ms for conditional E. These values need approval. Decode the next image before transition; retain the current visible image while waiting. A failed next image leaves the current frame readable, skips the failed item and offers manual controls; if fewer than two usable slides remain, show one static image and remove redundant playback/progress controls. No jump back after returning from a hidden tab.

Manual previous/next wraps through available slides, cancels pending transitions, resets elapsed progress and **pauses autoplay until Play is explicitly chosen**. Repeated input during crossfade should resolve to a single requested destination, without queuing animations or moving keyboard focus. A user Pause is persistent while that hero remains mounted; hover/focus/visibility are temporary reasons and cannot override it. Remove listeners and cancel clocks on navigation/unmount.

### Circular progress control and accessibility

Use a small 24–28px SVG progress ring inside a 44px minimum Play/Pause button, beside Previous and Next and a concise active count such as“1 of 3”. Ring stroke follows the template accent; track remains low contrast but visible. Progress is elapsed/dwell; reset at the new slide, freeze when paused and start from zero after manual selection. The circle itself is decorative (`aria-hidden`); the button exposes “Pause slideshow” / “Play slideshow”. Do not announce every progress tick.

Expose a labelled carousel region and meaningful slide position. Buttons support normal Tab and Enter/Space. Arrow keys work only while focus is within the hero controls, never hijack form/global navigation; Home/End can select endpoints. Keep the chosen button focused. Inactive interactive slide content must not receive focus. Automatic image-only changes should not create repeated screen-reader announcements; announce a concise status for manual changes. Pause automatically for keyboard focus, hover and pointer interaction. Provide a persistent, obvious Pause control from the first running frame.

Reduced-motion defaults to a static first frame, no autoplay, no progressing ring and no text motion; manual changes are instant. Allow a deliberate Play choice only if the owner approves that policy, without restoring scramble/zoom. Static first frame and working existing CTAs remain the no-JavaScript/failure fallback. Consider manual-only mode when data-saving is indicated; first content should not wait for animation or optional images.

### Text entrance

A/B: one soft fade/up entrance,180–220ms, small displacement and no repeated text reset on every image. C/D: static or a short opacity entrance. E: a decorative scramble is optional for a single short title segment, capped at approximately 250–300ms once per initial entry; preserve the full accessible semantic text from the first render, animate only an `aria-hidden` visual copy with fixed dimensions, then remove it. Never scramble CTA labels, paragraphs, essential names/prices or text being read/focused. Reduced motion sees static text; no layout reflow, letter-width oscillation or continuous random updates.

### Loading and performance

Deliver approved local responsive sources in AVIF/WebP with appropriate fallback, dimensions and compression proved against facial detail. Eager-load only the first hero frame with high priority; do not preload all 3–5 slides. After first render, load/decode at most the next needed frame, respecting visibility and data-saving conditions. Supporting images lazy-load with reserved ratios. Use `picture`/media art direction rather than sending a panoramic file and guessing a mobile crop. Keep at most two decoded transition layers active, use opacity transforms sparingly, and leave no permanent `will-change` on every section. No video, parallax or new animation library is justified by this preparation brief.

Later acceptance must cover first-frame LCP/CLS, slow/failed image loading, zero images, one image, hidden tab/offscreen pause, rapid manual input, visible focus, screen reader/manual announcements, reduced motion, desktop/tablet/mobile crops, contrast throughout transition and real touch hardware where available. Do not claim these future behaviors are implemented or tested now.

## 7. Production priorities and implementation sequence

The full field-level register is [IMAGE_SLOTS.md](../IMAGE_SLOTS.md):25 retained internal logical IDs +10 homepage exports, resolved through explicit template/story/purpose profiles. It records all requested fields, including lighting, colour, source dimensions, desktop/mobile crop, text safety, overlays, motion, candidate/reuse, new requirements and pending approval. Optional RH entries are not instructions to add five new introductory heroes.

| Priority | Future production / review | Reuse discipline |
| --- | --- | --- |
|1 | Primary Residential woman/laptop master and A crop proofs | One approved scene before variants; no automatic identical hero on all templates |
|2 | Primary Business collaboration master | Distinct wide hero and internal/support crop from the same shoot when appropriate |
|3 | Connected-family master | Preserve relationship and mobile framing; deliberately distinguish B and C crops/story use |
|4 | Nigerian environment/city master, if E direction selected | Real location/context approval; no fabricated coverage/network evidence |
|5 | Residential supporting activity | Different action from adjacent hero; image-only internal treatment where appropriate |
|6 | Business/entrepreneur supporting activity | Use existing candidate only after exact story/rights/crop review; avoid duplicate near-identical shoots |
|7 | About material | Genuine authorised people/place; leave pending if unavailable |
|8 | Remaining internal reservations | Interface-first pages remain image-free; no filler production |

After owner approval: resolve source/rights and the B/C audit issues in bounded template reviews; produce static desktop/mobile proofs first; implement approved responsive imagery for one template; review home→inner pages→footer; only then enable an approved hero slideshow; run build/tests/accessibility/responsive/performance checks; publish that bounded template change; repeat for the next template. D/E require their own composition decisions before production.

## 8. Approval checkpoint

The user's instruction explicitly says: “Stop at the photography approval checkpoint.” This report and the manifest are the concrete review package. No further photography or slideshow work is authorised by the carousel deployment.

Approve or revise: A/B three-story directions; C/D static-first choices; whether E retains its horizon or moves to photographic storytelling; exact images/slots and allowed reuse; Nigerian subjects/environments and source method; rights/model/property permissions; genuine About material; desktop/mobile proofs and text-safe areas; overlays; autoplay timing, circular controls and E's optional scramble; and the individual template review sequence. Existing commercial facts and customer journeys remain Phase 2A's validated demonstrations.

## 9. Final QA and publication record

Local validation complete: build passed, 77 existing tests passed, and 40 steady-state browser measurements (5 templates × 2 audiences × 4 widths) passed. All rails remained scrollable with `scrollbar-width:none` and WebKit scrollbar display `none`; no document overflow; centred card difference 0px; desktop/tablet scale 1.06 and narrow-mobile scale disabled. Native horizontal input on C moved scrollLeft 768→1152. Mouse arrows and keyboard were exercised in each template/audience, and plan links retain their Phase 2A behavior. Physical touch hardware and separate Firefox/Safari device validation were not performed.

Curated evidence: [carousel metrics](evidence/phase-2b/carousel-checks.json), [rendered home inventory](evidence/phase-2b/existing-home-inventory.json), plus desktop Residential/mobile Business screenshots and all five existing hero snapshots. Source photo/logo assets and Phase 2A catalogue/controller/routes/forms are unchanged. Publication verification is recorded below.


Production verification: implementation commit `7461b77` was pushed to `main`. All five deployed template entry points and their referenced stylesheets returned HTTP 200, with the scoped hidden-scrollbar rule present. The live A Residential carousel remained scrollable; View Plan Details → Check Coverage retained selected plan `res-igold` (iGold · 50 Mbps · ₦25,000/month). This confirms the published correction and a representative live plan journey. See [production HTTP checks](evidence/phase-2b/production-checks.json) and [live carousel screenshot](evidence/phase-2b/production-a-scrollbar-hidden.png). The pre-existing B root image URL still returns HTTP 404 and remains recorded for its separate template review.
