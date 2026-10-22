# IKONECTT — PRE-PRESENTATION READINESS REPORT

**22 October 2026 — recommendation: conditional GO for a supervised desktop development demonstration.** Not approval for production or a claim of live bank/ISP operation. The precise expired-service browser scenario and full mobile interaction remain unverified; use the explicit alternatives below.

## A. Actual running applications

| Application | Verified state | Address |
|---|---|---|
| Backend and persistent database | Healthy; existing records retained; health/database checks pass | http://127.0.0.1:4000/api/v1/health |
| Admin/CRM | Healthy; actual staff authentication and operational actions exercised | http://127.0.0.1:3013/admin/ |
| My Ikonectt | Healthy; actual customer authentication and cross-application actions exercised | http://127.0.0.1:4175/ |
| Public design selector / Template E | Running; A/E shortlist verified in browser | http://127.0.0.1:3000/ |
| Template A development server | Running; missing separate server restored; plan and coverage preview exercised | http://localhost:3001/#/home |

Combined source: `C:\Users\Efe-Dev\.codex\worktrees\ikonectt-wallet-stage5a\ikonectt`, with `backend`, `admin`, `my-ikonectt` and `contracts` folders. Branch `codex/ikonectt-wallet-stage5a`; HEAD remains `81e1a45`. The approved prior changes are consolidated. This readiness task adds **uncommitted Admin corrections and reports in this same checkout**; those edits are not a new committed integration checkpoint or copied to other ownership branches.

Website source remains `C:\Users\Efe-Dev\Documents\business News\ikonectt` on its separate main checkout. Its approved A/E design source was not changed. Existing untracked website assets were preserved.

Database remains `ikonectt_development`, PostgreSQL port 55440, under `C:\Users\Efe-Dev\.codex\worktrees\ikonectt-core-backend\ikonectt\backend\.local\development\postgres`. Original records persisted before fixture preparation: 21 customers, 26 orders, 23 payments and 10 tickets. Two new isolated presentation customers were added. No reset, reseed, migration, provider credential change, real financial edit, merge or deployment occurred.

The platform supervisor and the two website terminals must remain open. Restart using `npm run platform:dev` in the combined checkout, `npm start` in the website checkout and `npm --prefix option-a run dev` in the website checkout. Do not run these a second time while their ports are occupied. Use `npm run platform:status`; do not reinitialize/reseed to resolve a startup issue.

## B. Private demonstration inventory

Administrator, Finance, Support and Provisioner credentials were verified through the actual authentication API; those roles also logged in through the browser. Two dedicated non-production customers were securely set up through the existing onboarding API and signed in through the browser. Identifiers and exact private credential retrieval instructions are in the **ignored local** `.platform/PRESENTATION_LOGIN_GUIDE.md`; passwords are not in this report or screenshots.

- **Customer A:** available wallet NGN25,000, no hold and no linked subscription. Funding did not activate service. This is an inactive-service demonstration, **not a historically expired subscription**.
- **Customer B:** an active simulated subscription; its first browser rehearsal is complete. Available NGN5,500, no hold, service expiry 21 December 2026. A second clearly simulated NGN25,000 top-up report is pending for the client replay; pending funds are not spendable.

Customer A's funds/service state remain independent of B. The existing staff fixture accounts are identified as simulated and are not production accounts. No universal password, bypass or credential disablement was introduced.

## C. Browser rehearsal actually executed

1. Public A homepage → plans → coverage → progressively enabled address fields → Unknown demonstration result. The page explicitly states this is not a live coverage decision. A/E selection and E homepage rendering were checked.
2. Admin actual login → customer search/open. The same dedicated B identity/account appears in the customer portal. Customer creation/setup and initial B order/payment/service were **HTTP fixture preparation**, not claimed as browser creation.
3. B customer login → overview/wallet: NGN0 available and NGN25,000 pending.
4. Finance actual login → Wallet Top-ups → dedicated B report → review, simulation evidence and explicit authorization → record decision. Top-up became confirmed.
5. B service showed NGN25,000 available and unchanged 21 November expiry. Customer explicitly chose Renew Plan, reviewed the NGN19,500 quote and checked consent → Confirm and reserve funds.
6. Portal showed RESERVED, NGN5,500 available, NGN19,500 held and no confirmed expiry. Finance saw the same renewal but had no processing action.
7. Provisioner actual login → Wallet Renewals → same record → reviewed/authorized Process renewal. Deterministic simulated outcome succeeded.
8. Customer Refresh status showed SUCCEEDED, NGN5,500 available, no hold and confirmed 21 December expiry. Provider mode/reference explicitly SIMULATED.
9. B created a support request in the portal. Support opened that exact ticket, replied and resolved it. Customer re-opened the conversation and saw the same reply/status.
10. A signed in with NGN25,000 and no service. Direct attempt to open B's service showed not found. Support direct navigation to Finance wallet top-ups showed a permission error. Failed requests did not become mock success.
11. Customer A explicitly signed out and signed back in. Admin explicitly signed out and signed back in. Separate staff/customer API probes verified session 200 before logout and the same token rejected with 401 afterward. Natural expiry was covered by automated tests, not an elapsed browser wait.
12. Staff recovery for an unknown synthetic identity returned a generic acknowledgement. Staff/customer setup forms mounted with one-time-code fields. Existing accounts' passwords were not changed through the browser; new demo account setup was verified by the normal HTTP setup flow, and reset/recovery lifecycle checks passed automated tests. Real SMS/email delivery is not connected.
13. B submitted a second top-up through the **actual portal report/review/consent/confirmation UI**, reference `SIMULATED-PRESENTATION-REPLAY-20261022`. It is intentionally left REPORTED for the client presentation. Its Finance confirmation/second renewal are **future script steps**, not another completed rehearsal.

