# IKONECTT — STAGE 5A WALLET & SELF-SERVICE INTEGRATION REPORT

Date: 21 October 2026. Admin implementation: `698ddeaefda4f64008397128b0c0ab0659d5bd6d`; final acceptance corrections: `c889782b027243d983b9b48e8629a7d20b5f261f`. Report/evidence commit is supplied in the accompanying handoff.

## Admin/CRM implementation

Branch: `codex/ikonectt-admin-wallet-stage5a`. Isolated baseline: `78a55705921a9b3bc733ca162d39f7d4b444b8e3`, preserving approved visual work and collapsible sidebar commit `33e5463`. Current canonical API: **1.2.0**, source `d0a300a2b5a17d63c637e71c71b523b88046a78f`, with unchanged 78 paths / 95 operations and role permissions. Vendor schemas, permission export, operation map and provenance are synchronized from that exact commit. The original joint browser journey below ran on API 1.1.0, source `cb05bb65c96c0b5bfff9c0a8a53b275d23659625`. No independent frontend financial schemas were introduced.

Only Admin files change. Backend, portal, public website and approved logo/base typography/readability assets remain unchanged. Admin development UI uses port **3017** against the shared development API on **4000**. No merge to main or production deployment is performed.

## Screens and controls

- Existing customer detail includes the backend wallet summary: available credit, reserved funds and unverified top-ups. Errors remain visible, with retry; no fallback balance appears.
- Wallet transaction dialog uses canonical server pagination (25 entries), immutable credit/reserve/capture/release/reversal history, signed posted/reserved movements, actor/date/reference and related top-up/renewal references. Ordinary order payment records never become wallet credits.
- Separate Wallet Top-ups list/detail exposes WALLET allocation and Finance verification evidence. Only `payments.verify` holders can reach list, detail or verification. Rejection creates no credit; confirmation does not activate service.
- Controlled positive credit correction requires integer kobo amount, reason and operator review. Full reversal of a TOPUP_CREDIT/ADJUSTMENT_CREDIT uses a compensating-entry request and reason; the backend decides available funds and prior reversal conflicts. No arbitrary balance editing, wallet debits, refunds, transfers or withdrawals.
- Each adjustment/reversal form generates one UUID per reviewed intent. Fields freeze during submission; an ambiguous failure retries the exact captured body and UUID. Validation errors remain editable. The interface warns operators to inspect current records before abandoning a financial intent and beginning another.
- Wallet Renewals list/detail retains RESERVED/PROCESSING/REQUIRES_REVIEW/FAILED/SUCCEEDED distinctions and simulation/provider flags. A hold or acknowledgement is never presented as completed renewal.
- Provisioner-only actions process RESERVED renewals separately and reconcile PROCESSING/REQUIRES_REVIEW outcomes using an authoritative attestation, reference and evidence. Confirmed success requires operator-supplied UTC expiry; the interface never invents it. A differing period or uncertain result requires review/escalation with funds protected. Operators are explicitly warned never to record failure merely to release funds when service succeeded.
- Subscription detail exposes an audited enable/disable renewal-policy form, with reason. ACTIVE alone never implies eligibility. Catalogue plan forms accept an explicit nullable positive renewal price; blank removes the price rather than assuming the original connection price.
- Loading, empty, validation and API-error states remain explicit. Stale asynchronous responses do not reopen financial dialogs after the operator closes them or the session changes.

## Role boundaries

| Role | Wallet summary/history | Top-up evidence/verification | Credit correction/reversal | Renewal review | Policy/process/resolve |
| --- | --- | --- | --- | --- | --- |
| Admin | Yes | Yes | Yes | Yes | Yes |
| Support | Read only | No | No | Read only | No |
| Finance | Yes | Yes | Yes | Read only | No |
| Provisioner | No wallet grant | No | No | Yes | Yes |
| Sales / Executive | No | No | No | No | No |

These gates consume server permissions. The backend remains the authority for every financial and service mutation; frontend controls do not replace backend authorization.

## Development fixtures and browser evidence

Explicit SIMULATED preview data uses the canonical response schemas, with coherent customer/service/order/ledger references. Wallet financial mutations are **read-only in preview** and require the live backend. The preview is a UI demonstration, not accounting acceptance, and a failed live operation never enters it.

The real browser inspected customer wallet summary/history, top-up review and correction forms. Wallet dialog measurements at exact **1440, 1024, 768, 390 and 320 CSS pixels** show no page-wide horizontal overflow. Wide ledger content scrolls within its named keyboard-focusable region. Mobile summary cards stack and correction fields stay inside the dialog. Approved sidebar groups/branding/layout remain.

Evidence: [stage5a-wallet](docs/stage5a-wallet/), including `responsive-checks.json`, five responsive wallet captures, a mobile correction form and separate simulated top-up review. Screens are explicitly simulated, without credentials/tokens or real payment evidence.

Live development Finance, Provisioner and Support sign-ins were verified against the migrated API. Historical Stage 4 records have not been financially modified by this Admin pass.

## Completed joint browser journey

