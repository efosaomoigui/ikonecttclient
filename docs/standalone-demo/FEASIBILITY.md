# Standalone demonstration feasibility

Assessment recorded before implementation, against integration commit `3b0060c5dcdc0df121cc4aa7dd95ab796edd62a2`.

## Decision

Feasible as two isolated static frontend builds. No backend, database, authentication service, payment integration or provisioning redesign is required. Proceed with the scoped implementation in the user's brief; do not deploy.

## Existing capabilities

- Admin has an explicit review entry, six staff roles, permission-gated navigation and schema-checked in-memory records. Lists, filters, operational forms, ticket replies and audit changes already have simulation branches. Wallet financial mutations explicitly reject in preview. Normal login/recovery still call the API, so the existing review build alone is not a sufficiently isolated standalone artifact.
- The portal explicitly selects mock or live adapters; it does not fall back after API failure. Mock services, billing, orders, plans, coverage and support exist. Wallet previews expose scripted presentation states and limited intents, rather than the requested end-to-end client demonstration. Existing mock entry requires demonstration credentials.
- Both apps already have approved themes, local assets/fonts and hash navigation. Their runtime can therefore be served statically, provided the correct base paths and explicit configuration are supplied.

## Gaps and implementation scope

- Add dedicated demo build commands and separate outputs; retain ordinary integrated builds.
- In standalone Admin builds, retain the review selector and disable real authentication/recovery networking at the request boundary. Preserve all six role permissions and existing UI refinements.
- Add a collapsed portal review disclosure with two passwordless fictional profiles: expired residential service with NGN30,000 and an illustrative NGN19,500 renewal; active business service with zero wallet balance.
- Implement a demo-only resettable state adapter for funding, explicit renewal reservation and separately confirmed simulated completion, and support interactions. Funding must leave service state unchanged. Keep this adapter outside live financial behavior.
- Clearly disclose simulation, illustrative prices and independent application state. Never imply the Admin and portal deployments share a database.
- Provide independent Vercel project configurations, restrictive demo network policy, no-index metadata/headers and local static-only serving/verification. Keep the repository's public-website `vercel.json` untouched.

## Build and deployment constraints

- Admin currently builds with `/admin/` as its base; an independent deployment must preserve that prefix or explicitly adapt asset paths. Its ordinary production build excludes the review entry.
- The portal currently emits a runtime config containing a default localhost API origin. A standalone artifact must emit an explicit demo configuration without depending on that origin.
- Portal contract compilation uses the committed local `vendor/` snapshot, so its application folder can be an independent build root. Contract synchronization is a separate integration operation and must not run during a client demo deployment.
- No server API, environment secrets, database connections or external fonts should be necessary in either demo artifact.
- Hash route refresh behavior, both themes, role gates, scenario transitions, mobile rendering and actual network isolation require verification on the built artifacts; source inspection is not browser acceptance evidence.

## Risks and controls

- Keep all simulation selection explicit. Never convert a failed live request into mock success.
- Use separate outputs and static preview ports; leave the integrated platform running.
- Use synthetic data only. Do not copy `.env`, runtime control files, database fixtures or credentials into artifacts.
- Preserve approved theme/sidebar/top-up layout changes from the integration baseline when accepting frontend owner patches.
- Keep Admin financial functions read-only where no safe simulation already exists; document that limitation rather than presenting false success.
- Deployment authorization and account-specific Vercel protection settings remain later steps. No hosting action is part of this implementation.
