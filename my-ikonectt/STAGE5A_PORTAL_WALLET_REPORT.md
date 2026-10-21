# Stage 5A customer portal wallet handoff

The portal adds internal wallet credit, manual top-up reporting, paginated ledger and report history, backend-approved renewal quotes, and renewal outcome tracking within the approved layout. The persistent SPA shell and navigation correction from `36e7f49` remain in place.

## Scope and contract

- Portal-only implementation on `codex/my-ikonectt-wallet-stage5a`, based on approved UI consolidation `78a5570` plus SPA correction `36e7f49`.
- Canonical API **1.1.0**, read-only snapshot from `cb05bb65c96c0b5bfff9c0a8a53b275d23659625`. No independent financial schema or backend changes.
- Customer methods use the eight published wallet/renewal endpoints, strict canonical request/response validation, and server pagination (25 records per history page).
- All balances, ledger deltas, eligibility, price versions, billing periods and expiry dates come from the backend. Only NGN display formatting converts minor units.
- Top-up reports have explicit review and confirmation; pending reports are unspendable. Order payments stay separate. No invented bank details, payment gateway, withdrawals or transfers.
- Renewal requests send only the approved `priceVersion` and UUID idempotency key. Reservation, processing, review, failure and confirmed completion have distinct messages. Completion requires `confirmedEndsAt`.
- An in-memory intent retains the original UUID and payload through uncertain retries; an edited pending request is blocked. Recovery after eligibility or price changes reuses the original request, without accepting a new quote. Intent data is cleared on logout/session expiry and is never logged or persisted. Reload loses the local intent: customers must check backend history before starting another report.
- Live errors and malformed responses never become fixture success. Optional overview wallet errors are explicit; dedicated wallet errors keep the navigation shell available.
- Explicit mock mode provides fixed, labelled presentation scenarios only. Live mode has no scenario controls or financial fallback.

## Verification

`npm test`: **26 passed**, including the existing 17 regressions and nine wallet tests. `npm run typecheck`, mock and live production builds passed. All five vendor files match the exact canonical Git snapshot byte for byte; `git diff --check` passed. Tests cover strict canonical authority boundaries, pagination, duplicate intent recovery, uncertain network results, zero opening wallet despite historical payment, pending reports, reservation versus success, review holds, insufficient funds, escaped record text and changed-quote retry recovery.

The dedicated preview is `http://127.0.0.1:4195/`, built in **live mode** and proxied to the local development API on 4000. The approved user preview on 4185 remains separate. Preview helper, credentials, runtime output and dependency folders are ignored and are not committed.

## Live API browser acceptance

These checks use isolated, explicitly **SIMULATED** development records and actual API requests; no real bank transfer or ISP operation occurred. Credentials remain in the backend owner's ignored file and are excluded from this report and screenshots.

Customer `83028c05-b524-4c91-8288-c3c8373c970f`, account `84375004`, service `7dddabe9-5e29-4aa1-bd6c-27dfbba1aecb`:

1. Existing completed order payment of ₦19,500 did not create wallet credit. Wallet opened at zero; server quote was ₦19,500 and insufficient funds blocked confirmation. Current expiry 20 Nov 2026; expected expiry 20 Dec 2026.
2. Submitted exactly one ₦25,000 report, reference `SIMULATED-S5A-BROWSER-d6ec3f94`, top-up `7bd78286-1694-4559-be69-71edcfd6e44d`. Portal showed REPORTED, available ₦0 / reserved ₦0 / pending ₦25,000, with one report and no renewals.
3. Separate Finance owner confirmed that exact report through Admin. Fresh portal navigation showed available ₦25,000 and the canonical ₦19,500 quote; no second report was submitted.
4. Submitted exactly one renewal, `e63ad55e-d577-48b0-beb6-a2dfe168f26c`. Portal showed RESERVED, available ₦5,500, reserved ₦19,500, confirmed expiry unavailable. Separate service details remained Active with 20 Nov expiry. Ledger showed one credit and one reservation, with posted change zero on the reservation.
5. Separate Provisioner owner processed the exact renewal once. Fresh portal navigation showed SUCCEEDED, confirmed expiry 20 Dec 2026, available ₦5,500 and reserved ₦0. Separate service details showed Active and 20 Dec expiry.
6. The next backend quote remained ₦19,500 against available ₦5,500, with an explicit insufficient-funds message and **zero confirmation controls**. No second renewal was attempted.

Evidence: `evidence/stage5a/live-zero-wallet-quote.png`, `live-reported-topup.png`, `live-pending-wallet.png`, `live-funded-renewal-quote.png`, `live-reserved-renewal.png`, `live-completed-renewal.png`, `live-insufficient-after-renewal.png`.

The separate timeout customer account `19544104` was inspected read-only. Renewal `c232441f-1784-44d9-908a-f58cf302ed12` showed **Review required**, no confirmed expiry, available ₦5,500 and reserved ₦19,500. The page explains that the provider outcome is uncertain, retains the hold and instructs the customer not to submit another renewal. It offers status refresh and navigation, with no customer process/release control. No timeout mutation occurred. Evidence: `live-timeout-review.png`, `mobile-timeout-review.png`.

## Layout checks

The existing Home/public branding, image label, compact footer, approved typography and sidebar presentation are preserved. Wallet balances stack on narrow screens; actions, long references and ledger records wrap. Live wallet checks at approximately 320 and 390 CSS pixels showed no horizontal overflow. Outcome checks at approximately 320, 390, 768, 1024 and 1280 CSS pixels also passed without horizontal overflow. `mobile-wallet.png` records the mobile pending state; `mobile-timeout-review.png` records the mobile review outcome. Viewport overrides were reset after checks.

Adding the Wallet item exposed a short-desktop sidebar issue: its bottom sign-out control could fall below the viewport. The sidebar now scrolls vertically with unshrunk children; browser inspection verified the sign-out control becomes reachable by sidebar scrolling. The navigation shell remains mounted across ordinary route changes.

## Limits

Finance verification and service processing remain separate staff responsibilities. No live provider integration, main-branch merge or deployment is included. Backend/API concurrency, role authorization, historical-payment fingerprints and timeout-provider execution tests are owned by Agent 1; Admin Finance/Provisioner/Support browser evidence is owned by Agent 3. This report claims only the portal tests and browser observations above.
