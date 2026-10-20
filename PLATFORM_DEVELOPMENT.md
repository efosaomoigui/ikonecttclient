# Consolidated Ikonectt development platform

This integration branch contains the existing public website, the NestJS API, Admin/CRM and My Ikonectt. The public website stays on its separate design approval track. No production deployment is configured here.

## Folder ownership

| Folder | Responsibility |
| --- | --- |
| `backend/` | NestJS controllers/services, identity, permissions, Prisma schema/migrations, provider adapters, outbox, database helpers and backend tests |
| `contracts/` | Canonical API v1.0.1 schemas, clients, OpenAPI, endpoint/permission map and frontend handoff |
| `admin/` | Staff Admin/CRM frontend, its own dependencies/build/tests, pinned generated contract/permission copies |
| `my-ikonectt/` | Customer frontend, its own dependencies/build/tests, pinned canonical client sources |
| `shared/`, `option-a/` through `option-e/`, root HTML, `assets/`, `public_html/` | Existing public website/design showcase; no platform frontend is mixed into these presentation folders |
| `scripts/platform*.mjs` | Local installation/start/stop/contract/acceptance/compiled-preview tools |
| `docs/stage4/` | Credential-free consolidation evidence and release report |
| `.platform/` | Git-ignored local configuration references, process control token, logs, browser test credentials and isolated website build |

Admin and customer UI code never import backend services or Prisma. Their shared boundary is the canonical HTTP API. Vendored contract copies retain canonical provenance and are checked for drift; do not edit copies independently.

## Existing machine setup

Validated with the installed Node/npm and PostgreSQL 16 on Windows. Use the package lockfiles. From PowerShell:

```powershell
Set-Location 'C:\Users\Efe-Dev\.codex\worktrees\ikonectt-platform-stage4\ikonectt'
npm run platform:install
npm run platform:configure -- --backend-root 'C:\Users\Efe-Dev\.codex\worktrees\ikonectt-core-backend\ikonectt\backend'
npm run platform:check
npm run platform:dev
```

`configure` is a one-time operation. This machine is already configured; skip it on subsequent starts. It refuses to overwrite an existing configuration. Review `.platform/config.json` manually when intentionally changing its owner directory. `--pg-bin 'C:\Program Files\PostgreSQL\16\bin'` is available if the default differs.

The installer runs locked installs sequentially in root, contracts, backend, Admin and portal and explicitly generates Prisma Client. It does not install website option dependencies unless `--website` is supplied. Do not run simultaneous installs in the same package directory.

The database and secrets remain in the original backend owner directory. Configuration stores a path reference, not copied secrets. The supervisor verifies the helper-owned development database state and probes its name before starting applications. It starts PostgreSQL from that existing data directory if needed. It never initializes, migrates, resets or seeds a database on startup.

Keep the supervisor terminal open. Endpoints:

| Application | Local URL |
| --- | --- |
| API health | http://127.0.0.1:4000/api/v1/health |
| API explorer | http://127.0.0.1:4000/api/docs |
| Admin/CRM | http://127.0.0.1:3013/admin/ |
| My Ikonectt | http://127.0.0.1:4175/ |
| PostgreSQL | 127.0.0.1:55440, `ikonectt_development` |

The portal starts in live mode. Simulated records/provider results remain labeled; a failed live request does not become a successful mock response. The API payment gateway is disabled; payment reporting and authorized manual Finance verification remain available for simulated development transactions.

## Shutdown, health and recovery

From a second terminal in this checkout:

```powershell
npm run platform:status
npm run platform:stop
```

Ctrl+C also stops the supervisor. Shutdown stops only the application process trees this supervisor created. PostgreSQL is stopped only if this supervisor started it; an already-running database adopted at startup stays running. Database files persist in both cases. The control token is local and ignored by Git.

