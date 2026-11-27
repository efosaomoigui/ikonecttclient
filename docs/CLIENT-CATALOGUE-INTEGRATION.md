# Client plans and coverage integration

The client CRM is the source of published plans, monthly prices, download/upload speeds and area coverage. Our backend remains responsible for website enquiries, staff workflows, contact configuration and published support knowledge. This integration does not modify wallet or payment services. My Ikonectt continues opening https://portal.ikonectt.com.

## Configuration and hosting

Set `IKONECTT_CATALOGUE_PROVIDER=client` and `WEBSITE_API_KEY` in the backend's private environment. The local key is saved in Git-ignored `backend/.env`. Never prefix it with `VITE_`, expose it in browser configuration, commit it or embed it in a URL. An environment template contains placeholders only.

The normal backend serves the existing `/api/v1/plans`, `/api/v1/plans/:id` and `/api/v1/coverage/service-areas` routes through `server/client-catalogue.js`. It calls the fixed HTTPS origin `https://crm.ikonectt.com/api/v1/public` with `X-API-KEY`. Browsers call our same-origin public proxy; they do not receive the key or depend on the CRM's browser CORS allowlist. No Vercel account or configuration is required for this deployment model. The optional existing hosting bridge reuses the same adapter for these read-only routes.

On a new host, deploy the Node backend and PostgreSQL, apply `prisma migrate deploy`, provide its private environment, build with `npm run build:release`, and reverse-proxy `/api/v1` to the backend over a trusted connection. Configure the public server's `IKONECTT_PUBLIC_API_ORIGIN` for that backend and verify enquiry/staff access separately. Keep TLS verification enabled. Windows local review uses Node's `--use-system-ca`; use an actively supported Node version with that option when system certificates are needed.

## Authority and retained implementation

`IKONECTT_CATALOGUE_PROVIDER=internal` retains the previous local catalogue for isolated tests or an explicitly approved alternate setup. It is not a network fallback. Client mode never substitutes old database plans or coverage when CRM access fails. Admin displays the client catalogue read-only, and the server rejects local catalogue writes. Legacy building eligibility routes are unavailable in client mode; area presence cannot confirm building feasibility.

Our database plan history is preserved. Stable UUIDs derived from client plan IDs retain the website's existing route contracts. A new enquiry stores `clientPlanReference` and `clientPlanName`, with the local `planId` left null. It does not create a competing plan record. Existing confirmed orders and financial records remain untouched. Idempotent enquiry retries return the saved receipt even during a subsequent CRM outage.

## Plan descriptions and presentation

Full client names, such as `i-Basic_50Mbps`, are preserved. `price_per_month` means monthly billing; no fixed 30-day period is inferred. Naira amounts become exact integer minor units. Upload/download rates always come from the current response.

Descriptions follow this priority:

1. Non-empty client API description.
2. `shared/plan-descriptions.json` mapping by client ID and category, then normalized name and category.
3. A category-specific generic description.

The current mapping contains approved generic editorial copy, not a claim to reproduce the earlier spreadsheet verbatim. Speed placeholders use the live response. Replace only the editorial templates when exact client descriptions are supplied. Descriptions do not contain prices, invented service promises or installation guarantees.

## Verification and failures

Requests time out after eight seconds, coalesce concurrent identical requests and cache successful responses for at most 60 seconds. Plan `fetchedAt` retains the actual fetch time while cached. Expired data is not used after failure. Missing configuration, invalid responses, authentication failure and provider downtime produce bounded errors without secrets or static substitutes. The existing website's unavailable states remain in use.

Coverage searches use `/coverage/check?q=...` with 2–100 characters and preserve multiple matches. Lists use `/coverage`. Results identify area presence and explicitly retain exact-address feasibility qualification. A missing match does not prove service is unavailable.

Automated checks cover contract validation, money conversion, provider descriptions, generic descriptions, stable identifiers, cache expiry, request coalescing, multiple/no coverage matches, read-only Admin, selected-plan enquiry persistence, offline idempotent retries and absence of local catalogue writes. Browser rendering must also be reviewed on the chosen production host before release.
