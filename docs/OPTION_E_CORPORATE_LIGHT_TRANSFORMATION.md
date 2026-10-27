# Option E — corporate light transformation

## Scope and audit

Client direction: retain E's structure and city concept, replace its dark burgundy atmosphere with a bright corporate treatment. Option A's latest approved state is commit `e187fa5`; every A source and the design selector is protected by the new preservation record. No A source, shared customer logic or existing photographic asset was edited during this E task.

| Area | Previous treatment | Final treatment |
| --- | --- | --- |
| Base theme | Burgundy/black E tokens, inverse text and controls | White, `#F4F5F6` surfaces, `#E8EAED` separators, charcoal `#24272C` |
| Header and menus | Transparent dark header, white wordmark | Light corporate header and original red wordmark; existing menus and responsive behaviour |
| City hero | Warm burgundy fog, dark buildings, cable source | Pale blue-hour atmosphere, stone/slate buildings, exact official “i” source and red routed signals |
| Coverage | Dark background and translucent input | Soft gray section, white input and red CTA; same validation and address hand-off |
| Audience split | Empty living room and commercial exterior | Approved family/tablet photograph and two professionals collaborating in an office |
| Plans | Dark cards and pale plan marks | White cards, readable charcoal prices, red marks/buttons, restrained active border |
| Benefits | Burgundy cards and pink icons | Six white cards on soft gray; existing line icons in red |
| About | Dark wave composition | White editorial space with a quiet native-size digital-wave field and faint official mark |
| My Ikonectt | Burgundy panel around the woman/laptop | Light neutral surroundings and a single photo-side fade; the approved woman is retained |
| Footer | Near-black, inverse logo | Soft gray surface, original red logo, charcoal hierarchy and complete existing links |
| Internal pages, support | Dark fields, dark photo fades and dialog | Inherited light tokens, white photo fades and a light support skin; unchanged journeys and engine |
| Photo credits | Dark standalone page | Matching light page with every attribution and disclosure retained |

`option-e/corporate-light.css` is the E-only theme boundary. It bridges existing shared component tokens and supplies explicit treatments for components that previously hardcoded dark colours. E's existing `refinement.css` photo fades now use theme variables rather than burgundy literals. Shared CSS, layout geometry and customer logic remain unchanged. The verified existing brand red `#ED101A` remains the accent; the slightly deeper `#D90E18` button colour gives white labels sufficient contrast.

## Hero connectivity story

The existing lightweight Three.js renderer and its visibility-aware 30 FPS controller are retained. No new rendering library, video, image-generation workflow or additional animation loop was introduced.

1. **Source:** the original 59 × 221 dot-and-lightning mask is rendered as a small camera-facing architectural mark at the network's existing origin. Its proportions and silhouette are unchanged. It is visible from the first rendered frame and gently brightens during activation.
2. **Distribution:** existing causal strand, trunk and branching routes carry restrained red packet trains toward the buildings, including the rear destinations. Their timing, routing, continuity and mobile simplification remain intact.
3. **Neighbourhoods:** arriving signals gently tint the existing destination buildings. Buildings now use a mix of neutral stone, blue-gray glass and slate, with brighter atmospheric lighting.
4. **People:** the existing scroll sequence leads into the family and office panels. No unrelated slideshow or new automatic scene change was added. The original changing headlines, CTA placement and pause/resume behaviour are retained.

The hero is complete before WebGL loads: HTML text and CTAs appear immediately over the approved city photograph. Reduced motion, data saving, hardware budgets or render failure keep the static city and original mark; no Three.js download is required for reduced motion/data saving. The static network follows explicit ground and building routes. Leaving the homepage, scrolling offscreen, hiding the tab or pressing pause stops the existing animation clock. The pause control still clearly applies to the city and text.

## Photography and library decisions

- Residential uses the approved family tablet photograph, with its existing 4:3 source to keep all three faces comfortably framed in E's panel.
- Business uses the approved photograph of two Nigerian professionals with a shared device and presentation screen. They are illustrative people; they are not represented as verified Ikonectt employees.
- Both are referenced from the existing packaged A image library. The source files are unchanged and no duplicate or regenerated photographs were installed.
- Small red rules beside the panel headings provide the requested red accents without skin recolouring, artificial light or damage to approved photographs.
- The My Ikonectt woman/laptop and internal-page campaign family are preserved.
- All six supplied connectivity categories were reviewed. The current high-resolution city is retained in the hero; the native 832px digital-wave asset remains a restrained About accent. The other low-resolution concept crops are not stretched into E's full-screen imagery or scattered throughout its sections.
- Existing architectural and network photographs remain in their approved internal-page contexts. Legal pages retain their document-oriented imagery and actual terms/privacy status.

## Validation

Local browser checks: 1440, 1280, 1024, 768, 390 and 320px. Each checked light tokens and colour scheme, overflow, logo assets, primary controls, six benefit cards, catalogue cards, menu operation, coverage validation, address navigation, residential/business/plans/support/account/terms routes and the support introduction/conversation. Reduced motion is static and never requests the Three.js bundle. Sampled solid-surface text/CTA contrast is at least 4.5:1; hero text is also reviewed against its pale photographic scrim.

Real WebGL is checked separately at 1440 and 390px: original building counts, bounded rendering cost/draw calls, two textures (shared pulse texture plus the official mark), active network transmission, pause/resume and stopping on another route. Option A receives an independent functional browser check and source-preservation verification.

Evidence and full-page screenshots: `docs/evidence/option-e-corporate-light/local/` and, after publishing, `live/`. `scripts/option-e-corporate-light-preview.cjs` reproduces those checks. The repository has no separate lint command; syntax checks and the production build cover the changed native modules.

Deployment status and final test results are recorded after verification.

Local completion: production build passed; all 171 automated tests passed, followed by six focused E/preservation/network checks after the static route refinement. Final browser suite passed all six responsive widths, two normal-motion render checks and the independent A check with no page errors or failed asset requests. The selector and A have no diff against `e187fa5`. Desktop/mobile local WebGL used 10 draw calls and two textures; rendering cost stayed below the existing 12ms budget. The supplied concept images and approved photographs are unchanged.
