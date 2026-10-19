# Persistent Stage 2 development environment

This is the shared integration backend for My Ikonectt and Admin/CRM. It is independent of the
public website's visual template and has no production provider connection.

## Database separation and ownership

| Environment | Database / port | Storage |
| --- | --- | --- |
| Shared development | `ikonectt_development`, loopback 55440 | `backend/.local/development/postgres/` |
| Automated tests | `ikonectt_test`, loopback 55439 | Stage 1 test helper under ignored `backend/tmp/` |

The development helper owns a dedicated PostgreSQL cluster, role and database. It does not change
the installed PostgreSQL Windows service or unrelated databases. Data survives API and database
restarts. `.local/` and `.env` are ignored by Git and must not be distributed as contract artifacts.
The normal `.env` points to development; `.env.test.local` belongs only to automated test commands.

## Start or resume

Run commands from `backend/`, except the explicitly separate contracts installation.

1. Stop the API before reinstalling dependencies on Windows, to release Prisma's native DLL.
2. Run `npm ci` in backend and `npm ci` in the sibling `contracts/` directory.
3. Run `npm run dev:db` in a terminal and leave it open. On first initialization the helper creates
   a random database password, random notification key and ignored `.env`. On later starts it reuses
   the saved cluster/environment. It refuses to overwrite a pre-existing `.env` to claim a database.
4. Review `.env`. Supply `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` locally. Passwords require at
   least 12 characters. Quote a dotenv value containing `#`; otherwise the suffix becomes a comment.
   There is no committed default administrator password. The user's local administrator password was
   generated randomly with explicit authorization and saved only in this file.
5. Run `npm run db:generate`, `npm run db:migrate`, then repeat `npm run db:migrate`.
6. Run `npm run db:seed`. Repeat bootstrap preserves credentials and the initial password-change gate;
   using an existing non-administrator/disabled account as the bootstrap email is rejected.
7. Run `npm run dev:fixtures` to initialize the canonical SIMULATED development dataset.
8. Run `npm run dev` in another terminal. Origin: `http://127.0.0.1:4000`; API prefix: `/api/v1`.
9. Verify `GET /api/v1/health`, Swagger `/api/docs`, and OpenAPI JSON `/api/docs-json`.

For normal development only steps 3 and 8 are needed after configuration, migrations and fixtures exist.
To stop PostgreSQL cleanly, run `npm run dev:db:stop`. Retain `.local/` and `.env` to resume later.
These are terminal-managed local processes, not an installed always-on Windows service.

## Administrator and role accounts

The bootstrap administrator remains subject to first-login password change. Sign in through
`POST /auth/staff/login`, call `POST /auth/change-password`, then sign in again because all prior
sessions are revoked. There is no bypass for ADMIN or a separately invented SUPER_ADMIN identity.

`dev:fixtures` creates six separate SIMULATED staff role accounts with unique random initial passwords,
plus residential/business/suspended customer accounts. It records credentials only in:

`backend/.local/development/accounts-<current-database-name>.json`

Read that file locally; never commit it, paste its values into a chat, capture it in screenshots,
or add credentials to frontend source/browser storage. The regular customer/admin API does not expose it.
The live validation script completes initial password changes/setup through the existing API and updates
the local credential file with working development passwords. The user-supplied bootstrap account is
separate from these SIMULATED role accounts and is not changed by fixture validation.

Keep shared role/customer passwords and baseline scenario records intact for other frontend developers.
For an isolated imported/temporary-credential customer requiring password change, run
`node -r ts-node/register/transpile-only scripts/create-password-gate-account.ts`. This guarded development
scenario creates a new labeled account and writes a unique ignored credential file. It does not change
ordinary reset-token onboarding or shared account passwords. The portal owner may consume that isolated
account's password-change flow without affecting others.
Create separate labeled records for mutation tests. To add another customer, use staff onboarding and
the single-use setup token. For an unused expired fixture token, rerun `dev:fixtures`; it reissues setup
only while the fixture user has no password. Password-bearing accounts are never silently reset.

## Dataset and provider scenarios

The sole canonical dataset is `developmentFixtures` in `contracts/fixtures.ts`. The database initializer
consumes it rather than maintaining a second independent fixture catalogue. It includes:

