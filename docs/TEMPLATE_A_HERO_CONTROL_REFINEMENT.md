# Template A hero controls and transitions

26 October 2026. Client direction: keep the previous/next and pause/play controls; remove only the visible slide numbers. The preceding request also asks for slightly faster slide progression and a smoother transition.

- Removed the visible `1 / 3` indicator and its unused styling/update code.
- Retained all three 44px controls, progress ring, keyboard arrows, focus styling, manual announcements and pause behavior.
- Dwell remains 5.5 seconds. Following the client's next request to try option 1, the transition is now a 900ms carpet-style reveal: an eased clipping edge unrolls the incoming photograph with a narrow shaded fold. Previous navigation reverses the roll direction.
- The images are never stretched, translated or rotated. The outgoing photograph remains opaque under the incoming photograph, preventing a dark flash. Only two decoded image layers and one temporary decorative fold are used during a transition; the fold and clipping are removed on completion.
- Reduced motion still disables autoplay and makes manual changes immediate. Hover/focus, explicit pause, touch interaction, background-tab and offscreen protections remain.
- Photography, crops, copy, CTAs, Template E and all other homepage sections are unchanged.

This later authorised revision has its own source checkpoint in `docs/evidence/template-a-hero-refinement/checkpoint.json`. Historical phase records remain unchanged; preservation tests use the new checkpoint only for the three edited hero files. Original photograph and slide-data protections remain intact.

Validation: all 160 tests passed and the production build completed. The carpet revision covers directional clipping, undistorted images and clearing an active fold when reduced motion is enabled. Browser checks passed at 1440px and 390px, plus 320px with reduced motion: three controls remain, no numeric counter, manual navigation works, and no console errors or horizontal overflow were found. Mid-transition screenshots confirm the image-only reveal leaves copy, CTAs and crops in place.

Work remains local; not pushed or deployed.
