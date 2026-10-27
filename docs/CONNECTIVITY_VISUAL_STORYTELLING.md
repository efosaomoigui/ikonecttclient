# Connectivity visual storytelling and flush photography

27 October 2026 · Templates A and E only.

## Review and decisions

The supplied library contains six concepts, all **832px wide**, with heights 306–310px. Its README identifies them as concept-sheet references. No image is generated, recreated or enlarged during export. Instead of stretching low-resolution concepts across desktop heroes, native-size artwork meets a section edge and blends into a full-width tonal background. The six original JPEGs and their SHA-256 hashes are retained.

A's approved people photographs, responsive crops, headline/CTA markup, 5.5-second slideshow dwell and 900ms carpet transition are retained. E's current city backdrop, Three.js fibre architecture, controls and photographic panels are retained. The selector, archived B/C/D, customer journeys, catalogue/prices, plan-name symbols, coverage logic, assistant and My Ikonectt panels are unchanged.

## Installed refinements

| Location | Treatment |
| --- | --- |
| A hero opening | Supplied night-city concept at native size, with three fine path-following pulses and two restrained activation nodes. City holds briefly, then dissolves over 800ms into the approved first human photograph; entire introduction lasts 2.6 seconds. Headline and CTAs are visible immediately. |
| A coverage launcher | Very light monochrome supplied map atmosphere; existing input, address transfer, button and address-verification notice remain primary. The image is decorative and does not depict actual service coverage. |
| A benefits | Supplied abstract network at 3.5% opacity behind the overall section; all six icons/cards/type/spacing retained. |
| A company | Supplied fibre-connected city on the right of an edge-to-edge charcoal composition, with a strong text-safe gradient and the existing official i motif. One static photographic moment; no second carousel. |
| E company | Subdued digital-wave atmosphere, adapted to burgundy, behind the existing company story and i motif. No new hero/network engine. |
| A/E internal Residential family section | Removes the former four-sided feathering and floating-image effect. Square edges; photograph reaches the section's right edge with one text-side blend on desktop. Text and the complete family photo stack flush below 1024px, preventing tablet face cropping. |
| A/E editorial image reservations | Square image corners; pricing cards and promotional-panel geometry remain unchanged. |

The supplied connected-homes concept is held in reserve because the existing people-led Residential/Business photographs are stronger. No supplied artwork replaces My Ikonectt's approved man/red chair in A or woman/laptop in E. No source photograph or official logo file is modified.

## Motion, accessibility and delivery

The opening uses the existing hero RAF clock, not a separate 3D or animation dependency. It pauses for explicit pause, hover/focus, hidden tabs, hidden home routes and offscreen visibility. Manual previous/next skips directly to the normal carpet transition. Reduced motion and data saving skip the introduction; enabling reduced motion during it removes the layer. After the opening, the first human photo receives its full normal dwell. The city layer is not replayed during later slides. Mobile omits SVG signal rendering.

Atmospheric images are decorative, pointer-inert, responsive and lazy-loaded below the hero. The intro and atmospheres reserve no new foreground layout, and no busy image is placed behind pricing. Native-size WebP exports are 320/480/640/832px; the city cover crop requests the 832px candidate even at narrow widths to avoid enlarging a small selected candidate. Only near-white concept-sheet separator rows are trimmed (city/fibre, three rows each).

## Validation

- Full automated suite: **169 passed, 0 failed**. Added timing, visibility pause, manual skip, reduced-motion/data-saving, source-preservation, asset-dimension and scoping coverage.
- After final crop/sizing adjustments, focused hero/visual/E regression suites: **30 passed, 0 failed**.
- Production build passed.
- Browser checks: A/E at 1440, 1024, 768, 390 and 320px (**10 responsive cases**), plus normal-motion A at desktop/mobile (**2 hero cases**). No page errors, missing resources or horizontal overflow. Verified exact flush edge, zero image rounding, one desktop text-side blend, complete stacked photo, unchanged card counts, working coverage-address launcher, About action and Residential Plans CTA. The final city dissolve and existing manual carpet reveal both complete correctly.
- Checked that E's existing presentation and A's approved human story remain distinct. No heavy video, new dependency, new Vercel project or deployment-settings change.

[Asset inventory and hashes](evidence/connectivity-storytelling/assets.json) · [Local browser results](evidence/connectivity-storytelling/local/checks.json).

Screenshots: [city opening](evidence/connectivity-storytelling/local/a-city-intro-1440.png), [approved people hero](evidence/connectivity-storytelling/local/a-people-hero-1440.png), [coverage](evidence/connectivity-storytelling/local/a-coverage-1440.png), [company](evidence/connectivity-storytelling/local/a-about-1440.png), [desktop flush family](evidence/connectivity-storytelling/local/a-flush-family-1440.png), [tablet family](evidence/connectivity-storytelling/local/a-flush-family-768.png), [mobile family](evidence/connectivity-storytelling/local/a-flush-family-390.png), [E family](evidence/connectivity-storytelling/local/e-flush-family-1024.png).

Publication uses the existing GitHub main/Vercel workflow. Verify the actual deployed A and E before reporting success; production screenshots and checks are saved alongside the local evidence after deployment.
