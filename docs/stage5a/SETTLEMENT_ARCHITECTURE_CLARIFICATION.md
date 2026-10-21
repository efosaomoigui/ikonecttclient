# IKONECTT — STAGE 5A ARCHITECTURE CLARIFICATION

Payment settlement, wallet credit and service activation · 21 October 2026

## Business rule implemented

**Payment settlement funds the wallet. Customer authorization initiates renewal. Service activation is a separate controlled outcome.** This supersedes conflicting funding or activation assumptions in the initial Stage5A handoff. Manual Finance browser acceptance remains valid evidence of the separate manual-report fallback; it does not mean a future approved-provider settlement waits for manual approval.

Wallet and subscription state are independent. All four zero/positive-wallet × active/inactive-service combinations are valid and tested. A funded expired or suspended service stays unchanged until an eligible customer explicitly selects and confirms Renew Plan. There is no scheduled recurring renewal, funding-triggered reservation, automatic service activation or wallet-derived status.

## Settlement adapter and event boundary

`backend/src/wallet/settlement.adapter.ts` defines the approved provider boundary, exact raw-envelope input, provider/merchant identity and validated authoritative response. `DisabledSettlementAdapter` is the production application binding. No provider or merchant credentials were supplied; no live settlement occurred and no unauthenticated callback/checkout route is enabled. Existing capabilities explicitly report `paymentSettlement:not-connected`.

Trusted future checkout code registers a provider-created payment bound to the authenticated customer, wallet, merchant account, provider payment ID, merchant reference, expected full NGN amount and idempotency key. Registration is internal and creates no credit. An approved transport then calls `SettlementService.ingest`, which authenticates/fetches through the adapter before financial writes. The core independently validates registered payment/customer/provider/account/reference/amount/currency bindings and requires SETTLED, a settlement reference and settled date.

INITIATED/PENDING/FAILED verified events produce no credit. Callback claims without authentication and authoritative lookup are rejected. One serializable transaction locks the registered payment and wallet, persists an immutable event receipt, marks the payment CREDITED and posts one SETTLEMENT_CREDIT into the same in-house ledger that backs the wallet projection. There are no order, subscription, renewal or provisioning writes in this transaction. Automatic credits use system actor null and retain payment/merchant/ledger references.

Same event/content replays return the original receipt; conflicting event reuse is rejected. Different events for the same credited payment cannot post again. Later failure/pending messages cannot retract a prior settlement. A posting failure rolls back payment/receipt/ledger together, so unacknowledged redelivery can safely retry. A future transport must acknowledge only after durable success and supply the approved retry/alert/reconciliation protocol; none is falsely presented as connected today.

Only test support contains a SIMULATED HMAC protocol adapter with a separate authoritative lookup fixture. It is unavailable outside tests and is not a real provider implementation. Tests exercise forged callback status, missing/tampered/stale signatures, lookup failure and mismatched customer/economic terms. Provider-specific signature, API and settlement semantics remain an implementation dependency until supplied and approved.

## Persistence and authoritative ledger

Additive `SettlementPayment` records bind expected funding terms to the existing customer wallet. Immutable `SettlementEvent` receipts retain provider/account/event IDs, a body digest, verified status/outcome and timestamps, without raw bodies, credentials or signatures. `WalletEntry.settlementPaymentId` uniquely links a SETTLEMENT_CREDIT to its source. The wallet remains a transactionally maintained projection of the one append-only financial ledger; it is not a second settlement balance.

Database guards preserve immutable terms and credited history, enforce the unique credit/event allocation, require settled proof, and require payment, verified event and matching credit to commit together. The explicit non-null proof guard accounts for PostgreSQL's CHECK/NULL semantics. Previous applied migration checksums are preserved; the additional proof constraint is its own migration. No historical financial rows are converted or edited.

