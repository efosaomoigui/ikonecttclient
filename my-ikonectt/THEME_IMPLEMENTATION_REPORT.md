# My Ikonectt Light and Dark themes

22 October 2026. Optional Dark Mode is a visual enhancement of the approved customer portal. Light remains the default. The main public website, Admin/CRM, API contracts, authentication, wallet, payment, renewal and provisioning logic are unchanged.

## Implementation and changed files

| File | Change |
| --- | --- |
| `theme.js` | Small synchronous bootstrap, saved preference, delegated toggle and same-origin preference synchronization. No framework or dependency. |
| `index.html` | Loads the theme bootstrap before the stylesheet and application, preventing an incorrect-theme startup flash. |
| `portal.css` | Central semantic dark palette; existing exact light colors retained as CSS variable fallbacks. Native controls, focus, autofill, status colors, mobile navigation and print surfaces covered. |
| `app.js` | Discreet toggle in public portal and authenticated headers; source-provided status label added as a styling attribute. No account or financial decision code changed. |
| `build.mjs` | Includes `theme.js` in compiled assets. |
| `tests/theme.test.mjs` | Four theme tests: startup/default/persistence, delegated control without node replacement, storage failures/cross-tab updates and contrast. |
| `evidence/themes/` | Real browser screenshots and `checks.json`. All financial records shown are labelled development fixtures. |

The dark palette uses charcoal page/chrome surfaces, slightly lighter cards, restrained borders, light text, the existing red primary actions and a brighter red text/focus color. Input borders are slightly stronger than panel borders for readable field boundaries. No logo asset, typography, card layout, sidebar organization or customer journey was redesigned. The recently approved top-up form/instruction side panel remains intact.

## Switcher and preference

The moon button is in the portal's public header beside Sign in, and in the authenticated header beside the account number/avatar. On small screens its text collapses to the icon while the accessible label remains. It is a native keyboard-operable button with the stable name **Dark mode**, `aria-pressed` state, and a title describing the next action. Space-key operation was verified in the browser.

Switching changes the root `data-theme` immediately. It makes no API call, reload, route change or account re-render. An unfinished top-up reference remained intact across switching. Existing persistent SPA navigation remains in place.

Preference is stored under **`ikonectt.portal.theme`** in localStorage for that browser/origin. New visitors default to Light, regardless of OS settings. Existing selection survives reloads and public/authenticated navigation and synchronizes with other tabs on that origin. Separate ports are separate browser origins. If storage is disabled, switching still works for the current page, but cannot persist across reloads. System preference mode is intentionally omitted; it was optional.

The small classic bootstrap runs synchronously in the head before CSS, so the first styled frame uses the saved theme. No auth token, customer data or payment evidence is stored by the theme system.

## Light preservation and accessibility

Browser comparison against the pre-change login captured identical colors, backgrounds, borders, font, padding, width and height for the body, header, story, auth panel, input, primary button and footer. Only the new toggle is added. Results are recorded in `checks.json`, with `baseline-login.png` and `light-login.png`.

Semantic text colors meet at least **4.5:1** contrast against page, sidebar, card, secondary/raised/hover and input surfaces in the tested palette; input borders meet **3:1** against input backgrounds. Success, pending/review and failure colors retain text labels and do not replace the authoritative status. An expired label has a separate neutral treatment; the portal does not infer expiry or activation from wallet funds. Focus outlines and native dark controls/autofill remain readable. Print colors switch to light paper surfaces without changing the screen preference.

## Browser verification

Desktop checks used the isolated live preview on 4195 against the existing local API, reading the authorized simulated test account. No live financial or account mutations were submitted. The only form edit was an unsubmitted temporary reference used to verify draft preservation and then cleared.

Both themes were reviewed on:

- Portal home, login, account setup, recovery and help.
- Overview; My Services and current service details; published plans, coverage and new-order form.
- Billing, verified receipt and empty billing state.
- Wallet balances, manual top-up form and side instructions, transaction history and renewal quote.
- Profile, account security, notifications, support empty state and ticket form.
- A real missing-order API error inside the preserved navigation shell.
- Mobile wallet and login, with navigation open/close behavior. Approximately 320 and 390 CSS pixel views had no horizontal overflow; viewport overrides were reset.

Existing **explicit mock presentation states** were used separately to view renewal confirmation, reservation, processing, review and failure, plus a populated support history/conversation. Those screenshots use `mock-` names and do not claim real provider operations. The live build was restored after fixture review. No renewal or support submission was made.

The manifest contains **66** theme/layout observations (including repeated final checks), with no wrong-theme state, horizontal overflow or duplicate/missing header toggle recorded. The public 320px header keeps Sign in on one line with a compact toggle.

Representative pairs in `evidence/themes/`:

- `light-overview.png` / `dark-overview.png`
- `light-wallet.png` / `dark-wallet.png`
- `light-login.png` / `dark-login.png`
- `light-top-up.png` / `dark-top-up.png`
- `light-mobile-wallet.png` / `dark-mobile-wallet.png`
- `light-mock-renew-confirmation.png` / `dark-mock-renew-confirmation.png`

Additional named screenshots cover the other screens and states listed above. Credential fields are empty in delivered login/setup screenshots.

## Checks and limits

- `npm test`: **33 passed**, including all 29 previous regressions and four new theme tests.
- `npm run typecheck`: passed.
- Production builds in explicit mock and live modes: passed.
- `git diff --check`: passed.
- No backend, API, financial calculation, dependency, main-branch merge or deployment changes.

There are no known outstanding theme defects from these checks. Native OS print dialogs and live financial submissions were not exercised; existing inline confirmation forms and native-control color schemes were checked without changing their behavior. The provider settlement capability remains unconnected, as before.

## Running integration check

The portal-only change was applied to the existing Stage 5A integration branch serving port **4175**, preserving unrelated Admin work. A separate read-only browser tab verified Light was the initial theme, Dark immediately used `rgb(17, 20, 24)`, and Dark persisted through reload. The preference was restored to Light and the temporary tab closed. Evidence: `integrated-light-login.png`, `integrated-dark-login.png`, `integrated-check.json`. No runtime restart, account mutation, main-branch merge or deployment occurred.
