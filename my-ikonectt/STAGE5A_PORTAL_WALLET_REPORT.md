# Stage 5A customer portal wallet handoff

The portal adds internal wallet credit, manual top-up reporting, paginated ledger and report history, backend-approved renewal quotes, and renewal outcome tracking within the approved layout. The persistent SPA shell and navigation correction from `36e7f49` remain in place.

## Funding and subscription independence clarification

The human's subsequent clarification supersedes any assumption that every funding source requires manual Finance verification. A verified approved-provider **settlement** automatically posts the in-house ledger and wallet credit. It must never activate or renew service. Manual payment reports remain a separate unverified intake flow until staff verify them.

Wallet balance and subscription status are independent: zero/positive wallet balances with active/inactive subscriptions are all valid. Customers explicitly choose and confirm each renewal; there is no recurring renewal or funding-triggered service action. Reservation and separately confirmed service outcome remain the renewal process.

Portal audit found no wallet-based service activation or automatic renewal. Subscription status and dates are mapped directly from the subscription response; wallet pages load independently of service status; renewal actions use canonical backend eligibility and an initially unchecked required consent control. Two targeted regressions exercise the four balance/status combinations and explicit-consent/eligibility boundary. **28 tests passed** after this audit. The subsequent canonical settlement update below preserves those regressions.

## Canonical settlement display update

Synced API **1.2.0** from exact published commit `d0a300a2b5a17d63c637e71c71b523b88046a78f`, including `SETTLEMENT_HANDOFF.md`. The HTTP inventory and permissions are unchanged. The live settlement capability is `not-connected`: no checkout, callback, provider connection or customer settlement-details route is invented.

The ledger labels `SETTLEMENT_CREDIT` as **Settled wallet funding**, separately from **Manual top-up credit**, reservation and renewal debit. The optional `settlementPaymentId` is displayed as a plain settlement payment reference; `actorId:null` for a settlement is labelled **System settlement**. Historical manual entries without the additive field still validate. Provider-settlement entries have no reversal action in the customer portal. Manual top-up history explicitly scopes Finance verification to manual reports; verified provider settlement credit posts directly to wallet history. Wallet guidance states that adding funds does not activate or renew service and each renewal must be chosen and confirmed separately.

**29 tests pass**, including a canonical settlement-credit render test with escaped description, plain source identifier, system actor, no fabricated link and no form/action controls. Type checking, live build and exact six-file canonical parity pass. This update changes display and contract consumption only; it performs no wallet mutation, provider action or runtime restart. Previous browser evidence below records the earlier API 1.1.0 manual-report journey; no settlement browser record is fabricated or claimed.

## Scope and contract

- Portal-only implementation on `codex/my-ikonectt-wallet-stage5a`, based on approved UI consolidation `78a5570` plus SPA correction `36e7f49`.
- Canonical API **1.2.0**, read-only snapshot from `d0a300a2b5a17d63c637e71c71b523b88046a78f` (initial manual-report journey used API 1.1.0 at `cb05bb6`). No independent financial schema or backend changes.
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

These checks use isolated, explicitly **SIMULATED** development records and actual API requests; no real bank transfer or ISP operation occurred. Browser customer credentials remain in the root Stage 5A worktree's ignored `.platform/stage5a-accounts.json`; the separate staff manifest remains in the backend owner's ignored file. All credentials are excluded from this report and screenshots.

Customer `83028c05-b524-4c91-8288-c3c8373c970f`, account `84375004`, service `7dddabe9-5e29-4aa1-bd6c-27dfbba1aecb`:

1. Existing completed order payment of ₦19,500 did not create wallet credit. Wallet opened at zero; server quote was ₦19,500 and insufficient funds blocked confirmation. Current expiry 20 Nov 2026; expected expiry 20 Dec 2026.
2. Submitted exactly one ₦25,000 report, reference `SIMULATED-S5A-BROWSER-d6ec3f94`, top-up `7bd78286-1694-4559-be69-71edcfd6e44d`. Portal showed REPORTED, available ₦0 / reserved ₦0 / pending ₦25,000, with one report and no renewals.
3. Separate Finance owner confirmed that exact report through Admin. Fresh portal navigation showed available ₦25,000 and the canonical ₦19,500 quote; no second report was submitted.
4. Submitted exactly one renewal, `e63ad55e-d577-48b0-beb6-a2dfe168f26c`. Portal showed RESERVED, available ₦5,500, reserved ₦19,500, confirmed expiry unavailable. Separate service details remained Active with 20 Nov expiry. Ledger showed one credit and one reservation, with posted change zero on the reservation.
5. Separate Provisioner owner processed the exact renewal once. Fresh portal navigation showed SUCCEEDED, confirmed expiry 20 Dec 2026, available ₦5,500 and reserved ₦0. Separate service details showed Active and 20 Dec expiry.
6. The next backend quote remained ₦19,500 against available ₦5,500, with an explicit insufficient-funds message and **zero confirmation controls**. No second renewal was attempted.