- Two published SIMULATED plans: residential and business, with sample minor-unit prices.
- Five geographic parent levels and five buildings spanning all eligibility results.
- Residential, business and suspended customers; development account numbers remain labeled simulated.
- Six staff roles, enquiries, support conversations, order/payment/subscription/provisioning histories.
- Seven commercial scenarios: reported payment, paid awaiting provisioning, active service, failed
  provisioning, timeout/review, rejected payment and pending provisioning.

Repeated initialization preserves existing rows/identities and does not overwrite interactive work.
One development audit marker identifies the dataset. No live usage values are invented.

Current local modes are gateway disabled, native coverage, simulated provisioning/legacy/email/SMS.
Manual payment reporting remains available independently of online gateway selection. Provisioning
success occurs only after a separate authorized request against confirmed payment. Simulated provider
failure or timeout gives REQUIRES_REVIEW, never an assumed activation. Archived FAILED/PENDING outcomes
also remain available as explicitly labeled UI scenarios. Manual provisioning of simulated plans/coverage
is refused; do not remove simulation flags to get around that protection.

All simulated modes are rejected in staging/production. Simulated notification processing is not real delivery.

## Workflow and contract validation

```powershell
npm run build
npm run check
npm run contracts
npm run contracts:check
npm run dev:validate
node -r ts-node/register/transpile-only scripts/check-bootstrap.ts
```

`dev:validate` uses actual HTTP calls to the running loopback API with database assertions against the
owned persistent development database. It exercises workflows A-F, all roles, password changes/setup,
customer isolation, financial state separation, support, leads, audits, provider failure/timeout and logout.
It uses temporary real loopback Nest instances on the same development DB for alternate adapter scenarios;
it does not mock application services. It leaves labeled validation records for inspection.
First-time account setup may wait about a minute to respect the existing authentication rate limit.
It does not weaken authentication or increase quotas. The result is saved without credentials/tokens to
`.local/development/workflow-validation.json`.

`contracts:check` checks the published specification against generated OpenAPI and actual Nest route/guard
metadata, including all 75 operations, anonymous/staff/customer access, error schemas and fixtures.
`contracts` also generates the exact operation/permission table in `contracts/ENDPOINTS.md`.

Automated regression tests remain isolated from this DB: `npm test` and `npm run test:smoke` require the
dedicated `_test` database. A test environment loader prevents the development notification key from
being accidentally mixed with existing encrypted test records.

## Persistence check

```powershell
node -r ts-node/register/transpile-only scripts/check-persistence.ts snapshot
# Stop and restart only the API with npm run dev; leave the development DB in place.
node -r ts-node/register/transpile-only scripts/check-persistence.ts verify
```

This compares canonical customer/plan/order/staff identity and state fingerprints across restart.
It records no credential hashes or plaintext secrets. Persistence was verified during Stage 2.

## Backup, restore and safe reset

```powershell
npm run dev:db:backup
npm run dev:db:verify-backup
```

Backups are custom-format PostgreSQL archives inside `.local/development/backups/`. Verification actually
restores the archive into a new owned verification database and checks its fixture marker; the active
database and `.env` remain unchanged. Protect the archives and the notification encryption key separately.
Encryption keys and account-setup credentials are not recoverable from database records alone.

For a clean integration dataset, first stop the API and coordinate with both frontend owners:

```powershell
npm run dev:db:reset
npm run db:migrate
npm run db:seed
npm run dev:fixtures
npm run dev
```

Reset makes a backup, creates a new empty uniquely named development database and updates only the owned
DATABASE_URL. The old database is retained. It never drops/truncates a database or disables audit triggers.
Fresh fixture credentials live in a new per-database account file; communicate the new local path.

To restore an owned backup, with the API stopped:

```powershell
node scripts/development-db.cjs restore-new "<absolute path to an owned backup .dump>"
npm run db:migrate
npm run dev
```

Restore also creates a new database, retains the previous one and selects the restored copy. If available,
the corresponding current development account manifest is copied with the new DB name; an older archive
may contain older passwords, so verify accounts and use approved recovery when necessary.
Only archives inside this workspace's owned backup folder are accepted. Production mode, remote hosts,
the `_test` DB, other roles/ports, unsafe DB names and outside-workspace data paths are refused by guards.

## Remaining release dependencies

Detailed client ERD/policies, official identifiers, approved catalogue/coverage, payment/bank procedures,
CRM and ISP APIs, billing/usage, SMS/email, hosting/TLS, monitoring, backup ownership and refund/cancellation/
proration/reconciliation rules remain external discovery/release items. They do not block local frontend
integration. Rate limiting is still single-instance; shared storage is needed before horizontal scaling.
