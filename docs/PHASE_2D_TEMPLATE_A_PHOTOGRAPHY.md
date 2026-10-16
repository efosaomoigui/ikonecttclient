# Phase 2D — Template A photography preparation

16 October 2026 · **Image approval checkpoint — preparation only**

This is the review package for Template A. No photography has been generated, downloaded, installed or replaced; no homepage, slideshow or photographic layout has been implemented. Templates B–E retain their existing implementation. Existing copy, plans, destinations and customer journeys remain the baseline.

The separately authorised welcome-screen adjustment is limited to A: “Welcome to Ikonectt Virtual Assistance” and “Browse Help Topics” below Start Conversation. The conversation engine, validation, privacy and in-memory handling are unchanged. This exception is separate from photographic work.

## 1. Template A visual audit

### Sources and inspection boundary

Reviewed [IMAGE_SLOTS.md](../IMAGE_SLOTS.md), [Phase 2B photography preparation](PHASE_2B_PHOTOGRAPHY_PREPARATION.md), [architecture](PHASE_1_ARCHITECTURE.md), [content audit](CONTENT_AUDIT.md), [visual refinement](PHASE_1_5_VISUAL_REFINEMENT.md), [plan and journey report](PHASE_2A_PLAN_CATALOGUE_AND_JOURNEY_REPORT.md), [support report](PHASE_2C_AI_SUPPORT_ASSISTANT.md), `docs/design.md`, the active A source/content/styles and shared renderer. Also reviewed the supplied 14-page `Ikonectt_Visual_Architecture_Blueprint_Corrected.pdf` in the client's Custom Downloads folder, including its public website, customer journey, coverage and assistant boundaries.

The active application mounts `HomePage.tsx` and the shared public-site renderer. Old React Residential, Business, About, Coverage and Support page components are not mounted. Their imagery is excluded from the active inventory; they must not be activated as part of photo installation.

Local browser inspection covered the homepage and every one of the 29 canonical internal routes at desktop and mobile widths. Desktop/mobile route results are saved in [route-audit.json](evidence/phase-2d-template-a/route-audit.json) and [route-audit-mobile.json](evidence/phase-2d-template-a/route-audit-mobile.json). Parameterised plan, coverage and troubleshooting states share those renderers; source review and existing functional tests cover their variants. This was a local responsive audit, not physical-device or production performance certification.

### Current composition and photographic opportunities

| Location | Existing composition / finding | Preparation decision |
| --- | --- | --- |
| Homepage hero | Full-bleed photograph, fixed HTML copy on the left, horizontal scrim. The portrait source loses the face in the desktop crop; mobile text crosses the face. | Three approved Nigerian lifestyle stories, with independent responsive compositions. Retain hero structure, headline and CTAs. |
| Homepage coverage | Centred title, short introduction, address input and action. | Keep interface-first; no photograph or new banner. |
| Homepage audience introductions | Two edge-to-edge photographic panels; stacked below 1024px. Existing Residential scene lacks a clear home story; Business is one posed person. | Distinct household activity and collaborative workplace images; maintain existing panel geometry and text alignment. |
| Homepage plans, company confidence and portal | Catalogue and centred text/action sections. | Keep image-free. No new About photo band, photographic plan cards or decorative background maps. |
| Residential overview | Text page header followed by editorial copy and one 4:3 neutral reservation. | A-RS: everyday home activity, text outside the image. Residential use-case tiles remain text-led. |
| Business overview | Text page header followed by editorial copy and one 16:9 reservation. | A-BH: workplace collaboration, text outside. The manifest's “hero” name does not authorise converting the page header into a photographic hero. |
| Connectivity, SME and Enterprise details | Same editorial structure with a 3:2 reservation on each separate page. | A-SD: one suitable general business scene may serve the three pages. No implied plan-specific equipment or service promises. |
| About | Text page header, company story and 3:2 reservation. | A-AB: genuine authorised company material only; leave pending if none is available. |
| Other internal pages, menus and footer | Forms, facts, help, legal or account-preview controls. | No filler photography; official logo remains unchanged. |

