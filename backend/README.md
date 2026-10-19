# Ikonectt core backend

Independent TypeScript/NestJS API for the Public Website, My Ikonectt and Admin/CRM.
Uses PostgreSQL 16+ and Prisma. Frontend files and the existing showcase server are unchanged.

Stage 2 shared integration setup: see `DEVELOPMENT.md` for the persistent development database,
repeatable SIMULATED data, guarded backup/reset, local accounts and real API workflow validation.
Future approved provider connection steps are in `PROVIDER_READINESS.md`; frontend handoff is in
`../contracts/FRONTEND_HANDOFF.md`. Stage 1 test infrastructure below remains separate.

## Run locally

Use Node 22.19+ (or a compatible current release) and npm. This implementation was verified with Node 25.9 and PostgreSQL 16.13 on Windows.

1. In `contracts/`, run `npm ci`.
2. In `backend/`, run `npm ci` and `npm run db:generate`.
3. Copy `.env.example` to `.env`. Set a dedicated `DATABASE_URL`, explicit CORS origins and a random `NOTIFICATION_ENCRYPTION_KEY` (64 hex characters).
4. Start your database. Optionally set `POSTGRES_PASSWORD` and run `docker compose up -d postgres` if Docker is available. The compose database listens on loopback only.
5. Run `npm run db:migrate`.
6. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (at least 12 characters) and run `npm run db:seed`. It never overwrites an existing user's credentials and seeds no plans or customers.
7. Run `npm run dev`, or `npm run build` followed by `npm start`.

Default address: `http://localhost:4000/api/v1`. Swagger UI: `http://localhost:4000/api/docs` outside production. `HOST` defaults to loopback; use `0.0.0.0` explicitly inside a private container with an HTTPS reverse proxy.
Prisma binary downloads on managed Windows networks may require `NODE_OPTIONS=--use-system-ca` with recent Node; TLS certificate verification must remain enabled.

The seeded administrator must change their password before operational API use:
`POST /auth/staff/login`, `POST /auth/change-password` with current/new password,
then sign in again. Sessions are revoked on password change.

## Customer onboarding

Authorized SALES/ADMIN staff creates a customer through `POST /admin/customers`.
The response contains the stable customer UUID, account number, and a single-use, 30-minute setup token.
Staff must deliver this token through an approved channel after verifying the customer's identity.
The same token is queued in an encrypted notification outbox. `POST /auth/reset-password`
sets the initial password. The customer signs in using account number and password.
No public registration endpoint exists. Creating a customer or lead creates no subscription.

Generated development account numbers are eight digits, labeled `accountNumberSimulated: true`.
Staff may replace them with official identifiers through PATCH customer. The UUID and operational
history remain unchanged; previous sessions are revoked. External references are separately unique
by system/external ID and by customer/system.

## Contracts and frontend integration

Canonical schemas, inferred types and client helper: `../contracts/index.ts`.
OpenAPI: `../contracts/openapi.json`. Run `npm run contracts` to regenerate without a running DB.
Labeled fixtures: `../contracts/fixtures.ts`; they are never automatically inserted into production.
Route and integration guide: `../contracts/README.md`. Change record: `../contracts/CHANGELOG.md`.
All successful writes return HTTP 200. Lists use `{items,total,offset,limit}`.
Prices are integer NGN minor units, not floating-point naira amounts.
The client helper takes the host origin (for example `http://localhost:4000`), and appends `/api/v1`.
Assistant links are API resource hints; each frontend maps them to its own routes.

## Operational workflows

1. Publish an approved plan. Current price is edited directly; no price-version table exists.
2. Create the six-level coverage hierarchy. Only a building/address can have final eligibility.
   AVAILABLE without a selected plan mapping does not establish eligibility for that plan.
3. Create an order for an active customer, matching published plan and verified address.
   The order snapshots plan name, amount, currency and billing period.
4. Customer or authorized staff reports a payment. Amount/currency must match the order.
   This remains REPORTED, and the order remains PENDING_PAYMENT.
5. FINANCE/ADMIN verifies bank evidence, recording actor/time/reference/evidence. A confirmed
   payment sets the order PAID, without activating or creating a service subscription.
6. PROVISIONER/ADMIN requests provisioning separately. Manual mode creates a PENDING
   subscription and FULFILLING order. Authorized staff records the verified network outcome.
7. An ACTIVE outcome completes the order and updates service dates/reference exactly once.
   Failure/uncertain response remains FAILED/REQUIRES_REVIEW. Existing service is preserved if
   a renewal/change fails. Duplicate confirmations and provisioning requests cannot duplicate fulfillment.

Renewal extends from the later of now or the current end date. Plan change uses the selected order's
full billing period starting at fulfillment; no proration/refund calculation is invented. These local
dates represent recorded contractual periods, not live ISP usage/health. External ISP/billing systems
remain authoritative. Stale status must be reconciled when their APIs become available.

Customer profiles permit self-edit of phone only. Email, account identifier, classification and status
changes require staff authorization. Suspended customers can view records and contact support but
cannot order/pay; closed accounts cannot authenticate. Business accounts have one issued login per
customer record in this baseline; additional delegated memberships require approved requirements.

## Permissions

