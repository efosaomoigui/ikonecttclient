# Homepage benefits and testimonials

26 October 2026. Implemented locally for **Template A and Template E only**. Nothing has been pushed or deployed.

## Placement and design

Both homepages retain their existing sections and order. “Why Choose Ikonectt” follows plan discovery. “What Our Customers Say” sits before the existing My Ikonectt closing panel when approved testimonials or local review samples are available.

The additions are isolated in `shared/homepage-sections.js`, `shared/homepage-content.js` and `shared/homepage-sections.css`. A’s existing React page markup is unchanged; its adapter mounts the new sections. E loads the same scoped adapter through its own entry point. Navigation, pricing, plans, coverage, support, internal pages, photography, A’s grey My Ikonectt panel and E’s Three.js hero remain unchanged. Existing section nodes and their event handlers are retained.

A uses soft-neutral surroundings, white cards, fine borders, modest corner details and red SVG line icons. E uses burgundy/charcoal cards, quiet separators, soft-white type and restrained red accents. Its existing fibre-wave artwork supplies a faint background detail. Neither section introduces photography, Three.js, timers, autoplay or continuous animation.

The six-card grid uses three columns from 1024px, two from 640–1023px and one below 640px. Card heights are equal within each grid, including wrapped headings. Testimonial cards use two columns on desktop/tablet and stack below 768px. Static cards require no carousel controls or unnecessary tab stops. Hover feedback is limited to fine pointers; reduced motion removes transitions and movement.

## Benefits content

| Client theme | Implemented heading | Supporting description |
|---|---|---|
| Unlimited Internet | Everyday Internet | Stay connected for work, entertainment and everyday life. |
| 24/7 Customer Support | Customer Support | Find guidance and assistance when you need help with your connection. |
| Blazing-Fast Speeds | Fast Connectivity | Explore broadband for streaming, working and staying connected. |
| Perfect for Remote Work | Remote Work | Make room for video calls, collaboration and everyday productivity. |
| Unrestricted Access | Open Connectivity | Explore the web and the online services you rely on. |
| High Definition Streaming | Entertainment & Streaming | Enjoy your favourite content and connected experiences. |

The project’s content audit does not verify unlimited/FUP terms, staffed 24/7 support, no-throttling guarantees or unrestricted access. These are therefore not presented as service promises. “Everyday Internet” preserves the everyday-connectivity theme without asserting an unlimited allowance. No new speed, reliability, response-time, SLA, device-count or availability guarantees are introduced.

Evidence: `Ikonectt_content (1).md` lines 365, 384–385 and 639–658; `docs/CONTENT_AUDIT.md`; and the current catalogue’s confirmation status. Client confirmation remains necessary before adding absolute commercial claims.

## Testimonials: review versus production

No verified customer quote records or portrait permissions were found in the supplied project documentation. Daniel Chukwuma and Zainab Lawal are named in the brief as references requiring verification; their names, likenesses, ratings and quotes have not been reused.

The local preview displays two short **illustrative scenarios**, headed “Demonstration content” with a visible explanation that customer stories and permissions await approval. Each card is also labelled “Not a customer endorsement.” Attribution fields read “Example home customer” and “Example business customer.” There are no portraits, ratings or decorative stars. These samples are layout content, not factual accounts of an Ikonectt customer experience.

Review data lives exclusively in `assets/review/homepage-sections/demo-testimonials.json`, which the existing production packaging rule excludes. The adapter only attempts to load it on exact loopback hosts (`localhost`, `127.0.0.1`, IPv6 loopback). A published host never requests this file, even if a review query is added. Missing review data is harmless: benefits remain usable and the testimonial section is not inserted.

The published configuration `approvedHomepageTestimonials` is empty. Consequently, **production shows the benefits but no testimonial section or sample endorsements**. Once real customer stories and permissions are approved, author them there. Quote, attribution and publication approval must all be explicit; portrait and rating approval are separate. Names, descriptors and quotes are escaped before rendering. No third-party image or testimonial API is used.

For production-like local viewing, add `?production-preview` before `#/home`; this suppresses review samples. This switch cannot enable samples on a published host.

## Validation

- **157 tests passed, zero failures**, including nine new content, approval, production-omission, ordering, cleanup and escaping tests. Existing hero, city, plan, support, form and route checks passed.
- `npm run build` passed. The review JSON is absent from `public_html`, and its sample quotation text is absent from the production payload.
- Browser checks cover A/E at **1440, 1280, 1024, 768, 390 and 320px**: 24 section/viewport checks, correct column counts, equal card heights, no overflow or clipped card content, and no page errors.
- Real built assets were also served on an intercepted public origin. Both templates rendered six benefits, zero testimonial cards and made zero review-data requests. No deployment was needed for this verification.
- Existing My Ikonectt actions still reach the sign-in route, including E’s existing `#portal` alias; home refreshes do not duplicate either section.
- Fine-pointer hover feedback and reduced-motion behavior were checked. Text uses high-contrast dark-on-light or soft-white-on-burgundy combinations; icons are sharp inline SVGs.
- Source/asset footprint stays small: one shared adapter/content module and scoped CSS, no new runtime dependency, no portrait downloads and no animation loop. E’s city renderer and performance controls are untouched.

Screenshots and measurements: `docs/evidence/homepage-sections/`. Desktop captures include both new sections in both templates; mobile captures include 390px and 320px, with touch-device emulation. Component screenshots temporarily omit unrelated fixed header/assistant chrome for an unobstructed view; live functionality and styles are unchanged. The local review gallery presents these together.

## Review links

- [Benefits and testimonials gallery](http://127.0.0.1:3021/assets/review/homepage-sections/index.html)
- [Template A homepage](http://127.0.0.1:3021/public_html/option-a/#/home)
- [Template E homepage](http://127.0.0.1:3021/public_html/option-e/#/home)
- [A without review testimonials](http://127.0.0.1:3021/public_html/option-a/?production-preview#/home)
- [E without review testimonials](http://127.0.0.1:3021/public_html/option-e/?production-preview#/home)

Outstanding approvals: unlimited/FUP/no-throttling wording, actual support hours, unrestricted-access claims, genuine customer quotes and attribution/publication permissions. Portraits or ratings can be added only with their corresponding approvals. No approval is implied by the demonstration layout.
