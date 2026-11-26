# Production readiness review — 26 November 2026

## Delivery status

Local implementation and automated verification; no Git push, deployment or production database operation was performed. The approved public design remains intact. Native desktop/mobile visual sign-off is pending because the browser helper cannot initialize (`failed to write kernel assets`, Windows error 3).

The former development database is archived and must not be restored into production: it contains historical demonstration financial records. The active local database has now been rebuilt cleanly, as described in the superseding cleanup section below. Production must still use an explicitly provisioned persistent database and the reviewed client-only release bundle.

## Existing functionality verified and retained

The existing NestJS/PostgreSQL/Prisma backend, shared Zod contracts, Admin and Option E frontend were retained. Persistent plan/coverage/knowledge CRUD, publication controls, authentication, password setup, session revocation, server permissions, input validation, throttling, configured CORS, bounded error handling, encrypted provider credentials and notification outbox already existed. Source-level scope was reconciled with `backend/ARCHITECTURE.md`: the original three-application blueprint remains in source, while the later approved delivery restricts production to the website and operational Admin; customer financial services remain dormant.

Seven published client plans, 83 coverage source rows (81 primary display records), and 21 knowledge articles (20 published) remain preserved. Unknown business prices and billing terms were not invented. Public plans, coverage searches, FAQs and assistant guidance use the existing backend. Coverage is an internally managed registry, not a pending external API dependency. All customer account links remain https://portal.ikonectt.com.

## Enquiry management completed

One existing Lead table remains the operational queue. Added structured request category, source channel/page, assignee, private activity/notes and idempotency metadata. Legacy status values and records remain compatible; historical submissions default to LEGACY/GENERAL for staff review instead of guessing ownership or purpose. The UUID is the unique customer reference.

Statuses include New, Assigned, In Progress, Awaiting Customer, Resolved and Closed; previous Contacted/Qualified values are retained. Staff changes and notes persist in a related activity history. Assignees must be enabled staff with request-management roles. A protected assignee picker exposes names/IDs, not credentials or staff email addresses. SUPPORT now has request read/write permissions alongside SALES/ADMIN. FINANCE does not gain request access.

The public response contains only reference and status. Private notes, request hashes, idempotency keys and staff details never appear in public responses. Public submissions are server-validated and limited to five attempts per minute/IP, with a honeypot and payload limits. Idempotency retries return the existing reference; changed details under the same key return a conflict. The website keeps the key for an identical retry and generates a new key after edits.

| Website activity | Existing destination / structured category |
| --- | --- |
| General contact | Enquiries / GENERAL (or explicit residential/business/support choice) |
| Residential installation | Enquiries / INSTALLATION |
| Business quotation | Enquiries / QUOTATION |
| Coverage or exact-address enquiry | Coverage views / ADDRESS_VERIFICATION; COVERAGE also supported |
| Fault reporting | Customer Support view / FAULT |
| Service request | Customer Support view / SERVICE |
| Contact Support | Customer Support view / SUPPORT |
| Assistant actions | Same destination website forms; sourceChannel ASSISTANT |
| Phone / WhatsApp / official portal | External action only; no internal submission claimed |
| Feedback | No public feedback submission form exists; the carousel is display content |

Admin uses a single request module with category/status/search filters, sorting, pagination, CSV export, assignment, notes and activity details. Coverage and support navigation entries are filtered views of that queue. Navigation remains expandable. Products, Coverage, Knowledge/AI and Administration are grouped by function. Dormant wallet, billing, subscriptions, customer-account and customer-portal ticket modules remain hidden in live navigation; their implementation is preserved. Local guest support submissions use the request queue rather than requiring duplicate customer accounts.

The live dashboard counts actual database records, deduplicates its list requests, links to management views and shows recent submissions. Failed data loads display Unavailable rather than fabricated zeroes. No sample activity was created for the dashboard.

## Assistant simplification

Operational embedded forms were removed. Coverage remains interactive through the backend API with ambiguous choices, no-match and unavailable-service states. Published troubleshooting remains in chat. Current plan information links to the relevant plans page. Enquiry, installation, quotation, fault, service and support intentions link to existing pages. Portal actions remain external. The public assistant does not repeatedly render an entire topic menu.

Pre-chat introduction, Nigeria-only country selector, validated phone number, conversational context, red launcher, WhatsApp and accessible composer are preserved. Prefilling uses a one-use in-memory five-minute handoff, never URL parameters or browser storage. No chat conversation database was introduced; pre-chat contact details are excluded from model context. Provider credentials remain encrypted/write-only. Added a bounded published-article candidate limit to the existing authorized AI settings alongside provider/model, enablement, daily/output limits, connection test and revocation.

