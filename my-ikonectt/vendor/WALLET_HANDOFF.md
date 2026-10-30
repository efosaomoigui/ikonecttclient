# Stage 5A wallet and self-service contract 1.1.0

**Superseding clarification:** current contract is **1.2.0**. Approved provider settlement automatically funds the ledger-backed wallet, independently of services. Manual reports below remain a separate Finance-verified fallback. Read [SETTLEMENT_HANDOFF.md](SETTLEMENT_HANDOFF.md) for the SETTLEMENT_CREDIT source, disabled provider boundary and customer-authorized renewal rules. The original 1.1.0 handoff follows as historical context.

Date: 21 October 2026. Additive API extension: **78 paths / 95 operations**, prefix `/api/v1`. Core schemas, routes, errors, HTTP200 writes, revocable bearer sessions and offset/limit pagination remain. Existing order payments are always ORDER allocated; separate wallet top-ups are always WALLET allocated. No historical payment becomes wallet credit. Wallets begin at zero.

This publishes the shared interface so UI owners can work concurrently. Runtime financial/migration/concurrency acceptance must pass before the lead declares the backend ready. Until then use explicit schema-compliant SIMULATED fixtures; never turn a failed live request into mock success. Exact source commit is provided in the owner handoff.

## Authoritative values and UI behavior

All amounts are **integer NGN kobo**. Display divides by100; balances/prices/dates/eligibility are backend values. Summary: `postedMinor` is unspent credited funds; `reservedMinor` is held; `availableMinor = posted - reserved` is already supplied; `pendingTopUpsMinor` is reported/unverified, not spendable. Keep these concepts distinct. The immutable ledger includes TOPUP_CREDIT, RESERVE, CAPTURE, RELEASE, ADJUSTMENT_CREDIT and compensating REVERSAL. Entries contain signed deltas and posted/reserved snapshots. A reserve is not a debit or service success.

`WalletSummary.topUpInstructions` returns MANUAL_REPORT, bankDetails:null and an approved-channel notice. No bank account/gateway details were supplied. Do not invent one or claim a report is a payment success. Evidence is required; customer TopUp responses omit evidence and staff verification details. Admin review schemas include them. Simulation labels must follow response flags and existing environment banners.

## Routes and canonical schemas

| Method/path (after prefix) | Request → response | Access |
| --- | --- | --- |
| GET `/me/wallet` | → WalletSummary | own customer |
| GET `/me/wallet/transactions` | ListQuery → page(WalletEntry) | own customer |
| GET `/me/wallet/top-ups` | ListQuery → page(WalletTopUp) | own customer |
| POST `/me/wallet/top-ups` | ReportWalletTopUpRequest → WalletTopUp | own active customer |
| GET `/me/wallet/renewals` | ListQuery → page(WalletRenewal) | own customer |
| GET `/me/wallet/renewals/:id` | → WalletRenewal | own customer |
| GET `/me/subscriptions/:id/renewal-eligibility` | → RenewalEligibility | own customer |
| POST `/me/subscriptions/:id/wallet-renewals` | WalletRenewalRequest → WalletRenewal | own eligible customer |
| GET `/admin/customers/:id/wallet` | → WalletSummary | wallet.read |
| GET `/admin/customers/:id/wallet/transactions` | ListQuery → page(WalletEntry) | wallet.read |
| POST `/admin/customers/:id/wallet/adjustments` | WalletAdjustmentRequest → WalletEntry | wallet.adjust |
| POST `/admin/wallet-transactions/:id/reverse` | WalletReversalRequest → WalletEntry | wallet.adjust |
| GET `/admin/wallet-top-ups` | WalletTopUpQuery → page(AdminWalletTopUp) | payments.verify |
| GET `/admin/wallet-top-ups/:id` | → AdminWalletTopUp | payments.verify |
| POST `/admin/wallet-top-ups/:id/verify` | VerifyPaymentRequest → AdminWalletTopUp | payments.verify |
| GET `/admin/wallet-renewals` | WalletRenewalQuery → page(AdminWalletRenewal) | renewals.read |
| GET `/admin/wallet-renewals/:id` | → AdminWalletRenewal | renewals.read |
| POST `/admin/wallet-renewals/:id/process` | no body → AdminWalletRenewal | provisioning.write |
| POST `/admin/wallet-renewals/:id/resolve` | RenewalResolutionRequest → AdminWalletRenewal | provisioning.write |
| PATCH `/admin/subscriptions/:id/renewal-policy` | RenewalPolicyRequest → Subscription | provisioning.write |

