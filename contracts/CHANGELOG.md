# API changes

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
