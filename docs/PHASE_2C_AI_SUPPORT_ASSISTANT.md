# Phase 2C — Ikonectt Support Assistant

Implemented 15 October 2026 against the supplied Phase 2C brief. This is an interactive, local scripted demonstration across Templates A–E. No production AI, CRM, account, billing, payment, provisioning or ticket service is connected.

## 1. Existing application audit and architecture

Reviewed the active A/B/C React entry points, D/E standalone adapters, shared router, nine-plan catalogue, coverage hierarchy, request forms, support/FAQ/troubleshooting routes and My Ikonectt previews. Reviewed the Phase 1 architecture/completion, Phase 1.5, Phase 2A, Phase 2B and design reports, plus the supplied corrected visual architecture blueprint (particularly assistance, provider interfaces and authorization boundaries).

Every active template calls `mountSite` in `shared/public-site.js`. The assistant mounts once in that lifecycle, outside the route-rendered `#ik-main`, and is destroyed on site teardown. Public hash navigation therefore preserves the template and in-memory chat without creating five engines. Existing shared routes continue to render and focus their own destination headings.

Legacy `ConciergeWidget` in A and `AIAssistant` in B are dormant, outside the active entry-point tree. Their old live-agent, network and vendor-call behavior is not reused. The new build has no assistant network/provider endpoint. The legacy B server/component files remain inactive reference code, not a production integration.

## 2. Shared components and provider boundary

| File | Responsibility |
| --- | --- |
| `shared/assistant.js` | Mount/teardown, launcher, modal lifecycle, validation, memory-only session, reset, public context, keyboard behavior, navigation and viewport handling |
| `shared/assistant-view.js` | Branded shell, introduction form, escaped message bubbles, timestamps, action controls and catalogue plan picker |
| `shared/assistant-engine.js` | Pure validation, intent matching, context filtering, contextual actions and local scripted response provider |
| `shared/assistant.css` | Scoped responsive product styles, five visual variants, safe areas and reduced motion |

Provider contract: `respond({text, intent?, context:{path,audience,plan}})` returns `{text, actions, plans?}`, synchronously or as a promise. The UI imports only `demoProvider`; there is no AI SDK or network call. A revision counter discards pending replies after reset or teardown. A future adapter can replace the response implementation without rebuilding the shell; it must not silently turn this client-side interface into an operational agent.

## 3. Launcher and five visual treatments

A 56px launcher sits at the bottom right, respects safe-area insets, and lifts above nearby page controls. It remains available after dismissal. A small welcome invitation can be dismissed, closes when opening the assistant or scrolling, and expires after 12 seconds. It is shown once per mounted page session and is not recreated on internal route changes. No persistent pulse, sound, online light or human-agent status is used.

| Template | Assistant treatment |
| --- | --- |
| A | Editorial white surfaces, red logo, rounded panel and restrained red actions |
| B | High-contrast charcoal header with white logo, light body, stronger type and compact squared corners |
| C | Carbon header, dark neutral conversation surfaces, white logo and fine grey borders |
| D | Warm ivory/rose surfaces, Manrope, soft 26px corners and deeper red actions |
| E | Burgundy surfaces, Outfit, white logo, structured fine borders and minimal 4px panel corners |

Official existing transparent logo assets are used directly in the header and compact assistant message signature, with no asset modification. The desktop/tablet panel is at most 420px wide and 820px tall, constrained to the viewport. At 600px and below it becomes a full-screen interface. Header, tools, demonstration notice, composer and footer remain separate from the scrollable content.

## 4. Introduction form

Full Name and Phone Number are required; How can we help? is optional. Names support Unicode letters/marks, spaces, periods, apostrophes and hyphens, with bounded length. Phone validation accepts Nigerian local mobile numbers, `234`, `+234`, `00234` and formatted international numbers with prefixes; malformed, missing and overlong values are rejected. This is format validation, not proof that a line exists or belongs to the visitor.

Labels, individual error messages, `aria-invalid`, `aria-describedby` and an alert summary are provided. Invalid submission focuses the first invalid field. Valid submission uses the first name for the greeting, clears and removes the introduction form immediately, and starts the chat. The phone is not needed by the response provider and is discarded. An optional opening enquiry is processed as the first visitor message. Browse Help Centre routes into the existing website.

## 5. Conversation and supported scenarios

The conversation includes escaped visitor/assistant bubbles, visible author labels, local time labels, an accessible message log, persistent composer and send button, contextual actions and Restart. Input length is bounded; blank messages are not sent. Responses are immediate scripted guidance with no artificial network/typing claim. Eight initial topics are available in a progressively disclosed All support topics menu; the main action list remains a short, context-relevant stack.