Occupied application ports cause a safe startup refusal. Identify the previous checkout/process and stop it deliberately; this tool does not kill or adopt arbitrary applications. An unexpected owned child exit stops the other owned apps. Inspect `.platform/api.log`, `admin.log`, `portal.log` and `postgres.log` locally, correct the cause, then run `platform:dev` again. `platform:status` checks URL availability, not source revision or process ownership; use the active supervisor runtime state for ownership. These are terminal-managed development services, not installed Windows services or production monitoring.

## Verification commands

```powershell
npm run check --prefix backend
npm run build --prefix backend
npm run contracts:check --prefix backend
npm run platform:check
npm test --prefix admin
npm run build --prefix admin
npm test --prefix my-ikonectt
npm run typecheck --prefix my-ikonectt
npm run build --prefix my-ikonectt
npm test
node admin/node_modules/tsx/dist/cli.mjs scripts/platform-acceptance.mjs
```

The last command makes new isolated SIMULATED development records through real HTTP using the shipped frontend adapters. It requires the configured owner development environment and role account manifest. It must not target staging or production. It writes credential-free JSON under `docs/stage4/`; fresh browser credentials stay only in `.platform/browser-accounts.json`. Add `--api-only` to retain an existing coordinated browser account instead of preparing another one. No existing customer credentials or prior acceptance records are reset.

Backend tests require the independent test database, not the development database. Start `node scripts/test-db.cjs start` in the **original backend owner** directory. Then, from this integration checkout's `backend/`:

```powershell
node --env-file='C:\Users\Efe-Dev\.codex\worktrees\ikonectt-core-backend\ikonectt\backend\.env.test.local' --require ts-node/register/transpile-only --test --test-concurrency=1 test/*.test.ts
```

Tests enforce a database name ending in `_test`. Use the owner `test-db.cjs stop` helper afterward. Never set test database variables to the development or production URL.

Production asset smoke previews use only built `dist/` files and proxy `/api/` to the same local API:

```powershell
npm run build --prefix admin
node scripts/platform-preview.mjs admin
# Separate terminal: http://127.0.0.1:3014/admin/
$env:IKONECTT_MODE='live'
$env:IKONECTT_API_BASE='http://127.0.0.1:4176/api/v1'
npm run build --prefix my-ikonectt
node scripts/platform-preview.mjs portal
# http://127.0.0.1:4176/ ; Ctrl+C closes each preview
```

These preview servers are local smoke tools. They are not hosting/TLS configurations. Build the portal with the intended deployment API base before any later release.

The existing root website build rewrites `public_html/`. Stage 4 ran it against a separate Git-exported copy under `.platform/website-build/`, installing each option's lockfile there. Preserve that isolation when checking website production output. Text checkout line endings are pinned; the preservation regression accepts only LF/CRLF equivalents of the original checkpoint content.

## Database and operational ownership

See `backend/DEVELOPMENT.md`, `backend/PROVIDER_READINESS.md`, `backend/README.md` and `backend/ARCHITECTURE.md`. Existing migrations and bootstrap/fixture tools remain unchanged. Apply migrations deliberately with the target environment loaded and review migration status first; startup does not run them. Bootstrap credentials are local, never printed/committed. First-login password change remains enforced. Working simulated role accounts are for local acceptance only.

For the existing development cluster, use the original backend owner directory:

```powershell
npm run dev:db:backup
npm run dev:db:verify-backup
```

Verification restores to a new database and checks the fixture audit marker without selecting it or changing the active environment. It retains the archive and verification database. `restore-new` deliberately selects a new database and retains the previous one; review the documented procedure before using it, then restart the API. Preserve the notification encryption key with backups through a secure secret backup process. Local dumps and verification are not an off-machine backup policy, point-in-time recovery or disaster recovery sign-off.

Before staging: assign deployment and database owners; supply approved plans/coverage/official identifiers and policy decisions; configure a dedicated database, migration role, restricted runtime role, HTTPS origins/TLS, platform secrets, backup retention/restore drills, request/error/health alerting and outbox processing. Approve provider specifications and sandbox access before connecting them. Current sessions are hashed, database-backed, revocable bearer sessions held in browser memory; rate limiting is per API process. Use one API instance until shared throttle storage is configured. Simulated adapters are rejected in staging/production.
