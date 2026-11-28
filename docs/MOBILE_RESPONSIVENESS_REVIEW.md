# Mobile responsiveness review — 27 November 2026

Changes are local in the canonical Option E checkout. No Git push, cPanel update or public deployment was performed. Backend services, API contracts and financial logic were not changed.

## Refinements

- Benefit cards use an icon/title row followed by a full-width description on phones and narrow tablets. Descriptions remain readable at 16px and cards expand naturally.
- Residential and business buttons have consistent widths on phones. Device and plan carousels retain horizontal scrolling.
- Mobile plan cards share the same top edge. Unavailable-plan messages sit below the red heading area.
- Business enquiry tables stack labels and descriptions on phones. Comparison tables retain horizontal scrolling.
- Phone inputs separate the country/code row from the number field when space is limited. The number field measures 212px at a 320px viewport.
- Mobile headings, gutters and information cards have appropriate spacing. Existing fields, validation and submissions are preserved.
- AI and WhatsApp controls stay anchored rather than moving above page links during scrolling. Hero arrows leave clearance for the dock.

## Verification

Chrome emulation checked 27 website routes at widths of 320, 360, 384, 390, 412, 768, 1024 and 1440px: **216 route/viewport checks**, with no overflow, clipped headings or browser errors. A fresh response from the local backend was replayed only inside the test browser; no runtime plan fallback was added.

Native touch swiping, mobile navigation, plan controls, the unavailable-plan layout and phone fields passed. Forty normal-motion scroll checkpoints confirmed a stable dock. A desktop comparison confirmed unchanged card geometry and typography; hero controls have deliberate clearance from the dock.

The website suite passed **243 tests**. Final focused assistant and preservation checks passed **44 tests**. The live website/Admin release build passed. Screenshots were reviewed; these checks do not represent physical-device testing on every mobile browser.

## Files and evidence

Presentation: `option-e/mobile-responsive.css`, the stylesheet link in `option-e/index.html`, and the Option E docking branch in `shared/assistant.js`.

Regression checks: `tests/mobile-responsive.test.mjs` and `scripts/check-mobile-responsive.cjs`. Content preservation metadata records the authorized changes.

Evidence is in Git-ignored `.local/mobile-review/`: screenshots, `results.json`, `dock-final.json`, desktop comparisons and test/build logs.

Local review: http://127.0.0.1:3000/option-e/#/home. Publication awaits approval.