Fresh simulated development customer: account `84375004`, UUID `83028c05-b524-4c91-8288-c3c8373c970f`; subscription `7dddabe9-5e29-4aa1-bd6c-27dfbba1aecb`. All financial actions below were executed through real interfaces against the shared development API/database; no real money transfer occurred.

| Stage | Actual observed result |
| --- | --- |
| Initial wallet | Available/reserved/pending all zero, no entries, despite a legitimate prior order payment. No historical double credit. |
| Customer report (Agent 2) | One top-up reference `SIMULATED-S5A-BROWSER-d6ec3f94`, UUID `7bd78286-1694-4559-be69-71edcfd6e44d`, amount 2500000 kobo, WALLET allocation, REPORTED. Admin saw the same record and explicitly simulated evidence. |
| Finance confirmation (Agent 3) | Confirmed that exact top-up once. Available 2500000, reserved/pending zero, exactly one TOPUP_CREDIT. Verification control disappeared. No renewal processing occurred as part of payment approval. |
| Customer reservation (Agent 2) | Existing renewal `e63ad55e-d577-48b0-beb6-a2dfe168f26c` RESERVED 1950000; available 550000/reserved 1950000. Customer owner captured the hold and unchanged 20 November service expiry before handing off. No second renewal was created. |
| Separate Provisioner processing (Agent 3) | Processed that exact renewal once. Backend returned SUCCEEDED with SIMULATED provider outcome; confirmed expiry `2026-12-20T02:20:46.219Z` matches the reserved expected period. Process control disappeared. Subscription remained ACTIVE with 20 December expiry. |
| Finance final main journey | Available 550000/reserved zero/pending zero; exactly three immutable entries: TOPUP_CREDIT, RESERVE and CAPTURE. |
| Customer final proof (Agent 2) | Independently reported matching 5500 NGN/zero hold, confirmed 20 December renewal and service expiry. The next 19500 NGN quote displayed insufficient funds and no confirmation controls; no new financial mutation. Portal screenshots belong to Agent 2's handoff. |
| Support final main journey (Agent 3) | Same 5500 NGN, zero hold and three entries. No credit/reversal/top-up evidence controls. |
| Controlled correction after main proof | Finance added an explicitly simulated 10000-kobo correction, raising balance to 560000, then reversed it in full through the compensating-entry endpoint. Final balance returned to 550000/zero hold. Five entries remain, including original history. Correction entry `15904ab0-2dc9-4bb9-a789-6445c06c2394`. |

The separate timeout fixture was inspected **read-only**: customer `8ed394ec-8fb9-4830-8910-7933e53e74c7`, renewal `c232441f-1784-44d9-908a-f58cf302ed12`. Finance saw REQUIRES_REVIEW with an explicit funds-held warning, available 550000 and reserved 1950000. No Finance process/resolve controls appeared. Admin did not process, resolve or adjust this fixture. The timeout itself was prepared by Agent 1's backend service/test configuration, not triggered by this Admin browser run.

Agent 2 subsequently confirmed the customer portal also shows all five entries and the unchanged 5500 NGN balance after correction/reversal, and separately inspected the unchanged timeout hold. Agent 1 reported the final financial fingerprints were matched in a restored verification database. Those are owner-reported results; Admin's directly executed browser observations are listed above.

Final live wallet layout checks at exact 390px and 320px show the 5500 NGN balance, contained dialog and named keyboard-focusable horizontal ledger scroll region, without page-wide overflow. The earlier explicit fixture pass covers 768/1024/1440 as well. Viewport overrides were reset and coordinated with the portal owner.

Recorded evidence includes `joint-browser-results.json`, `correction-reversal.json`, `support-final-permissions.json`, `live-responsive-checks.json`, and screenshots of initial zero balance, reported/confirmed top-up, one credit, reserved/completed renewal, service expiry, final debit, Support read-only access, timeout hold, correction and compensating reversal. No credentials, setup tokens or real financial evidence are included.

## Acceptance corrections

Browser inspection found concatenated camel-case renewal labels; explicit readable expiry/provider/resolution labels now replace them. The transaction history also offered reversal on a credit whose compensating reversal was already present in the loaded page; it now displays “Reversed” while retaining both entries. Backend reversal eligibility/idempotency remains authoritative, including history outside the loaded page. A regression test covers suppression of that duplicate action.

## Automated validation

`npm test --prefix admin`: **50 passed, zero failed**, after final source changes. The Admin test suite covers the existing regressions, canonical fixtures/route parity, Support evidence restrictions, Finance/Provisioner separation, invalid or injected financial input, exact retry UUID/body retention, no live-to-mock fallback, response validation and expired/revoked session behavior. UI tests cover read-only wallet history, controlled correction fields, uncertain holds, authoritative reconciliation, known reversed entries and explicit nullable catalogue renewal prices. Approved visual asset checks pass.

