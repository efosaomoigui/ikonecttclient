# Admin/CRM browser acceptance - 19 October 2026

## Outcome

The Admin-side acceptance run is complete against the real development API. Four display defects discovered in the browser were corrected and rechecked. Ready for a coordinated customer journey with Agent 2; that cross-application journey has not yet been executed.

- Branch: `codex/ikonectt-admin-crm`; accepted commit `4f5215c` is retained unchanged in history.
- Canonical contract: API v1.0.1 at `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`.
- Admin: `http://127.0.0.1:3013/admin/`; real API on port 4000; database `ikonectt_development` connected.
- Agent 2 portal on port 4175 is reachable. Reachability is not portal acceptance.
- Ordinary staff login was used throughout; no browser test used Open simulated workspace. Backend test records/providers remain explicitly SIMULATED.
- No backend, portal or public website source was modified. No merge or deployment.

## Real-browser evidence

Browser access succeeded after the user enabled it. These are actual UI actions and rendered server responses, separate from automated/API-only tests.

| Area | Executed and observed |
| --- | --- |
| Authentication | Existing ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER and EXECUTIVE credentials all authenticated. Signing-in disabled/loading state observed. Invalid synthetic credentials returned Invalid credentials. Password visibility, sign-out and recovery dialog controls worked. |
| Dashboard and reports | Shared backend summary displayed 11 customers, 4 leads, 17 orders, 3 open tickets, 4 active subscriptions and NGN 464,000 confirmed payments after this run. Simulation notice and six-card composition retained. Executive reports rendered the same operational totals. Shared data may subsequently change. |
| Customers | Created an isolated residential customer; server-generated UUID and separate account number displayed. Setup dialog appeared and was closed without logging/capturing the token. Search, detail and related records worked. |
| Plans | Zero price produced validation with the form retained; valid NGN 18,000 plan was published. Changed current price to NGN 19,000; existing order retained its NGN 18,000 snapshot. |
| Coverage | Parent hierarchy form disabled final eligibility. Created building under an existing street/estate with UNKNOWN eligibility; edited to AVAILABLE with plan mapping and evidence. Returned states rendered correctly. |
| Orders | Unavailable building returned real Plan eligibility must be verified at this building/address error, preserving form and live mode. Valid order persisted. Second order was created from mobile Sales at the new price. |
| Payments | Sales Report payment action populated order/amount. REPORTED had no receipt and no activation. Finance confirmed first payment with evidence and confirmation; PAID order still had no subscription until separate provisioning. Confirmed receipt displayed correct reference and amount. Finance rejected second payment; REJECTED detail recorded identity/time/evidence, with neither review nor receipt action. |
| Provisioning | PROVISIONER submitted a separate request for the paid first order. Server returned ACTIVE with mode simulated and Simulated source; no manual override action offered. Matching active subscription appeared. Rejected/unpaid second order returned Verified payment is required before provisioning and did not produce fake success. |
| Support | SUPPORT created a customer-linked ticket, replied, assigned it to the support account and moved IN_PROGRESS to RESOLVED. Persisted messages and resolution displayed. Post-fix detail has one proper conversation and no raw message-object row. |
| Roles and permissions | All six roles signed in with their respective navigation/actions. Finance staff route and Executive customer route showed permission errors. Support had no finance-review or staff action; Sales reported a payment without finance navigation; provisioner fulfillment was separate from finance. Admin staff edit controls, enabled flag and role matrix were inspected and cancelled without changing access. |
| Other screens | Lead queue/details/edit controls inspected and cancelled; unsupported lead assignment/private notes explained. Integrations, settings, queued notification metadata and a matching customer.created audit event rendered from the API. |
| Provider truthfulness | Payment disabled; provisioning/legacy/email/SMS simulated; coverage native registry; AI guidance without a model; external usage not configured. QUEUED notifications were not represented as delivered. |
| Mobile and responsive | Measured CSS widths 390 and 320: navigation toggle, dashboard cards, search/filter, table-only horizontal scrolling, empty state, create/detail/review dialogs and reachable actions. Mobile order/payment writes completed. Tab/Shift+Tab remained in dialog and Escape dismissed it. Additional overview checks at approximately 768, 1024 and 1440 CSS pixels retained all six cards without page-wide overflow. |
| Failure behavior | Real eligibility and unpaid-provisioning errors retained the form; failed login remained signed out. Restricted routes showed actionable permission errors. No failed request silently returned a mock success. Browser network disconnect was not exercised; session expiry has automated coverage only. |