`SettlementService.reconcile(customerId)` checks projection totals against signed ledger sums and registered settlements against their unique credit using a consistent read snapshot. It reports drift and does not edit balances. Ordinary Finance credit-reversal controls do not reverse provider settlements; chargebacks/refunds require a separately approved policy.

## Existing and future order allocation

The existing manually reported ORDER payment workflow was reviewed: a confirmed payment marks its existing order paid; separate authorized provisioning performs service activation. Those consumed order payments retain their original allocations, history, receipts and audit trail and are never also credited to a wallet.

The global normalized payment-reference registry now claims both the merchant and provider payment references for settlement funding. Historical order/manual-top-up references cannot be recycled as provider wallet credit. Idempotent registration returns the same payment; changed terms conflict. Conservative reference collisions require reconciliation rather than a second credit.

All future approved-provider payments fund WALLET first, including those started from an order-related journey. They do not also mark an order paid or activate service. This settlement boundary deliberately accepts no `orderId` allocation. Spending those funds requires an explicit, separate, legitimate wallet-funded operation. Existing-service renewal already provides that customer authorization, atomic hold and confirmed service capture. Wallet-funded new connections/plan changes require their own approved purchase/fulfilment extension before provider order checkout is enabled. The preserved legacy manual ORDER path remains explicitly separate during this compatibility stage.

## Renewal remains explicit

Customer identity/ownership, explicit service policy, authoritative price/version and billing period, eligibility, conflicts and available funds are rechecked on confirmation. The customer request reserves funds atomically; a separate authorized processing action initiates service renewal. Confirmed matching service outcome captures the hold and updates subscription state. Definite failure releases funds; timeout/uncertainty retains reviewable funds without blind retries. Settlement alone invokes none of these operations.

## Canonical API and frontend handoff

API **1.2.0**, unchanged **78 paths / 95 operations**, same roles/permissions. Canonical source pin: `d0a300a2b5a17d63c637e71c71b523b88046a78f`.

- `WalletEntry.kind` adds SETTLEMENT_CREDIT.
- `settlementPaymentId` is an optional nullable source UUID; `actorId:null` represents the system posting.
- Capabilities explicitly expose `paymentSettlement:'not-connected'`.
- No public settlement callback, checkout or invented settlement-details route is added.

Both Agent2 and Agent3 received the clarified architecture and exact [settlement handoff](../../contracts/SETTLEMENT_HANDOFF.md). The portal labels settled wallet funding separately from manual top-up credit, displays source references, and retains explicit renewal consent. Admin displays the same authoritative source independently of service status and never offers an ordinary settlement-credit reversal. Both owners added zero/positive × active/inactive display regressions. Strict canonical snapshots and provenance are synchronized rather than maintaining competing schemas.

## Development migration and preservation

Only the owned local development database was migrated, after an independent backup/restore verification and isolated PostgreSQL tests. `202610210002_settlement_boundary` adds two tables and one nullable ledger source column; `202610210003_settlement_proof_guard` adds the explicit proof constraint. Original migration checksums are unchanged.

All **23** pre-existing order-payment rows retained their complete fingerprint. The prior main acceptance wallet remains ₦5,500, zero hold and five entries; its service date and successful renewal are unchanged. The timeout fixture retains its ₦19,500 hold and REQUIRES_REVIEW state. No provider funding payment/event was manufactured in shared development. Evidence: [migration verification](settlement-migration-verification.json), [before migration](persistence-before-settlement-migration.json) and [after migration](persistence-after-settlement-migration.json).

Final test counts, owner commits and integrated parity/build results are recorded in the completion section below. The original Stage5A report and screenshots remain historical evidence. No merge to main or production deployment is authorized or performed.

## Completion and validation

