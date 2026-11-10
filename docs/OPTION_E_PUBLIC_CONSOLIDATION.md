# Ikonectt — Option E public website consolidation

**10 November 2026 · prepared locally; not deployed.** The client-approved Option E now opens directly from the public root. Its established markup, corporate light layout, imagery, controls, and animations are retained. This branch is based on approved website revision `b10c760`. The existing `presentation/vercel-demo` reference and historical shortlist remain recoverable.

## What changes for visitors

- `/` redirects to `/option-e/`, the canonical public document. Using the established base path keeps relative assets and bookmarkable hash routes intact.
- Retired A–D URL paths redirect to Option E rather than showing a design selector. The old standalone Residential, Business and Coverage entry points redirect to the corresponding Option E pages. Old selector anchors open the home view.
- `npm run build` packages Option E, shared modules and public assets into `dist-public`. It does not compile A–C, serve Option D, inject presentation links, or include the Admin, customer portal or API. Local public preview: run `npm start` after building.
- `npm run build:presentation` still uses the isolated showcase build and two standalone demos. Its historical selector source and test fixtures are retained for that build, outside the production output. No preview branch, Vercel project or hosted environment was modified.
- Public **My Ikonectt** links resolve to an honest account-unavailable view with a public support link. Legacy sign-in, recovery and account-preview hashes show that same safe state, with no credential inputs or fake login. Live customer and staff application URLs remain independent release decisions.

## Page-by-page audit

This pass reviewed Option E markup, route definitions, declared image choices and controls, and rendered all listed pages in a DOM test. CSS/device behavior and photography were reviewed at source level; this is not a claim of complete visual accessibility or browser/device certification.

| Route | Findings and disposition |
| --- | --- |
| Home | Preserve connected-city, family and business scenes, existing card spacing, plan and support CTAs. Add a quiet architectural backdrop to coverage. The account CTA now reaches the safe account status. |
| Residential overview | Household imagery and work/streaming/device examples support the page. Keep approved campaign image, plans and installation links. |
| Residential plans | Preserve approved price cards and connected-home photo. Recheck narrow-width pricing and descriptive text at zoom in browser QA. |
| Residential plan detail (both legacy routes and plan parameters) | Same established home-plan photo and published tariff detail. Preserve speed and price values; plan selection remains query-driven. |
| Residential compare | Comparison purpose clear. Preserve comparison columns and accessible names; confirm keyboard scrolling and 320 px table overflow in real browser QA. |
| Residential installation | Infrastructure photo is relevant. Keep fields and validation; preview does not deliver an installation request. |
| Business overview | Tower and conference-room imagery align with office connectivity. Keep approved photo crop and business CTAs. |
| Business solutions | Architecture hero suits business positioning. Retain links to distinct solution detail pages. |
| Business connectivity | Infrastructure imagery has useful service context. Solution definitions remain client-dependent. |
| SME connectivity | Conference-room and workplace imagery relate to small teams; avoid treating illustrative scenes as customer references. |
| Enterprise connectivity | Office architecture plus city scene supports scale. Verified service capabilities and any enterprise claims still need client input. |
| Business plans | Preserve published offers, comparison pathways and workplace image; do not invent packages. |
| Business quote | Workplace image remains relevant; preview validation does not create a lead or send mail. |
| Coverage checker | City image gives network context. Explicit scenario selector remains a demonstration; entered addresses do not determine service availability. |
| Coverage results | Preserve clearly labelled sample outcomes, address verification and navigation. Live coverage API remains pending. |
| Address verification | Same area context and form hierarchy. Preview does not submit a real review request. |
| Support centre | Adviser illustration supports intent; retain search, help topics and existing assistance routes. |
| FAQs | Preserve category/search controls and useful concise answers. Support adviser may repeat across the support family; no extra image needed here. |
| Troubleshooting | Infrastructure backdrop is relevant, but a real modem/indicator photo could provide better task context. Preserve guided steps. |
| Fault report | Existing network infrastructure is generic but relevant; keep form validation and clear non-delivery semantics. |
| Service request | Adviser photo and request categories are appropriate. Preview action does not create a ticket. |
| Contact support | Adviser image and available support information remain; confirmed real channels, hours and submission are pending. |
| About | Architecture/infrastructure assets support the company positioning. Avoid implying that illustrative facilities belong to Ikonectt. |
| Contact | Adviser photo and Residential/Business/Support pathways fit. Verified contact details and actual delivery are still blockers. |
| Privacy | Generic legal context is secondary to readability. Client-approved policy and effective date required; placeholder is not a policy. |
| Terms | Document photo supports the subject; legal copy, effective date and final approval required. |
| My Ikonectt sign-in | Production shows an unavailable status with public help; no password or account fields. |
| My Ikonectt recovery | Same safe status; no reset or message is attempted. |
| My Ikonectt account preview | No simulated or private account data on the public website. Same unavailable status. |

