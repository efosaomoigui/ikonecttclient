# IKONECTT — CUSTOMER PORTAL ACCEPTANCE HANDOFF

Date: 20 October 2026. Status: portal fixes reviewed for Stage 4 integration; joint browser acceptance remains incomplete.

## Changes ready for integration

- Setup/recovery guidance distinguishes a full one-time code from an account number. Live bounds come from the canonical reset schema. Explicit mock mode retains its documented demo code; its adapter rejects incorrect or reused codes.
- New-password inputs enforce 12–128 characters. Editing a reset/password form clears obsolete errors. No human password was read, entered, changed or committed by this work.
- Live navigation reloads the account summary so staff changes can appear without losing the in-memory session. Clicking the current sidebar section also refreshes it. Joint staff-to-portal readback still needs browser verification.
- Shorter account, support, coverage and payment-report wording; slightly larger small labels, stronger secondary-text contrast and subtle alternating table rows. Existing layout, navigation, typography families and branding are retained.

## Contract and validation

Canonical API v1.0.1: `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`. The four vendored contract files byte-match that committed source. No contract, backend, Admin or public-site source changes are included.

Final portal verification: **14 tests passed, 0 failed**; strict TypeScript check passed; live production build passed; Git whitespace check passed. The added mock regression test confirms that its short demo code works only in explicit mock mode, while incorrect and reused codes remain rejected. Production build means local output only, not deployment.

## Evidence and gaps

| Area | Observed evidence | Still required on integrated branch |
| --- | --- | --- |
| Environment | Portal 4175, API 4000, Admin 3013; shared development DB on 55440. API outage was restored by backend owner without resetting records. | Integrated startup/recovery smoke test. |
| Onboarding | Admin created account 83655382, customer `8ba319fe-dc0d-45a0-8eef-dd8b4c00aa20`. Backend owner confirmed password setup completed and login enabled. | Portal sign-in and identity readback for this account. |
| Identity guard | Preserved login form authenticated a different sample account, 98928971. Portal account footer exposed the mismatch; it was signed out before creating an order. | Correct joint-account authentication. |
| Plans/coverage | Admin verified published plan `3df15596-ab4d-4cea-8599-144149ae979f` at NGN 19,000 and eligible building `927378d7-0d6d-4b4c-aabd-f5e30406a4bb`. | Portal readback of those shared records. |
| Order/payment | No portal order or payment was created for the joint account. Backend owner last verified 0 orders and 0 subscriptions. | One order, Admin readback, report payment, Finance confirmation and proof that confirmation alone does not activate service. |
| Provisioning | Stage 2 isolated API acceptance exists separately. | Separate authorized simulated provisioning and portal subscription readback for joint workflow. |
| Support | Stage 2 isolated API acceptance exists separately. | Joint portal ticket → Admin reply/status → portal conversation readback. |
| Permissions/sessions | Automated tests cover session expiry, server 401 clearing, response validation and explicit failure handling. Stage 2 live checks are documented separately. | Integrated browser permission and cross-customer isolation regression. |
| Failed requests | During actual API outage, login stayed unauthenticated and displayed “We couldn’t reach Ikonectt. Check your connection and try again.” No mock success appeared. | Integrated error regression as needed. |
| Browser/responsive | Stage 2 records 68 screen/width checks. Stage 3 current-source login loaded successfully. The historical login image is excluded from committed evidence because it shows a masked password control. | Authenticated desktop/mobile review of final refinements and summary refresh behavior. |

Detailed observations: `evidence/stage3a/acceptance-log.json`; calculated color contrast: `evidence/stage3a/contrast-check.json`. These observations are not a completed joint acceptance report. Consult Admin's joint report for its owned checks.

## Integration readiness

Ready to integrate the reviewed portal changes into the controlled Stage 4 branch. Do not infer that unfinished joint browser workflows passed. Use isolated development records for new mutations; retain the original Stage 3 account without resetting its password. Providers remain disabled or simulated as documented in `STAGE2_INTEGRATION_REPORT.md`; no commercial payment, live ISP provisioning, external messaging, production deployment or merge to main is claimed.