| Topic | Demonstration behavior |
| --- | --- |
| Residential plans | Catalogue-driven exploration, plan picker, comparison and coverage |
| Business connectivity | Existing plans/solutions and quote pathway; generic price questions respect Business context |
| Coverage | Explains the address-check demonstration; never confirms geographic eligibility |
| Installation | Coverage → plan → enquiry/confirmation journey, without invented fees or deadlines |
| Internet troubleshooting | Existing approved basic checks, safe cable/power observations, guide/fault/support links; no remote diagnosis |
| Fault reporting | Existing fault/service-request forms; explicitly no ticket creation or delivery |
| Billing/renewal | Portal/support guidance; no balances, invoices, payment status or customer lookup |
| Human support/sales | Contact, fault and enquiry pathways; no agent-joined or availability claim |
| Portal/recovery | Existing sign-in and password recovery previews; no authentication or recovery-message claim |
| Unsupported enquiry | Clear scripted fallback and plans/coverage/Help Centre options |

## 6. Contextual navigation and selected plans

The context getter exposes only the public route, audience and catalogue plan ID. It never exposes coverage address/form state. Actions change with Home, Residential, Business, Plans, Coverage, Support and My Ikonectt routes. A locally explored catalogue plan is retained for the current public context; changing route/audience/website plan invalidates that override. Restart clears the chat selection without changing the website's existing selected plan.

All plan names, speeds, prices and picker options are read from `shared/catalogue.js`. No duplicate price list exists in the assistant. Preview pricing and address-confirmation qualifications remain explicit. A selected Residential plan links to the existing details/comparison/coverage journeys. Business has no invented detail page: it links to Business Plans, Request a Quote and coverage.

Navigation closes the modal before calling the existing shared navigator, allowing the destination heading to receive focus. Hash links retain `/option-a/` through `/option-e/`. Only public audience/plan identifiers appear in assistant-generated URLs.

## 7. Escalation pathways

Existing internal routes: `support`, `support/faqs`, `support/troubleshooting`, `support/contact`, `support/fault`, `support/service-request`, `business/quote`, `residential/installation`, `coverage/verification`, `contact`, `my-ikonectt/sign-in` and `my-ikonectt/forgot-password`. No duplicate support form is built inside the conversation. Sales offers the relevant home installation, business quote or general enquiry pathway. Verified phone/email/hours have not been supplied, so no channel or live availability is invented.

## 8. Privacy and session handling

All introduction input and conversation content stay in the current page's DOM/JavaScript memory. There is no localStorage, sessionStorage, cookie, IndexedDB, analytics, console logging, fetch, beacon, AI call or support submission in the new assistant modules. Autocomplete is disabled on these fields. No Remember Me is implemented. Minimise/reopen retains the current in-memory chat; Restart removes introduction values, messages, composer content and the chat's plan override. Full reload/unmount discards the assistant session. Browser-controlled autofill/password-manager behavior is not an application storage feature.

The provider receives only the typed enquiry plus an allowlisted public context. Name and phone are not passed to it; the first-name greeting is constructed locally. Visitor text is escaped before rendering. The UI advises against sharing passwords, payment details and codes. Existing website imagery/network behavior is unchanged; the privacy guarantee here concerns assistant data and integration code.

## 9. Accessibility and motion

Native modal `dialog` with accessible title/description, explicit close/minimise, `aria-haspopup`, expanded launcher state and labelled form controls. Opening focuses the first field or composer; Escape closes and returns focus to the launcher. Native modal isolation plus Tab/Shift+Tab boundary handling keeps focus in the open dialog. Restart focuses the cleared name field. Internal navigation closes first, then the existing page focus behavior applies. Pending replies cannot reappear after reset.

The log uses `role=log`, polite live updates and additions/text announcements. Decorative SVGs and repeated logo signatures are hidden from assistive output. Focus outlines are visible, primary text/buttons use contrasting surfaces, and touch controls have 44px minimum targets. Entrance/hover/message motion is brief and entirely disabled by `prefers-reduced-motion`. No heavy motion dependency was added.

## 10. Responsive and browser validation

- **30 width/template checks:** A–E at requested 1440, 1024, 768, 390, 375 and 320px widths, with 900px height. Browser pixel rounding produced actual 376/321 CSS pixels for requested 375/320; actual values are saved.
- Checked invitation visibility, 56px launcher bounds, introduction focus, modal dimensions, document/panel/content horizontal overflow, composer containment, typed troubleshooting responses and available action routes. All checks passed.
- **Five short viewport checks:** A–E at 390×500. The composer remained inside the panel, no horizontal overflow appeared, and a typed Business price enquiry retained `biz-500` through Request a Quote.
- **Five Residential browser handoffs:** selected `res-igold` showed iGold / 50 Mbps / ₦25,000 per month from the catalogue and arrived at coverage with the same plan, active template and closed panel.
- Native browser keyboard Enter opened the launcher; Escape closed it and returned focus. Footer scrolling at narrow E reached the bottom with no launcher/link intersection. Automated tests additionally cover modal Tab/Shift+Tab boundaries across all templates.
- Safe-area CSS and VisualViewport resize/offset handlers are implemented. Short viewport resizing tests reduced available space; **physical mobile devices and actual on-screen keyboards were not tested**. No separate Firefox, Safari, screen-reader audio or hardware touch testing is claimed.

