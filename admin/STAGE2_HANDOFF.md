# Stage 2 Admin integration readiness

Current status: superseded by [Stage 2 integration report](STAGE2_INTEGRATION_REPORT.md). Real development staff login and 15 live acceptance groups have now passed; historical readiness observations below are retained for context.
Contract baseline: Agent 1 commit `61aa3ba`, API v1. Admin branch: `codex/ikonectt-admin-crm`. This audit modifies only `admin/`; it does not modify backend services or canonical contracts.

## Local origin and transport

- Primary Admin origin: `http://127.0.0.1:3013`.
- Optional localhost alias to allow if used: `http://localhost:3013`.
- Frontend path: `/admin/` (paths are not part of a CORS origin).
- Browser requests use relative `/api/v1/...`; Vite proxies `/api` to `http://127.0.0.1:4000` by default. `IKONECTT_API_ORIGIN` can override the target.
- Staff login: `POST /api/v1/auth/staff/login`.
- Permission discovery: `GET /api/v1/admin/permissions` with the session bearer token in memory.
- Highest role is ADMIN. There is no separate Super Admin role or frontend bypass.

The backend's public `/api/v1/capabilities` endpoint responded HTTP 200 during this audit. It reported manual payments/provisioning, disabled legacy/email/SMS, native coverage, guidance-only assistance and unavailable external usage. This proves public service reachability only; it does not establish authenticated workflow readiness, database fixture completeness or any live external connection.

## Compatibility changes

Shared schema and permission snapshots have been synchronized from the published backend worktree. Their source hashes are in `vendor/provenance.json`. The integration status renderer now recognizes the published coverage mode `native` as the native address registry, alongside its earlier label. Manual workflows remain distinct from configured external automated providers, and simulated providers remain explicitly simulated.

## Genuine backend capability gaps

These are absent from API v1 and should remain explicitly unavailable rather than receive invented CRUD:

- Lead assignee, source metadata, private notes, activity history and scheduled follow-ups.
- Ticket categories, priority and private internal staff notes, separate from customer-visible messages.
- Custom permission definitions, custom roles and editable operational settings.
- Integration credential/configuration management; current APIs expose status, legacy lookup and external customer references.
- Server-side record search/filtering beyond the published list query fields. Admin currently retrieves offset/limit pages and searches locally; this needs an agreed server contract for larger datasets.
- A minimal staff assignment directory available to support operators, if assignment should use a name picker instead of staff UUID entry. `/admin/staff` currently requires `staff.manage`; that broad privilege should not be granted just for a picker.

Real provider credentials, API documentation, live billing/usage and automated provisioning are environment/integration prerequisites, not reasons to create competing backend services.

## Existing backend capabilities that are not missing contracts

Staff recovery, password reset, customer credential reissue and notification listing are already published backend capabilities. The Admin frontend currently includes sign-in, forced password change, logout and initial customer setup-token display. Recovery/reset screens, credential reissue controls and a notification delivery view would be frontend follow-up work if included in the next acceptance scope; they must not be reported as missing backend endpoints.

## Validation required after role/account handoff

Use the dedicated persistent development database and supplied repeatable SIMULATED fixtures. Do not use production credentials or change canonical schemas for the frontend.

1. Verify staff login, forced password change, server permissions and logout/revocation for each supplied role.
2. Verify restricted roles receive actual server 403 responses for staff management, finance verification and provisioning operations.
3. Exercise staff customer creation, one-time setup-token display and customer account setup through the shared identity service.
4. Verify plan publication, building eligibility, customer order creation and related records against persistent data.
5. Verify reported payment → finance confirmation → separate manual provisioning → verified service state. Repeat invalid and duplicate decisions.
6. Verify ticket creation, assignment, customer-visible conversation, closure and related customer history.
7. Verify integration labels, report totals, receipts and audit events against the development records.
8. Complete browser visual/responsive acceptance; automated DOM tests are not rendered-layout verification.

The previously documented browser security-policy rejection still limits automated visual inspection. Authenticated integration results must be recorded only after the account/setup handoff; no successful real staff login is claimed by this audit.

## Readiness verification

The synchronized review build and all 25 automated frontend tests pass. The production build also passes. No authenticated backend workflow is claimed by these frontend tests.
