# Template E visual refinement

The initial refinement was pushed in commit `052fd0e` on 17 October 2026. The hero performance and visibility tuning of 18 October is **local only**, awaiting review before another push.

Preview: http://127.0.0.1:3021/public_html/option-e/

## Scope and preservation

Option E retains the approved Outfit typography, burgundy palette, section order, wording, plan carousel, navigation, customer journeys, forms, logo and support assistant. New presentation modules live inside `option-e/`. Shared application and visual code are unchanged. The preservation test compares A, D, the selector and shared sources against the captured pre-change hashes in `evidence/template-e-refinement/preservation.json`.

The existing shared visual adapter still runs first. E's own module decorates its internal hero and editorial image hosts after route changes; it does not replace the router or conversation engine. No images have been added inside pricing cards, forms, FAQs or authentication fields.

## Internal heroes and image fields

All 29 internal routes receive one contextual visual. Residential, Installation, Business overview and solution pages, and About have photographic heroes. Coverage, support, legal, account and other functional pages use restrained original illustrations in their headers. These illustrations are decorative, not geographic coverage representations.

Desktop photos extend to the section's right boundary, with a burgundy-to-transparent horizontal blend and bottom scrim. Editorial slots now occupy the full section height; the former four-sided feathered image-card treatment is removed. Text stays aligned with the existing content column. Mobile photographic heroes and editorial fields stack below their text with top/bottom blends. Functional headers remain compact.

## Replaceable image map

E-only assignments are in `option-e/visual-map.js`. Existing shared assets are referenced without changing their source files or mappings for other templates.

| Location | Current asset and source | Purpose / status | Replacement priority |
|---|---|---|---|
| Home Residential panel; Residential hero | `assets/visual-library/residential/connected-home-*.webp` | Retained approved illustrative interior with TV, phone and router | Low; client campaign optional |
| Home Business panel; Business overview and solution heroes | `option-e/images/civic-tower-lagos-*.webp` | Real Lagos commercial architecture; provisional campaign context | Medium |
| Home My Ikonectt card | `option-e/images/my-ikonectt-woman-*.webp` | Exact copies of approved A-H01 desktop exports; smiling Nigerian woman integrated on right | Medium; official campaign portrait later |
| Installation and About heroes; Connectivity editorial section | `assets/visual-library/infrastructure/network-patch-panel-*.webp` | Existing illustrative infrastructure, not claimed to be Ikonectt equipment | Medium |
| Business and SME editorial sections | `assets/visual-library/business/contemporary-workplace-*.webp` | Existing illustrative meeting room with tablet/display | Medium |
| Enterprise editorial section; subdued home fallback context | `assets/visual-library/city/lagos-skyline-*.webp` | Licensed general Lagos context; no coverage/ownership claim | Medium |
| Residential editorial section and plan headers | `abstract/fibre-flow.svg` in the visual library | Original restrained fibre illustration; avoids repeating the adjacent home photograph | Low |
| Coverage headers | `abstract/network-grid.svg` | Original non-geographic illustration | Low |
| Support headers | `abstract/signal-arcs.svg` | Original subtle header treatment; functional content remains clear | Low |
| Other Business headers; About editorial section | `abstract/city-grid.svg` | Original architectural illustration | Low |
| Account, contact and legal headers | `abstract/connected-spaces.svg` | Original low-opacity illustration | Low |