### Image recommendation for founder review

On **Support → Troubleshooting**, the current infrastructure hero describes a network broadly, but does not reinforce what customers can check at home. If user testing confirms the need, consider a **16:9** photograph of a genuine home router in a Nigerian living space, framed at right with indicator lights and power connections visible, with quiet space at left for the heading. First review existing home-connectivity images for a matching device and crop; use the current approved image until a replacement is approved. No imagery was generated in this pass.

## Coverage and animation

The coverage background reuses the existing local architecture SVG, masked away from the address form and toned down on small screens. The existing pin, branded centre mark, and address launcher remain. The background is decorative CSS, has no DOM accessibility burden, and adds no animation, script or photograph.

| Motion | Decision | Basis |
| --- | --- | --- |
| Connected-city opening and network renderer | Keep | Existing fallback, frame-budget degradation, viewport/visibility pause, user pause and reduced-motion checks. |
| Three-scene hero and headline transitions | Keep; monitor mobile | Existing manual controls and shared pause; scenes are decoded before display. Check tile-transition paint cost on lower-power phones before tuning. |
| Photo network in city scene | Keep | Tied to connectivity story; existing device-budget and reduced-motion decisions retained. |
| Plan carousels | Keep | Purposeful interaction, established controls and existing route tests. |
| Hover and menu transitions | Keep | Existing feedback; confirm focus visibility independently of hover during final browser QA. |
| Lax/Lenis scroll polish | Refine if profiling warrants | Existing reduced-motion fallback and scroll exclusions retained; assess overhead on mobile before changing the approved motion. |
| Entry loader | Refine if real loading measurements warrant | Existing finite wait retained. Measure first-view delay and avoid masking page content unnecessarily. |
| Coverage skyline | Keep static | No animation or additional runtime needed. |

No animated behavior was removed. Lower-powered device testing, 200% zoom, narrow-page wrapping, contrast checks and image focal-point verification remain real-browser acceptance items.

## Verification

- `npm run build` passed. `node --test tests/*.test.mjs`: **189 passed, 0 failed** against that output.
- Static HTTP checks verified the root/compatibility redirects, all local entry asset references, no app/API routes, and a read-only static server.
- DOM checks rendered all 29 declared public routes, preserved the historical preview packaging, and confirmed that account routes expose no credential forms.
- Local Edge spot-check at 1732 px: root landed on Option E, the coverage skyline CSS resolved to its local SVG, the page had no horizontal overflow, and clicking My Ikonectt reached the unavailable/help state with zero password fields. This was a desktop spot-check rather than full mobile or accessibility acceptance.

## Launch limits

The layout and public routing are ready for integration. Live lead submission, coverage, support channels, customer access and verified legal text are not supplied by this static artifact. These flows must not be advertised as operational until connected and verified. Production hosting configuration is prepared using [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json); hosted smoke tests and launch authorization remain outstanding.
