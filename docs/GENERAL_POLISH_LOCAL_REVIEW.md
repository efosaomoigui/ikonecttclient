# A and E — local review, 28 October 2026

Preview A: http://127.0.0.1:3001/?review=polish-final#/home

Preview E: http://127.0.0.1:3021/public_html/option-e/?review=polish-final#/home

No production build, push or deployment was performed for this refinement.

## Visual changes

- Approved white plan cards with red price ribbons now continue through Residential/Business catalogues, comparison and detail pages. Existing catalogue prices, specifications and actions are retained.
- A retains its original hero stories; the supplied tablet-family photo is now the second slide. The first woman's photo has red cushions in desktop, tablet and mobile compositions. Original masters remain intact.
- A's paired homepage audience panels now show family and architecture. Benefits use a charcoal section, larger icons and a supplied connectivity atmosphere.
- Residential heroes are compact with balanced headings, followed by a short text introduction rather than a competing large image.
- E opens on the existing city and network signals for 20 seconds, followed by supplied family and conference-room photos for seven seconds each. Staggered carpet blocks reveal the next scene. Controls remain accessible; manual changes pause the hero. Reduced-motion mode removes automatic visual movement.
- The white signal source emerges from the bottom edge into the city; the 3D building model remains removed.
- E's company story uses the supplied photographed red acrylic emblem. Its My Ikonectt photo uses the edited red-cushion portrait.
- Inner heroes use supplied people, architecture and existing parent-library connectivity imagery with flush edges and text-safe fades.
- Poppins headings and Nunito Sans body text follow the font roles observed in the supplied ipNX reference, with original Ikonectt layouts retained. Fonts and licenses are self-hosted in `assets/fonts/polish`.
- Both templates have a brief official-i loader and gentler scrolling using pinned local copies of Lax 2.0.3 and Lenis 1.3.27. Touch scrolling, reduced-motion preferences, horizontal plan rails and assistant modal locks are respected.

## Red-cushion edit

The built-in image_gen tool edited existing approved photographs. No new people scene was created. Final masters, exact prompts, output dimensions and SHA-256 records are in:

`assets/review/red-cushions/manifest.json`

- `assets/review/red-cushions/a-h01-residential-woman-desktop-red-cushions-v1.png`
- `assets/review/red-cushions/a-h01-residential-woman-medium-red-cushions-v1.png`
- `assets/review/red-cushions/a-h01-residential-woman-mobile-red-cushions-v1.png`

Prompt: recolor only the existing cushions rich red, preserving the woman, laptop, pose, furniture, room, lighting and composition. The tablet composition's existing sofa back cushions receive the accent; other compositions use the small throw pillows. Full prompt variants are recorded in the manifest. Responsive WebP copies reside under A's public image directory and E's image directory.

## Verification

Browser evidence and route/responsive results are saved in `docs/evidence/general-polish/`. Checks cover all 29 routes in A/E at desktop and mobile widths, plus key pages at 1440, 1280, 1024, 768, 390 and 320 pixels. Motion checks cover the loader, city dwell, tile reveal, manual pause, eased wheel movement and assistant scroll locking. Automated customer-journey and preservation tests and A's TypeScript check are run separately without a production build.

Local A entry links redirect to its live Vite source so the selector and direct previews show the same changes. E is served directly from the synchronized static preview. These local server processes must remain running while reviewing.

Reference: https://ipnxnigeria.ng/home-broadband/
Library documentation: https://github.com/alexfoxy/lax.js and https://github.com/darkroomengineering/lenis

Final result: 181/181 automated tests passed; A TypeScript check passed. All 29 routes in both templates passed desktop/mobile checks with no broken visible images, missing headings or page overflow. Key-page checks at all six widths passed.