Evidence: `evidence/stage5a/live-zero-wallet-quote.png`, `live-reported-topup.png`, `live-pending-wallet.png`, `live-funded-renewal-quote.png`, `live-reserved-renewal.png`, `live-completed-renewal.png`, `live-insufficient-after-renewal.png`.

The separate timeout customer account `19544104` was inspected read-only. Renewal `c232441f-1784-44d9-908a-f58cf302ed12` showed **Review required**, no confirmed expiry, available ₦5,500 and reserved ₦19,500. The page explains that the provider outcome is uncertain, retains the hold and instructs the customer not to submit another renewal. It offers status refresh and navigation, with no customer process/release control. No timeout mutation occurred. Evidence: `live-timeout-review.png`, `mobile-timeout-review.png`.

After the backend owner's controlled restart, a fresh login and read-only browser navigation verified the main wallet still has available ₦5,500 / reserved ₦0 / pending ₦0. The ledger contains exactly **five** records: original top-up credit, reservation, renewal debit, the Admin owner's separately authorized ₦100 correction and its complete compensating reversal. The reversal shows -₦100 and the correction +₦100, preserving both records and returning the posted balance to ₦5,500. The portal made no further financial mutations. Evidence: `live-persisted-ledger.png`, `mobile-ledger.png`, `live-final-wallet.png`. The mobile ledger has five entries and no horizontal overflow at 390 CSS pixels. The repaired sidebar sign-out was also exercised successfully before the final login.

## Integrated compiled build smoke

The root owner's compiled production assets on `http://127.0.0.1:4176/` were checked with the same isolated account, separately from the owner preview on 4195. The read-only browser smoke verified available ₦5,500 / reserved ₦0 / pending ₦0, five preserved ledger entries, Active service with 20 Dec 2026 expiry, and the ₦19,500 quote blocked by insufficient funds with zero confirmation controls. The 390px mobile quote had no horizontal overflow; the viewport was reset. The desktop app restart interrupted the first pass after wallet/ledger checks, so the restored preview was reopened and service/quote/mobile checks completed after a fresh login. No financial mutation occurred in either pass.

Evidence: `integrated-wallet-desktop.png`, `integrated-insufficient-quote.png`, `integrated-quote-mobile.png`, and machine-readable `integrated-smoke.json` in `evidence/stage5a/`. The root owner separately reports integrated 26-test, typecheck, build and canonical-parity checks passed.

## Layout checks

The existing Home/public branding, image label, compact footer, approved typography and sidebar presentation are preserved. Wallet balances stack on narrow screens; actions, long references and ledger records wrap. Live wallet checks at approximately 320 and 390 CSS pixels showed no horizontal overflow. Outcome checks at approximately 320, 390, 768, 1024 and 1280 CSS pixels also passed without horizontal overflow. `mobile-wallet.png` records the mobile pending state; `mobile-timeout-review.png` records the mobile review outcome. Viewport overrides were reset after checks.

Adding the Wallet item exposed a short-desktop sidebar issue: its bottom sign-out control could fall below the viewport. The sidebar now scrolls vertically with unshrunk children; browser inspection verified the sign-out control becomes reachable by sidebar scrolling. The navigation shell remains mounted across ordinary route changes.

## Limits

Manual-report Finance verification and service processing remain separate staff responsibilities. Approved-provider settlement verification belongs to the backend settlement boundary and does not perform a service action. No live provider integration, main-branch merge or deployment is included. Backend/API concurrency, role authorization, historical-payment fingerprints and timeout-provider execution tests are owned by Agent 1; Admin Finance/Provisioner/Support browser evidence is owned by Agent 3. This report claims only the portal tests and browser observations above.
