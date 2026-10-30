# MY IKONECTT — STAGE 2 INTEGRATION REPORT

19 October 2026. Frontend branch: `codex/my-ikonectt-portal`. Canonical Shared API v1.0.1 commit: `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`.

The approved Stage 1 visual design is preserved. Changes are confined to `my-ikonectt/` in the assigned worktree. No public website, Admin/CRM, canonical contract, backend business logic or production deployment was modified. The portal is running on `http://127.0.0.1:4175/`, using the separately managed development API on port 4000.

## 1. Screens integrated

- Login, setup/recovery, mandatory password change and Account Security.
- Overview dashboard with actual customer identity, subscriptions, payment records and recent support activity.
- My Profile, with phone as the only editable field.
- My Services and service detail, service orders and order detail, published plans and building coverage checks.
- Billing & Payments, payment reporting, confirmed receipt detail/print and an explicit unconfirmed-receipt state.
- Support creation, confirmation, history, detail, timeline and customer replies.
- Notifications as delivery metadata; read-only account guidance and capability-based availability.

New operations use the approved panels, forms, buttons, status indicators and responsive navigation. Orders remain within My Services, payment reporting within Billing & Payments, and guidance within Support. No public registration or gateway checkout was added. Only a small scoped reflow rule was added to keep API-provided order names and statuses within their panels.

## 2. API operations connected

The service layer validates requests and responses against the exact pinned canonical Zod schemas and uses the shared `createApiClient`. TypeScript infers wire types from those schemas. Portal view models derive their wire fields from canonical types. The browser runtime is bundled locally; presentation components contain no HTTP calls.

| Area | Operations relative to `/api/v1` |
| --- | --- |
| Authentication | POST `/auth/login`, GET `/auth/session`, POST `/auth/logout`, POST `/auth/recovery`, POST `/auth/reset-password`, POST `/auth/change-password` |
| Dashboard/profile | GET `/me/dashboard`, GET/PATCH `/me/profile` |
| Services/orders | GET `/me/subscriptions`, GET/POST `/me/orders`, GET `/me/orders/:id` |
| Payments | GET/POST `/me/payments`, GET `/me/payments/:id/receipt` |
| Support | GET/POST `/me/tickets`, GET `/me/tickets/:id`, POST `/me/tickets/:id/messages` |
| Plans/coverage | GET `/plans`, GET `/coverage/locations`, POST `/coverage/check` |
| Notifications/capabilities/guidance | GET `/me/notifications`, GET `/capabilities`, POST `/assistant/guidance` |

These 26 operations use environment-configured API base URLs, in-memory bearer authentication, centralized error handling, timeout handling and canonical paginated lists. ISO dates are formatted for display. Money is supplied in integer minor units; payment input converts decimal text to minor units exactly, and display preserves kobo. Mutations are never automatically retried after an uncertain network result.

`vendor/` is a read-only snapshot extracted from the committed Git object, including canonical index, OpenAPI, README and fixture source. It is not a competing contract. No uncommitted backend files were copied.

## 3. Authentication status

Account-number/password login, setup/reset, password changes, sessions, recovery and logout are connected. Tokens remain in memory; no refresh-token flow is invented. Reloading requires login again. A server 401 clears authenticated state; the server expiry timestamp also schedules local session clearance. First-password-change accounts are gated to Account Security without loading protected dashboard data.

Setup codes are entered in a password field, never read from URLs, logged or displayed from API responses. Recovery acknowledgements do not reveal whether the account exists. Logout requests server revocation and clears local credentials. Only phone information is editable; customer identity, permissions, order eligibility, payment verification and activation remain server responsibilities.

## 4. Real backend workflows verified

Tests used the actual HTTP API and persistent development database. The data is explicitly SIMULATED; this is not a live commercial provider integration.

The opt-in acceptance run passed 13 workflow groups: isolated staff-created account setup; single-use setup codes; login/session identity; customer-specific dashboard and phone update; available and UNKNOWN coverage; service order creation/detail; payment reporting; unconfirmed receipt 409; cross-customer 404s; finance confirmation and receipt; support creation/detail/reply; notifications/capabilities/guidance; password change and revocation; seeded subscriptions/payment records; generic recovery; and logout. Related assertions are grouped in the machine-readable results.