There are **three displayed homepage photographs and six internal neutral reservations**, not six installed internal photographs. Optional A-RH is a logical brief with no currently rendered slot. The Business Solutions index has no photographic reservation. Residential “Work from home”, “Stream and unwind” and “Connect the household” are existing text tiles, not separate solution-image pages.

### Text arrangement and the supplied ipNX reference

The client supplied `ipnxnigeria.ng_sme-broadband_.png` as a reference for typography, alignment and spacing, with a second screenshot illustrating scattered text. Adopt the reference's editorial discipline in subsequent approved work:

- One strong section heading, one compact supporting block and a clear action. Do not repeat an introductory sentence as both a lead and a paragraph.
- Align the heading, paragraph and CTA to the same column edge. Keep image and text in an intentional pair; avoid captions, badges and floating labels that create competing anchors.
- Use the existing A type scale. Headings should carry the hierarchy through weight, size and controlled wrapping; do not enlarge body copy until it competes with the heading.
- Keep body text within a readable measure, generally about 45–65 characters per line on desktop and the available single column on mobile. Judge actual wraps with approved copy rather than forcing hard line breaks.
- Keep heading-to-body spacing smaller than the gap between sections. Use A's existing spacing tokens consistently, with roughly 16–24px within a text group and its existing broader section rhythm; do not introduce isolated large gaps.
- Left-align editorial prose and paired image sections. Retain deliberate centred page headers and concise conversion sections; avoid centred long paragraphs.
- Stack related text, action and photograph in a coherent reading order on mobile. Never interleave one section's copy with another section's image.

These are forward requirements for review, not permission to rewrite or restyle the current homepage in this phase. The second screenshot is treated as an illustration of the problem, not evidence that its exact block is mounted in A. Do not copy ipNX branding, photography, service claims, progress bars, footer facts or page content. In particular its “100%” labels do not establish any Ikonectt performance fact.

## 2. Existing image inventory

| Inventory key | Active source / rendered dimensions observed | Current role and suitability |
| --- | --- | --- |
| A-current-hero | Unsplash `photo-1573496359142-b8d87734a5a2`, `?auto=format&fit=crop&w=2400&q=85`; 2400 × 3595 | Vertical portrait. No established Nigerian home/laptop story; unsuitable as the new Residential master. Preserve current use until replacement approval. |
| A-current-home-residential | Unsplash `photo-1609234656388-0ff363383899`, `?auto=format&fit=crop&w=1600&q=80`; 1600 × 900 | Existing group scene; home context and Nigerian subject identity are not established. Preserve pending approval. |
| A-current-home-business | Unsplash `photo-1573497019940-1c28c88b4f3e`, `?auto=format&fit=crop&w=1600&q=80`; 1600 × 2400 | Single-person portrait, not collaborative professionals. Preserve pending approval. |
| A-RS / A-BH / A-SD × 3 / A-AB | Neutral `data-slot` reservations from `shared/pages.js` | No installed internal photos, no source image dimensions. Desktop ratios 4:3 / 16:9 / 3:2 / 3:2; all become 4:3 below 768px. |
| Official Ikonectt marks | Existing brand assets used by navigation, footer and assistant | Branding, not photography. Preserve aspect ratio and approved files; do not recreate or bake into photos. |
| Legacy A component photos | Unmounted page components | Excluded from the active placement map and production order. |

The complete remote references remain in `option-a/src/components/pages/HomePage.tsx`. Existing alt descriptions imply home use or actual Ikonectt customers beyond what the photos establish. They are preserved in this preparation phase; replacements should use concise, accurate scene descriptions without claiming real customers, staff, premises or proven nationality from appearance alone. Subject/story authenticity and source rights require approval. B/C candidate files listed in the manifest are not approved A assets and are not imported here.

## 3. Three-slide homepage hero plan

