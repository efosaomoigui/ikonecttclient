# Option A price cards — local review

A now uses the approved E price-header card layout, adapted with a white-and-gray section, darker and stronger heading, 8px card corners and A's brighter red. The selected card rises above its neighbours. Original Ikonectt catalogue content, official i prefixes, price values, links, audience switching and shared carousel controls remain intact.

The change is scoped to the A homepage. Native source assets are option-a/public/plan-showcase.js and option-a/public/plan-showcase.css, linked from option-a/index.html. The existing local preview received these same files directly, without compiling or replacing A's current bundle. Future normal Vite packaging copies the public assets. E's approved design and source files were not modified.

Local preview: http://127.0.0.1:3021/public_html/option-a/?review=price-cards#/home

Evidence: docs/evidence/option-a-price-cards/local/price-card-checks.json and desktop/mobile screenshots in the same folder. Browser checks passed at 1440, 1280, 1024, 768, 390 and 320px, covering page overflow, price headers, centre selection, arrow controls, keyboard Home/End, audience switching and selected-plan quote routing, with no browser errors or failed asset requests.

The full suite initially passed 175 of 177 checks; two historical preservation checks flagged the newly authorised HTML asset links. The exact native HTML was added to the explicit preservation checkpoint, retaining historical baselines. All 12 affected/targeted checks then passed, including both previous failures and the new startup/content preservation checks.

No production build, push or deployment was run.
