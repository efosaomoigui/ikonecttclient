# Template E — real-time fibre network

18 October 2026. Implemented and built locally; not pushed or deployed.

Preview: http://127.0.0.1:3021/public_html/option-e/#/home

## Working result

The approved Lagos photograph, original fibre-flow graphic, burgundy atmosphere, expanding arc, foreground city composition and accessible HTML content remain. One transparent Three.js scene now shows three exposed strands feeding a main fibre route, one distribution junction and four building endpoints on desktop. Below 1024px, it uses sixteen buildings and three endpoints rather than thirty-six buildings and four endpoints. The compact cable source is placed inside the narrow foreground so it stays identifiable on phones.

The project contained an abstract fibre graphic rather than an exposed-cable photograph. The owner approved keeping that graphic and adding a lightweight procedural cable end. Its sheath and cut core use two small cylinder meshes; no new photograph or imported city model was installed.

This is an infrastructure visualisation: the routes align to the retained foreground building geometry, not to individual structures in the contextual Lagos photograph. It is not a map of Ikonectt coverage or installed infrastructure.

## Rendering and route behaviour

- `option-e/network-model.js` owns scene coordinates, rounded street paths, curved exposed strands and the causal schedule. Routes share exact junction coordinates. Samples are interpolated by distance along each path.
- Every strand arrives before the main route starts. The main route arrives before the staggered distribution branches start. Buildings receive a brief warm lighting response only after their signal arrives. Each cycle ends with about 2.8 seconds of quiet time.
- Routes follow street gaps, then an exterior facade riser to each endpoint. Tests sample every route against all building interiors. There are no airborne fibre links or random independent particles.
- `option-e/city-three.js` draws instanced buildings and bands, line-segment routes and fading trails, and concentrated sprite pulse heads/node halos. One generated 64px radial sprite is shared. There are no real-time shadows, bloom passes, external models or large particle systems.
- `option-e/city-experience.js` remains the single 30 FPS controller. It lazy-loads the renderer after 700ms, pauses offscreen or when hidden, releases resources on unmount and handles WebGL failure. Headline changes do not import or rebuild the scene. Its existing eight-second message dwell remains.
- The opening arc is immediately available. The scene fades/rises gently over 2.2 seconds; fibre activation precedes the first transmission at three active seconds. The camera makes a small restrained oscillation instead of rotating continuously.
- **Pause city & text** freezes rendering, the arc, city entrance and changing headline. Reduced motion avoids loading Three.js and retains the static visual and usable HTML. Resource-constrained/data-saving devices also keep the fallback. The controller reduces the render budget or falls back under sustained poor performance.

The vendored MIT Three.js 0.186.1 bundle adds only the required cable/sprite exports. Its current size is 544,739 bytes raw / 136,752 bytes gzip, loaded asynchronously. Provenance and licence remain in `option-e/vendor/`.

## Other retained E refinements

Plan cards are borderless with rounded corners. At the default middle selection, desktop shows three complete cards, including the enlarged selected centre card. Existing finite scrolling, arrows, touch handling, catalogue and prices remain; end selections retain the existing finite rail behaviour. Tablet and phone show one complete selected card.

Existing blended photography remains. A low-opacity fibre-wave accent appears selectively in About. An original tone-on-tone architectural silhouette emerges from the footer's bottom-left, behind its existing content.

A+C, D, selector and shared customer-journey/support/plan sources were not modified. Preservation hash tests pass. Build-only regenerated B/C output was restored.

## Validation executed

Both residential and business carousels were checked at requested widths 1440, 1280, 1024, 768, 390 and 320px. The browser reported 1281 and 321 CSS px for the 1280/320 requests. All checks found no horizontal overflow, complete content and zero card borders. Desktop showed three whole cards; the smaller layouts showed one. The selected desktop/tablet card retained its 1.06 scale and vertical clearance. Business next/previous navigation advanced to 1000 Mbps and back to 500 Mbps. Hero CTAs remained reachable. The source was visually checked on phone and narrow desktop after the compact placement correction.

Live browser checks confirmed a single scene canvas, a stable frame count while manually paused, a paused arc, offscreen pause, successful route remount and the forced compatibility fallback with usable CTAs and no canvas. Automated tests additionally exercise hidden-tab, reduced-motion, WebGL-failure, cleanup and low-performance paths, and verify that changing headlines does not reload the renderer. Reduced motion and hidden-tab behaviour were tested through those lifecycle fixtures rather than a physical mobile device or operating-system setting.

`npm test`: **141 passed, 0 failed** (43.88s). This includes desktop/compact path connectivity, causal branching, all destination activations, quiet rests, route/building collision checks and existing customer journeys.

`npm run build`: **passed**. E's source modules, SVG, vendor licence/provenance and assets are included in `public_html/option-e/`.

## Actual performance observations

Measurements below are from the local desktop browser. The compact result uses a phone-sized viewport, not physical phone hardware. `readyMs` includes the intentional 700ms delay and renderer setup; it does not measure first HTML paint. Render duration measures CPU submission, not full GPU frame time. Long tasks cover the whole page and browser capture period, not only the renderer.

| Observation | Desktop | Compact viewport |
|---|---:|---:|
| Renderer ready | 1,015ms | 867ms |
| Idle sampled frame rate | 30.1 FPS | 30.1 FPS |
| Mean render submission | 0.71ms | 0.79ms |
| Draw calls | 11 | 11 |
| Triangles | 1,856 | 896 |
| Geometry / texture counts | 9 / 1 | 9 / 1 |
| Sampled JS heap | 9.9MB | 11.5MB |
| Observed long tasks / longest | 2 / 191ms | 2 / 102ms |

Geometry and texture counts stayed stable over repeated cycles. No sustained freeze was observed while scrolling or changing plans. The recorded initial long tasks mean this is not a claim of zero main-thread blocking, guaranteed device performance or a complete memory-leak audit. Actual lower-powered phone hardware still needs device testing.

## Review evidence

- [Desktop hero](evidence/template-e-network/hero-desktop.png)
- [Mobile hero](evidence/template-e-network/hero-mobile.png)
- [Working animation capture, 19.63 seconds](evidence/template-e-network/network-demo.mp4)
- [Residential carousel, desktop](evidence/template-e-network/carousel-1440.png) and [mobile](evidence/template-e-network/carousel-390.png)
- [Business carousel, desktop](evidence/template-e-network/carousel-business-1440.png) and [mobile](evidence/template-e-network/carousel-business-390.png)
- [Footer silhouette](evidence/template-e-network/footer-desktop.png)
- Raw [performance](evidence/template-e-network/performance.json), [live transmission samples](evidence/template-e-network/live-signals.json), [residential responsive checks](evidence/template-e-network/responsive-checks.json), and [business responsive checks](evidence/template-e-network/business-responsive-checks.json).

The review MP4 encodes timestamped screenshots of the working browser at approximately three captured samples per second. It demonstrates the actual sequence but cannot represent the native renderer's measured 30 FPS smoothness. Capture overhead lowered render samples to roughly 23–27 FPS during recording. The MP4 is review evidence only; the website does not load a video, GIF or image slideshow.

Review the local preview before requesting a push. No further expansion of the city network is needed to assess this working vertical slice.
