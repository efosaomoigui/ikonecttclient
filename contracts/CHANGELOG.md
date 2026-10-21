# API changes

## 1.1.0 - 2026-10-21

Additive Stage5A internal wallet/top-up/renewal extension: 78paths/95operations. Separate allocation, authoritative ledger/holds, explicit renewal price and policy, credit corrections/compensating reversals, existing-role permissions. Historical order payments never become opening wallet credit. See WALLET_HANDOFF.md. No live provider connected.


## 1.0.1 - 2026-10-19

Stage 2 compatibility release: unchanged 59 paths, 75 operations, request/response names and v1 behavior.
OpenAPI now represents the existing strictly-positive price/payment rules and shared error payloads,
including the existing 413 body-size limit. Route/guard parity and the generated endpoint/permission map
are checked automatically. Added one canonical extended SIMULATED dataset for persistent development,
shared by database initialization and frontend fixtures. Added committed-contract consumption and
Agent 2/3 handoff guidance. Contract package version matches API_VERSION. No new live provider or role.

## 1.0.0 - 2026-10-19

Initial contracts for public website, customer portal and staff CRM.
Account-number/customer and email/staff login. Opaque revocable bearer sessions.
Money uses NGN integer minor units. Paginated lists use offset/limit.
Explicit payment verification and separate provisioning; no self-registration.
Coverage uses building-level eligibility and returns UNKNOWN explicitly.
Usage and real integrations unavailable until client APIs are supplied.
Initial contract is published for review; frontend applications must opt in to these endpoints.
Staff recovery is included alongside customer recovery. TicketDetail explicitly includes ordered messages;
AdminPayment adds review evidence and verifier identity without exposing those fields to customers.
Configurable coverage modes are native/disabled/simulated. Initial OpenAPI publishes 59 paths and 75 operations.
