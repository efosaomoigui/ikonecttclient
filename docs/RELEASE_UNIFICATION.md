# One canonical Ikonectt release

## Source and publishing

- Repository: efosaomoigui/ikonecttclient, branch main.
- Canonical checkout: C:/Users/Efe-Dev/Documents/business News/ikonectt.
- Authoritative public source: option-e/ and shared/. Staff source: admin/. Services: backend/. Contracts: contracts/.
- Generated release: dist-public/. public_html/ is archived presentation output and must not receive current product changes.
- Single live build: `npm run build:release`. Both local `npm run dev` and root Vercel configuration use it. Normal releases include the actual Admin, never standalone mock mode. Explicit demos remain isolated QA tools. Local-only feedback preview files are excluded from the release.
- Existing client host: https://ikonecttclient-kappa.vercel.app . No new project, alternative preview domain or separate landing page was created.

## Why WhatsApp disappeared

Thirteen deployed source/style files were compared against the committed main versions and all matched. The changes had reached Vercel. WhatsApp was hidden until the contact-settings API returned successfully; with the online backend unconfigured, that request failed and the link stayed hidden.

The approved WhatsApp contact now has one shared public configuration in shared/public-contact-settings.json. The release builder publishes those public contact details in shared/public-config.js, and the backend uses the same WhatsApp default when initializing settings. The launcher and Contact Support can therefore show the approved external contact without waiting for an operational API. When connected, the current authorized Admin contact setting overrides the published default. Contact requests are coalesced and successful results cached briefly to avoid duplicate requests. Personal data and credentials are never put into public configuration.

This is public company contact metadata, not a substitute operational database. Plans, coverage searches, knowledge retrieval, form submissions, AI-provider calls and staff authentication remain backed by the existing API. They do not fall back to fake records or static financial state.

## Release verification

Every build writes /release.json with the Git commit, template, live Admin mode and SHA-256 fingerprints of the delivered HTML, JS, CSS and JSON. This includes the assistant, inner-page refinements, contact page, phone library, public contact configuration and Admin code. Files are normalized for line endings before hashing. The manifest excludes secrets and database state.

Run `npm run verify:release -- http://127.0.0.1:3000/` locally or `npm run verify:release -- https://ikonecttclient-kappa.vercel.app/ <expected-full-commit>` after deployment. The tool checks every code/config asset against its release fingerprint, confirms WhatsApp configuration, and reports backend health separately. Add `--require-backend` for commissioning checks that must fail when API hosting is not ready. The verifier uses system certificate authorities; TLS validation is never disabled.

A matching static release is not proof that a separate backend is commissioned. The online /api/v1/health currently reports BACKEND_NOT_CONFIGURED until IKONECTT_BACKEND_ORIGIN is set to the actual publicly reachable HTTPS backend origin in the existing Vercel project. Local 127.0.0.1:4000 cannot be used by Vercel. The frontend release, Admin bundle and API bridge are unified; hosting the persistent backend/database is still required for online operational workflows.

## Verification scope

Automated tests cover WhatsApp visibility during API failure, Contact Support links, live settings overriding published metadata, duplicate request suppression, shared build selection, rejection of demo packaging on Vercel, manifest fingerprints, existing frontend journeys and backend assistant settings. A native browser session could not initialize because of the desktop tool's Windows kernel-assets error; visual/mobile sign-off is not claimed. HTTP/file parity and DOM behavior are checked independently.

Latest verification: 233 frontend tests passed; 6 focused backend assistant tests passed; backend type checking/build passed and the compiled backend imported the same public contact configuration. The pre-change live audit matched all 13 checked committed files. Local release parity and post-deployment checks are recorded privately under .local/client-review/.
