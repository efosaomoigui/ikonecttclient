# IKONECTT — SYSTEM INTEGRATION REQUIREMENTS

## Wallet questionnaire

Please provide API documentation and sandbox access with test customers, wallets, subscriptions and payment references. For each supported operation, include the API method and path, sample requests and responses, permissions, status and error meanings, rate limits, and any differences between sandbox and production. Please identify unsupported operations and the approved operational alternative.

| Priority | Operation | What we need you to confirm |
| --- | --- | --- |
| Balance launch blocker | Account and wallet identification | Which stable identifier links a verified customer to a wallet? Can a customer have multiple wallets? Who supplies and verifies the initial mapping, and how are account merges or reassignments communicated? |
| Balance launch blocker | Current balance | Can we retrieve the wallet identifier, currency, posted balance, holds and available balance? Are amounts in minor units? Please define the arithmetic, timestamps and freshness guarantees. What does an absent or suspended wallet return? |
| History launch blocker | Transaction history | Can we retrieve credits, debits, holds, releases, reversals and adjustments, with stable IDs, references, status, amount, effective date and cursor or page ordering? How do we reconcile imported records without showing a transaction twice? |
| Funding launch blocker | Funding initiation and confirmation | Who accepts funds and issues payment instructions? How do we submit or correlate a report or checkout reference? Which status proves the funds are credited to this specific wallet? How do we verify pending, failed, refunded and reversed payments? |
| Renewal launch blocker | Quote, debit and activation | Which API checks eligibility and returns the authoritative price for a mapped subscription? Can a confirmed customer request atomically check funds and initiate debit? Does the same operation renew service, or is a separate approved provisioning call required? Which service status and expiry confirm activation? Who handles release or refund if provisioning fails? |
| Funding and renewal launch blocker | Transaction and service status | Can we query by both client transaction ID and our stable request reference after a timeout? Which outcomes are terminal? How long do idempotency keys remain valid, what is their scope, and what happens if a retry changes the request? |
| Optional if polling suffices | Balance, payment and service notifications | Are signed webhooks available? Please provide signing, key rotation, timestamp, replay, delivery retry, duplicate and ordering rules. Which event types require a follow-up status lookup? |

Please confirm the service authentication method, required scopes, credential rotation and network restrictions. For sandbox verification we need scenarios for unmatched wallet, insufficient funds, pending settlement, duplicate callback, ambiguous timeout, reversal, and debit confirmed with activation still pending.

## Current implementation and cutover

- The existing wallet APIs, ledger, history, top-up reports and explicit renewal workflow remain in local mode. This is the default. The presentation still uses its isolated sample data.
- The client balance adapter resolves the authenticated customer's preverified `ExternalReference` in the `client-wallet` namespace. Populate mappings only through a trusted process agreed with the client. A client-supplied browser identifier, name or email is never used as a fallback.
- The adapter contract is internal, not a proposed client endpoint. Its transport must retrieve a fresh snapshot and normalize the response. The backend checks wallet identity, NGN minor-unit amounts and balance consistency. Concurrent reads for the same customer share one in-flight request. Reads after navigation retrieve again. Failures return a verification message without a local balance fallback.
- `WALLET_AUTHORITY=client` prepares the backend for client authority. The default client provider is deliberately unconfigured. Keep client mode off on live environments until the client contract, mappings, implementation and cutover checks are ready. Client mode blocks local settlement, top-up posting and renewal debit and processing. Local history is retained as operational history. Remote history, funding and renewal are awaiting their contracts.
- Reconcile existing balances, pending top-ups, and held or in-flight renewals before switching authority. Decide with the client which references are historical, already consumed, or still pending. A local top-up report never establishes client credit. Funding never triggers renewal. When the client processes a debit, local records will track intent and verified outcomes without posting a second debit.
