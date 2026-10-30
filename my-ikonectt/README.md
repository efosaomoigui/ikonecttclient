# My Ikonectt — Stage 2

The approved customer portal is integrated with Shared API v1.0.1. The public website and Admin/CRM are unchanged. Development stays on port **4175**; the separate backend is **4000**.

## Run

Use Node 22.9 or later. From `my-ikonectt/`:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Open http://127.0.0.1:4175/. Keep the process running. The API must also be running. Agent 1’s development procedures are in its `backend/DEVELOPMENT.md`.

`.env` is ignored. Its public configuration fields are:

```text
IKONECTT_MODE=live
IKONECTT_API_BASE=http://127.0.0.1:4000/api/v1
PORT=4175
```

Only `mode` and `apiBase` are emitted into browser runtime configuration. No account credentials, setup codes, database URL or provider secrets belong in this configuration. CORS must allow the actual frontend origin. The development server serves only on loopback and blocks private directories.

Live mode uses staff-issued development credentials. Read those locally from the ignored account document supplied by Agent 1; no passwords or setup codes are published in source or this report. A dedicated isolated account created by the opt-in test is also available in ignored `.local/e2e-browser.json`. Do not use these accounts outside the development environment.

For the approved isolated mock experience, set `IKONECTT_MODE=mock` in `.env` and restart. The Stage 1 account `10000001` / `IkonecttDemo!2026` works **only in explicit mock mode**. All mock activity is visibly labeled and resets on reload. Live failures never switch providers.

## Build and checks

```powershell
npm run typecheck
npm test
npm run build
```

The static bundle is in `dist/`. Build reads the same environment configuration as development. Browser JavaScript has no external CDN dependency. No production deployment has been performed. The existing public showcase build intentionally does not package this separately owned product.

`client.ts` uses the canonical `createApiClient` and Zod schemas for typed input/output validation. `compile-contracts.mjs` bundles this shared runtime for the browser. `live.js` maps canonical records into presentation models. `api.js` selects an explicit independent mock adapter. HTTP is confined to the service layer. TypeScript view models derive their wire types from the authoritative snapshot, rather than declaring a competing API.

The read-only snapshot in `vendor/` was extracted from committed backend contract `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`. `vendor/provenance.json` identifies its origin. It includes the exact canonical index, OpenAPI document, README and fixtures. Updating it requires a published stable Agent 1 commit:

```powershell
node sync-contracts.mjs <approved-commit>
node compile-contracts.mjs
```

This reads Git objects and writes only the portal’s vendor directory. It never edits canonical contracts or copies uncommitted backend files.

## Connected customer actions

Account setup/recovery, login/session/logout/password change, dashboard, phone update, subscriptions, published plans, service orders and order details, payment reporting, confirmed receipts, tickets and replies, recorded building coverage checks, notification delivery metadata, capabilities and read-only guidance are connected.

Orders appear within My Services. Payment reporting appears within Billing & Payments. Plans and coverage are reachable from My Services; guidance is reachable from Support. The approved navigation and visual language are preserved. Customer accounts cannot self-register.

Live bearer tokens stay in memory and have a timer based on the server expiry. Reloading requires sign-in because v1 has no refresh tokens. Authenticated navigation checks the session; a server 401 clears customer state. Mandatory password changes gate the dashboard. Logout calls the revocation endpoint and clears local state even if the network is unavailable. Recovery/setup codes are entered privately, never taken from URLs or logged.

Money enters/leaves the API as integer minor units; decimal input is converted without floating-point multiplication. Display supports kobo. Lists are paginated. Mutation network errors do not claim failure or success when the result is uncertain; the customer is asked to check history before resubmitting.

Payment reports remain unverified until authorized staff review them. Only confirmed payments expose receipts; a direct unconfirmed receipt route handles 409. Payment confirmation does not activate service. Coverage UNKNOWN requires verification. Invoice records, usage, service address labels and customer provisioning-event detail are not supplied by v1 and are never fabricated. Customer guidance has no model or write tools.

## Opt-in real API acceptance tests

These tests are restricted to a loopback development API. They read Agent 1’s ignored development account document in memory, staff-create isolated labeled test customers and retain the test records. They never overwrite shared fixture passwords. Do not run against production.

```powershell
$env:IKONECTT_TEST_ACCOUNTS = '<absolute path to Agent 1 development account document>'
npm run test:live
```

For a fresh isolated imported account that requires a first password change:

```powershell
$env:IKONECTT_PASSWORD_GATE_ACCOUNT = '<absolute path supplied by Agent 1>'
node tests/e2e-password-gate.mjs
```

That test consumes the isolated temporary credential; it is intentionally not repeatable with the original password. The changed isolated credentials remain only in ignored `.local/password-gate-completed.json`. Test output and evidence exclude passwords, bearer tokens and setup codes.

See `STAGE2_INTEGRATION_REPORT.md` and `evidence/stage2/` for results. Stage 1’s `DELIVERY.md` is retained as historical context.
