# Four-experience client presentation

Prepared 29 October 2026 on `presentation/vercel-demo`, based on the approved website commit `70ae105`. This is a temporary static client demonstration. The existing website production branch is not merged or replaced.

## Reuse and repository layout

One repository contains `option-a/`, `option-e/`, `admin/` and `my-ikonectt/`. The application folders are reused from the completed standalone integration revision `7770b7d`, not rebuilt as new products. The real backend, database, migrations and canonical contracts remain in their existing integration worktree/branches; this presentation branch neither changes nor removes them.

Admin uses the existing `src/fixtures.ts` and `src/wallet-fixtures.ts`, with the existing demo-only `src/demo-fixtures.ts` wrapper. Customer presentation uses the existing isolated `standalone/model.js`. All identities and financial records in these providers are fictional. No database, credentials, payment gateway, email/SMS or ISP connection is needed.

`build:demo` remains each app's explicit standalone choice. Normal build/provider behavior is retained. Backend failures never silently become mock responses. State is local/resettable; the two demos do not share a database or synchronize.

## Build and hosting

`npm run build:presentation` calls the existing website build and both existing application `build:demo` commands. It copies their static output into:

| Experience | Output and hosted path |
| --- | --- |
| Presentation landing | `public_html/index.html` → `/` |
| Option A | `public_html/option-a/` → `/option-a/` |
| Option E | `public_html/option-e/` → `/option-e/` |
| Admin/CRM | `public_html/admin/` → `/admin/` |
| My Ikonectt | `public_html/my-ikonectt/` → `/my-ikonectt/` |

This small packaging step lets the existing Vercel project serve all four experiences, without duplicate projects or framework/backend changes. Its original website build command is still available as `npm run build`. Presentation-only `vercel.json` selects `npm run build:presentation`, installs the existing app dependencies, preserves the public output directory and adds route-specific demo security headers. No API proxy or functions are configured. Trailing-slash redirects preserve relative customer assets.

Only `/admin/` and `/my-ikonectt/` receive the restrictive application CSP (`connect-src 'none'`, `form-action 'none'`). The existing public website preview/iframe is preserved. No-index headers cover the temporary presentation. Existing Vercel preview protection should be retained; no paid protection or account-setting change is introduced. The optional Vercel Toolbar may be blocked by the demo CSP; no network policy is weakened for it.

Use the existing Git integration to deploy the pushed presentation branch as a preview. Keep the existing production URL and `main` unchanged. Do not invent a preview hostname: use the URL returned by the actual deployment and verify all four paths. Final hosting evidence and any account-specific limitations are reported by the orchestrator after deployment.

## Presenter access

- On Admin, expand **Review the application**, select a staff role and choose **Open simulated workspace**. No password is required. Role selection illustrates the existing permissions within isolated sample state.
- On My Ikonectt, expand **Review the application** and choose Ada Okafor or Meridian Studio. Ada has expired residential service and ₦30,000; Meridian has active business service and ₦0.
- Ada's **Renew Plan** requires explicit confirmation for ₦19,500. Reservation leaves ₦10,500 available and keeps service expired. The separate **Simulate confirmed service completion** action consumes the hold and marks only the sample service active. Funding alone never activates or renews service.
- Support tickets/replies and other supported sample actions are local only. Financial/provider/security operations that cannot be simulated stay explicitly unavailable. There is no unrestricted real customer self-registration.
- Refresh/reset restores fictional records as disclosed. Admin exit/reload returns to role selection; customer refresh retains only profile selection and restores sample state. Theme preference persists separately.

## Local validation

After building, run `node scripts/serve_presentation.mjs 4188` for a static-only local preview. It serves only `public_html`, applies demo headers, returns 404 for API/private paths and rejects mutation requests. Run the existing website/Admin/customer tests plus `node --test tests/presentation.test.mjs`; the latter checks four landing destinations, existing A/E controls, precise artifact packaging, path redirects and scoped policies. Do not use local success as proof of a hosted deployment.
