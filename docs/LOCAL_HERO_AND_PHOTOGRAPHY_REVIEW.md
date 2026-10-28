# Local hero and photography review

Nothing in this review has been pushed or deployed. The client requires local review and feedback before any future publishing.

## Option E — current direction

- The full city photograph remains the hero. All generated 3D buildings and the WebGL renderer are removed from its loading path.
- The exact official dot-and-lightning “i” is white and sits in the bottom-left foreground, on the opposite side of the road. A small ground shadow and rim anchor its base; its shape is unchanged.
- Red signal packets cross the road from this source into eight photographic building locations on desktop and five within the narrower mobile crop. Arrival highlights stay on the buildings. The source position adapts to viewport size while facade coordinates stay attached to the photograph.
- The heading, description and CTAs are grouped in the upper centre with reduced empty gaps. Copy and destinations are unchanged.
- Pause applies to signals and the changing headline. Reduced motion shows static paths. The existing visibility/route/tab lifecycle and shared animation clock are retained. There are no Three.js downloads or canvas elements in the current E hero.
- The darker hero is localised. The light navigation, page sections, forms, plans and footer remain. E's original living-room and unbranded commercial-building panels are restored; its approved My Ikonectt woman remains.

## Option A — photo variants

The people-photo update belongs to A's Residential and Business audience panels. The original A slideshow photographs and transitions remain unchanged.

Built-in **imagegen** edited existing approved photographs. Masters and prompts are stored non-destructively:

| Variant | Saved master | Application |
| --- | --- | --- |
| Red woven sofa and cushion | `assets/review/red-accents/family-red-sofa-v1.png` | A homepage family panel |
| Red screen details and phone case | `assets/review/red-accents/business-red-details-v1.png` | A homepage business panel |
| Red fabric sofa | `assets/review/red-accents/campaign-family-red-sofa-v1.png` | A internal Residential family section |

Final prompt set: `assets/review/red-accents/prompts.json`. Optimised responsive files and dimensions: `assets/review/red-accents/exports.json`; WebP exports live in `assets/visual-library/red-accents/`. Source photographs are preserved. E's internal family image is unchanged.

## Review locally

- E: `http://127.0.0.1:3021/public_html/option-e/#/home`
- A: `http://127.0.0.1:3021/public_html/option-a/#/home`
- Side-by-side photo review and signal-layer toggle: `http://127.0.0.1:3021/assets/review/red-accents/index.html`

Evidence: `docs/evidence/hero-grounding/`. Automated checks cover source position at desktop/mobile sizes, a white source mark, expanded facade destinations, actual signal travel/arrival, no canvas or independent animation loop, pause/resume, reduced motion and preservation of customer journeys. Browser evidence covers responsive crops, A/E photo selection and the local comparison control.

Final local validation: all 173 automated tests pass. The white source and expanded destinations pass real-browser checks at 1440, 1280, 1024, 768, 390 and 320px, with no horizontal overflow, no canvas elements and no Three.js downloads. Responsive A/E photo selection and the comparison toggle also pass. Latest hero screenshots are `docs/evidence/hero-grounding/local/white-source-*.png`.