The original identifiers remain **A-H 01**, **A-H 02**, **A-H 03**. Filenames may use `a-h01-*`, `a-h02-*`, `a-h03-*`; that alias does not create new manifest IDs.

### Fixed copy and destinations

All three frames share the current visible HTML, without extra slide slogans:

> Fibre internet for a brighter Nigeria  
> **Connectivity without limits.**  
> Fibre broadband for homes, businesses and everything you do online.

“Check Coverage” retains `#/coverage`; “Explore Plans” retains `#/residential/plans`. Keep one semantic heading and one set of controls outside the fading image layers. Do not add plan, SLA, coverage, speed or customer claims to the photography.

### Common hero asset profile H

Each H record below inherits these explicit specifications:

| Field | Proposed requirement |
| --- | --- |
| Placement | Template A homepage, existing `#home-hero`, full bleed edge to edge; no rectangular photo card. |
| Lighting / grade | Soft natural window light, believable shadows, warm neutral interiors and true skin tones. Restrained red detail may connect to the brand; no neon, fake fibre beams or excessive orange/teal grade. |
| Aspect ratio / source dimensions | Desktop source at least 3840 × 2160 (16:9); medium composition at least 2400 × 1800 (4:3); independently art-directed portrait source 1440 × 2560 (9:16). These are future production targets, not instructions to enlarge existing files. |
| Delivery | Candidate desktop widths 1600 / 2400 / 3200; medium 1200 / 1600; mobile 720 × 1280 and 1080 × 1920. Approve exact crops in the rendered frame; use only the appropriate source set for the viewport. |
| Subject position / text safety | Wide view: people predominantly right, faces outside the existing copy bounds; quiet left/background field through about 55% at 1440px and 66% at 1024px. Medium/mobile: faces in a shallow upper image band, calm lower field behind the existing copy. No raster text or logo. See section 6 for crop gates. |
| Overlay | Continuous charcoal-to-transparent scrim over the text field; shallow lower support only where needed. Frame-specific tuning, natural faces and no opaque rectangular panel. |
| Motion | Future opacity-only crossfade, proposed 650ms after a 7-second dwell. No camera pan, zoom, parallax or moving people. Motion is specification only; section 8 controls all pause/fallback behaviour. |
| Existing candidate / new requirement | No approved exact A master. Existing remote references are retained display assets only. New, approved Nigerian scenes and responsive crop proofs required before replacement. |

The earlier generic 2520 × 1080 panoramic source cannot yield a native 2400 × 1350 export without increasing height artificially. Profile H therefore proposes larger A-specific masters and independent medium/mobile framing. It also replaces the earlier generic 4:5 mobile assumption for this tall, text-over-image hero. These are **pending A-specific specifications**, not edits to other templates or silent changes to the shared manifest.

### Individual hero records

| Asset identifier | Page / section | Intended subject and composition | Lighting | Subject position / text-safe area | Mobile crop | Overlay / motion | Candidate status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-H 01 · HOME-WOMAN | A home / hero slide 1 · H ratios/dimensions | Beautiful Nigerian woman laughing naturally while using a laptop in an elegant contemporary living room. Candid side interaction, credible hands/device, premium but lived-in cream/timber interior; no posed corporate portrait. | H, soft window key and warm neutral ambience. | Desktop subject right third; calm wall/sofa left. Retain face, laugh and laptop context; no headline across face. | Independent H portrait; face above the first line of existing hero text, hands/device lower without requiring a full-body view. Test the smallest viewport first. | H horizontal/vertical adaptive scrim; H crossfade only. | New approved scene required; current portrait is not a qualifying candidate. |
| A-H 02 · HOME-FAMILY | A home / hero slide 2 · H ratios/dimensions | Nigerian family enjoying a connected home, authentic warm expressions and a premium residential setting. Shared activity around a tablet/laptop rather than everyone posing with separate screens. | H, consistent time-of-day and warmth with slide 1. | Family grouped tightly on right; faces and relationships intact; quiet left field. Avoid people spread across the full width. | Independent portrait with a close grouping in the upper band; preserve every principal face. Re-stage rather than cut a family member out. | H; avoid darkening faces to solve copy contrast. Same timing/controls as other slides. | New approved scene required; existing A group image does not establish this story. |
| A-H 03 · HOME-BUSINESS | A home / hero slide 3 · H ratios/dimensions | Nigerian professionals collaborating in a contemporary business environment; confident, productive discussion with plausible laptops, notes and gestures. No staged handshake or invented Ikonectt office signage. | H, slightly cleaner workplace daylight while maintaining the common grade. | Interaction right half, principal faces right and clear of the copy. Negative space left, credible workspace visible. | Independent tight portrait/medium setup, key faces uppermost; maintain collaboration rather than a cropped single-person portrait. | H; restrained image transition, fixed HTML copy. | New approved collaboration scene required; current A Business portrait is not a team. |

