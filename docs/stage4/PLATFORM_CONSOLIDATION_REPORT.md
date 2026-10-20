# IKONECTT — STAGE 4 PLATFORM CONSOLIDATION REPORT

Date: 20 October 2026. Lead: Agent 1; customer portal owner: Agent 2; Admin/CRM owner: Agent 3.

**Outcome: consolidated development platform verified. Commercial production release remains blocked by the external, data, policy and deployment dependencies below.** All financial/service examples in this report are isolated local development exercises; no real transfer, ISP activation, CRM connection or message delivery is claimed.

## Controlled integration and verified baseline

- Branch: `integration/ikonectt-platform-stage4`.
- Verified implementation/runtime commit: `6a7ff9602b0d9da168e3b0c7ac4c2671dd5b3031`.
- Root installation/startup/contract/HTTP acceptance implementation: `edabc61c4f8a6683e391a48d97ba0e55e891bd95`.
- Public website baseline/main remains `6418909f2ef900788f8fd832281dc2ebdd99e765`.
- Reviewed backend input: `948dfa10aaba44930feb1bf9433cb1d0b8c01cf0`.
- Reviewed Admin input: `9ebec44ee549b841317b25d26b105e86eec460c4` (includes accepted Stage 2 `4f5215c`, browser corrections and readability refinements).
- Reviewed portal input: `dc6a467656c6c97cd426ffeb574e086a7dba3ff2` (includes final setup-validation, refresh and readability corrections).
- Final owner follow-ups: Admin `36c483929b3bf5956bd18144dde361a8457d3a3f`; portal `733166df42485b0fc38916dafa4d08405f0ae9bd`.

The original worktrees and uncommitted work were inspected before integration. Owners finalized their own changes first. Backend, Admin and portal were merged by exact reviewed commits into a dedicated worktree, without conflicts. The original main checkout, its historical untracked review assets and temporary files were preserved. No reset/discard, force-push, direct merge to main or deployment occurred.

The existing Stage 3 joint report was found at `admin/JOINT_APPLICATION_ACCEPTANCE_REPORT.md`. It explicitly records a partial journey: the intended customer had completed setup, but a different sample account was signed into the portal and no joint order/payment was created. Stage 4 does not relabel those unfinished checks as passes. It used fresh isolated records and new API/browser evidence to complete the integration checks.

## What is consolidated and how folders are partitioned

| Boundary | Contents and ownership |
| --- | --- |
| `backend/` | NestJS API; database-backed identity/sessions; customer/staff permissions; plans/coverage/enquiries; orders, payment reporting/verification and separate provisioning; support; audit; durable encrypted notification outbox; disabled/manual/native/simulated adapters; Prisma migrations and guarded development tools |
| `contracts/` | Single canonical API v1.0.1 definition, clients, OpenAPI, fixtures, endpoint/permission map and handoff documentation |
| `admin/` | Staff-only Admin/CRM, independent package/build/tests and pinned contract/permission artifacts; live requests use shared API |
| `my-ikonectt/` | Customer-only portal, independent package/build/tests and pinned canonical client; live summary refresh exposes staff updates |
| Root website HTML, `shared/`, `option-a/`–`option-e/`, `assets/`, `public_html/` | Existing public website/design showcase; retained separate approval track |
| Root `scripts/platform*.mjs`, `.platform/`, `docs/stage4/` | Local orchestration/validation, ignored machine state, and credential-free report/evidence |

No backend source, ORM or credentials were moved into frontend folders. Applications communicate through HTTP; frontend contract copies are provenance-checked generated artifacts, not competing API definitions. Public plans, coverage locations/check and consented enquiry APIs already exist for later approved website integration. Public presentation remains developer-controlled; no CMS/page builder was added.

New consolidation tooling provides sequential lockfile installation with explicit Prisma generation, one-time references to the existing database/environment, coordinated PostgreSQL/API/Admin/portal startup, health reporting, ownership-scoped shutdown, contract parity checking, real HTTP adapter acceptance and local compiled-asset previews. Detailed commands and folder responsibilities are in [PLATFORM_DEVELOPMENT.md](../../PLATFORM_DEVELOPMENT.md).

## Runtime and reproducibility

| Service | Development endpoint |
| --- | --- |
| PostgreSQL 16 | `127.0.0.1:55440`, `ikonectt_development` |
| NestJS API health | http://127.0.0.1:4000/api/v1/health |
| API explorer | http://127.0.0.1:4000/api/docs |
| Admin/CRM | http://127.0.0.1:3013/admin/ |
| My Ikonectt | http://127.0.0.1:4175/ |

