# Admin delivery and verification

Current status: superseded by [Stage 2 integration report](STAGE2_INTEGRATION_REPORT.md). Real development staff login and 15 live acceptance groups have now passed; historical readiness observations below are retained for context.
19 October 2026. Local frontend delivery on `codex/ikonectt-admin-crm`.

Stage 2 update: the published API baseline is Agent 1 commit `61aa3ba`. Its public capabilities endpoint is now reachable; authenticated role/account integration remains pending. See STAGE2_HANDOFF.md for current origins, gaps and acceptance steps. The offline-backend observations below describe the original delivery check.

## 1. Admin screens

Branded staff login; dashboard; leads/enquiries; customers; plans; six-level coverage; orders; subscriptions; payments and receipt detail; provisioning; support tickets and conversations; operational reports. Reusable list/detail/form components provide search, status filtering, pagination, empty/loading/error feedback and responsive navigation. Official transparent PNG logo assets and the bundled Inter font are copied into this package.

## 2. Super Admin screens

Staff list/create/edit, multiple role assignment, enable/disable controls, shared permission matrix, integration status and customer reference linkage, audit activity and settings capability boundaries. Agent 1 currently defines ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER and EXECUTIVE; it does not define a distinct SUPER_ADMIN role. Administration uses the backend's `staff.manage`, `integrations.*` and `audit.read` permissions without inventing a new role.

## 3. Operational workflows

Staff-only customer creation and backend-issued setup-token display; permitted contact/status editing; lead status/customer linkage; current plan editing and publication; coverage hierarchy/eligibility/evidence; staff order/payment-report creation; finance verification with explicit confirmation and evidence; confirmed receipts; independent manual provisioning request and evidenced result; support ticket create, shared reply, assignment and resolution/closure; staff role/access updates; external CRM reference linking; audit review.

Customer setup tokens are displayed once in a dialog and not persisted by the frontend. Real credentials are never hard-coded. In-memory simulated actions remain visibly labeled, and simulation entry is enabled only in development or explicit review builds.

## 4. Shared API contracts consumed

Agent 1 API v1 schemas and role permissions are synchronized into `vendor/`. Runtime list responses and form requests use the shared Zod schemas, including AdminPayment evidence and TicketDetail messages. The customer setup response and staff-ticket input follow the exact composed schemas exposed by Agent 1's controllers. Paths cover `/auth/*` and `/admin/{permissions,customers,leads,plans,coverage,orders,subscriptions,payments,provisioning,tickets,staff,reports/summary,audit,integrations}`. External references use `/admin/integrations/customers/:id/references`.

## 5. Live backend connections

The dev proxy is configured for Agent 1 at port 4000. A connectivity check found no reachable service there during this delivery. No real staff login, database mutation, provider connection or end-to-end backend authorization result is claimed. The frontend handles unavailable service, request timeout, 401 expiry, 403 denial and structured validation errors without silently falling back to sample data.

## 6. Simulated and contract-blocked features

Development/review mode supplies temporary typed sample records for operational testing. It is a frontend test adapter, not a backend or database. No live payment, network or notification provider is configured by this work.

Lead notes, assignment, source metadata and follow-ups; support categories, priority and internal notes; custom role permissions; editable settings; and provider credential configuration remain blocked by missing Agent 1 contracts. Production deployment assembly is also separate: the existing public-site build script is unchanged. Full production acceptance requires Agent 1 integration, approved hosting assembly and real browser visual review.

## 7. Permission tests

Automated tests exercise all six role/module combinations, denied writes, server-supplied permissions overriding frontend role assumptions, backend 403 handling, expired/revoked sessions, last-admin protection in the simulator and direct forbidden-route access in the DOM. Payment confirmation is audited and cannot activate a subscription; manual activation requires a distinct evidenced provisioning action. Transport tests use controlled HTTP responses; they do not replace Agent 1's server authorization tests.

## 8. Visual and responsive tests

DOM tests mount every admin screen and exercise login controls, customer search/detail/create, restricted navigation, empty states, modal Escape and logout. Structural CSS checks cover mobile navigation, horizontal table overflow, dialog height containment and reduced-motion handling.

The browser automation security policy rejected inspection of the local preview. No screenshot or real viewport measurements were obtained, and browser visual/responsive acceptance is outstanding. The local preview is available for the user's manual walkthrough in README.md.

## 9. Build results

TypeScript checking and Vite bundling pass. A production DOM smoke check confirms the login renders with simulation entry disabled. The review build and automated test command are `npm test --prefix admin`; the production build is `npm run build --prefix admin`. The test suite contains 24 tests and has passed. Build output is isolated in `admin/dist/` and ignored by Git. Only `admin/` source files are changed; the public website, My Ikonectt and Agent 1's worktree are not modified.