Source method, rights and subject approvals remain undecided. Nigerian context should be deliberate and credible, without costume stereotypes or treating apparent ethnicity as proof of nationality. If synthetic lifestyle assets are later chosen, they remain illustrations of the intended audience, never documentary evidence of Ikonectt people or facilities.

## 4. Supporting image requirements

All records below are static. Preserve approved existing geometry, gutters and copy position. Text-outside images need no legibility scrim or baked-in caption. Supporting sources can come from the same approved shoot as a hero, using distinct compositions; an identical frame immediately repeated below a rotating hero is not acceptable.

| Asset identifier | Page / section | Subject, composition and lighting | Aspect / source and delivery dimensions | Position / text-safe area / overlay | Mobile crop | Motion | Existing candidate / new requirement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-HP-R · proposed supporting alias | Home / Residential audience panel | Nigerian household engaged in a different everyday activity from the hero: relaxed shared viewing or a home work moment. Natural window light, warm neutral room; retain meaningful home context. | Source at least 2400 × 3000 (4:5) plus alternate wide 3000 × 2000 (3:2) for the single-column tablet panel. Desktop delivery 1440 × 1800; mobile 1080 × 1440 (3:4), subject to actual panel proof. | People upper/centre-right, quiet bottom-left for existing label, heading, body and action. Integrated bottom scrim begins around 75% charcoal, fades through 25% to clear; tune by crop. | Separate 3:4 composition, preserve faces in upper area and clear lower copy. Existing panel stays min-height 520px, not a forced 3:4 box. | Static; no added animation. Existing gentle hover treatment is not a reason to add more motion. | Current home Residential source remains until approval. New distinct frame required; not the exact A-H 02 crop. |
| A-HP-B · proposed supporting alias | Home / Business audience panel | Nigerian colleagues actively discussing work; different angle/activity from A-H 03. Contemporary credible workspace, natural daylight and authentic gestures. | Same source/delivery profile as A-HP-R: 4:5 master 2400 × 3000, wide alternate 3000 × 2000, 1440 × 1800 desktop and 1080 × 1440 mobile proofs. | Faces above the lower copy group; preserve team interaction and a calm bottom-left area. Same softly graded bottom overlay family. | Separate 3:4 composition; do not isolate one person or crop communicating gestures. | Static, no new motion. | Existing single-person portrait does not satisfy the team brief. New supporting frame; no consecutive hero repetition. |
| A-RS | Residential overview / “Made for everyday moments.” | Nigerian adult using a laptop at home, or a naturally connected household. A distinct action from the home hero; soft window light, neutral interior, credible device/hands. | 4:3 source 2400 × 1800; desktop 1200 × 900; mobile 800 × 600 or 1200 × 900. | Centre-right within the image; text is entirely alongside on desktop and above on mobile. No text inside image, no overlay. | 4:3 with face, hands and useful home/device context intact. | Static, lazy-loaded below header. | No approved local A candidate. An alternate approved residential shoot frame may be reused across this separate page. |
| A-BH | Business overview / “Keep business moving.” | Nigerian professionals working together, confident and productive. Broad environment, believable screens, neutral daylight. Do not imply actual company premises or employees. | 16:9 source 3840 × 2160; desktop 1920 × 1080; separately approved mobile 4:3 1200 × 900 (800 × 600 minimum delivery). | Centre/right balanced team; all adjacent HTML remains outside. No scrim in current layout. | 4:3 tighter view preserving collaboration, not a crop cutting off the second person. | Static. | No approved A collaboration candidate. An approved alternate from the Business shoot can serve this non-adjacent page. |
| A-SD | Business solution details / connectivity, SME, enterprise | General Nigerian workplace interaction relevant to discussing connectivity needs. Small credible team with devices, no fabricated network racks, router specification or plan differentiation. Soft natural workplace light. | 3:2 source 3000 × 2000; desktop 1440 × 960; independent 4:3 mobile crop 1200 × 900 / 800 × 600. | Centre-weighted activity contained in the central 70–80%; text outside, no overlay or raster annotations. | 4:3 keeps all people/device context essential to the story. | Static. | New approved general scene or distinct alternate from the approved Business shoot. One master can serve all three separate routes; no automatic order for three extra photos. |
| A-AB | About / “About Ikonectt.” | Genuine authorised company people, place or documented working environment. Natural available light and truthful colour; composition follows what authentic material supports. | Desired source at least 3000 × 2000 (3:2), desktop 1440 × 960, mobile 4:3 1200 × 900 / 800 × 600. If source quality is insufficient, review a smaller placement rather than upscale or invent detail. | Centre/right only where genuine framing permits; retain authorised identifying context. Copy outside, no overlay. | Approved 4:3 crop retaining the factual context; no misleading exclusion. | Static. | None authenticated. Client-approved genuine material required. Keep pending if absent; stock/generated staff or offices cannot stand in as company fact. |

