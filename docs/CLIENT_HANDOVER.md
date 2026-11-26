# Ikonectt client operations and deployment handover

Prepared 25 November 2026. This describes the current source implementation, not a claim that a production server or live AI account has been commissioned. Current verification results and cleanup decisions are in `docs/PRODUCTION_READINESS_REVIEW.md`; the assistant completion report retains earlier historical checkpoints.

## Architecture and scope

The approved Option E website reads plans, coverage, published FAQs/knowledge and contact settings from the persistent NestJS/PostgreSQL backend. Admin manages these records through protected, role-checked APIs. The assistant uses those same records and the existing enquiry service. There is no separate vector database or duplicate ECRM.

`option-e/` and `shared/` are public sources; `scripts/build_public.cjs` produces `dist-public/`. `admin/` is the staff application, `backend/` contains services and migrations, and `contracts/` contains shared validation contracts. Generated output is not edited manually. `public_html/` is legacy output and is not the production source.

The custom customer application, local wallet and related services are retained in source but are outside this delivery. Public customer access goes to **https://portal.ikonectt.com**. Production must keep `CUSTOMER_PORTAL_ENABLED=false`; do not re-enable dormant services without a separate review. There are no temporary public Admin shortcuts.

### Current assistant flow — 26 November 2026

The welcome collects name, Nigeria (+234) phone and an optional initial question. Valid phone numbers are normalized to E.164. Coverage checks, selectable location matches, published troubleshooting and live plan information remain inside chat. Operational enquiries, installation, quotations, faults and service requests link to the existing website forms. The assistant no longer creates a second form-submission mechanism.

Name, phone and enquiry context can prefill the destination form through a one-use, five-minute in-memory handoff. Nothing is put in URL parameters or browser storage. Restart/unmount clears it. The website form retains its validation and explicit consent and submits to the existing lead API with a structured category, source page/channel and idempotency key. My Ikonectt opens https://portal.ikonectt.com.

See `docs/PRODUCTION_READINESS_REVIEW.md` for the current verification and cleanup inventory. Earlier live QA enquiries were removed after backup; their former IDs are historical evidence, not current operational records. Native browser verification remains blocked by the desktop tool initialization error.

## Daily administration

Sign in to `/admin/` with an individually assigned staff account. Change the bootstrap password at first login. Only administrators with `staff.manage` can configure AI credentials and contact settings. Assign minimum necessary roles; do not share administrator credentials.

- **Plans:** edit published names, speeds, prices, features and confirmed billing attributes. Business prices may remain quote-only. Do not infer a billing period from a price.
- **Coverage:** add, edit or deactivate the imported service-area records. Our own registry supplies coverage; **no external coverage API is required**. A registry match indicates an area, not an exact-address installation guarantee.
- **Knowledge:** edit approved questions, answers and search keywords. Publish only confirmed material. Drafts are excluded from public FAQs and assistant retrieval. Resolve conflicting articles before publishing both.
- **Enquiries/support:** an enquiry reference is returned only after local persistence. A local reference does not mean a ticket was accepted by the client's external support system. Review and follow up in Admin; external support integration remains pending its real contract.
- **AI Assistant settings:** save provider/model/limits, replace or revoke credentials and run a connection test. Saved credentials are never returned. Review usage and audit records.
- **Contacts:** change the WhatsApp destination in Admin contact settings. Both the green launcher and assistant links read this setting. The approved initial destination is `https://api.whatsapp.com/send/?phone=2349168965000&text&type=phone_number&app_absent=0`.

The source import retains 83 coverage rows and identifies two duplicate pairs; 81 primary records are intended for search. The spelling `Victiria Island` is retained with a Victoria Island search alias pending confirmation. Seven supplied plans and 20 published knowledge articles were the previous baseline; consult the final report for observed counts. Existing records are preserved on repeat imports rather than overwriting later Admin edits.

## Client-owned AI onboarding

OpenAI is the implemented provider; other vendors are not presented as working integrations. The client owns the provider account and pays its API usage charges. A ChatGPT subscription does not configure this backend.

1. Create or use the client's OpenAI API organization/project at https://platform.openai.com/ and arrange API billing and an appropriate project budget.
2. Generate a project API key with the minimum permissions needed for model responses. Keep it out of email, chat, Git and frontend configuration.
3. On the backend host, generate an independent random 32-byte hex `AI_ENCRYPTION_KEY`, stored in the host's protected secret configuration, separately from PostgreSQL. Alternatively supply a client-owned `OPENAI_API_KEY` as a server environment secret.
4. In Admin AI settings choose the implemented provider and a model available to the client's project. Enter the API key only if using encrypted Admin storage. Saving a credential requires the encryption key. A database copy alone cannot decrypt it.
5. Save, then **Test connection**. This makes a small real provider request and is subject to limits. A successful test confirms that selected account/model was reachable at that time. Invalid credentials, model restrictions, network failures or exhausted quota must be resolved before enabling model assistance.
6. Enable model assistance and use conservative output-token and daily request limits. Monitor the provider's own billing dashboard as well as local request/token usage. Local limits are request/token controls, not a currency billing guarantee.
7. Replace or revoke keys when staff access changes or a compromise is suspected. Admin revocation removes this application's stored credential and suppresses its environment fallback; it does not revoke the key at OpenAI. Revoke a compromised key in the provider's account as well. Keep database and encryption-key backups protected and separate.