## Cleanup inventory and safe actions

A full pre-cleanup dump was created and its archive listing verified. A subsequent backup was restored into a separate database and the existing fixture marker verified; the active database/environment was unchanged. Paths, record IDs and hashes are held in Git-ignored `backend/.local/production-readiness/` and the owning development database backup directory. Treat backups and manifests as private operational artifacts.

Initial inventory: 9 enquiries, 23 customers, 31 users, 15 plans, 83 service areas, 21 knowledge articles, 11 customer-portal tickets, 24 payments, 28 orders, 16 subscriptions, 68 notifications and 558 audit entries.

Removed: **8 explicitly test-marked enquiries**, after manifest review and backup. Cleanup is local-development-only, manifest-bound and auditable. It refuses remote/production targets and marker changes. The one enquiry without a reliable test marker remains untouched pending ownership review.

Deactivated credentials for 30 explicitly test-linked accounts (7 staff and 23 customer accounts), cleared their password hashes and revoked their sessions. One enabled non-test administrator remains. User IDs remain for financial/audit relationships. Two incorrectly classified unpublished placeholders were marked simulated; the live product list excludes simulated plans.

Archived outside the active dataset after the later complete cleanup: 8 unpublished development plans, inactive development customer/accounts, tickets, payments, orders, subscriptions and notifications. Many are linked to immutable financial records. They were not indiscriminately deleted, relabelled as genuine or copied into the production release. Deleting unknown records or overriding financial safeguards requires a separately approved inventory. Existing production-safe bootstrap creates only an explicitly supplied administrator; development fixtures/import utilities remain isolated and reject production targets.

A client-only release export contains exactly 7 plans, 83 source rows, 21 knowledge articles and the configured WhatsApp destination, with no customers, staff, requests, payments or credentials. `export-client-release.ts` creates a private JSON/checksum. `import-reviewed-release.ts` validates it and defaults to dry-run; `--apply` refuses an occupied target. This provides a clean initialization path without weakening the existing ledger or destroying audit history. Do not run its apply step against a production database until deployment approval.

## Verification evidence

- Full frontend suite: 221 passing. Final focused assistant, contact-form, integration and preservation checks: 26 passing after the last phone-display refinement.
- Full backend suite: 94 passing, including concurrent idempotency, financial invariants and production guards. Final Admin suite: 69 passing, plus a focused filtered-queue/active-sidebar regression check passing; public, Admin and backend builds and TypeScript checks passed.
- Isolated HTTP + frontend DOM integration: all seven public operational forms submitted, persisted, were managed through staff APIs and survived application restart. Duplicate clicks were suppressed. Test requests were removed from the isolated `_test` database.
- Request API checks cover all eleven categories, invalid consent/honeypot, idempotency conflicts, search/filter/pagination, invalid assignees, private output, unauthorized access and throttling.
- Assistant DOM checks cover coverage match/no-match/multiple matches/API failure/retry/debounce, current plans, troubleshooting, existing-page actions, pre-chat, restart, private one-use prefill and official portal. These are not native visual/mobile tests.
- Prisma migrations applied to local development and isolated test databases. TypeScript and generated OpenAPI/security/route parity checked. Current shared contract is 1.5.0.
- Clean client-only bundle applied to a separate new `_test` database: 7 plans, 83 areas, 21 knowledge articles; zero users, customers, enquiries and payments. Re-import was refused.
- Generated contract parity: 90 paths / 111 operations, version 1.5.0.
- Local HTTP checks passed for website, Admin, direct API health and the public plans, coverage, knowledge and contact-settings proxy routes. Health is intentionally not exposed by the public proxy allowlist.
- Post-cleanup local inventory: 1 preserved enquiry, 1 enabled staff administrator, 0 enabled customer accounts, 7 published client plans, 83 retained areas / 81 primary locations, 21 articles / 20 published. Historical simulated catalogue and financial records remain in the backed-up development database.

Private logs: `.local/client-review/production-readiness-frontend.log`, `production-readiness-admin.log`, `public-forms-isolated-evidence.json`; backend `.local/production-readiness/backend-suite.log`, `final-focused.log`, `contracts.log`, `typecheck.log`, `release-verification.json`.

## Production handover and remaining decisions

Use `docs/CLIENT_HANDOVER.md`, `backend/README.md` and `backend/PROVIDER_READINESS.md` for environment, hosting, bootstrap, notifications and integrations. Required: maintained Node/PostgreSQL host, HTTPS reverse proxy, explicit production CORS origins, private database, migration/backup schedule, tested restoration, secret/encryption-key storage, approved administrator and monitoring. Keep CUSTOMER_PORTAL_ENABLED=false; no development fixtures, sample accounts or simulated providers in production. Publish public frontend and Admin builds deliberately; restrict staff access. Back up before migrations and take a new post-import backup.