`A-HP-R` and `A-HP-B` are local placement aliases proposed by this report, not changes to existing `A-RS`/`A-BH` IDs. **A-RH remains deferred**: optional Residential introductory hero, original 16:9 1920 × 1080 / mobile 4:3 800 × 600 brief, right subject and left safe field. No rendered slot or implementation order exists for it; any activation needs a separate layout decision and full crop proof. The current page already has its title band and A-RS editorial slot.

## 5. Image placement map

All paths below are hash routes under `/option-a/`. Existing page order, section backgrounds and CTA destinations are retained.

| Route / section | Intended image placement |
| --- | --- |
| `#/home` hero | A-H 01 → A-H 02 → A-H 03; one existing full-bleed field, fixed copy. |
| `#/home` audience introductions | A-HP-R / A-HP-B in the existing edge-to-edge panels. |
| `#/home` coverage, plans, company and portal | No new image. |
| `#/residential` | A-RS in existing `data-slot="residential"`; no additional A-RH. |
| `#/business` | A-BH in existing `data-slot="business"`, below the text page header. |
| `#/business/solutions/connectivity` | A-SD in existing `data-slot="solution"`. |
| `#/business/solutions/sme` | A-SD in existing `data-slot="solution"`. |
| `#/business/solutions/enterprise` | A-SD in existing `data-slot="solution"`. |
| `#/about` | A-AB in existing `data-slot="about"`, conditional on authentic material. |
| `#/residential/plans`, `#/residential/plans/demo-1`, `#/residential/plans/demo-2`, `#/residential/compare`, `#/residential/installation` | Image-free catalogue, detail, comparison and enquiry layouts. All five catalogue plan detail variants and the `residential/plans/details?plan=…` alias remain image-free. |
| `#/business/solutions`, `#/business/plans`, `#/business/quote` | Image-free solution index, commercial information and quotation pathway. |
| `#/coverage`, `#/coverage/results`, `#/coverage/verification` | Image-free checker, five explicit demonstration outcomes and address review. No fabricated coverage imagery. |
| `#/support`, `#/support/faqs`, `#/support/troubleshooting`, `#/support/fault`, `#/support/service-request`, `#/support/contact` | Image-free help, guides, forms and escalation. No staff portraits or hardware diagrams without approved documentation. |
| `#/contact`, `#/privacy`, `#/terms` | Text, approved contact pathways and legal publication states. No photos. |
| `#/my-ikonectt/sign-in`, `#/my-ikonectt/forgot-password`, `#/my-ikonectt/preview` | Accessible preview/account controls, no customer records or photography. |
| Navigation / mega menus / footer / assistant | Existing official logo only. No new photographic dependency. |

