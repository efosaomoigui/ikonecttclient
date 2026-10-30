# Admin/CRM browser acceptance and joint customer journey

Accepted Admin baseline: `4f5215c` on `codex/ikonectt-admin-crm`.
Canonical backend contract: `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`, API v1.0.1.

The standalone Admin browser run is complete; see BROWSER_ACCEPTANCE_STATUS.md for executed scenarios, corrections and isolated record IDs. This checklist remains for the joint cross-application run. Unchecked items are not evidence of a joint pass, and some include additional scenarios not exercised by standalone acceptance. No backend, portal or public-site changes are part of this acceptance task.

## Environment and record ownership

- Admin: <http://127.0.0.1:3013/admin/>; use ordinary staff login, not Open simulated workspace.
- My Ikonectt: <http://127.0.0.1:4175/>; Agent 2/operator owns customer-side UI execution.
- Shared API: <http://127.0.0.1:4000/api/v1>; persistent development dataset `ikonectt_development`.
- Use existing local staff role credentials without changing shared passwords or baseline scenarios. Never place credentials, session tokens or setup tokens in this checklist, screenshots, logs or chat.
- Reuse the recorded isolated customer/plan/building for readback, or create fresh joint acceptance records through the UI with a unique `SIMULATED-JOINT-<run>` prefix and `example.test` contact addresses. Track only entity UUIDs, the customer account number, references and non-secret status evidence.
- Record desktop (1440 × 900), mobile (390 × 844) and narrow mobile (320 × 740) evidence. Check the existing 768/1024 breakpoints when a defect warrants it. Preserve approved styles and branding.

## Desktop Admin acceptance

- [ ] Sign in as ADMIN. Verify session/role display, backend summary values and simulation notice. Confirm the ordinary login never enters the frontend mock workspace.
- [ ] Review sidebar/topbar, six-card overview, official logo, font, colors, tables, search/filter controls and dialogs. Capture screenshots only after credential/setup fields are cleared or closed.
- [ ] Verify required/invalid login and form fields, password visibility, disabled submit/loading state, field validation and actionable error feedback. Do not repeatedly consume login quotas.
- [ ] Create one residential plan and one business plan with labeled test prices. Check minor-unit entry, displayed NGN amount, attributes and publication status. Agent 2 confirms published plans appear in customer discovery.
- [ ] Create or choose the complete country → state → city/LGA → district/area → street/estate → building/address hierarchy. Verify parents cannot receive final eligibility. Verify UNKNOWN is distinct from UNAVAILABLE, then evidence the selected building's availability and plan mapping.
- [ ] Review an isolated lead, change status and link the customer when created. Do not expect assignment, private notes or follow-up fields absent from API v1.
- [ ] Create a residential customer. Verify stable internal UUID, separate account number, classification, building and status. Deliver the one-use setup token only through the agreed secure local handoff. Close the token dialog before collecting screenshots.
- [ ] Review customer details and related orders/services/support, permitted editing and external references where authorized.
- [ ] Create an order for the test customer/plan/building. Record the amount, then change the plan's current price; confirm the existing order amount is unchanged.
- [ ] Report a matching sample transfer. Confirm REPORTED and PENDING_PAYMENT; receipt must remain unavailable. No real transfer or gateway transaction is performed.
- [ ] As FINANCE, review reported evidence and confirm the isolated payment with verification evidence and explicit confirmation. Confirm order PAID and no automatic subscription activation. Review confirmed receipt.
- [ ] Make a separate authorized provisioning request. Verify the actual returned status and SIMULATED source. Do not interpret an ACTIVE simulated service as ISP activation or submit a manual override for a simulated request.
- [ ] Open pending, active, failed and review-required provisioning/subscription fixture details without changing shared scenarios. Manual result acceptance requires a separately agreed manual-configured backend run.
- [ ] Review notification metadata and provider status. SIMULATED/QUEUED/FAILED are not delivered messages; DISABLED and NOT CONFIGURED are not connected providers. Native coverage means the application's registry, not a connected external ISP service.
- [ ] Review read-only audit activity for the isolated records and compare summary totals with actual backend data.

