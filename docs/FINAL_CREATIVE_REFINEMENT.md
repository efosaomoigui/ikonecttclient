# Final creative refinement and deployment

26 October 2026 · Active Templates A and E only.

## Team feedback review

| Request | Finding and action |
| --- | --- |
| Remove Union Bank branding | Newly addressed. The client identified the green-glass tower used by E's Business panel and headers. That entire image is replaced by unbranded bronze-and-charcoal commercial architecture. A separate bank horse emblem, advertising and corporate signage remained in the broad Lagos city photo; A/E now use a cleaned, AI-assisted derivative. |
| Update images | Mostly already addressed locally: official campaign family, A's man/red chair, E's approved woman/laptop, supporting interiors, infrastructure and fibre/city animation. Retained these improvements; changed only the two offending architectural images. |
| Creative use of the “i” | Newly addressed using the actual dot-and-lightning symbol from supplied official artwork. One restrained watermark per homepage, adapted to each design. No wordmark recreation or modification. |

The team had not seen the latest work because campaign photography, homepage additions and the carpet hero reveal had not yet been committed/published. The existing live site was still serving the 22 October build before this task.

## Changes and exact placements

- **A company section** (`#home-company`, “Connecting people and possibilities”): subtle red “i” watermark at the left; existing typography, background, words and About action retained.
- **E company section** (`.about`, “Connecting people and possibilities”): subdued rose “i” on the right; replaces the pre-existing decorative fibre texture in this one section to avoid stacking decoration.
- **E homepage Business panel and Business/solution heroes**: `commercial-architecture-v1-*.webp`, original generated illustration, not verified premises.
- **E city hero, Coverage heroes and Enterprise editorial photo; A Enterprise editorial photo**: `lagos-clean-v1-*.webp`, AI-assisted retouch of the licensed city photograph. Signage removed, attribution retained and adaptations disclosed.
- Official campaign photography, residential heroes, supporting scenes, My Ikonectt panels, benefits and testimonial handling remain as approved. A keeps its 5.5-second slideshow and 900ms carpet reveal, arrow/pause controls and no visible numbers. E keeps its fibre/city rendering and pause behaviour.

No changes to the selection interface, archived B/C/D source, catalogue/prices, navigation, router, forms, coverage logic, assistant engine or in-memory privacy handling. No new dependency or deployment configuration. Demo testimonials are intentionally local-review-only: no unapproved endorsements are published.

## Image production and provenance

Built-in imagegen produced the two image masters. [Exact prompts and source details](../assets/review/final-creative/PROMPTS.md), [export manifest](../assets/review/final-creative/exports.json), and [licensing](../assets/visual-library/creative/README.md). The masters are retained under `assets/review` and excluded from the deployed distribution. WebP exports never exceed source width (city 1725px, architecture 1086px). The original photographic files remain intact for archives; active A/E do not request the old tower or branded skyline.

The original symbol is extracted at its native 59 × 221 bounding field from the official colour sheet. It is decorative, pointer-inert and hidden from assistive output. Header, footer and support wordmarks remain unchanged.

## Validation

- `npm test`: **164 passed, 0 failed**. Focused creative tests passed again after correcting Vite's handling of a dynamic image URL.
- Production build: passed. Packaged-app QA caught and resolved that image URL issue before publication.
- Browser QA: **180 route/viewport checks** (30 routes × A/E × 1440/768/390px). All current-page images decoded; no missing resources, page errors, horizontal overflow or out-of-bounds headings. Internal navigation destinations resolve to existing routes; empty support welcome forms still validate.
- Checked the A hero transition and E city pause without reduced motion, plus static/manual reduced-motion behaviour. Natural photographic tones, dark/light identity, text overlays, My Ikonectt and signature placement visually inspected.
- [Machine-readable local checks](evidence/final-creative-refinement/local/checks.json). Local screenshots: [A brand signature](evidence/final-creative-refinement/local/a-brand-1440.png), [E brand signature](evidence/final-creative-refinement/local/e-brand-1440.png), [E Business hero/mobile](evidence/final-creative-refinement/local/e-business-390.png), [E city hero](evidence/final-creative-refinement/local/e-animated-hero-paused-1440.png).

## Publication

Commit/push and verification of the existing Vercel production deployment follow validation. Record the actual commit, deployed result and final checks here; do not infer deployment success from a push alone.