| Role | Operations |
| --- | --- |
| ADMIN | All defined operations; cannot remove the final enabled administrator |
| SUPPORT | Read customers/orders/payments; manage support queues |
| SALES | Read/write customers, leads and orders; report payment |
| FINANCE | Read customer/order/payment records; verify payments; reports |
| PROVISIONER | Read customers/orders; manage coverage and provisioning |
| EXECUTIVE | Summary reporting |

Permissions are checked on every server request, including customer ownership. Customer endpoints
reject staff sessions. Audit records include actor, action, entity, timestamp and bounded metadata.
The database rejects updates/deletes to audit records. Operational writes and their audit entries
commit in one transaction. Credential plaintext is never stored in audit metadata.

## Adapter configuration

| Variable | Modes | Default |
| --- | --- | --- |
| PAYMENT_ADAPTER | manual / disabled / simulated | manual |
| COVERAGE_ADAPTER | native / disabled / simulated | native |
| PROVISIONING_ADAPTER | manual / disabled / simulated | manual |
| LEGACY_ADAPTER | disabled / simulated | disabled |
| EMAIL_ADAPTER / SMS_ADAPTER | disabled / simulated | disabled |
| SIMULATOR_SCENARIO | success / failure / timeout | success |

Contracts and implementations are in `src/integrations/adapters.ts`. Native coverage is in
`src/catalogue/catalogue.service.ts` and implements the CoverageProvider interface. Gateway initiation
and verification interfaces are prepared but not exposed as a live gateway API. Manual payment
recording is independent of gateway selection. No webhook accepts unsigned payment assertions.

Simulation is restricted to development/test. Staging and production fail startup if a simulated
adapter is configured. Simulated plans/addresses cannot be used for real manual provisioning.
Coverage orders always validate the persisted native building/plan verification, including when
the public coverage adapter is simulated. Neither mock CRM lookup nor references import or activate
accounts automatically. There is no live provider connection in this implementation.

Run `npm run notifications:work` from a scheduler to drain at most 100 outbox messages per invocation.
Jobs use PostgreSQL SKIP LOCKED with a lease, retry up to five attempts and require provider idempotency
keys. Credential-bearing payloads are AES-256-GCM encrypted and cleared after delivery/simulation.
Queued/failed payloads are never returned by the API. Disabled channels retry and eventually fail;
an acknowledgement from recovery does not imply delivery. A simulated send is marked SIMULATED,
never SENT. A production email/SMS adapter and approved templates are required for real delivery.
Redis/BullMQ is deliberately deferred: the bounded outbox does not yet justify another service.
Its provider boundary permits moving to BullMQ when throughput/scheduling requires it.

The assistant currently uses bounded direct guidance, no model and no autonomous tools. It cannot
create orders, verify payments, modify accounts or provision services. It offers authenticated support
resources for escalation. Future account reads must add server-side, customer-scoped authorization.

## Verification

Integration tests require a dedicated database whose name ends in `_test`; never point them at production.
They leave labeled test records in that database, avoiding any destructive automatic cleanup.

For the supplied local PostgreSQL helper, from backend:

```powershell
node scripts/test-db.cjs
# Keep that terminal open. From another backend terminal:
node --env-file=.env.test.local node_modules/prisma/build/index.js migrate deploy
npm run build
npm run contracts
npm test
npm run test:smoke
node scripts/test-db.cjs stop
```

Set `PG_BIN` if PostgreSQL binaries are elsewhere; set `TEST_PG_PORT` before first initialization
to change port 55439. The helper stores credentials only in ignored `.env.test.local`; data/logs are
under ignored `tmp/`. Existing installed PostgreSQL service/databases are not modified.
For another test database set `TEST_DATABASE_URL`, `DATABASE_URL` and `NOTIFICATION_ENCRYPTION_KEY`
explicitly and apply migrations before running tests.

## Environment and release notes

Development/test can use simulators. Staging uses a dedicated database, explicit HTTPS origins and
approved sandbox/manual integrations. Production must use HTTPS, secrets from the hosting platform,
a distinct encryption key, least-privilege runtime DB credentials, backups and monitoring.
Use a migration-owner role for deploy migrations and restrict runtime access to required tables.
Do not expose PostgreSQL, Swagger or outbox payloads publicly. Do not forward untrusted proxy headers.

Rate limiting is currently per process. Use one API instance for this baseline; configure a shared
ThrottlerStorage implementation (for example Redis) before horizontal scaling. Sessions/reset tokens
are hashed, database-backed, expiring and revocable. The browser should hold bearer tokens in memory;
this API does not implement refresh tokens, public signup, impersonation, delegated business logins,
refunds, gateway webhooks, automatic expiry/reconciliation or an autonomous assistant.

`GET /api/v1/health` verifies database connectivity. Production logging records request IDs and error
types, excluding payloads/credentials. Configure platform metrics, TLS, backup/restore verification,
session/outbox retention and a rollback plan before deployment. Rollback uses a tested DB backup and
previous application build; the initial migration is forward-only and is not automatically dropped.

The approved visual blueprint is the architecture baseline. No separate detailed ERD, production
catalogue, verified coverage dataset or external API documentation was supplied. See `ARCHITECTURE.md`
for the proposed relational model and explicit remaining discovery items.
