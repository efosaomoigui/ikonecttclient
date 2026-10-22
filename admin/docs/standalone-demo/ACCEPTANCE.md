# IKONECTT — Standalone Admin demonstration acceptance

22 October 2026. Admin owner report. No deployment, merge to main, backend change or live financial action performed.

## Scope and location

Implemented from approved `3b0060c5dcdc0df121cc4aa7dd95ab796edd62a2` in branch `codex/ikonectt-admin-standalone-demo`, at `C:\Users\Efe-Dev\.codex\worktrees\ikonectt-admin-standalone-demo\ikonectt\admin`.

Stage A findings are in [FEASIBILITY.md](FEASIBILITY.md). Changes are scoped to Admin. The approved layout, typography, light/dark/system themes, accordion navigation and single simulation banner are retained.

## Build and demonstration instructions

From the Admin directory run `npm ci --include=dev`, then `npm run build:demo`. Static output is `dist-demo`, with Admin under `/admin/`. Serve this directory with the response headers in `vercel.json`; do not serve repository source or `.env` files. The coordinator provides the combined static preview helper/runbook separately. This owner's temporary QA address was `http://127.0.0.1:4196/admin/`; it is not a deployed client URL.

Open **Review the application**, select Admin, Support, Sales, Finance, Provisioner or Executive, then **Open simulated workspace**. No credentials are required or accepted by the demo sign-in form. Exit demonstration or reload resets local sample changes. Theme preference persists independently. Refreshing a permitted hash route returns to role selection, then resumes that route.

The normal `npm run build` continues to write `dist` with real integration behavior. The integrated Admin/API/portal runtimes were not stopped or restarted by this task.

## Independent fictional scenarios

- Ada Okafor: residential, previous service ended 21 September 2026 and is suspended; available credit ₦30,000, no hold or pending credit. Published Demo Home 80 catalogue and illustrative renewal price both ₦19,500.
- Meridian Studio: business, active subscription through 31 December 2026; available credit ₦0. Its unverified top-up is not spendable.
- Example identities, contact details, IDs and ledger entries are fictional. Admin and the separate customer portal demonstration do not share state or synchronize changes.

## Interactive and unavailable capabilities

Local sample lists, details, searches, status filtering, forms, customer creation, catalogue/coverage edits, order-payment review, separate simulated provisioning, and support replies/status use existing in-memory workflows subject to sample role permissions. They are illustrations, not backend acceptance evidence. This browser run explicitly exercised customer creation/search/detail and support reply/status/reset; it did not execute every financial/provisioning mutation.

Wallet summaries, ledger, top-up reports and renewal records are inspectable. Wallet financial mutations remain unavailable in the standalone preview and show an explicit error rather than success. Real authentication, credential setup/reissue, recovery delivery, bank settlement, provider activation and cross-application synchronization are unavailable. No real credentials, payments or provider calls are needed.

## Isolation and Vercel preparation

`build:demo` selects an immutable build flag. The API request method rejects before fetch, including if runtime mode is accidentally set to live. Normal builds retain the real request path; failed real requests do not become simulated success. The demo disables real sign-in inputs/submission, replaces recovery/setup with an unavailable explanation, and removes credential reissue.

All fonts, logos, CSS and scripts are local. Demo HTML and static response headers block connections (`connect-src 'none'`) and form submissions (`form-action 'none'`). Noindex metadata, `robots.txt`, and `X-Robots-Tag` are included. Noindex is not access protection.

For a separate Vercel project choose root directory `admin`. The checked-in `admin/vercel.json` specifies framework null, `npm ci --include=dev`, `npm run build:demo`, output `dist-demo`, `/` redirecting to `/admin/`, and headers applying to `/(.*)`. Enable an appropriate [Vercel deployment protection method](https://vercel.com/docs/deployment-protection) before sharing a hosted preview. No account, keys or deployment were created. See [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json).

## Actual browser results

All six roles entered through Review without credentials. Every permitted navigation destination was clicked and its expected heading awaited before recording:

| Role | Screens | Console errors |
|---|---:|---:|
| Admin | 18 | 0 |
| Support | 7 | 0 |
| Sales | 5 | 0 |
| Finance | 8 | 0 |
| Provisioner | 7 | 0 |
| Executive | 2 | 0 |

Each fresh dashboard role entry had collapsed navigation and one simulation banner. Light and Dark desktop screenshots are saved. At an actual 390 × 844 viewport, document width was 390: no page overflow; the table has its existing horizontal scrolling area. Drawer open/close, account-menu theme change and Light/Dark appearance were checked and captured. The temporary viewport override was reset.

A fictional customer was created, searched and opened. Its wallet now displays zero credit, held funds and pending top-ups. A support reply appeared locally; ticket status changed to Resolved. Reload reset it to Open and re-entering a role preserved `#/tickets`. No browser console errors occurred. Static server logs during browser QA contain only GET requests for local artifacts, no API paths or POST requests. Independent CLI probes confirmed API GET 404 and POST 405. Server logs alone do not prove absence of requests to other hosts; the CSP, build tests and transport spies provide that additional isolation coverage.

## Defects corrected

1. Newly created standalone customers lacked a wallet summary, causing a visible schema error in customer details. Demo-only creation now initializes an empty valid wallet; a regression test opens the detail and checks zero balance.
2. Customer creation wording implied backend account/password creation in standalone mode. Demo-only copy now explicitly says it creates fictional local data and no real account/password.
3. Initial standalone Home catalogue price and renewal illustration differed. Both now show ₦19,500; fictional historical wallet totals were reconciled.

## Validation and limits

Standalone tests: 12 passed, including artifact isolation, login/recovery denial, all six roles, theme retention, fixture reconciliation, local workflows/reset, deep routes and guard-before-transport. Normal suite: 64 passed. Normal production build and TypeScript: passed. `git diff --check`: passed. Evidence is in [evidence/](evidence/), including screen-ready role results, mobile measurements, workflow results and a credential-free network summary.

Ready for a controlled client demonstration with the stated read-only boundaries and explicit fictional-state labeling. This does not establish production readiness, live shared-database journey acceptance, provider readiness, or backend authorization security. Sample roles illustrate permissions locally; they are not a security boundary. Deployment protection and the coordinator's final combined artifact check remain release prerequisites. No production deployment or merge is authorized by this report.