This accounts for the homepage and all 29 canonical internal routes. Image use must not imply live coverage, authenticated Care functionality, submitted enquiries or operational support. The corrected architecture keeps the public website separate from Care/Admin and real operational actions.

## 6. Responsive crop requirements

### Measured text envelopes

Measurements are approximate CSS pixels from the local browser; fractional scrollbar/device scaling produces minor differences. Images must be approved against the real rendered copy, not just these percentages. [Hero measurements](evidence/phase-2d-template-a/hero-measurements.json) contain medium/mobile bounds; [desktop before](evidence/phase-2d-template-a/homepage-desktop-before.png) records the wide composition.

| Requested viewport | Existing hero / text envelope | Implication |
| --- | --- | --- |
| 1440 × 900 | Hero 720px high; copy column x≈165–785, first line y≈267px inside image, CTA bottom ≈608px inside image. | Calm left field through about 55% width. Face/context must survive the wide crop and right edge. |
| 1024 × 900 | Hero 720px high; copy x≈48–668, first line ≈279px into image. | Copy occupies about 66% of width: earlier 40–45% safe-space advice is insufficient. Use a reviewed right-weighted crop or medium art direction. |
| 768 × 1024 | Hero 600px high; copy x≈24–644, first line ≈270px into image. | Text spans most of the width; put faces in the upper image region, not beside the lower headline. |
| 390 × 844 | Hero 600px high; copy x≈24–361, first line ≈135px into image; CTA group ends ≈520px into image. | Portrait framing must keep principal faces above the copy and leave the lower field quiet. Desktop cropping cannot meet this reliably. |
| 320 × 740 | Hero grows to about 636px; copy starts ≈128px into image; headline wraps to three lines and CTAs stack. | Preserve responsive height growth. Do not shrink text/form controls or hide a CTA to make the photograph fit. |

For portrait proofs, target principal faces entirely within approximately the top 18% of the rendered image (about 108px in a 600px hero), with a small gap before the first copy line. This is a **rendered-frame gate**, not a universal `object-position` value. Wider family/office compositions may need a separate portrait setup so all essential faces remain recognisable. Reject the crop if this band makes faces implausibly small, cuts hair/heads or obscures the story. Bring an explicit layout alternative back for approval if no natural composition can pass; do not silently move approved copy or accept text covering faces.

Use separately approved wide, medium and portrait exports with per-export focal points. Initial implementation candidates: wide at ≥1024px with explicit 1024 proof, medium at 768–1023px, portrait below 768px; adjust media selection only after actual crop proofs. No mechanical centre crop or universal focal percentage. The tall portrait source needs headroom and `object-position` proof because `cover` trims it differently at 320 and 390px. Check 1440, 1280, 1024, 768, 390 and 320px, plus a short landscape viewport and text zoom.

Audience panels need separate desktop, single-column tablet and portrait-mobile proofs: their aspect changes substantially when the grid becomes one column. Keep faces above the complete existing text group. Internal slots use their existing desktop ratios and 4:3 below 768px, with text outside. At desktop the inspected internal image width was about 531px; neutral reservations measured about 531×398, 531×299 and 531×354 for 4:3, 16:9 and 3:2. Mobile reservations retain 4:3 and stack below their related copy; they do not become full-bleed home heroes.

## 7. Overlay recommendations

