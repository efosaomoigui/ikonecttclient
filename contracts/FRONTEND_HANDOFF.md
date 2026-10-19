# Shared API v1 frontend handoff

Contract version: **1.0.1**, backward compatible with Stage 1 v1.0.0. Same 59 paths / 75 operations.
The exact released Git commit is recorded in `backend/STAGE2_REPORT.md` and the integration handoff message.
The public website template decision does not change these API boundaries.

## Consume committed contracts safely

Separate worktrees share Git objects but not checked-out files. Do not import an uncommitted sibling
worktree path or assume a backend commit has appeared automatically in your frontend checkout.

One safe review/export workflow, from your own repository checkout, is:

```powershell
$contractCommit = '<exact full commit supplied in handoff>'
git show --stat $contractCommit
git show "${contractCommit}:contracts/index.ts"
# Choose a new empty location outside your source files:
$contractArchive = Join-Path $env:TEMP "ikonectt-contracts-$contractCommit.zip"
$contractExport = Join-Path $env:TEMP "ikonectt-contracts-$contractCommit"
git archive --format=zip --output=$contractArchive $contractCommit contracts
Expand-Archive -LiteralPath $contractArchive -DestinationPath $contractExport
```

Review that immutable export, then import/vendor the reviewed contract package under your own ownership
or integrate the reviewed commit through the project's agreed Git process. Record the exact commit hash.
Do not use `git checkout <commit> -- contracts` over local changes or cherry-pick backend-owned files blindly.
No destructive reset, force push or merge of unrelated frontend work is needed.
The contract package's peer dependency is Zod 3; run `npm ci` in the exported contracts package if evaluating
its TypeScript fixture schemas. Do not export backend `.env`, `.local/`, DB archives or account files.

Canonical files: `index.ts`, generated `openapi.json`, generated `ENDPOINTS.md`, `fixtures.ts` and changelog.
`contracts:check` in the backend verifies that the checked-in schema and endpoint/permission map match runtime metadata.

## Shared transport and session conventions

- API base URL: `http://localhost:4000/api/v1`; `127.0.0.1:4000` is equivalent on this machine.
- The exported `createApiClient` takes the **origin only**, such as `http://localhost:4000`; it appends `/api/v1`.
- Custom clients taking the full API base must append resource paths only. Avoid a doubled `/api/v1` prefix.
- `Authorization: Bearer <accessToken>`; keep tokens in memory and out of URLs/localStorage.
- `Session` includes `mustChangePassword`. Gate normal application queries until password change completes.
- Password change/reset revokes all old sessions. Clear tokens and require sign-in again.
- No refresh-token endpoint or public registration exists in v1. Logout revokes the active session.
- Successful writes return 200; lists return `{items,total,offset,limit}` with default 25 and maximum 100.
- Dates are UTC ISO-8601; money is integer minor units (`1500000` = NGN 15,000.00).
- Errors are `ErrorResponse`: statusCode/code/message/requestId and optional validation details.
- 401: session missing/expired; 403: permission/password gate; 404: missing or inaccessible record;
  409: workflow/duplicate state conflict; 413: body too large; 429: quota reached, respect Retry-After.

Default development CORS permits localhost/127.0.0.1 ports 3000, 3001 and 4173-4176. Request an explicit
additional origin if necessary; do not work around CORS with a wildcard or change backend permissions.

## Agent 2 - My Ikonectt

See `README.md` for customer route/schema mappings and `ENDPOINTS.md` for exact methods.

| Portal view | Existing API |
| --- | --- |
| Welcome/login/recovery | /auth/login, /auth/recovery, /auth/reset-password |
| Session/security | /auth/session, /auth/logout, /auth/change-password |
| Dashboard | /me/dashboard |
| My Services | /me/subscriptions and /me/subscriptions/{id} |
| Orders | /me/orders and /me/orders/{id} |
| Billing/payments | /me/payments |
| Receipts | /me/payments/{id}/receipt; confirmed payments only |
| Support | /me/tickets, detail and /messages |
| Profile | GET/PATCH /me/profile; PATCH phone only |
| Notifications | /me/notifications; delivery metadata only |
| Plan/coverage discovery | /plans, /coverage/locations, /coverage/check |
| Assistance | /assistant/guidance and /capabilities |

Use the local ignored account manifest described in backend/DEVELOPMENT.md for Residential/Business/Suspended
accounts. Onboarding must remain staff-controlled: setup tokens are issued once to authorized staff,
expire in 30 minutes and are exchanged through the existing reset-password endpoint. Never display them
as a public registration flow. The development validator has completed setup for working shared accounts.
Do not expose customer IDs as an authority selector; /me scope comes from the session.

## Agent 3 - Admin/CRM

Sign in with `/auth/staff/login`; recovery is `/auth/staff/recovery`. Retrieve `/admin/permissions`
after sign-in/password setup and gate the UI by returned permissions, while retaining backend enforcement.
ADMIN is the highest role; there is no SUPER_ADMIN enum, second authentication system or unrestricted bypass.

| Admin view | Existing resource / action |
| --- | --- |
| Dashboard/reports | GET /admin/reports/summary |
| Leads | /admin/leads list/detail/update |
| Customers | /admin/customers list/detail/create/update and POST {id}/credentials |
| Staff/roles/highest-admin controls | /admin/staff list/create/update; staff.manage |
| Plans | /admin/plans list/create/update |
| Coverage | /admin/coverage list/create/update |
| Orders | /admin/orders list/detail/create |
| Payments | /admin/payments list/detail/report; POST {id}/verify; confirmed receipt |
| Subscriptions | /admin/subscriptions list/detail |
| Provisioning | /admin/provisioning list/request; POST {id}/result for manual requests |
| Support | /admin/tickets list/detail/create/update/messages |
| Audit | GET /admin/audit |
| Integration status/references | /admin/integrations and documented lookup/reference methods |
| Notifications | GET /admin/notifications |

Check `ENDPOINTS.md`: this table does not imply delete endpoints, arbitrary status editing or unrestricted CRUD.
The six staff roles are ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER and EXECUTIVE. Role-specific local
credentials are in the ignored development account manifest; no credentials are included in contracts.
SUPPORT cannot verify payments or provision; FINANCE cannot provision; EXECUTIVE has summary reporting only.

## Progressive mock-to-live transition

Keep existing UI components and introduce/configure one API transport adapter behind their existing data
boundary. Move one view/workflow at a time from schema-validated simulated fixtures to real API responses.
Do not silently fall back to fixtures after an authenticated API error; display the actual unavailable/error
state. Keep the user's session in memory and project minor-unit amounts only at the display boundary.

Both frontend mock mode and the shared development DB are SIMULATED business information, even when HTTP
and persistence are real. Show simulation labels. Unknown coverage is not unavailable coverage. A payment
report is not financial confirmation, and PAID is not ACTIVE. Receipts before confirmation return 409.
Usage remains null with EXTERNAL_PROVIDER_NOT_CONNECTED. Notifications may be QUEUED/FAILED/SIMULATED;
none of those statuses means a real message was sent. Map assistant API resource hints to frontend routes.

## Provider capabilities and change requests

No live gateway, ISP, legacy CRM, email, SMS or usage provider is connected. The development adapter modes
are visible through /capabilities; configuration and API authorization remain backend-owned.

For a missing capability: first check the current schema and operation map, then report the concrete
workflow gap to Agent 1. Changes require architecture review, a compatible implementation, schema/OpenAPI,
tests, changelog, an exact committed revision and a message to both affected frontend owners.
Do not invent a parallel endpoint or patch backend files from a frontend worktree.
