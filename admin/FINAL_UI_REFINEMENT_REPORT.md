# Admin/CRM final subtle UI refinement

22 October 2026. Approved theme baseline: `f423c74`.

Changed `src/main.ts`, `src/readability.css` and `tests/dom.test.ts`. Screenshots and observations are in `docs/final-ui-refinement/`.

- Fresh dashboard sessions start with all six groups collapsed. Clicking or pressing Enter/Space toggles a group; opening another closes the previous group. Page navigation automatically opens the active parent and scrolls its selected link into view. Active styles, hierarchy and all 18 permitted Admin links remain intact. Logout/new sessions reset disclosure state.
- Only navigation scrolls inside the sidebar. Its scrollbar uses transparent tracks, muted gray Light/Dark thumbs, brighter hover/focus/scroll feedback, Chromium 6px styling and Firefox thin/color rules. A stable gutter prevents width shifts. Native keyboard and wheel scrolling were verified; the passive activity listener does not intercept native scrolling or touch input.
- The primary horizontal banner remains below the header; the duplicate dashboard simulation notice is removed. Its copy identifies development records, non-real simulation actions and possible resets. The header indicator stays intact. When live API summary data includes simulated records, its notice uses the same primary banner position.

Browser checks on the running preview on port 3013 passed: fresh collapse, accordion toggling, Enter/Space, active Orders/Provisioning/Settings navigation, keyboard/wheel scrolling without moving the document, and mobile navigation at actual 390px and 320px CSS widths without horizontal overflow. Recorded before/after Dark measurements match for sidebar/header/card geometry and colors, table typography/colors, item height/padding, font size and icon size. Light mode and the existing theme controls also work; the original Dark preference and default viewport were restored.

**64 tests passed, 0 failed.** TypeScript/review build, production build and whitespace checks passed. Firefox-specific CSS is included; browser interaction verification used the Chromium-based in-app browser. No authentication, sample-data, financial, backend-contract or customer-portal changes were made by this refinement.

Evidence: [browser checks](docs/final-ui-refinement/browser-checks.json), [Dark dashboard](docs/final-ui-refinement/dark-dashboard.png), [Light dashboard](docs/final-ui-refinement/light-dashboard.png), [320px navigation](docs/final-ui-refinement/dark-320-navigation.png).