Start from A's existing continuous horizontal charcoal scrim: approximately 75% opacity at the text edge, 40% through the middle, then clear over the principal subject. Extend the calm/shaded field for the measured 1024px copy envelope rather than applying a fixed 45% mask. On mobile use a gentle vertical transition supporting the broad lower copy field while preserving the upper faces. Audience panels keep a graded lower scrim; internal editorial photographs need none.

Tune each approved frame and crop individually. Prove at least 4.5:1 for normal text and 3:1 for qualifying large text, visible controls and focus indicators on their actual backgrounds. Check transitional blends as well as endpoints; one bright incoming frame can invalidate a shared overlay. Reject/recompose an asset that requires excessive blackening of faces. Do not use flat text boxes, decorative gradient panels or photo-embedded words as a shortcut.

## 8. Motion and image-delivery recommendations

**Specification only — no slideshow code, dependency or animation has been added.**

| Concern | Proposed behaviour |
| --- | --- |
| Transition / progression | Woman → family → business, wrapping. Proposed 7-second dwell and 650ms opacity crossfade, subject to approval. Two absolute image layers inside the existing hero; stable HTML copy and dimensions. |
| Previous / next | Visible left/right buttons, at least 44px hit areas, wrapping through usable slides. Manual choice resets elapsed time and pauses automatic progression until explicit Play. Do not queue repeated transitions or move focus. |
| Circular progress | Decorative 24–28px SVG ring inside a ≥44px Play/Pause control, concise “1 of 3” status. Ring and slide use the same elapsed-time clock; pause freezes it. No screen-reader announcement on every tick. |
| Interaction pause | Pause on hover, keyboard focus, pointer interaction, document hidden, offscreen hero and waiting for image decode. Temporary pause reasons cannot override user Pause. Resume without hidden-tab catch-up; manual interaction remains paused until Play. |
| Timing architecture | One requestAnimationFrame clock using timestamp deltas; no independent progress/slide timers. Cancel clocks, pending transitions and listeners on navigation/unmount. Keep this separate from the existing plan-carousel engine. |
| Headline entrance | Once on initial entry: 160–220ms soft fade and rise of no more than 8px. Never restart the heading or CTAs on each photo change. No scramble, typewriter, zoom or continuous camera movement. |
| Reduced motion | Static first frame by default, no autoplay, moving ring or headline entrance. Manual image changes instant. Respect preference changes while open; do not silently restart autoplay. |
| Accessibility | Labelled slideshow region and semantic buttons with visible focus; Play/Pause available from the first running frame. Standard Tab/Enter/Space. Arrow keys scoped to focused hero controls, not global navigation. Announce concise manual selection only; decorative backgrounds use empty alt where adjacent copy supplies the purpose. |
| Loading | Local responsive AVIF/WebP with compatible fallback and intrinsic dimensions. First frame only eager/high priority. Load/decode at most the next needed frame after first render; lazy-load supporting images. Use media-based art direction and correct `sizes`, not three eager large downloads. |
| Failure / constrained data | Retain current frame until next is decoded. Skip failed next asset; one usable slide becomes static without redundant controls. Zero usable images gets a neutral dark readable fallback with working copy/CTAs. Consider manual-only mode for data-saving; never delay essential content for animation. |
| Performance | Preserve current hero/slot dimensions to avoid shifts; at most two transition layers, no heavy animation library or video. Prove first-frame LCP, CLS and payload on a representative mobile connection. Candidate budgets: first mobile hero ≤250KB, desktop ≤450KB, supporting export ≤200KB, adjusted only after face-detail review. These are targets, not measured results. |

Future acceptance must exercise loading failure, zero/one/three images, repeated manual input, focus/hover/touch pause, hidden tab, offscreen state, route changes, reduced motion, contrast during blending, slow network and mobile layout. Current functional tests do not certify a slideshow that has not been written.

## 9. Implementation order and current validation