| Check | Final result |
| --- | --- |
| Backend PostgreSQL suite | **73 passed / 0 failed**: original60 plus13 settlement scenarios |
| Backend tools typecheck and production TypeScript build | PASS |
| Canonical route/security/OpenAPI check | PASS:1.2.0,78paths/95operations |
| Portal strict schema/provenance and both handoff snapshots | PASS: exact published source |
| Admin schema/permissions/operation map/provenance/handoff | PASS: exact published source; permissions unchanged |
| Integrated portal tests | **29 passed / 0 failed** |
| Portal typecheck and mock/live production builds | PASS |
| Integrated Admin tests | **53 passed / 0 failed** |
| Admin TypeScript/review build and production build | PASS |
| Historical order-payment fingerprint | PASS: all23 rows unchanged |
| Prior main wallet, timeout hold and service fingerprints after both migrations | PASS |
| Running API unconnected-provider boundary probe | PASS: capability not-connected, unconfigured callback404, no financial mutation |
| Public website preservation | No source/asset differences from approved Stage4 checkpoint; prior143-test/build evidence retained |
| Configured-secret scan and whitespace checks | PASS |

The13 new backend cases cover disabled/no-public-route behavior; initiation/pending/failure without credit; missing/tampered/stale authentication and failed lookup; customer/provider/account/amount/currency/proof mismatches; same-event replay, new-event duplicates and concurrent delivery; out-of-order failures; equivalent timestamp precision; transactional rollback and safe redelivery after a capacity failure; all four independent wallet/service states; explicit customer/staff renewal of a funded expired suspended service; historical consumed-reference protection; and direct database orphan, incomplete-proof and history-mutation rejection. Customer/Finance/Support HTTP summaries and ledger pages match after a test-only settlement.

The frontend tests cover the independent state matrix, explicit unchecked customer consent, canonical settlement entry/source rendering, system actor, no invented source route, no settlement-credit reversal and the unavailable provider capability. Existing desktop/mobile manual-funding browser evidence remains in the owner reports; no browser exercise is falsely attributed to a connected provider settlement. New settlement effects were tested only with isolated PostgreSQL and authenticated test protocol fixtures. Shared development has zero registered provider payments and zero settlement events.

Reviewed source history:

- Agent1: `d0a300a2b5a17d63c637e71c71b523b88046a78f` publishes the adapter/event/ledger boundary and API1.2.0; `c8aa0c9b761e503ff7211864611c0c1cb5202175` hardens proof and redelivery edge cases.
- Agent2: `841b2e4d8c0f275e1175aebbc1699bc0f88fd5f7` independence audit/tests; `341e5a76b3cd3e17fcb7d8e4721e7f4c5f1b1c82` canonical settlement display and handoff.
- Agent3: `2cfbe4f50aa2fd6e58009cb230eb437072a33a23` independence audit/tests; `f19fde55d584c8e6e1796417545471f3a39b0948` canonical settlement display, capability and handoff.

All owners' changes are consolidated on `codex/ikonectt-wallet-stage5a`. The final documentation/evidence commit containing this report identifies the delivered revision. See [test summary](settlement-test-summary.json), [live boundary probe](settlement-live-boundary-check.json), [post-proof-guard preservation](persistence-after-settlement-proof-guard.json), [customer report](../../my-ikonectt/STAGE5A_PORTAL_WALLET_REPORT.md) and [Admin report](../../admin/STAGE5A_WALLET_ADMIN_REPORT.md).

The API, Admin and customer portal remain available through the development supervisor. The original main checkout remains on its separate website work; no main merge, production migration or deployment occurred. Original financial acceptance fixtures and approved visual refinements are preserved.

## Provider dependencies

Before enabling a real adapter, supply approved provider and merchant/environment identity, raw-body/signature/replay specification, server verification API and credentials, authoritative paid-versus-settled semantics, gross/net/fee/partial-settlement rules, reference mapping, webhook/retry/polling identity, reconciliation and alert ownership, and refund/chargeback policies. Current matching is exact full NGN funding; no fee or partial-credit rule is invented. Production still requires the operational/database/security/deployment readiness recorded in the initial integration report.