The existing development database and `.env` remain in the original backend owner directory. The integration checkout references them through ignored `.platform/config.json`; no credentials or database files were copied into Git. Startup verifies the owned development state and database name, and reuses persisted data. It does not initialize, migrate, reseed or reset records. Occupied application ports cause a safe refusal; the supervisor does not take over arbitrary app processes.

`npm run platform:dev`, `platform:status` and `platform:stop` provide the normal cycle. Only owned child application trees are stopped. An adopted database is retained; a database started by the supervisor is stopped with it, with data retained. These remain terminal-managed local services, not production services. Runtime recovery results and persisted record fingerprints are recorded in `runtime-recovery.json`.

## Canonical API and compatibility

**Version v1.0.1**, canonical commit `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`: **59 paths, 75 operations**. No API schema or permission change was needed.

Backend-generated OpenAPI, actual Nest route inventory, authentication metadata, response/error schemas and endpoint access map pass validation. Root parity checks compare both frontends' schemas/provenance and Admin permissions/operation inventory against the exact canonical Git revision. Bearer authentication, six existing staff roles, customer-owned records, default 25/max 100 pagination, integer NGN minor units, request-ID errors and provider capability reporting were exercised. Tokens remain in browser memory; failed live requests do not select mock fixtures.

The configured capabilities are payment gateway **disabled**, coverage **native**, provisioning/legacy/email/SMS **simulated**, AI **guidance only**, usage **not connected**. Manual payment reporting and Finance verification are distinct from payment gateway initiation.

## Shared workflow results

Two isolated real HTTP runs used the **actual Admin `WorkspaceApi` and portal `createLiveAdapter`**, the integrated Admin proxy, the shared API and PostgreSQL. Each passed eight acceptance groups. The final run also rejects replay of consumed customer setup codes. See `api-acceptance-d4e66e52.json` and `api-acceptance-97d198cc.json`. These are HTTP integration checks, not browser automation results.

The development harness marks only its newly created plan/location rows as simulated through Prisma; that fixture metadata is not an additional public API field. Onboarding, catalogue/eligibility edits, order/payment/provisioning and support workflow writes use the canonical HTTP operations.

| Workflow | Verified result |
| --- | --- |
| Onboarding | Authorized Admin creates isolated customer; real setup API consumes one-time code; intended customer login/profile and password-change gate read back correctly. Browser separately verifies the prepared customer's exact identity. Setup itself was exercised by API, not by a human/browser password-creation flow. |
| Plans/coverage | Admin update to NGN 19,500 reaches portal; UNKNOWN eligibility stays UNKNOWN until an evidenced building update makes the specific plan AVAILABLE. Entire hierarchy is created under a new run. |
| Order/payment | Customer creates order; Admin reads exact customer/plan/building/amount; report is REPORTED, receipt denied before confirmation; Finance confirms; portal sees PAID and receipt. No subscription/activation exists at this checkpoint. |
| Provisioning | A separate authorized Provisioner action returns explicitly simulated ACTIVE; portal receives matching subscription, and order becomes COMPLETED. Usage remains unavailable. |
| Support | Customer creates ticket; Support replies and resolves it; portal sees the same conversation and status. |
| Security | Support cannot verify payment; Finance cannot provision; other customer cannot read order/receipt/ticket or reply to ticket; anonymous/revoked sessions denied; staff cannot access customer-only profile; invalid IDs/pagination return structured errors. |

The separate browser journey uses account **81117181**, customer `c8c6a143-4319-44a3-84ab-0b21672a6e10`, plan `51201d97-a053-4c70-b8f7-2adb242a4be5` and building `7ff56965-b620-4a9e-b863-29a45b3c4802`. Owners coordinated one mutation at a time:

