# IKONECTT — ADMIN/CRM STAGE 2 INTEGRATION REPORT

19 October 2026. Scope: Admin/CRM frontend only. No production deployment.

Pinned canonical backend/contract commit: `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`.
API version: **1.0.1**, with 59 paths and 75 supported operations. The vendored schemas, permission definitions and generated operation map are read from that immutable Git commit; provenance hashes are recorded in `vendor/provenance.json`. Backend readiness documentation was subsequently published at `948dfa10aaba44930feb1bf9433cb1d0b8c01cf0`.

## 1. Screens integrated

Staff login/security and recovery; dashboard; leads; customers; plans; coverage; orders; payments/receipts; subscriptions; provisioning; support tickets/conversations; staff/roles; reports; audit; integration status/customer references; and notification delivery metadata.

The approved stylesheet, official logo images and font are unchanged. The existing sidebar/topbar, six-card overview composition, tables, forms, dialogs and responsive CSS are retained. Required recovery/setup controls and Notifications use the existing components. Automated preservation checks compare stylesheet content with normalized line endings and binary logo/font hashes against Stage 1 commit `d321f76`. This is source preservation evidence, not a rendered visual inspection.

## 2. API operations connected

| Area | Connected operations |
| --- | --- |
| Identity | POST staff login/recovery, GET session, POST reset/change-password/logout |
| Authorization | GET `/admin/permissions`; server remains authoritative |
| Overview/reporting | GET `/admin/reports/summary` |
| Customers | GET list/detail, POST create, PATCH permitted fields, POST credential setup |
| Leads | GET list/detail, PATCH status/customer linkage |
| Plans | GET list, POST create, PATCH current attributes/prices/publication |
| Coverage | GET list with documented pagination/level/parent parameters, POST create, PATCH building eligibility |
| Orders | GET list/detail and POST staff order |
| Payments | GET list/detail, POST report/verify and GET confirmed receipt |
| Subscriptions | GET list/detail |
| Provisioning | GET list, POST request and POST evidenced manual result |
| Support | GET list/detail, POST create/message, PATCH assignment/status |
| Staff | GET list, POST create, PATCH enabled state/roles |
| Administration | GET audit/integration/notifications; GET/POST customer external references |
| Public validation/options | GET published plans/coverage locations and POST coverage check |

The transport provides bearer headers, timeout handling, structured error metadata, schema-validated responses and paginated reads. Tokens stay in memory. Responses from authenticated errors never fall back silently to fixtures. Search/status filtering remains local after fetching published offset/limit pages; unsupported server search parameters are rejected rather than invented.

## 3. Staff authentication status

**Passed real HTTP/database acceptance for all six roles:** ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER and EXECUTIVE. Session validation reads `/auth/session` and refreshes `/admin/permissions` on navigation/focus. Live sessions start with no inferred frontend role permissions; the backend supplies them.

An isolated temporary staff account exercised the required initial password change. Old sessions were rejected after password change, disabling the account and logout. Shared role passwords were not changed. Recovery returned a generic acknowledgement, and an invalid reset token was rejected. Actual email/SMS recovery delivery was not claimed or tested as live: those providers are simulated in development.

Use the ordinary staff sign-in form for persistent development integration. The approved local role manifest is the backend-owned ignored file `backend/.local/development/accounts-ikonectt_development.json`. Credentials are not committed or reproduced in this report.

## 4. Customer onboarding status

**Workflow A passed against the actual development API/database.** SALES created an isolated customer; the response supplied the permanent UUID, separate generated account number and a one-time setup token. The token was exchanged through `/auth/reset-password`; reuse was rejected. The customer then authenticated with account number/password and read `/me/dashboard` for the same customer.

The frontend displays setup tokens only in a temporary dialog after authorized creation/reissue. They are not placed in URLs, logs or browser storage. Staff can edit approved contact/classification/status fields, building association and account-number mapping. Customer creation remains staff-only. The customer authentication API used by My Ikonectt was verified; Agent 2's browser interface was not modified or tested here.

## 5. Plan/coverage integration status

**Workflows B/C passed.** A newly published plan appeared through the public catalogue API. A complete six-level hierarchy was created, UNKNOWN remained UNKNOWN, and an evidenced building update caused `/coverage/check` to return AVAILABLE with the selected plan mapping.

Parent-location forms lock final eligibility/plan mappings, and only building/address records offer eligibility editing. Maps remain optional. Published public plan/coverage reads provide safe form choices for roles that do not have catalogue administration access.

An order captured a plan's original amount; a subsequent direct plan-price change left that historical order amount unchanged. No price-versioning or independent frontend order transitions were introduced.

## 6. Payment/provisioning integration status

