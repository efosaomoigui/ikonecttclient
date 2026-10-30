# Agent 2 delivery — 19 October 2026

Branch: `codex/my-ikonectt-portal`. Scope: the new `my-ikonectt/` directory only.

## 1. Screens

Welcome page with hero, benefits, connected process flow and closing CTA; sign-in; recovery request; setup/recovery code and password form; account access help; overview dashboard; services and individual service detail; billing and payment records; printable receipt detail; support request form, history, confirmation and request timeline; profile; password change; capability-dependent notifications; loading, error, unavailable, empty and missing-record states.

## 2. Customer journeys

Verified in browser: welcome → login → dashboard; incorrect login → feedback → successful login; overview → services → service detail; billing → receipt detail; support → new request → confirmation and detail; support history → request detail; profile → account security; logout → login; protected URL after logout → login; recovery → generic acknowledgement → recovery-code destination. Mobile menu opens, navigates and closes on route changes. Escape closes it.

Unit checks cover password change, session invalidation, new credential acceptance, invalid and consumed recovery codes, support persistence during the current demo session, immutable fixture returns, live token invalidation, strict request payloads, money conversion, and unavailable fields. No real customer credentials were changed during browser QA.

## 3. Visual assets

- Official existing `assets/brand-logo-red.svg`, copied into the portal as `assets/logo.svg`.
- Existing `option-e/images/my-ikonectt-woman-1672.webp`, copied as `assets/welcome.webp`; customer stays in frame at each responsive crop.
- Existing local Plus Jakarta Sans Latin font, copied into portal assets.
- CSS-native account panels and service visual; no remote asset or generic placeholder dependency.

## 4. API contracts

Read Agent 1's published shared v1.0.0 contracts from the separate backend worktree. Live adapter implements `/auth/login`, `/auth/session`, `/auth/logout`, `/auth/recovery`, `/auth/reset-password`, `/auth/change-password`, `/me/profile`, `/me/dashboard`, `/plans`, `/me/orders`, `/me/payments`, `/me/payments/:id/receipt`, `/me/tickets`, `/me/tickets/:id` and `/me/notifications`.

Lists use offset/limit pagination. Ticket creation sends `{subject,message}`. Change password sends `{currentPassword,password}`. Account numbers remain strings of variable length; permanent IDs remain separate. Authentication, data ownership and permission enforcement remain server responsibilities. No public registration, payment execution or service activation was added.

## 5. Live integrations

Live adapter and configuration switch are implemented and tested against contract-shaped fetch responses. Actual backend/provider connectivity has not been smoke-tested: Agent 1 is still building the separate service, and no running seeded customer backend was supplied during this handoff. No live financial, ISP, email, SMS or chat provider is claimed as connected.

## 6. Simulations and remaining integration

Default mode is visibly labeled mock. Customer profile, service, payment, receipt and support records use canonical wire fixtures; mutations are in-memory test actions. Remaining: run the API, staff-create a customer, allow the portal origin, switch configuration to live, then perform live acceptance tests. External usage and invoice records are unavailable in v1 and have honest unavailable/empty states. Notification delivery is shown only as the available metadata. Chat awaits the separately approved customer-care implementation.

## 7. Responsive and visual results

64 route/width checks passed at requested viewport widths 320, 390, 768 and 1280, covering nine welcome/authenticated routes, four public account-access routes and three record-detail routes. Browser rounded some CSS viewports by one pixel; actual viewport and scrollWidth values are recorded in `evidence/responsive.json` and `evidence/public-responsive.json` and `evidence/detail-responsive.json`. No measured document exceeded its actual viewport. Mobile welcome and dashboard, desktop welcome, login, service, receipt and request screens were inspected in the browser. Evidence screenshots are local files in `evidence/`.

## 8. Build and tests

`node build.mjs` passes and creates an independent static bundle. `node --test --test-reporter=spec tests/*.test.mjs` passes. Wire fixtures pass Agent 1 canonical Zod schemas for Customer, Plan, Subscription, Order, Payment, Receipt and TicketDetail; mutation examples pass CreateTicketRequest and ChangePasswordRequest. JavaScript syntax checks pass. The public showcase build was not changed or run; it packages other products and is outside this frontend work boundary.