WalletTopUpQuery filters optional customerId/status; WalletRenewalQuery filters optional customerId/status; pagination default25/max100. Exact exported types are in `index.ts`; do not invent alternate frontend financial shapes. Public `Plan`/PlanInput/PlanUpdate add nullable optional `renewalPriceMinor`; Subscription adds optional `renewalEnabled`; Order adds optional `fundingSource` ORDER_PAYMENT/WALLET. Responses include these new fields; absent old fixture values must not imply renewal eligibility. No changes to historical order Payment schema or its verification route.

## Permissions

Existing roles retained. ADMIN has all; SUPPORT: wallet.read/renewals.read only; FINANCE: wallet.read/wallet.adjust/renewals.read plus existing payments.verify; PROVISIONER: renewals.read and existing provisioning.write (policy/process/resolve), never wallet credits. SALES/EXECUTIVE have no wallet grants. Backend enforces every sensitive route. Support's wallet view does not grant top-up evidence/review endpoints. Finance may inspect pending renewals, but cannot attest service outcome.

## Idempotency, allocation and errors

Top-up, renewal, adjustment and reversal bodies require a UUID `idempotencyKey`. Generate once per confirmed intent and retain it for network retries. Same key + same payload returns the same record; changed payload is409. Keys are scoped to customer and operation and retained with financial history, not transient caches. Verify is idempotent by top-up ID/decision. Process is idempotent by renewal ID and never blindly resends a PROCESSING/REQUIRES_REVIEW request. Cross-customer IDs give404; invalid inputs400; unauthorized401/403; conflicts409, all with existing structured request-ID errors. New payment references are globally claimed across order payments and wallet top-ups, using consistent database normalization. Rejected/used references are not silently recycled.

## Renewal and operator flow

1. A Provisioner explicitly enables the subscription via renewal-policy with a reason. Default=false for historical/new services. Admin catalogue owner sets an explicit positive current `renewalPriceMinor`. Existing price is not silently assumed to be renewal-approved.
2. Eligibility checks ownership, active customer, enabled ACTIVE/SUSPENDED service, known start/end/external service reference, published same-audience plan, explicit renewal price, verified building/plan, supported provider, no open legacy/wallet renewal, sufficient available funds. Reason codes are canonical. No policy for a fixed number of days before expiry is invented.
3. Quote returns amount, billing period, current expiry, expected expiry and `priceVersion` (plan.updatedAt). Request sends only priceVersion + idempotencyKey; server rechecks all conditions and derives amount. Stale version409 requires a fresh review. Do not retry with a new price without customer consent.
4. Reservation atomically creates a WALLET-funded RENEWAL order/FULFILLING and RESERVED renewal, plus RESERVE ledger entry. It does not create a fake confirmed order payment. Customer sees funds held/awaiting authorized processing, not success.
5. Separate Provisioner Process changes RESERVED→PROCESSING and calls the explicit renewal adapter once. Manual acknowledgement remains PROCESSING; timeout/uncertainty→REQUIRES_REVIEW, hold retained. Simulated CONFIRMED includes expiry and is explicitly SIMULATED. Definite failure→FAILED + RELEASE; prior service is preserved. Confirmed success atomically CAPTUREs and updates authoritative subscription expiry/status and orderCOMPLETED.
6. Manual reconciliation requires Provisioner/ADMIN `authoritative:true`, reference and evidence. SUCCEEDED additionally requires confirmedEndsAt matching the reserved expected period and unchanged old service expiry; otherwise review/hold remains. FAILED requires definitive failure evidence. No automatic timeout refund or blind provider retry.

Expected expiry extends the existing known expiry, or current server time if expired, by the plan's known approved billingDays, matching the prior renewal-period convention. No usage or dates are fabricated for unsupported services.

## Corrections and boundaries

Controlled adjustments are **positive CREDIT corrections** with amount/reason/UUID/review; there is no balance input. An erroneous TOPUP_CREDIT or ADJUSTMENT_CREDIT may be reversed in full with a compensating ledger entry and reason, only while sufficient available funds remain. Original history is never changed. Reserve/release/capture entries cannot be blindly reversed; service refunds/partial refunds/cancellation require approved policy and are outside this extension. No transfers, withdrawals, cash-out or external wallet payments.

Frontend acceptance should cover top-up2500000→Finance confirmation exactly once→reserve/confirmed1950000 renewal→available550000, insufficient funds, timeout review, Support read-only, same customer/Admin balances and immutable transaction history. Browser fixtures must be clearly separate from live results. Do not change another owner's source, public website, main or deploy.