**Workflow D passed using actual server responses.** A reported transfer remained REPORTED, its order remained PENDING_PAYMENT, and receipt access returned 409. FINANCE confirmation changed the order to PAID while no subscription had been created or activated. A separate PROVISIONER request then invoked the configured development provisioning simulator. Its result and subscription were explicitly SIMULATED; a repeated request returned the existing provisioning record without duplicating it.

Payment rejection preserved the unpaid order state. The backend rejected an attempted manual-result override of a simulated provisioning request. The UI offers result editing only for unfinished manual requests and records the backend response without applying its own live state transitions.

The pending/active/failed/review-required states are supported and displayed. The live environment uses a simulated provisioning adapter, so a successful manual-provider activation was not exercised against a manual-configured runtime. Manual workflow behavior remains covered by the frontend adapter tests and the backend's published enforcement. No ISP activation, gateway charge or live bank verification occurred.

## 7. Support integration status

**Workflow E passed.** A customer created a ticket through `/me/tickets`; SUPPORT read the initial customer message, assigned the ticket, replied and resolved it. The customer API returned the updated status and the staff reply in the same conversation.

Replies are labeled customer-visible. Private notes, categories and priorities are not offered because they are absent from API v1. Assignment accepts a staff UUID when the operator lacks `staff.manage`; the interface does not broaden privileges just to populate a picker.

## 8. Role/permission test results

**Workflow F passed with actual HTTP 403 responses.** SUPPORT could not confirm payments, provision services or read staff administration. EXECUTIVE could not read customer lists. SALES could not mutate coverage eligibility. All six roles consumed the actual server permission response.

Staff enabled/disabled and role actions use the backend endpoints. The last enabled administrator protection remains server-controlled; the frontend does not introduce an alternative highest role or bypass. Last-admin rejection is covered in the frontend simulated adapter tests; no attempt was made to remove shared development administrators during the live acceptance run.

## 9. Mock-only functionality remaining

The separate development/review workspace still supplies temporary in-memory sample records and is explicitly labeled. It is optional; persistent development staff login now uses the actual backend. Production builds disable the simulation entry controls.

No supported administrative workflow intentionally depends on frontend-only records in live mode. Actual development HTTP/persistence and external provider simulation are different: the former is verified, while CRM, provisioning and messaging remain simulated or unavailable according to backend capabilities. No notification status is converted into an invented delivery success.

## 10. Contract discrepancies and boundaries

The earlier `native-address-registry` coverage capability label is now mapped compatibly alongside the released `native` value. Staff payment evidence uses AdminPayment; support conversation reads TicketDetail. Controller-composed customer setup and staff-ticket payloads match the published OpenAPI shapes. The operation-map test verifies module list/create/update actions exist in the pinned release.

Remaining absent capabilities: lead assignment/source/notes/follow-up activities; ticket category/priority/private notes; custom role/permission definitions; editable operational settings and provider credential configuration; server-side search/status filters; and a restricted staff assignment directory. These are documented gaps, not fabricated endpoints.

## 11. Tests passed

- **33 automated frontend tests**: schema/transport/session/permission/workflow checks; all screens mounting; customer search/detail/create; recovery/reset handling; parent eligibility controls; forbidden navigation; modal/logout behavior; canonical operation map; and approved CSS/logo/font preservation.
- **15 live acceptance groups** through `http://127.0.0.1:3013/api/v1` into the persistent `ikonectt_development` database. The test used local role credentials only in memory and created isolated records labeled SIMULATED. Shared fixture scenarios and role credentials were retained.
- TypeScript checking and review/production Vite builds pass. Production login smoke testing verifies simulation entry is absent.
- `git diff --check` passes. Changes remain under `admin/`; no backend, portal or public-site source was modified, and no production deployment was performed.

The live test runner is `npm run test:live --prefix admin -- --accounts <absolute-local-manifest-path>`. It refuses non-loopback origins and manifests outside the helper-owned simulated development dataset. A redacted acceptance summary is retained in `docs/stage2-live-acceptance.json`; runtime credentials and raw local test files remain ignored.

## 12. Remaining blockers and acceptance limits

There is no blocker to testing supported Admin workflows against the current local development backend. Use <http://127.0.0.1:3013/admin/> and the backend's local role accounts.

Production readiness still requires approved provider integrations, deployment assembly/security/operations review and real browser visual/responsive acceptance. Browser automation previously rejected access under its security policy; no alternative browser inspection or screenshot workaround was used. DOM tests and unchanged styles/assets do not establish rendered viewport correctness.

The frontend uses a same-origin Vite proxy, which passed the live run. Direct cross-origin browser use would need explicit `http://127.0.0.1:3013` / `http://localhost:3013` entries in the backend-owned CORS allowlist; this frontend task did not modify that configuration. No wildcard is required or introduced.

End-to-end manual provisioning against a manual-configured backend and UI testing within Agent 2's portal remain separate acceptance items. The unsupported capabilities listed above require an approved backend extension before frontend controls can be enabled.
