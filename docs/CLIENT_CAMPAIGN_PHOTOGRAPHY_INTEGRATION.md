# Client campaign photography integration

26 October 2026. Active scope: **Templates A and E only**. Work is local for review; the selection interface and archived D remain unchanged.

## Current direction

The client wants photographs with **seating and room context**, with only the old flyer presentation removed. The isolated subjects were rejected and are superseded by room compositions.

| Photograph | Template A | Template E |
|---|---|---|
| Original campaign family, with sofa and warm room context | Existing Residential editorial image field | Same existing Residential field, blended into burgundy |
| Original campaign man, phone and distinctive red seating, with room context | Existing My Ikonectt homepage panel | Not installed: E retains the approved woman with her laptop |

No new sections are introduced. Both children and the pointing hand stay visible. The man's original visible pose, phone, sneaker and red seating are retained. A's slideshow, E's fibre-to-city animation, Residential heroes, typography, section order, navigation, CTAs, forms, support, catalogue and customer journeys are preserved.

## Preparation and limits

Source flyers are 619 × 740 (family) and 622 × 771 (individual). Matching clean campaign originals were not found in project assets. Flyer advertising obscures lower bodies and seating; complete untouched originals cannot be recovered from these files.

The visible people and red chair are retained from the original source pixels. Hand-traced mattes are an intermediate compositing step only, not the final presentation. No faces, clothing, hands, hidden body parts or legs are generated or repainted.

**The room and sofa background are reconstructed**, using room-only plates made with the built-in imagegen tool. These are campaign-derived composites, not untouched photographs of the original locations. Generated backgrounds contain no people. The family is shown with a beige sofa, cushions, window light and a lamp; the man's room sits behind the original red chair. Framing stops at the existing visible body limits.

Native opaque PNG masters are **640 × 320** and **480 × 330**. Every fully opaque subject pixel is verified unchanged in native lossless WebP exports. Partial alpha is used only during compositing: the installed photographs have **no transparent background**. Source softness remains; clean high-resolution originals would improve sharpness.

Room context remains visible. Small outer fades blend photo perimeters into A's light surfaces or E's burgundy surface without removing the setting. Mobile images follow the photograph aspect ratio and keep CTAs clear. E's original woman/laptop portrait and panel geometry remain intact.

Template A's My Ikonectt section now follows the client's wide-panel reference: a clean light-grey surface, left-aligned copy/CTA, and a much larger vivid photograph filling the right half with a continuous horizontal fade into grey. The man is no longer a small floating image. On mobile, the photograph spans the panel below the copy, with a vertical fade and clear button spacing. This targeted A-only layout update leaves E unchanged.

## Files and reproducibility

- Installed: `assets/visual-library/campaign/client-family-scene-v2-{320,480,640}.webp` and `client-individual-scene-v2-{320,480}.webp`.
- Original flyers, mattes, generated room plates and opaque PNG masters: `assets/review/client-campaign/`, excluded from production packaging.
- [Export/pixel-verification record](../assets/review/client-campaign/scene-exports.json) and [room prompts](../assets/review/client-campaign/room-prompts.md).
- `scripts/prepare-client-campaign.cjs` preserves the source subjects; `scripts/prepare-client-campaign-scenes.cjs` composites them into room plates and verifies final opaque exports.
- Logical references: `shared/campaign-assets.js`. The v1 cutouts are superseded authoring intermediates only.

Flyer headlines, logos, icons, prices, plan cards and contact footer do not appear in the installed photography.

## Catalogue confirmation

The flyers advertise i-Basic 50 Mbps at ₦32,500, i-Silver 100 Mbps at ₦65,000 and i-Gold 300 Mbps at ₦150,500. These differ from the provisional website catalogue. The catalogue is unchanged. Authoritative plan names, speeds, device guidance, prices, billing period and tax treatment require separate client confirmation.

## Review and validation

- [Local before/after gallery](http://127.0.0.1:3021/assets/review/client-campaign/index.html)
- [A Residential](http://127.0.0.1:3021/public_html/option-a/#/residential) · [A homepage](http://127.0.0.1:3021/public_html/option-a/#/home)
- [E Residential](http://127.0.0.1:3021/public_html/option-e/#/residential) · [E homepage](http://127.0.0.1:3021/public_html/option-e/#/home)

Browser review covers 1440, 1280, 1024, 768, 390 and 320px for both placements in A/E. It checks loading, errors, overflow, photo containment, text/CTA clearance and the A-man/E-woman selection. Before screenshots render the recorded Git baseline; after screenshots render the current production build. Evidence is in `docs/evidence/client-campaign/`.

The updated regression suite passed **148 tests**, with zero failures; the production build passed. Existing hero, animation, support, route, form and catalogue protections passed. The browser results and screenshots are refreshed for the room compositions. This update is local and has not been pushed or deployed.

Final browser pass: all 24 template/route/viewport combinations passed with zero page errors, missing images, horizontal overflows, text/photo collisions or photos outside their section bounds. Desktop and mobile screenshots were inspected after the final spacing adjustment.