The real building photograph is [Civic center Tower, Lagos](https://commons.wikimedia.org/wiki/File:Civic_center_Tower-_Lagos.jpg), by Ikeme Uchechukwu Sixtus, under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). It is general architectural context, not an Ikonectt office or infrastructure claim. Its native dimensions are 3024 × 4032. WebP exports are 480, 800, 1200 and 1600 pixels wide (24.6, 68.0, 145.2 and 246.5 kB). Original source, hash and export metadata are retained in `assets/review/template-e-refinement/`.

The portrait exports are 62.5 and 131.3 kB and are owned by E's delivery folder, so E does not depend on an A build URL. Their pixels and approval provenance are unchanged. No new generated people or campaign photographs were installed. Existing illustrative assets remain provisional pending client photography.

## Home card and panel interactions

The My Ikonectt portrait blends from the card's existing background toward its right edge. The original heading, description, destination and CTA remain. On mobile the photograph sits below the CTA, preserving a visible face and usable spacing.

Fine-pointer hover and keyboard focus gently scale Residential/Business photography to 1.035, adjust the scrim and emphasize the existing CTA. Motion returns smoothly. Touch devices need no hover. Reduced-motion CSS removes these transitions and transforms.

## Arc and connected city

The original `.horizon` element remains in place. It has an immediate CSS opening expansion and slow ambient illumination, independent of WebGL. It pauses with the user's animation control and respects reduced motion. The 18 October tuning replaces continuously animated, large blurred shadows with a static shadow and opacity animation, avoiding repeated shadow paints.

The procedural Three.js scene is a separate dynamic import, requested after 700 ms and only while the home hero is visible. The first render never blocks the navigation, original headline or CTA. A local static SVG city and subdued existing city photograph are available immediately. Canvas opacity fades in over 800 ms only after a successful render.

- 36 desktop / 16 mobile buildings, with instanced bodies and window bands (previously 64 / 25).
- Six draw calls; 1730 desktop / 770 mobile triangles (previously 3074 / 1202).
- Restrained camera movement, roads, fibre lines and travelling light points.
- Minimal lighting, no models, textures, shadows or postprocessing; pulse positions reuse allocated buffers.
- 30 FPS rendering cap; DPR 1 on both sizes, with buffers bounded to 860 × 400 desktop / 600 × 400 mobile, maintaining the field's aspect ratio. The opaque WebGL buffer matches the burgundy background; CSS masks retain seamless edges.
- Rendering stops for hidden tabs, an offscreen hero, internal routes, manual pause and reduced motion. Data-saving or reported low-memory/low-core devices skip the enhancement.
- WebGL/import/context failures preserve the HTML, arc and static fallback. Sustained CPU cost above 12 ms first reduces resolution and then disables the enhancement if needed. Two consecutive three-second samples below 18 FPS reduce resolution; repeated low samples then select the fallback.
- Accessible HTML headlines have eight seconds of active animation time per message. The scheduler now uses actual elapsed render time instead of accumulating its frame remainder. A short outgoing fade precedes the incoming fade/lift so two headlines do not overlap. The reserved headline area prevents movement of the CTA. Assistive technology receives the stable original heading rather than repeated announcements.

For visibility, the upper city scrim is reduced from 90% to 45%, the lower fade covers less of the scene, and the city canvas is fully opaque. Buildings, window bands and network lines are brighter, with reduced fog. This adjustment affects the home hero only. E's changed styles and module imports use versioned URLs so a normal reload replaces older cached animation assets.

Three.js 0.186.1 is vendored only for E, with its MIT licence, official npm source URL and verified SHA-512 integrity in `option-e/vendor/`. The selected-export bundle is 542,917 bytes raw / 136,088 bytes gzip. No runtime CDN is required and no shared npm dependencies were changed. Vanilla Three.js fits E's existing standalone HTML architecture; introducing React Three Fiber would add a second application runtime.

## Performance findings and limitations

The initial 17 October samples are retained in `evidence/template-e-refinement/city-performance.json`; they include a desktop low-frame-rate fallback and a mobile sample around 26 FPS.

On 18 October the desktop baseline in this browser sampled 30.1 FPS, became ready in 1.80 seconds and used a 989 × 387 buffer with 3074 triangles. The tuned desktop sample held 29.8 FPS, became ready in 845 ms, averaged 0.56 ms CPU per render, and used an 860 × 337 buffer with 1730 triangles. The tuned mobile sample at a 390-pixel CSS viewport held 30.1 FPS, became ready in 881 ms and averaged 0.70 ms CPU per render, with a 453 × 400 buffer and 770 triangles. Both stayed in the live scene rather than selecting fallback during these samples.

The before/after FPS samples were already near the cap on this run; they do not demonstrate an FPS increase on every device. The concrete reductions are scene complexity, rendering-buffer area, animated shadow paints and time until scene readiness. See `evidence/template-e-hero-tuning/checks.json`, `before-desktop.png`, `after-desktop.png` and `after-mobile.png`.

These are observations from this desktop browser's responsive emulation, not real-device guarantees. GPU time, network-throttled Core Web Vitals and physical phone battery use were not measured. The implementation therefore keeps device-adaptive fallback rather than assuming every visitor can sustain 30 FPS.

## Captions and attribution

E has no image-source badges or technical captions over its image sections. Required attribution remains on the existing footer-linked `option-e/photo-credits.html`, now including the new tower photograph and adaptation details. Debug/performance values exist only as non-visible DOM data attributes. Legitimate customer-facing notices, preview privacy protections and existing plan confirmation wording are preserved.

## Validation

- Production build: passed (`npm run build`).
- Automated suite: `npm test` passed **136/136**, zero failures (47.10 seconds). Tests cover preservation, all internal hero routes, existing journeys, assistant scenarios, 30 FPS scheduling, headline dwell time, pause lifecycle, WebGL failure, reduced motion, data-saving devices and sustained low-frame-rate fallback. A final focused run of the hero and visual integration suites passed **14/14** after the last visual/cache changes.
- Browser geometry/image checks: 29 routes × six requested widths = 174 internal-page checks, plus six home-card checks. No horizontal overflow, broken completed image, out-of-bounds heading or inline source credit was found. Requested widths: 1440, 1280, 1024, 768, 390 and 320; browser emulation can round the reported CSS width by one pixel.
- Visual inspection: desktop and mobile Business, Residential, home hero/fallback and My Ikonectt; tablet Residential. The CTA remains within the portrait card at every requested width.
- Live browser: manual pause held rendering metrics unchanged, offscreen pause and explicit static fallback confirmed. Unit tests additionally exercise hidden-tab, reduced-motion, WebGL rejection, route and manual pause states with a controlled scheduler. These simulated checks are not presented as physical-device tests.
- 18 October hero checks: heading and CTAs fit without horizontal overflow at the six requested widths (reported CSS widths within one pixel because of browser zoom). The coverage CTA opened the correct route and stopped city rendering; the home logo returned to the hero. Manual pause held the rendering metrics unchanged. Photography, internal-page layouts, plans and support functionality were not changed by this follow-up.
- Explicit review fallback: append `?e-city=off` before the route hash.

Evidence: `evidence/template-e-refinement/responsive-checks.json`, `home-responsive-checks.json`, `city-performance.json`, and PNG screenshots in that directory. Screenshots include `business-desktop.png`, `business-mobile.png`, `portal-desktop.png`, `portal-mobile.png`, `city-desktop.png`, `city-mobile.png` and `fallback-mobile.png`.

## Approval checkpoint

Review Option E locally before publication. No work on D or A+C follows this checkpoint. Remaining campaign replacements are optional, clearly mapped above; the genuine tower photograph and existing approved illustrative assets provide the current complete presentation.