- Portal order `800fce40-5220-4a40-a575-9bbf55752ffc` → Admin identity/amount/PENDING_PAYMENT readback.
- Portal payment `e816902e-9e22-4c36-b96a-56e54a5260f1` → Finance confirmation → independent portal PAID/receipt/**no activation** readback.
- Separate Provisioner request `91d6a031-4e6b-4a69-8768-86deaacd6dd5` → subscription `5f0b3a79-9019-425e-893c-5abb7352f5c7`, ACTIVE/**SIMULATED** → portal active service and COMPLETED order readback.
- Portal ticket `f599f85b-c0ea-4600-b685-6a202938394c` → Support reply/RESOLVED → independent portal two-message conversation readback.

Browser evidence and remaining qualifications are in the final owner reports under `admin/` and `my-ikonectt/`. Browser coverage includes desktop/mobile containment, intended account identity, live mode, same-record synchronization, role restrictions, logout/protected navigation and compiled production assets. Cross-customer isolation and revoked bearer enforcement are verified by HTTP/backend tests; they are not misrepresented as separate browser attacks. No password/reset token/login control screenshots are included in Stage 4 evidence.

After the final owner commits were merged and cold recovery completed, the compiled Admin was checked again: “Starts” and “External service ID” rendered correctly; the same ACTIVE/Simulated subscription, COMPLETED order and RESOLVED two-message ticket persisted. See `final-admin-after-recovery.jpg`. Final post-recovery browser observations are recorded separately in `final-browser-recheck.json`. The portal's single-word submission notice fix was reviewed and rebuilt; no extra ticket was created merely to recheck that copy.

## UI refinements and design preservation

Reviewed owner changes retain existing branding, layouts, navigation, spacing, typography families/hierarchy and approved visual assets. Refinements shorten awkward support/payment/setup wording, strengthen secondary-text contrast, modestly enlarge small labels, distinguish light/white surfaces and alternate dense table rows. Portal live navigation refreshes data; setup validation follows canonical code/password bounds. Final browser findings correct a duplicate “Request Request” support notice and Admin subscription labels “Starts”/“External service ID”. No new design system or page redesign was introduced.

Public website source/assets/packaged output remain identical to baseline. Only root orchestration/documentation, Git text attributes and the preservation **test tooling** changed outside application-owned directories. The original mixed LF/CRLF checkpoint hashes are still enforced for content; only equivalent text line endings are accepted. No checkpoint content or visual snapshot was replaced to conceal a design change.

## Automated validation and production builds

| Suite/check | Final result |
| --- | --- |
| Backend regression/safety | 39 passed, 0 failed; independent `_test` DB on 55439 |
| Admin regression/DOM/contract/preservation | 36 passed, 0 failed |
| Portal regression/live/mock | 14 passed, 0 failed |
| Public website regressions | 143 passed, 0 failed |
| **Total automated tests** | **232 passed, 0 failed** |
| Backend tools/typecheck and production compilation | PASS; compiled Node process health reports database connected |
| Backend canonical route/security check and root frontend parity | PASS, v1.0.1 / 59 paths / 75 operations |
| Admin TypeScript/Vite production build | PASS; compiled `/admin/` browser smoke; review/mock entry controls absent |
| Portal typecheck, live and explicit mock builds | PASS; compiled live browser smoke at temporary 4176 preview |
| Website production build | PASS in isolated export of accepted baseline; A/B/C compile and all five options package |

See `test-summary.json` and final owner reports for source revisions. Initial clean-checkout failures were resolved: Prisma generation is now explicit in the installer, and Windows text conversion no longer produces false contract/preservation drift. Final failures are zero. Lockfile installation reported zero vulnerabilities in the installed package trees at the time of this run. Existing website Vite warnings about a future native config loader remain non-fatal; public configuration was not changed for a future tool version.

## Operational and security review

| Area | Verified baseline and remaining release work |
| --- | --- |
| Environment/secrets | Development-only ownership guards, loopback runtime and ignored secrets/configuration. Dedicated staging/production secrets, HTTPS origins and restricted database roles still required. |
| Migrations | `202610190001_initial` complete, no rollback; 17 application tables. No Stage 4 migration/reset. Startup deliberately does not migrate. Future deploy needs explicit migration ownership and rollback procedure. |
| Admin bootstrap/fixtures | Existing idempotent bootstrap and first-change gate preserved; user bootstrap credential untouched. SIMULATED fixture role credentials remain local. New acceptance mutations are isolated and named SIMULATED. |
| Backup/restore | Custom-format dump/list/restore succeeded into a separate retained database; fixture marker and Stage 4 order/subscription/ticket match original. Active DB/environment unchanged. Off-machine storage, retention, encryption-key recovery, RPO/RTO and restore owner remain deployment requirements. |
| Sessions/permissions | Database-backed hashed expiring/revocable sessions and reset tokens; password gates, strict DTOs, customer ownership and server action permissions. Browser memory tokens; no new auth system. Per-process throttling requires one API instance until shared storage is implemented. |
| Audit | Sensitive operations persist append-only audit events, actor/entity metadata and verifier trails. Retention/access/export/alert policy remains to be assigned. |
| Outbox | Encrypted payloads, database leases, retry/backoff and idempotency boundary are implemented and regression-tested. At operational snapshot 42 messages were QUEUED; no delivery is implied. Worker scheduling, approved providers/templates/senders and queue alerts are not supplied by the four-app supervisor. |
| Provider adapters | Current disabled/native/simulated boundaries accurately reported; staging/production reject simulated modes. No real provider connected. |
| Health/logging | Database-connected API health and local child logs; request-ID/error-type logging avoids credential/payload output. Central log retention, uptime/latency/error alerts, DB/disk and outbox monitoring remain deployment work. |
| Recovery | Local ownership-scoped stop, adopted DB retention, cold DB start and persisted-record checks documented in recovery evidence. No production process manager, failover or automated disaster recovery claim. |

Supporting operational evidence: `operational-review.json`, `backup-verification.json`, `runtime-recovery.json`; existing detailed adapter and database procedures: `backend/PROVIDER_READINESS.md` and `backend/DEVELOPMENT.md`.

## Release-readiness matrix

“Development complete” and “integrated and verified” describe implemented local scope. “Simulated” identifies test-only outcomes. Pending information/connection/configuration and “blocked” identify prerequisites for the commercial release, not missing local test evidence.

| Capability | Development / integration | Current boundary | Required before commercial release |
| --- | --- | --- | --- |
| Payment/bank workflow | Development complete; integrated and verified for reporting/Finance/receipt/separate activation | SIMULATED test transfers; gateway disabled; manual verification mechanism exists | **Pending client information/provider connection**: official bank details, evidence/amount/reconciliation/verifier procedures, approved gateway/authenticity/idempotency specs; live payment release blocked |
| Legacy CRM | Adapter/reference boundary complete; simulation tested | SIMULATED lookup; no live import/sync | **Pending client information/provider connection**: authoritative CRM, access/API docs, mapping, migration/duplicate policy |
| ISP provisioning | Development complete; separate action integrated and verified | SIMULATED ACTIVE; manual outcome path exists | **Pending provider connection**: authoritative status, credentials/sandbox, idempotency/timeouts/callback/reconciliation approval |
| Official customer identifiers | Internal UUID/account separation complete and verified | Generated development account numbers flagged simulated | **Pending client information**: official numbering, uniqueness and legacy mapping/migration rules |
| Production coverage | Hierarchy and building/plan eligibility complete and verified | Isolated SIMULATED locations; native registry | **Pending client information**: approved authoritative building/address dataset, evidence, ownership and update process |
| Commercial plans | Catalogue, integer currency and order snapshots complete and verified | SIMULATED NGN catalogue | **Pending client information**: approved prices, taxes, installation charges, terms, audience and billing periods |
| Email/SMS | Encrypted outbox/worker/retry development complete and tested | SIMULATED adapters; queued is not delivered | **Pending provider connection/deployment configuration**: sender/templates/consent, credentials, scheduling, deliverability and alerts |
| Billing and usage | Order/payment/receipt/subscription display integrated and verified | Usage null/unavailable; no authoritative billing/usage integration | **Pending client information/provider connection**: source, billing lifecycle/proration/expiry/reconciliation specs; usage/billing automation blocked |
| Hosting/TLS | Local startup and compiled builds verified | Local terminal-managed HTTP only | **Pending deployment configuration**: hosts/domains/TLS, reverse proxy, secrets, network rules, process management, dedicated DB, release/rollback; production deployment blocked |
| Backup/restore ownership | Local backup/restore/readback verified | Same-machine retained dump/verification DB | **Pending deployment configuration/owner**: off-machine backups, retention, key custody, recovery objectives and restore drills |
| Monitoring | Health/request IDs/local logs implemented and verified | No central operational alerting/on-call | **Pending deployment configuration/owner**: metrics, log retention, uptime/error/disk/DB/outbox alerts and response procedures |
| Refund/cancellation policies | Existing order states remain; no new financial automation added | No approved refund/cancellation/proration flow | **Pending client information; blocked** until policies, authorization, accounting and provider behavior are specified |

## Recommended next stage

Perform a **staging preparation and client/provider specification stage**: approve source data, plans/identifiers, finance/service policies and operational owners; select dedicated hosting/TLS/DB/secrets; configure backup/monitoring/outbox scheduling; obtain approved sandbox documentation and credentials. Implement provider adapters only within that approved scope, then repeat the same contract, security, integration and browser checks in staging. Keep public website design/client approval separate. Main merge and production deployment remain subject to explicit approval; neither was performed here.