A separate isolated imported account verified the actual `mustChangePassword=true` scenario: dashboard access returned 403, password change succeeded, previous access was cleared and new credentials loaded the dashboard. This temporary account was supplied by Agent 1 specifically for this test. No shared fixture password was changed.

A separate real HTTP check reused a bearer token after logout and received 401. Password change also invalidated another already-authenticated session, which the adapter handled as 401. Natural clock expiration is covered by the adapter’s expiry-timer unit test using an expired session fixture; a full-duration real session was not left idle to expire.

Cross-account attempts to read orders, receipts or tickets, and to reply to another customer’s ticket, returned 404. Reporting a payment left it REPORTED; authorized finance confirmation changed the order to PAID but did not create or activate a subscription.

Browser checks exercised login, dashboard, profile phone save, support history and reply, service order creation, payment report confirmation, UNKNOWN coverage, guidance, mobile navigation and logout. Read-only fixture browsing did not mutate shared customer records. Mutation tests used isolated labeled accounts. Credentials and codes were read only from ignored local files and were not logged or captured in evidence.

## 5. Mock-only features remaining

The explicit standalone mock provider remains available for isolated UI work, including all Stage 2 forms and a labeled demo account. None of the required connected customer operations depends on a mock fallback. Live mode uses actual API responses and shows errors when requests fail. API-provided simulated records have a different banner from browser-only demo mode.

Demo credentials and the demo setup code work only in mock mode. Mock changes are memory-only. Real development changes persist in the backend database. New test credentials are held only in ignored `.local/`; they are not bundled or committed.

## 6. Unavailable external capabilities

- Live gateway charging, bank verification, refunds and automatic payment execution are unavailable. The portal only reports an existing payment for staff review.
- ISP usage/consumption and live network statistics are not connected. No graphs or usage values are fabricated.
- Provisioning is a separate backend workflow; the customer API provides subscription status, not a detailed customer provisioning-event feed. The frontend does not execute provisioning.
- Email and SMS delivery are simulated in the development environment. Notification metadata is shown without claiming real delivery or revealing outbox payloads.
- Guidance is the backend’s read-only, no-model implementation. No autonomous AI account operation or live customer-chat SDK is added.
- Invoice records and displayable service-address labels are not exposed by these v1 response models. Their existing empty/unavailable states remain honest.

## 7. Test results

- TypeScript strict typecheck passes for the canonical client and view definitions.
- Eleven automated tests pass, covering canonical schemas and bearer transport, required password gating, expiry timer, server 401 handling, pagination, malformed responses, explicit network/409 errors, exact minor-unit conversion and mock lifecycle/workflows.
- Canonical schema verification passes for every mock Customer, Plan, Subscription, Order, Payment, Receipt and TicketDetail record and the tested mutation shapes.
- Thirteen real HTTP/database workflow groups pass against v1.0.1. Separate mandatory-password-change and post-logout token-reuse checks pass.
- Sixty-eight connected page/width checks pass at requested widths 320, 390, 768 and 1280, including service, order, receipt and request details. The recorded actual browser viewport is used for overflow checks; none overflowed.
- The live browser console contained no errors during the final inspection.
- The static build passes and emits `dist/` with the public runtime configuration and bundled canonical validation code. Both live and mock configurations are explicit; no production deployment was performed.

Evidence is in `evidence/stage2/`: `live-e2e.json`, `password-gate.json`, `logout-revocation.json`, `responsive.json` and screenshots of the live development dashboard, services and payment-report confirmation.

## 8. Contract discrepancies

No incompatible endpoint or payload discrepancies were discovered in canonical v1.0.1. The limitations listed above are documented capabilities, not replacement frontend models. Ordinary token-based setup correctly clears the password-change flag; the separate gate test uses an imported temporary-credential account, matching Agent 1’s stated scenario.

The backend’s per-route throttling produced one 429 while agents were testing concurrently. Testing continued after its window; no rate limit was weakened and no fallback data was displayed. Browser error states retain the actual API error classification.

## 9. Remaining blockers

There is no blocker to local acceptance testing of the connected supported customer workflows. Keep Agent 1’s development API/database running and use staff-issued development credentials. The old Stage 1 demo credentials apply only to explicit mock mode.

Production acceptance still depends on the separately approved provider integrations, verified commercial plans/coverage, actual delivery channels and deployment configuration. These are outside this frontend-only integration stage. The frontend and backend remain on separate branches; no cross-branch merge or production publish was performed.
