# Local client follow-up — 28 October 2026

- E's white signal-source i rises 14px more above the bottom edge, retaining its buried base and original building anchors.
- E Business keeps its building hero; the second office photo is hidden and the existing copy/CTA becomes a compact text introduction.
- A homepage hero is 650px on desktop (previously 720px), 560px on tablet, with a 300px mobile photo field. Existing stories, controls and links remain.
- E's “Internet for every day” panel uses the supplied `newimages/image.png_76191433.jpg`. Responsive exports are named `everyday-couple` in the existing client library; the source is unchanged and recorded in the export manifest.
- A/E benefit sections now use the city photograph beneath a dark overlay, with translucent charcoal cards, subtle blur, borders and shadows. E's background also installs correctly when its benefits section loads after the presentation adapter.

Browser checks passed at 1440, 768 and 390 pixels for the changed fields, including no page overflow, correct photo, raised source position and removal of the second Business image. Evidence: `docs/evidence/general-polish/followup/`.

The broad run passed 180 tests with one stale old-photo expectation. That expectation was updated for the requested replacement; all nine affected tests then passed, including a regression check for E's deferred benefits section.

Local only. No production build, push or deployment.

Copy cleanup: A/E repeated pricing/availability notes, coverage helper/subtitle copy, draft footer notes, selected-plan preview hints and pending hero subtitles are hidden. Redundant unconfirmed plan-fact rows are hidden. Carousel position announcements remain available to screen readers. Live field errors and submission status remain intact. Active-template scope and dynamic validation passed unit checks; 11 routes per template and mobile layout passed browser checks. Evidence: docs/evidence/general-polish/copy-cleanup/. Local only.

Rooftop/grey follow-up: the supplied Satellite_dish_on_office_rooftop_c8b8cffa.jpg is now the A/E benefits background, preserving the dark overlay and translucent cards. Original source preserved; responsive rooftop-network exports recorded in the client-library manifest. E's lower plan-section background changed from pink #fce1e3 to grey #e9ebee. Eight affected checks passed; desktop/mobile browser checks passed. Evidence: docs/evidence/general-polish/rooftop-grey/. No production build or push.

Uniform card icons: A/E inner information cards now have context-specific 24px-grid SVG line icons in the same rounded, 1.6-stroke style and 52px desktop/48px mobile sizes as Why Choose Ikonectt. Light cards use brand red, with consistent internal padding. Existing plan, benefit and testimonial treatments remain. All routes were checked on desktop, with key card pages checked on mobile: exactly one decorative icon per information card, unchanged links, no page overflow. Existing four polish checks passed. Evidence: docs/evidence/general-polish/card-icons/. Local only.
