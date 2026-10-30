# Ikonectt shared API v1

Current contract release: **1.2.0**. Exact methods and role permissions are generated in
`ENDPOINTS.md`. See `FRONTEND_HANDOFF.md` for safe pinned-commit exports and progressive frontend integration.
The shared persistent development environment and local account procedure are in `backend/DEVELOPMENT.md`.

Integration branch: `codex/ikonectt-wallet-stage5a`. Independent NestJS service in `backend/`.
Base URL in development: `http://localhost:4000/api/v1`. Swagger: `/api/docs`.
Canonical request/response schemas and inferred TypeScript types: `index.ts`.
Generated language-neutral contract: `openapi.json` (run `npm run contracts` from backend).
All changes before integration are recorded in `CHANGELOG.md`.

## Customer portal integration

| Method | Path relative to /api/v1 | Input / response |
| --- | --- | --- |
| POST | /auth/login | LoginRequest / Session; accountNumber + password |
| GET | /auth/session | Session.principal |
| POST | /auth/logout | Ok; revokes current session |
| POST | /auth/recovery | RecoveryRequest / Ok; generic acknowledgement, no token |
| POST | /auth/staff/recovery | StaffRecoveryRequest / Ok; generic acknowledgement, no token |
| POST | /auth/reset-password | ResetPasswordRequest / Ok; single-use setup/recovery token |
| POST | /auth/change-password | ChangePasswordRequest / Ok; revokes all sessions; sign in again |
| GET/PATCH | /me/profile | Customer / UpdateProfileRequest; phone only |
| GET | /me/dashboard | Dashboard; usage=null until external usage provider connected |
| GET | /me/subscriptions | page(Subscription) |
| GET/POST | /me/orders | page(Order) / CreateOrderRequest |
| GET | /me/orders/:id | Order |
| GET/POST | /me/payments | page(Payment) / ReportPaymentRequest |
| GET | /me/payments/:id/receipt | Receipt; confirmed payments only |
| GET/POST | /me/tickets | page(Ticket) / CreateTicketRequest |
| GET | /me/tickets/:id | TicketDetail (Ticket + messages) |
| POST | /me/tickets/:id/messages | TicketMessageRequest / TicketMessage |
| GET | /me/notifications | page(Notification); delivery metadata only |
| GET | /capabilities | Provider modes and unavailable capabilities |
| POST | /assistant/guidance | AssistantRequest / AssistantResponse; read-only guidance |
| GET | /plans | page(Plan); published plans only |
| GET | /coverage/locations | page(CoverageLocation); filter parentId or level |
| POST | /coverage/check | CoverageCheckRequest / CoverageResult |
| POST | /leads | CreateLeadRequest / {id,status}; no customer creation |

All authenticated requests require `Authorization: Bearer <accessToken>`.
Keep tokens in memory. Sessions are revocable; there is no refresh-token endpoint in v1.
There is no public registration. Staff creates the customer and gets a 30-minute setup token once.
Deliver that token to the verified customer through an approved channel, then POST reset-password.
Missing/expired sessions produce 401, insufficient permissions 403, unknown/other-customer records 404.
Lists use `?offset=0&limit=25`, at most 100; response `{items,total,offset,limit}`.
Dates are ISO-8601 UTC. Money is integer minor units: 1500000 = NGN 15000.00.
Use the provided schemas and `createApiClient` or generate a client from OpenAPI.

## State rules

Payment REPORTED -> CONFIRMED/REJECTED is a finance-authorized operation.
Confirmation sets the order PAID, with no automatic subscription activation.
Provisioning is a separate authorized action and requires confirmed payment and verified address eligibility.
Renewal/plan-change orders identify an owned existing subscription. Requests cannot change another account.
An UNKNOWN coverage result means the address needs checking, not that it is unavailable.
SIMULATED fixtures and provider results must remain visibly labeled. No live provider is connected.
Receipt requests for unconfirmed payments return 409. External usage is unavailable; never fabricate it.

## Admin integration

POST `/auth/staff/login`, then `/admin/customers`, `/admin/staff`, `/admin/plans`,
`/admin/coverage`, `/admin/leads`, `/admin/orders`, `/admin/payments`,
`/admin/subscriptions`, `/admin/provisioning`, `/admin/tickets`, `/admin/reports/summary`,
`/admin/audit`, `/admin/integrations` and `/admin/notifications`.
OpenAPI specifies each supported operation. GET `/admin/permissions` returns the signed-in staff permissions.
Role/action permissions are enforced server-side; SUPPORT cannot verify payments or provision service.

## Development startup

From backend: `npm ci`; from contracts: `npm ci`; copy backend `.env.example` to `.env`,
set a dedicated PostgreSQL URL and random notification encryption key, then in backend:
`npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`.
Seed requires explicit `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` environment variables.
No default password or production catalogue is shipped. See backend README for full setup.

## Internal wallet extension1.1.0

See [WALLET_HANDOFF.md](WALLET_HANDOFF.md) for canonical schemas/routes, lifecycle, permissions, idempotency and manual verification boundaries.
