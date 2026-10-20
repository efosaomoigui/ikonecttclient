# Admin/CRM owner handoff for Stage 4

Date: 20 October 2026 (Africa/Lagos). Owner: Agent 3. Lead integrator: Agent 1.

## Reviewed source and boundaries

- Branch: `codex/ikonectt-admin-crm`.
- Accepted Stage 2 commit `4f5215c` remains in history.
- Browser corrections: `082cdf3`; restrained readability refinements: `99af295`.
- This documentation follow-up finalizes the owned outage/recovery evidence. Agent 1 receives its exact commit hash in the coordination handoff.
- Canonical API remains v1.0.1 at `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`. No vendored contracts or permission definitions changed during acceptance/refinement.
- Changes are confined to `admin/`. Agent 3 did not modify backend, portal or public website source, merge branches, reset data or deploy.

## Validation and evidence

Revalidated on 20 October 2026: `npm test --prefix admin` passed all 36 tests with 0 failures; `npm run build --prefix admin` passed TypeScript/Vite production compilation. The suite includes pinned-operation compatibility, approved stylesheet/logo/font preservation, role checks, session expiry, pagination, payment/provisioning separation, nested ticket messages, distinguishable order choices and rejected network reads/writes with no mock success or fixture mutation.

Real-browser Admin acceptance and exact evidence are documented in `BROWSER_ACCEPTANCE_STATUS.md` and `docs/browser-acceptance/`. Stage 3A additions are in `JOINT_APPLICATION_ACCEPTANCE_REPORT.md` and `docs/stage3a-mvfn1j1e/`.

Browser evidence comes from the running local development application. The test command builds review mode for DOM simulation tests; the separate production build disables the preview entry UI. Stage 4 must smoke-test the consolidated production assets as well as the live API behavior.

| Check | Actual evidence | Stage 4 gap |
| --- | --- | --- |
| Admin login/operations | Stage 2 browser run exercised all six roles, customer creation, plans, coverage, orders, finance confirmation/rejection, separate simulated provisioning and support | Smoke-test the integrated runtime |
| Admin UI preservation | Desktop and 390/320 CSS-pixel tables/details rechecked after restrained refinements; base stylesheet/logo/font hashes preserved | Check integrated assets/base path at `/admin/` |
| Customer setup | Fresh customer created in Admin; human performed setup; backend owner confirmed enabled login and `mustChangePassword=false` | Intended customer portal sign-in/identity was not browser-verified |
| Plans/coverage | Published plan and eligible building read back through Admin | Portal must show the same plan and eligibility |
| Order/payment | Earlier standalone Admin workflow passed; no fresh joint order/payment was created | Customer order/report, Admin readback, Finance confirmation and portal PAID readback without activation |
| Provisioning | Earlier Admin workflow returned explicitly simulated ACTIVE service | Integrated customer portal readback after separate Provisioner request |
| Support | Earlier Admin ticket creation/reply/resolution and stored conversation passed | Customer-created ticket, staff reply/status, portal synchronization |
| Security | Browser Support finance/provisioning restrictions; post-logout protected route denied. API supplement returned 403 for unauthorized operations and 401 for revoked staff sessions | Integrated customer ownership isolation and intended-account revoked-session checks |
| Service outage/recovery | API/DB processes stopped; both interfaces showed errors without mock success. Owner restored existing processes; Admin Try again recovered real data | Validate consolidated startup/shutdown/recovery; do not represent prior outage as a code defect |

## Safe existing records

All listed records are simulated development records; identifiers are not credentials.

- Earlier customer: account `83505969`, UUID `5f115958-4194-4f7b-822f-cbd8c0aa6714`.
- Earlier active simulated subscription: `1609838c-7c8f-4a11-87d5-89a104b42f59`.
- Earlier resolved ticket: `d7cdac54-237f-47a2-9a6a-61891ed5a74b`.
- Fresh Stage 3A customer: account `83655382`, UUID `8ba319fe-dc0d-45a0-8eef-dd8b4c00aa20`. No joint order/subscription was created during the attempted journey.
- Published residential plan: `3df15596-ab4d-4cea-8599-144149ae979f`, NGN 19,000, 80 Mbps, 30 days.
- Eligible building: `927378d7-0d6d-4b4c-aabd-f5e30406a4bb`, AVAILABLE and mapped to that plan.

Do not recover the discarded token, reuse passwords disclosed during troubleshooting, reissue credentials unnecessarily, reset fixtures or create an uncoordinated duplicate joint order. New integrated mutations need a single owner and an isolated run label.

## Admin smoke assistance after consolidation

Agent 3 can exercise the integrated Admin build once Agent 1 provides its checkout/commit and running URL. Verify live mode and summary; source/simulation flags; customer/plan/building readback; the same customer-created order/payment IDs; Finance confirmation without activation; separate Provisioner result; Support reply/status; denied actions; failed request feedback; desktop/mobile containment. Agent 2 retains all portal actions and source ownership.

The Stage 3A report remains partial. Source readiness permits controlled integration under the Stage 4 brief; it does not permit a claim that unfinished joint workflows passed, a merge to main or production deployment.

## Integrated browser follow-up

Assigned Stage4 Admin browser checks subsequently completed on the integrated local runtime: identity/plan/building, desktop/mobile, staff restrictions, compiled production preview-disabled entry, shared customer order/payment readback, Finance confirmation with no activation, separate simulated Provisioner action and Support reply/resolution. See STAGE4_BROWSER_ACCEPTANCE.md and docs/stage4-d4e66e52/. The follow-up source correction is limited to subscription labels Starts and External service ID and passed36tests/production build. Agent1 receives its exact commit for review/integration. Portal and cold-recovery evidence remain separately owned; this does not retroactively complete Stage3A.