## Joint journey with Agent 2 / customer operator

| Step | Owner | Expected cross-application evidence |
| --- | --- | --- |
| 1. Staff onboarding | Admin | New customer UUID/account number and temporary setup dialog |
| 2. Initial password setup | Customer operator | Single-use setup succeeds in portal; enter new credentials directly and keep them private |
| 3. Customer sign-in | Agent 2/operator | Issued account authenticates; correct account-scoped profile/dashboard |
| 4. Plan/address discovery | Agent 2/operator | Published plan and verified building eligibility agree with Admin |
| 5. Connection/order request | Agreed single owner | One order ID appears in both applications; do not create duplicates from both sides |
| 6. Report sample payment | Customer/operator or authorized staff | Same order/payment reference becomes REPORTED; remains unactivated |
| 7. Financial review | FINANCE operator | CONFIRMED/PAID is reflected in portal after refresh; no activation yet |
| 8. Separate provisioning | PROVISIONER operator | Provider outcome and simulation flag agree across both applications |
| 9. Customer support request | Agent 2/operator | Customer ticket/message appears in Admin conversation |
| 10. Staff support response | SUPPORT operator | Assignment, visible reply and resolution appear in customer conversation |
| 11. Ownership/permissions | Both owners | Another customer's records remain inaccessible; restricted staff actions remain denied |
| 12. Sign-out/reload | Both owners | Revoked or absent sessions cannot expose protected records; no browser token persistence |

Do not change Agent 2's code or send it task messages without explicit authorization. This document prepares the joint run; it does not claim that the portal/browser journey has happened.

## Role and failure acceptance

- [ ] SUPPORT: customer/order/payment reads and ticket workflow available; staff administration, finance verification and provisioning unavailable/denied.
- [ ] SALES: customer/lead/order workflow available; report-payment action reachable from an eligible order; coverage writes and finance confirmation denied.
- [ ] FINANCE: report/payment review available; provisioning and staff management denied.
- [ ] PROVISIONER: coverage/provisioning available; finance verification and staff management denied.
- [ ] EXECUTIVE: backend summary available; customer-record and operational mutation routes denied.
- [ ] ADMIN: supported administrative controls only; no separate Super Admin bypass, arbitrary deletion or unsupported privilege controls.
- [ ] Use an isolated, nonexistent record reference to verify a real 404 renders an error rather than a fixture detail. Verify 403 and expired-session behavior without changing shared role credentials.
- [ ] Exercise a client-local network failure if browser tooling supports it, restoring connectivity immediately afterwards. Do not stop/reconfigure the shared API. Confirm no fake save/success or automatic switch to mock mode.
- [ ] Verify payment rejection on an isolated second payment; order remains unpaid and provisioning cannot start.
- [ ] Test last-admin protection only in an agreed isolated setup; do not disable or change shared administrator accounts.

## Mobile acceptance

- [ ] At 390 and 320 CSS pixels, verify login, recovery controls, sidebar toggle and navigation without page-wide overflow.
- [ ] Verify cards, toolbar search/filter, table-only horizontal scrolling, pagination and readable values.
- [ ] Verify create/edit/detail dialogs fit viewport height, scroll correctly and keep confirmation actions reachable.
- [ ] Verify labels, validation, password controls, tap targets, keyboard focus, Tab containment and Escape dismissal.
- [ ] Verify loading/error/empty states and source/status badges remain readable. Recheck only affected screens after a correction.

## Evidence and exit criteria

For each executed item, record viewport, role, record IDs, observed status, screenshot path (no secrets), and pass/fail. An API-only check or DOM unit test must not be marked as a real-browser pass. Fix only defects actually discovered, with a focused regression check and a separate follow-up commit. Retain `4f5215c` unchanged in history. No merge or production deployment.