Evidence: [responsive measurements](evidence/phase-2c/responsive-checks.json), [Residential plan handoffs](evidence/phase-2c/selected-plan-journeys.json), [short viewport and Business handoffs](evidence/phase-2c/short-viewport-and-business-journeys.json).

## 11. Automated tests and production build

`npm run build` passed for all five packaged templates. Existing non-blocking Vite future-config warnings remain.

`npm test` passed: **112 tests, 0 failures** — 77 existing public-site tests plus 35 assistant tests, including nested per-template tests. New checks cover introduction formats/errors, all scripted intents, fallback, escaping, public-context filtering, absence of network/storage code, welcome dismissal, opening/closing, focus/Escape/modal boundaries, valid introduction, eight topic actions, typed messages, restart, selected plans, all nine required journeys in each template, no personal-data URLs/storage or network calls, no false account/ticket actions, provider-boundary filtering and reset of pending responses. Existing navigation, menus, catalogue, carousel, forms, coverage and portal tests remain unchanged and pass. `git diff --check` passed.

## 12. Screenshots and known limitations

Screenshots use synthetic Demo Visitor input. Each template has launcher/invitation, introduction, initial conversation and guided-action screenshots at desktop 1440 and mobile 390. File pattern: `docs/evidence/phase-2c/{a|b|c|d|e}-{launcher|introduction|conversation|guided-actions}-{1440|390}.png`.

| Template | Launcher | Introduction | Conversation | Mobile |
| --- | --- | --- | --- | --- |
| A | [View](evidence/phase-2c/a-launcher-1440.png) | [View](evidence/phase-2c/a-introduction-1440.png) | [View](evidence/phase-2c/a-guided-actions-1440.png) | [View](evidence/phase-2c/a-conversation-390.png) |
| B | [View](evidence/phase-2c/b-launcher-1440.png) | [View](evidence/phase-2c/b-introduction-1440.png) | [View](evidence/phase-2c/b-guided-actions-1440.png) | [View](evidence/phase-2c/b-conversation-390.png) |
| C | [View](evidence/phase-2c/c-launcher-1440.png) | [View](evidence/phase-2c/c-introduction-1440.png) | [View](evidence/phase-2c/c-guided-actions-1440.png) | [View](evidence/phase-2c/c-conversation-390.png) |
| D | [View](evidence/phase-2c/d-launcher-1440.png) | [View](evidence/phase-2c/d-introduction-1440.png) | [View](evidence/phase-2c/d-guided-actions-1440.png) | [View](evidence/phase-2c/d-conversation-390.png) |
| E | [View](evidence/phase-2c/e-launcher-1440.png) | [View](evidence/phase-2c/e-introduction-1440.png) | [View](evidence/phase-2c/e-guided-actions-1440.png) | [View](evidence/phase-2c/e-conversation-390.png) |

The matcher is deliberately bounded and English-language; it does not answer arbitrary questions. No live agent, authenticated account, delivery endpoint, AI model or verified coverage database is available. Phone validation is syntactic. Modern browsers with native dialog support are the intended target; no legacy-browser modal polyfill is installed. Phase 2B's pre-existing B photography URL failure and C image-label mismatch remain documented and unchanged. The three ipNX screenshots mentioned in the prompt were not supplied as separate files in this Phase 2C attachment; the specified interaction sequence was used to create the original design.

## 13. Future AI integration requirements

Introduce an approved backend adapter with request/response validation, scope checks, rate/token quotas, timeouts, safe error states and minimal data retention. Use approved knowledge and the same catalogue; route direct answers without model use where practical. Keep vendor keys exclusively on the server. Do not forward introduction details or full chat histories by default. Confirm consent, retention and genuine human handoff before adding operational support delivery.

Authenticated guidance requires verified server sessions and account-scoped authorization. CRM, ticket, billing and provisioning integrations require separate approved contracts, explicit action controls and audit records. The assistant must not autonomously modify accounts, execute renewals, create orders, verify payments or provision service. Future provider code must remain within the blueprint's lightweight, cost-controlled support boundary.

## 14. Files changed and preserved work

Added the four shared assistant modules/styles, `tests/assistant.test.mjs`, this report and evidence. Added a mount/cleanup hook and narrow context getter in `shared/public-site.js`, one CSS import in `shared/public-site.css`, and expanded the root test command to include both test files. Rebuilt generated A/B/C asset bundles/HTML and `public_html/shared` for deployment; D/E pick up the same shared modules through their unchanged adapter.

Protected source diff checked: catalogue/prices, plan rendering/comparison, carousel/controller/hidden-scrollbar CSS, existing pages/forms/content/routes, `IMAGE_SLOTS.md`, A/B/C homepage sources, D/E HTML, photograph and logo assets are unchanged. No photography/slideshow installation, homepage redesign, backend endpoint, new dependency or vendor credential was added.

## 15. Deployment status

Production build and local validation complete. Publish through the existing `efosaomoigui/ikonecttclient` main-branch GitHub → Vercel workflow. Commit and live verification will be recorded here after publication.