Deployment sequence after approval: install locked dependencies; generate Prisma; migrate a new database; validate the reviewed client release/checksum; apply only to the empty target; bootstrap the named administrator; rotate/remove bootstrap secrets; enforce first-login password change; set production URLs/secrets; build/start behind HTTPS; verify /api/v1/health, staff roles and public data; run isolated smoke tests and take a verified backup. Never copy a development .env or dump wholesale.

OpenAI account/key/model access is optional for deterministic help but required to verify paid model assistance. Email/SMS delivery needs the client's approved provider details if enabled; otherwise keep delivery disabled and rely on the persistent Admin queue. An external support/ECRM exchange remains optional pending its actual contract; no submission is falsely claimed to be delivered there. Official portal account/financial workflows remain client-operated. Coverage API access is not an outstanding client dependency.

Remaining release gates: ownership decision for the unmarked enquiry and any historical development records to retain/export; approved clean target/host/domain/secrets and administrator; provider onboarding where required; native browser review; explicit push/deployment approval. This is locally verified release preparation, not a claim of commissioned production service.

## Repeatable verification commands

From repository root: `npm test`, `npm run test:submissions`. The latter launches a loopback-only backend against the dedicated local `_test` database, exercises all seven real frontend forms plus assistant prefill and staff management, restarts the application and removes its request records. It must not be pointed at production.

From backend: `npm run check`, `npm run build`, `npm test`, `npm run contracts:check`. From admin: `npm run sync-contracts -- ..`, `npm test`, `npm run build`.

For a release bundle, from backend run `node --require ts-node/register/transpile-only scripts/export-client-release.ts`. Transfer only the reviewed private bundle/checksum through the approved deployment process. Validate with `node --require ts-node/register/transpile-only scripts/import-reviewed-release.ts <bundle> <sha256>`. Only after deployment approval add `--apply` against a new migrated, empty target before administrator bootstrap. The importer refuses existing customer, staff, coverage, request, catalogue and notification data.

## Normal Admin login and persistent administrator

Normal local development and production builds now disable the simulated-workspace entry point. Only explicit `review`/`demo` modes enable it for isolated QA. Config isolation tests and a production-bundle DOM check verify that the sign-in panel has no demo selector and that an injected preview action cannot open simulation. Latest full Admin suite: 71 passing; production build passed. Native browser visual review remains pending.

At the user's request, the existing configured administrator email was retained. The local persistent staff account is enabled with ADMIN rights; its configured bootstrap password was verified without printing it. First-login password change is required. Running `npm run db:seed` again preserves existing credentials rather than overwriting them. Git carries this setup process, not the account/password/database. A new backend deployment must receive SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD through private host secrets, apply migrations and run the existing bootstrap command once. Persistent PostgreSQL retains the administrator across code deployments. No hardcoded shared login or authentication bypass was added.

## Superseding complete local data cleanup and Vercel correction

At the user's explicit request, the active local environment was moved to a fresh migrated database after a verified full backup. Previous databases remain archived, not active. This removes the former 68 notifications, 565 audit events, 7 dummy staff accounts and all historical dummy customer/financial records from the active dataset without disabling append-only database safeguards. The current real administrator (including its current password hash), approved settings/credentials, 7 client plans, 83 areas, 21 knowledge articles and the unmarked enquiry were preserved. No dummy fixtures or notifications were seeded. Existing sessions must sign in again after the database change.

Active baseline: 1 real staff administrator, 1 preserved enquiry, 0 customers, 0 payments/orders, 0 notifications; 1 genuine new client-release import audit event. New real operations continue generating audit events normally. Old audit history and dummy data are not included in the active Admin. Private pre/post inventory and restoration evidence remain Git-ignored.

Vercel was still explicitly building standalone demos despite the normal Admin mode fix. Its root build command and Admin CSP are now corrected for the live application. A same-origin serverless bridge requires IKONECTT_BACKEND_ORIGIN pointing to the actually hosted HTTPS backend. Until that address is configured, online authentication and live data are not commissioned; the UI must report unavailable service. See CLIENT_HANDOVER.md for settings. No new Vercel project or alternative client domain was created.

Verification for the final deployment correction: 225 frontend tests passed, including Vercel proxy/configuration checks; the exact `--with-admin` build passed and its generated login was checked for enabled real credential fields and absence of the demo selector. The clean local backup was restored into a separate database with counts verified; the active database was not replaced during restoration testing.