1. Review this brief: three hero stories, exact placements, supporting priorities, authentic About source and the text-arrangement rules. Resolve source method and allowed reuse.
2. Create or source only approved photographic candidates in the next authorised phase. Review real asset pixels, source rights, subject/context accuracy and skin/hand/device quality. Keep current images in place.
3. Present static crop proofs with existing copy/CTAs at the measured desktop, tablet and mobile sizes. Approve the three hero scenes before installing them. Start with the narrow mobile proof because its face/text constraint is the tightest.
4. Prepare responsive local exports, compression and frame-specific overlays. Use distinct audience compositions; review internal A-RS/A-BH/A-SD separately. Leave About pending without genuine material. Update only A's approved manifest records after decisions.
5. In a later implementation phase, install approved static A imagery first, retaining current geometry, routes and fallback. Review homepage through every internal page and footer. Do not rebuild or change B–E merely to publish A.
6. Only after static photographic approval, implement the separately approved A slideshow and reduced-motion/failure behaviour. Keep plans, support and customer journey engines unchanged.
7. Run existing tests and A build, then the motion/accessibility/performance checks above. Publish through the existing GitHub/Vercel workflow when implementation is authorised; review the deployed responsive result.

Current validation: A production build passed; **112 existing tests passed, 0 failed**, including assistant validation/privacy and all five templates' public journeys. All 29 A internal routes had no document horizontal overflow at the inspected desktop and mobile sizes. Homepage geometry was checked at 1440, 1024, 768, 390 and 320px. A's restored welcome heading/link were inspected at desktop/mobile, and Browse Help Topics reached `#/support` and closed the dialog. The mobile Start Conversation button and help link were both visible without scrolling at 390×844. These checks do not certify future photography or motion.

Evidence includes [desktop welcome](evidence/phase-2d-template-a/assistant-desktop.png), [mobile welcome](evidence/phase-2d-template-a/assistant-mobile.png), [mobile hero before](evidence/phase-2d-template-a/homepage-mobile-before.png), [SME desktop](evidence/phase-2d-template-a/business-solutions-sme-desktop-before.png) and [Residential mobile](evidence/phase-2d-template-a/residential-mobile-before.png). Additional desktop snapshots record all six editorial reservation pages. These are screenshots of the current site, not new photographic production assets.

## 10. Approval checklist

### Brief decisions — pending

- [ ] Confirm A-H 01 woman/laptop → A-H 02 connected family → A-H 03 business collaboration, with unchanged copy and CTA routes.
- [ ] Confirm the source method and authentic Nigerian scene direction; no generic Western-stock substitution.
- [ ] Confirm larger wide masters plus separate medium/portrait compositions, rather than the earlier generic panorama/4:5 crop assumptions.
- [ ] Confirm the measured text-safe envelopes and the requirement that faces stay clear at every crop, particularly 1024px and 320/390px.
- [ ] Confirm two distinct homepage audience frames, A-RS, A-BH and one reusable A-SD; no extra A-RH or image-only band by default.
- [ ] Supply/approve genuine company material for A-AB, or leave it pending.
- [ ] Confirm subtle graded overlays and the forward text-layout principles from the supplied reference.
- [ ] Confirm proposed 7-second / 650ms slideshow timing, visible arrows and Play/Pause ring, interaction pause, one-time heading entrance and static reduced-motion behaviour.

### Actual asset approval — subsequent phase, not yet possible

- [ ] Review each actual photograph and its provenance/rights; no unverified customer, employee, office, coverage or performance implication.
- [ ] Approve desktop, medium and mobile crop proofs in the existing page, with all essential faces, interaction and readable copy intact.
- [ ] Approve per-frame overlays, compressed delivery quality, file sizes and concise accurate alt treatment.
- [ ] Check headings, prose measure, consistent alignment and spacing; remove no approved information or action during photographic installation.
- [ ] Explicitly approve static installation before implementation, followed by separate slideshow validation.

**Stopped here at the image approval checkpoint.** No new photography, image replacement, homepage edit or slideshow implementation is included in this phase.
