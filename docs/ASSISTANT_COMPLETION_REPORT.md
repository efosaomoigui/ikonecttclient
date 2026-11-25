# Assistant, WhatsApp and handover verification

25 November 2026. Canonical checkout: `C:/Users/Efe-Dev/Documents/business News/ikonectt`, branch `main`. Local implementation and commissioning preparation only; nothing pushed or deployed.

## Preserved and verified

The approved Option E site, API-backed plan cards, existing carousel interaction, internal coverage registry, published knowledge, enquiry persistence, staff authentication and permission checks remain in place. The custom customer portal and financial implementation remain in source; public account links use `https://portal.ikonectt.com`. No external coverage API is required.

Live database verification observed **7 published plans**, **83 retained coverage rows**, **81 primary search records** and **20 published knowledge articles**. An authenticated end-to-end HTTP check temporarily updated one plan, service area and article. The public website API client and assistant saw the changed values. Unpublishing/deactivation excluded those records. All three original records were restored and compared. A clearly labelled QA enquiry returned reference `d8755ff4-0537-43b3-a388-21b9ffdaf2ed` and was visible through the Admin API; it remains with its audit history. All **13 live checks passed**. Local evidence is in `.local/client-review/live-data-e2e-evidence.json` (ignored; no credentials in this report).

## Changes delivered

- Guest conversation without mandatory name/phone entry; enquiry clarification, existing form validation, review, explicit consent and confirmed backend reference. Form personal details are excluded from model history; uncertain submissions do not encourage a blind duplicate retry.
- Existing chat layout refined with larger message/action text, spacing, independent gray scrolling, loading state and red decorative header icon. Existing responsive viewport handling, restart and page context are retained.
- Separate green WhatsApp launcher and assistant escalation actions use one persistent Admin-managed contact setting. The configured initial URL is the client-supplied official destination. External links use new-tab isolation attributes; no WhatsApp messaging infrastructure was added.
- Actual optional OpenAI Responses transport with timeout, `store:false`, bounded history/output, atomic daily request reservations and usage records. Known plans, coverage, contacts and knowledge paths remain deterministic. Model output can only select an approved article or clarification route; untrusted generated factual text is not displayed.
- Admin-only provider/model/credential settings, connection test, masked status, replacement, revocation, limits and published-knowledge status. Saved credentials use AES-GCM with a separate server key; public APIs and audit records do not return secret values. Environment credentials are also supported.
- Active Admin navigation/dashboard now show website operations and genuine backend totals. Dormant customer/financial modules remain preserved. Production disables custom customer routes by default while retaining staff password recovery and password changes.
- Live-Admin production packaging, origin-specific canonical/robots/sitemap output, explicit loopback proxy trust option, and removal of temporary public Admin links. Previous requested heading-dash and coverage-sentence removals are included.
- Additive assistant settings/usage migration applied to persistent local development PostgreSQL after a backup; no reset performed.

## Acceptance evidence and limits

| Requested scenario | Result |
| --- | --- |
| Admin plan/coverage/FAQ edits reach website and assistant | Passed live HTTP checks; original values restored |
| General questions, plan guidance, coverage, enquiry clarification and approved troubleshooting | Deterministic/model-boundary automated checks; live published-data checks |
| Enquiry creates genuine reference and appears in Admin | Passed live HTTP and frontend guest-flow checks |
| Official WhatsApp and customer portal destinations | Backend setting, proxy response, generated source and DOM checks verified; actual external browser navigation not observed |
| Authorized provider setup, encryption, role restrictions, test/revoke/limits | Automated backend and Admin tests with controlled provider responses |
| Invalid provider credentials and unavailable provider | Mocked provider rejection and fallback tests; no real client credential used |
| Unsupported facts, unpublished content, unauthorized API/secret access | Automated checks, publication exclusion verified live |
| Desktop/mobile chat appearance and native browser interaction | **Pending visual review: both browser and Windows computer-use helpers timed out after supported recovery attempts** |

The model provider is implemented but **not live commissioned**: the client must supply its account, billing, credential and model, then run a real connection test. Mocked provider success does not establish production connectivity. No screenshot or visual sign-off is claimed for this change.

Final checks: **206/206 public tests**, **91/91 backend tests**, **69/69 Admin tests**, and **6/6 focused assistant tests** passed. The focused run covers the final capability-status refinement and mocked invalid-provider handling. Backend tools/type checks and build passed; Admin review/production builds passed. API contracts are version **1.4.0**, **89 paths / 110 operations**, with generated route, security and error-schema checks passing. Production packaging was built with live Admin; artifact checks excluded backend sources, secrets, dormant customer output and Option A, and verified canonical/robots/sitemap output. The regular public artifact was rebuilt for local review. Updated content-preservation checks pass after recording only the client-authorized source changes; the approved visual assets remain unchanged.

## Launch dependencies

The client must commission its server/domain/TLS, protected secrets, persistent PostgreSQL and a tested production backup/restore process. External support exchange still needs the actual client API contract and sandbox; the existing support/enquiry services are the local seam and do not claim ECRM delivery. Remaining commercial ambiguities, duplicate coverage identities, privacy/legal wording and retention require client confirmation. Email/SMS remain disabled unless separately integrated.

See `CLIENT_HANDOVER.md` for operating instructions, AI onboarding, exact build/migration approach, database recovery and security responsibilities. Additional providers and route-specific search rendering are optional later work. Browser visual sign-off and live commissioning remain open; do not describe the whole production launch as completed.

Local review endpoints: public site `http://127.0.0.1:3000/option-e/#/home`, Admin `http://127.0.0.1:3013/admin/`, API `http://127.0.0.1:4000/api/v1`, development Swagger `http://127.0.0.1:4000/api/docs`.
