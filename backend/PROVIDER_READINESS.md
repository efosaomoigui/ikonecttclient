# Connecting a future approved provider

No external production provider is connected. Stage 2 retains manual/native/disabled/simulated boundaries.
The current durable PostgreSQL notification outbox is sufficient for the bounded workload; Redis/BullMQ
and multiple API replicas are not introduced.

1. Obtain client approval, sandbox/API documentation, ownership of authoritative data, credentials,
   status mapping, timeouts, quotas, authenticity requirements and idempotency rules.
2. Implement the existing interface in `src/integrations/adapters.ts` (CoverageProvider is implemented
   by the native registry in `catalogue/`). Keep network/vendor response formats inside the adapter.
3. Add an explicit configuration value and constructor selection. Keep credentials in environment/secret
   storage; do not change domain controllers to call vendor APIs directly or hard-code a simulator.
4. Normalize outputs and errors into ProviderResult with accurate provider/simulated metadata. Staging and
   production must continue rejecting simulated modes. Test success, definitive failure, timeout and retries.
5. Validate in a separate staging environment using real sandbox requests and database-backed assertions.
   Publish compatible contract changes only if a genuine application capability requires them.

## Payments

Implement PaymentProvider.initiate/verify without trusting client-reported amounts/status. Initiation never
confirms payment or activates service. Add a gateway API/webhook only after signature verification,
event replay/idempotency controls, order/reference/amount/currency checks and reconciliation policy are
specified. Preserve transaction snapshots, verifier trails and separate provisioning. No unsigned webhook
or gateway-specific production method is exposed in the current baseline.

## Provisioning

Implement ProvisioningProvider.request using requestId as the stable provider idempotency key. Retain
confirmed-payment and verified-address prerequisites. Only authoritative outcomes may set ACTIVE;
timeouts/uncertain responses remain REQUIRES_REVIEW. A real asynchronous callback/status reconciliation
flow requires its approved authenticity/state mapping before being added. Do not retry blindly after a
timeout. Preserve existing subscriptions when a renewal/change fails and record external service IDs.

## CRM and customer references

Implement LegacyCrmProvider.lookup and verified mapping/import workflows after authoritative identity
rules are supplied. Internal UUIDs remain permanent; external IDs and official login/account numbers
remain separate. A lookup result cannot automatically create an active account or service.

## Coverage

Implement the existing CoverageProvider boundary for an approved source, retaining the full location
hierarchy and building/address-level eligibility. Unknown is distinct from unavailable. External results
must enter an audited verified mapping/persistence flow before service orders rely on them; a map pin or
public simulator result does not authorize provisioning.

## Email and SMS

Implement MessagingProvider.send. Honor the outbox message ID as idempotencyKey across retries and
delivery/commit interruptions. Respect the worker lease/timeout budget; introduce lease renewal if a
provider request can exceed it. Use approved templates/sender IDs. Never log decrypted payloads or reset
tokens. Report SENT only after an actual accepted delivery result; simulated sends remain SIMULATED.
Recovery acknowledgement does not promise delivery when a provider is disabled.

## Usage, assistant and operational limits

No authoritative usage/billing feed exists: preserve null/unavailable responses. The assistant remains
direct read-only guidance; any future account read must use a customer-scoped authenticated tool. It must
not execute payments, order/renewal operations, profile writes or network provisioning. Production release
also depends on hosting/TLS, monitoring, backup ownership, official identifiers/catalogue/coverage and
approved refund/cancellation/proration/reconciliation policies. Shared rate-limit storage is required
before scaling beyond one API process.