Independent final HTTP verification passed 20 checks: A unchanged; B customer/Admin summaries identical; first top-up has one credit; first renewal has one reserve and one capture; correct confirmed expiry; staff/customer revocation. This verification preceded the new pending replay report, which was subsequently verified in both interfaces.

### Responsive evidence and limits

Desktop operational flows ran in the real browser. The browser viewport override reported success but did not change the measured viewport; those attempts were rejected as mobile evidence. A disposable ignored QA wrapper then rendered the real Admin and portal login pages in **390 × 844** frames. DOM measurements confirmed both document/viewport widths were 390, without horizontal document overflow; logos, headings and controls were visually inspected and captured.

The browser could fill frame fields but could not click/submit frame targets. Therefore **mobile login layouts were inspected, but full mobile authenticated workflow/menu/table interaction was not completed today**. Credentials were cleared before screenshots. Prior responsive CSS/DOM tests passed; these do not replace fresh full mobile acceptance. Do not market this rehearsal as complete device coverage. Temporary QA server was stopped after evidence capture.

## D. Confirmed defects corrected

| Defect | Correction | Evidence |
|---|---|---|
| Template A iframe refused connection although the website hub was running | Started its existing separately documented Vite server on 3001; no website code change | HTTP200 and browser homepage/catalogue/coverage traversal |
| Admin login displayed raw `ThrottlerException: Too Many Requests` during repeated authentication checks | Admin API error maps HTTP429 to a clear wait instruction, honoring retry-after where supplied; keeps status, metadata and failed login intact | New regression covers explicit/fallback delay, no implicit retry, no session/permissions and no mock fallback; successful subsequent real browser login |
| Customer dialog reused old dashboard lists and falsely displayed zero orders/subscriptions/tickets after cross-application additions | Each customer detail opening fetches fresh permitted related lists | Browser corrected B to 2 orders, 1 subscription and 1 ticket; new Support/Sales DOM regressions cover later additions/status updates and permission restrictions |

No styles, layout, logo, font system or navigation structure were redesigned. Backend/portal/website application source was not modified. Minor nonblocking plural wording such as “1 records” remains; it was not expanded into a late redesign.

## E. Fresh checks and build evidence

| Check | Result |
|---|---|
| Canonical/provenance/permissions parity | PASS: API1.2.0, 78 paths / 95 operations, canonical pin `d0a300a2b5a17d63c637e71c71b523b88046a78f` |
| Backend type check / contract check / build | PASS |
| Backend isolated PostgreSQL test suite | **73 passed / 0 failed**; isolated port55438 stopped afterward |
| Admin final suite | **56 passed / 0 failed**, including 3 new regressions |
| Admin final production build / TypeScript | PASS |
| Portal tests / type check / production build | **29 passed / 0 failed**, PASS/PASS; live API configuration |
| Website tests | **143 passed / 0 failed**; no website build that rewrites public_html was run |
| Git whitespace check | PASS; only expected Admin source/tests plus new reports |
| Final managed health | API/Admin/portal healthy |

No live provider settlement, physical network activation, outbound message delivery or production build deployment is inferred from these results. Backend reset/recovery/session/expired-service tests used the independent test database.

## F. Go/no-go and remaining inputs

**GO with conditions:** a presenter operates the documented desktop script, explicitly calls external results simulated, uses only the dedicated identities, keeps servers running and verifies current quotes before confirming. The full rehearsal worked against the persistent shared database.

**NO-GO:** a claim of exact expired-customer browser acceptance, complete mobile functional acceptance, real bank settlement/ISP activation, live website enquiry integration or production readiness. There is no supported HTTP control to backdate a new subscription; do not change clocks, patch dates or reset data to manufacture an expired demonstration. Show A funded/no service and B explicit renewal as separate, clearly explained cases.

Use [PRESENTATION_SCRIPT.md](PRESENTATION_SCRIPT.md) for screens/actions and replay arithmetic. Use [CLIENT_GAP_MATRIX.md](CLIENT_GAP_MATRIX.md) for client inputs, owners and staging/production blockers. Presentation replay changes balances/expiry again; never replay an already confirmed report or assume starting numbers after additional operations.

Local credential-free evidence is under `.platform/prepresentation-evidence/`, with backend results in `.platform/prepresentation-backend-report.md` and `.platform/prepresentation-final-backend-evidence.json`. Evidence contains only isolated simulated customer records; do not add password/setup-token screenshots.
