# Stage 4 portal browser acceptance — d4e66e52

20 October 2026. Integration runtime: portal 4175, compiled portal preview 4176, API 4000, preserved development PostgreSQL 55440. Source: reviewed portal `dc6a467` incorporated into the controlled Stage 4 integration checkout. API contract v1.0.1 / `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e`.

These are actual customer-portal browser checks, separate from the integration lead's HTTP acceptance groups. The lead created and set up this isolated customer through the API. This owner signed in using existing local credentials; browser password creation was not tested. Credentials are excluded from this evidence.

| Browser check | Result / exact record |
| --- | --- |
| Existing customer login | PASS: profile and footer show account **81117181**, name **SIMULATED Stage4 browser d4e66e52**, matching the local manifest. Customer UUID `c8c6a143-4319-44a3-84ab-0b21672a6e10` comes from that manifest, not a rendered profile field. |
| Published plan | PASS: SIMULATED Stage4 d4e66e52 at **₦19,500**, 80 Mbps; plan `51201d97-a053-4c70-b8f7-2adb242a4be5`. |
| Building coverage | PASS: selected building `7ff56965-b620-4a9e-b863-29a45b3c4802` and plan; actual result **AVAILABLE**, explicitly SIMULATED development. |
| Single portal order | PASS: created exactly one new connection order `800fce40-5220-4a40-a575-9bbf55752ffc`, **PENDING PAYMENT**, ₦19,500, no payment or activation. Stopped for independent Admin browser readback. |
| Payment report | PASS: one bank-transfer report, reference **SIMULATED-STAGE4-BROWSER-d4e66e52**, amount 1,950,000 minor units; evidence explicitly says no real transfer occurred. Portal showed **Reported**, no receipt and no active service. |
| Finance readback before provisioning | PASS: after the Admin owner confirmed payment `e816902e-9e22-4c36-b96a-56e54a5260f1`, fresh portal navigation showed **PAID / Confirmed / No service activation confirmed**. Verified receipt showed the same customer, order and ₦19,500. |
| Separate simulated provisioning | PASS: after a separate authorized Admin action, fresh portal navigation showed **Active** subscription `5f0b3a79-9019-425e-893c-5abb7352f5c7` and **COMPLETED** order. No actual ISP activation is claimed. Service detail shows usage unavailable rather than invented usage. |
| Shared support conversation | PASS: created one ticket `f599f85b-c0ea-4600-b685-6a202938394c`; after Admin reply/status update, fresh portal navigation showed **Resolved**, the original customer message and the matching staff reply. Both messages explicitly describe simulated acceptance. |
| Compiled production assets | PASS: separate browser sign-in on 4176, overview and services show the same account and single pending order. No duplicate order/payment was created there. This check preceded Finance confirmation. |
| Responsive order view | PASS: requested 1280×900 / 390×844, rendered widths **1281 / 390**, no document horizontal overflow. Screenshots visually reviewed; shared viewport override reset afterward. |

## Evidence

- `order-desktop.png`, `order-mobile.png`: initial order state and responsive layout.
- `payment-reported.png`: report pending review, no receipt.
- `paid-no-activation.png`, `confirmed-receipt.png`: Finance confirmation and activation boundary.
- `simulated-active-service.png`, `simulated-service-detail.png`: later service state after separate provisioning.
- `support-resolved.png`: same conversation and staff status update.
- `compiled-services.png`: production assets reading the same backend records.
- `browser-results.json`: safe machine-readable observations.

All included images were visually checked and contain no password, setup code, bearer token or credential form. Historical Stage 3 login images are excluded.

## Corrected defect and limits

The browser submission notice read **“Request Request f599f85b received”** because the canonical presentation reference already includes “Request.” The portal source now uses the reference once. Final owned validation: **14 tests passed, 0 failed**, strict type checking passed, live and mock builds passed, Git whitespace check passed. No new test was added for a one-word reversible copy correction.

Final integrated-code smoke after merging this one-line fix remains assigned to the lead/portal owner. The resolved-ticket screenshot was captured before that fix was integrated; it does not exercise a new-ticket submission notice. No second ticket was created merely to test copy.

Cross-customer isolation, staff permissions, expired/revoked token enforcement and forced API failures were not independently exercised in this browser sequence; consult the lead's separate HTTP/security results and the Admin owner's evidence. The accepted typography, branding and navigation are preserved. No commercial bank transfer, external notification delivery, real ISP provisioning, deployment or merge to main is represented by these checks.