The provider adapter uses a server-side HTTPS request with timeout and disabled response storage. Bounded history and selected published article metadata support classification; model free text is not exposed as operational fact. Backend-rendered prices, coverage and approved article answers remain authoritative. Known plans, coverage, contacts and FAQ routes avoid paid calls. Unknown topics ask clarification or offer support rather than invent an answer. Provider-disabled mode leaves those deterministic tools and enquiry capture available.

Official provider references: https://developers.openai.com/api/reference/overview and https://developers.openai.com/api/docs/guides/migrate-to-responses . No client key or live paid-model test was supplied during implementation.

## Client server deployment

Required services: a supported Node.js LTS runtime compatible with the lockfiles, PostgreSQL, a process supervisor, HTTPS reverse proxy and protected host secret storage. Use a reviewed release of the single canonical repository; do not deploy a second divergent checkout. Vercel remains a presentation environment, not an assumption about final hosting.

Before deployment, take a PostgreSQL backup and verify restoration in a separate database. Install locked dependencies with `npm ci` in the root, `contracts/`, `backend/` and `admin/`. In `backend/`, run `npm run db:generate`, then `npm run db:migrate`, `npm run build` and `npm run contracts:check`. Run Admin and frontend tests for the exact release.

Backend host settings:

| Setting | Required treatment |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Dedicated persistent database; least-privilege application account; never the test DB |
| `HOST`, `PORT` | Bind backend privately, e.g. loopback port 4000 behind proxy |
| `CORS_ORIGINS` | Explicit approved HTTPS origins; no wildcard |
| `TRUST_LOOPBACK_PROXY` | Default `false`; enable only for a private loopback reverse proxy that overwrites forwarded client-IP headers |
| `SESSION_HOURS` | Approved staff session lifetime, maximum 24 hours |
| `NOTIFICATION_ENCRYPTION_KEY` | Protected independent 64-hex-character server secret |
| `AI_ENCRYPTION_KEY` | Independent protected 64-hex-character secret for saved AI credentials |
| `OPENAI_API_KEY` | Optional server-only client credential; never a public build variable |
| `CUSTOMER_PORTAL_ENABLED` | `false` for this delivery |
| Adapters | `COVERAGE_ADAPTER=native`; email/SMS/legacy disabled until genuinely integrated; never simulated in production |

Do not run development fixtures or database reset helpers in production. The client import entrypoints deliberately reject production execution: rehearse their non-destructive imports in an isolated staging database, review the resulting data/audit trail, and use a reviewed migration or approved database transfer for first production population. The one-time staff seed creates only an explicitly configured administrator and does not reset existing credentials or create sample customer records. Supply seed credentials only through protected temporary server settings and remove them afterward.

For the public artifact, set `NODE_ENV=production`, `IKONECTT_SITE_ORIGIN=https://<approved-client-domain>` and `IKONECTT_PUBLIC_API_BASE=/api/v1`, then run root `npm run build -- --with-admin`. This includes the live Admin build, not demo mode. Serve `dist-public/` as static files. Reverse proxy `/api/` to the backend; use `/admin/` SPA fallback only within that directory, and keep `/admin` and `/api` out of indexing. Do not expose source trees, `.env`, backups, `node_modules`, test logs or development database directories. Start the backend using its `npm start` under the process supervisor. The local public preview server only proxies approved public APIs and is not the production full-API reverse proxy.

Terminate TLS at the proxy, enforce HTTPS, configure suitable security headers and request-size limits, and verify the actual domain/CORS setup. If proxying over loopback, enable `TRUST_LOOPBACK_PROXY=true` only when the API is private and the proxy overwrites `X-Forwarded-For`; otherwise request throttles see the shared proxy IP. Never trust arbitrary forwarded headers from an exposed API. Readiness and health endpoints are documented in the generated backend contract; check them after every release. Production does not expose the development Swagger UI. Configure structured process logs with retention/access controls; never log credentials, full chat histories or form payloads. Monitor API failures, rate-limit events, database health and backup failures.

Without an approved site origin the build writes a no-index robots policy for previews. With an origin it generates canonical metadata, `robots.txt` and a sitemap for the actual Option E SPA document. Hash routes are not separate crawlable pages; route-specific search optimization would require a separate rendering/routing project. Review legal/privacy copy and data retention with the client before public launch.

## Database maintenance and recovery

Schedule encrypted `pg_dump` backups to protected off-host storage, with a defined retention period and recovery objective. Back up secret material separately through the client's secret-management process. Regularly restore into a separate database using `pg_restore`, verify record counts and a read-only application smoke test, then record the restoration result. Never test recovery against the live database. PostgreSQL volume persistence alone is not a backup.

For releases: backup, apply additive migrations with `prisma migrate deploy`, start the new backend, check readiness, then publish the matching static/Admin artifact. Retain the preceding release and assess database compatibility before rollback; never use `prisma migrate reset` as rollback. Production data imports and corrections require a reviewed, auditable plan.

## Outstanding commissioning items

- Client host/domain/TLS, persistent database, production secret storage and verified backup/restore schedule.
- Client-owned provider billing/key/model and a successful live connection test. Automated mocked provider tests do not establish live availability.
- Actual client support API documentation, sandbox access and technical contact before external ticket exchange; no invented endpoints or duplicate CRM.
- Confirm remaining ambiguous commercial terms, duplicate coverage identities, privacy/legal wording and operational retention policy.
- Configure real email/SMS only if commissioned; a disabled adapter does not deliver messages.

WhatsApp is a secure external link only: no WhatsApp Business API, message synchronization or automatic delivery claims. Model-driven financial/account actions are prohibited. Optional future work includes additional tested provider adapters and separately commissioned search rendering; neither is required for the current interface.