`npm run build --prefix admin`: **passed** (TypeScript and production Vite bundle), after final source changes. `git diff --check`: **passed**. The compiled owner preview at port 3018 was also inspected in a real browser: no simulated-workspace entry controls, live Finance sign-in, actual 5500 NGN/zero hold/five-entry wallet readback, and sign-out. Evidence: `production-owner-check.json` and `production-owner-wallet.png`. No financial mutation occurred in that compiled smoke check.

The consolidated compiled Admin at `http://127.0.0.1:3014/admin/` was then tested read-only after integration and desktop/runtime restoration: no preview entry controls; Finance showed 5500 NGN, zero hold and all five ledger entries, including the correction and compensation; Support showed the same balance/history with zero credit, reversal, top-up evidence or top-up navigation controls. Both staff sessions were signed out. Evidence: `compiled-integrated-check.json`, `compiled-integrated-finance.png`, `compiled-integrated-support.png`. Agent 1 separately reported the integrated 50-test suite and production build passed.

Financial ledger/concurrency/migration tests belong to Agent 1; customer top-up/request/insufficient-balance browser actions belong to Agent 2. This report does not claim those workflows passed solely from Admin fixtures or mocked transport tests.

## Remaining limitations and readiness

The Admin portion of the coordinated main journey, correction/reversal and protected timeout readback is complete. All Admin financial mutations are finished; the backend owner has been notified to fingerprint and back up the final shared state. Controlled integration review may proceed after final source/report handoff. No live gateway/bank details are invented. Alternate-period pricing, service refunds and external wallet transfers remain outside the canonical extension. The browser did not independently execute concurrent-spend races, an elapsed session expiry or a duplicate confirmation request after its control disappeared; those protections have automated coverage and backend-owner acceptance. This report distinguishes those checks from directly executed browser actions.

Final implementation/report hashes accompany the completion handoff.

## Subsequent settlement clarification

The human subsequently clarified that approved-provider verified settlement must automatically create authoritative ledger credit and wallet funds, while never activating, renewing or provisioning service. Wallet funding and service state are independent: zero or positive wallet credit can coexist with active or inactive service. The customer must still explicitly confirm renewal, followed by the existing reservation and separate authorized confirmed service-outcome workflow. No recurring renewal is implied.

The manually reported top-up/Finance acceptance above records the actual executed path; it does not require manual Finance approval for a future approved-provider settlement. Agent 1 owns the disabled-by-default settlement adapter, durable idempotent event boundary and historical allocation protection. Admin has now consumed the published 1.2.0 contract; its exact handoff is retained at [vendor/SETTLEMENT_HANDOFF.md](vendor/SETTLEMENT_HANDOFF.md). No settlement-provider connection or new financial mutation is claimed in this report.

Admin display audit: the wallet summary and history are not gated by service status or nonzero funds. A targeted automated test covers zero/positive backend balances crossed with ACTIVE/SUSPENDED service, verifies the supplied balance remains visible in all four cases, and asserts the display requests only the wallet GET endpoint with no service/financial write. The suite now passes **51 tests**, zero failures. These matrix assertions are automated, not newly created live financial fixtures; all shared financial records remain unchanged.

## API 1.2.0 settlement display supplement

The canonical `SETTLEMENT_CREDIT` entry renders as **Settled wallet funding**, distinct from **Manual top-up credit**. A null actor displays **System**. The optional `settlementPaymentId` appears as an escaped plain source identifier; no settlement details link, checkout route, callback or operator settlement action is invented. Settlement credits remain excluded from controlled credit reversal in both rendering and the action guard. Existing manual wallet reports still require Finance verification; verified settlement from an approved connected provider credits the wallet automatically and neither path initiates renewal or provisioning.

Integrations labels the capability **Payment settlement** and maps `not-connected` to its existing unavailable state. The explicit preview also marks settlement unconnected. The approved layouts, styles, fonts, logo and navigation are unchanged by this supplement.

Targeted automated checks consume canonical settlement-credit responses, render the system actor/source reference, preserve ordinary manual credits, reject even a direct UI attempt to reverse a settlement credit, and assert only wallet GET requests occur. A separate check verifies the unconnected settlement capability. **Final local validation: 53 tests passed, zero failed; TypeScript/review build and production build passed; `git diff --check` passed.** Approved visual assets and the canonical role-permission export remain byte-identical to the prior approved Admin baseline. No shared live settlement was fabricated, no runtime was started/stopped for this supplement, and no additional live browser financial workflow was executed. The final commit is supplied in the accompanying handoff.

## Integrated compiled-asset acceptance

The final root checkout's production assets on `http://127.0.0.1:3014/admin/` were checked read-only against API4000. Finance saw ₦5,500 available, zero reserved/unverified funds and all five ledger entries, including the correction and compensating reversal. The correction displayed “Reversed”. Support independently saw the same balance and five entries, with zero credit, reversal, top-up-evidence or top-up-navigation controls. No preview controls or financial mutations were used; the browser signed out afterward. Evidence: `docs/stage5a-wallet/compiled-integrated-check.json`, `compiled-integrated-finance.png` and `compiled-integrated-support.png`. The lead recovered and reviewed these saved files after an owner-agent capacity interruption and committed this evidence-only supplement; no source implementation changed.