## Defects corrected

1. Order choices previously repeated only the plan name. Payment/provisioning selectors now include the order reference prefix/suffix and status, making repeated-plan records distinguishable.
2. Live ticket detail included nested messages in the generic detail grid as [object Object]. Messages now render only in the existing conversation. Preview ticket detail now matches the live nested-message response shape so its regression test exercises this defect.
3. An absolutely positioned screen-reader table heading escaped its scroll container, producing a page-wide mobile scrollbar. Positioning the table scroll container fixes containment while preserving horizontal table scrolling and accessible heading text. At 320 pixels the document width became 320, with an independently scrollable 875-pixel table.
4. A real confirmed-payment total overflowed its mobile metric card. A scoped mobile amount rule now fits the observed total at both narrow widths while retaining the approved two-column cards.

Approved `style.css`, logo assets and font remain byte/content-equivalent to the approved visual baseline. The small containment/amount overrides are isolated in `src/acceptance.css`. No navigation, colors, typography family or desktop dashboard composition was redesigned.

## Validation

- `npm test --prefix admin`: 35 tests, including two new regression tests for nested ticket messages and repeated-plan order choices.
- `npm run build --prefix admin`: production TypeScript/Vite build.
- The visual-preservation test checks the approved stylesheet, logo and font hashes.
- Existing prior 15 live API acceptance groups remain historical evidence; not rerun as a substitute for this browser run.

## Isolated records for joint integration

Run label: `mvfm9iwu`; contacts use example.test. No real funds were moved and no live ISP activation was performed.

| Entity | Non-secret reference / outcome |
| --- | --- |
| Customer | `5f115958-4194-4f7b-822f-cbd8c0aa6714`; account `83505969`; SIMULATED Browser Acceptance mvfm9iwu |
| Plan | `3df15596-ab4d-4cea-8599-144149ae979f`; published, current NGN 19,000 |
| Building | `927378d7-0d6d-4b4c-aabd-f5e30406a4bb`; AVAILABLE, mapped to the plan |
| First order | `30568b28-f2e8-46ba-ad65-22074e65e92a`; NGN 18,000 snapshot, COMPLETED |
| Confirmed payment | `d44b5899-2d18-4676-b21d-dcdc81547d2d`; SIMULATED-BROWSER-mvfm9iwu |
| Provisioning | `ba3eddbc-ab46-4300-878d-e91782d021a8`; ACTIVE, simulated |
| Subscription | `1609838c-7c8f-4a11-87d5-89a104b42f59`; ACTIVE, simulated |
| Second order | `b6c2930f-68c9-4662-838e-176242c24ea8`; NGN 19,000, remains PENDING_PAYMENT after rejection |
| Rejected payment | `f134657e-4a7e-4bbf-bc47-e6b89cc1ed92`; SIMULATED-REJECT-mvfm9iwu |
| Support ticket | `d7cdac54-237f-47a2-9a6a-61891ed5a74b`; RESOLVED, persisted staff reply |

## Remaining work and limits

- Execute the joint portal journey in [JOINT_ACCEPTANCE_CHECKLIST.md](JOINT_ACCEPTANCE_CHECKLIST.md), including customer ownership isolation and seeing the same payment/service/support changes in My Ikonectt. No message has been sent to Agent 2 on the user's behalf.
- Customer initial password setup needs the customer/operator to enter new credentials. The temporary token was neither retained nor handed off; reissue securely at the agreed joint run if necessary. Staff recovery submission/reset completion were not performed against shared credentials.
- Role reassignment, last-admin removal and shared fixture state changes were deliberately not performed in the shared browser run. Existing automated permission/last-admin checks passed; browser evidence covers existing roles, denied routes and inspection of controls.
- No shared API outage was induced. API 403/404/no-fallback/session-expiry tests are automated/preflight evidence; no forced browser network-disconnect pass is claimed.
- Manual provisioning and real payment/ISP/messaging providers require a separately configured environment. Current simulations and unavailable capabilities are visibly labeled.

## Screenshots

Evidence is in `docs/browser-acceptance/`. Key final views: `desktop-dashboard-final.jpg`, `desktop-support-corrected.jpg`, `desktop-unpaid-provisioning-error.jpg`, `mobile-390-dashboard.jpg`, `mobile-320-orders-corrected.jpg` and `mobile-payment-rejected.jpg`. Earlier files capture validation and the original scenarios; filenames ending corrected/final show the rechecked results. No credentials or setup tokens are included.
