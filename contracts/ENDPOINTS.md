# Canonical API v1.1.0 endpoint and permission map

Generated from the actual NestJS route and guard metadata. All successful writes return HTTP 200.
Customer data ownership is checked inside the application in addition to route permissions.
ADMIN is the highest existing role; there is no separate SUPER_ADMIN bypass.

| Method | Full API path | Access / action permission |
| --- | --- | --- |
| GET | `/api/v1/admin/audit` | audit.read; ADMIN |
| GET | `/api/v1/admin/coverage` | coverage.write; ADMIN, PROVISIONER |
| GET | `/api/v1/admin/customers/{id}/wallet/transactions` | wallet.read; ADMIN, SUPPORT, FINANCE |
| GET | `/api/v1/admin/customers/{id}/wallet` | wallet.read; ADMIN, SUPPORT, FINANCE |
| GET | `/api/v1/admin/customers/{id}` | customers.read; ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/customers` | customers.read; ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/integrations/customers/{id}/references` | integrations.read; ADMIN |
| GET | `/api/v1/admin/integrations/legacy/lookup` | integrations.read; ADMIN |
| GET | `/api/v1/admin/integrations` | integrations.read; ADMIN |
| GET | `/api/v1/admin/leads/{id}` | leads.read; ADMIN, SALES |
| GET | `/api/v1/admin/leads` | leads.read; ADMIN, SALES |
| GET | `/api/v1/admin/notifications` | notifications.read; ADMIN |
| GET | `/api/v1/admin/orders/{id}` | orders.read; ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/orders` | orders.read; ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/payments/{id}/receipt` | payments.read; ADMIN, SUPPORT, FINANCE |
| GET | `/api/v1/admin/payments/{id}` | payments.read; ADMIN, SUPPORT, FINANCE |
| GET | `/api/v1/admin/payments` | payments.read; ADMIN, SUPPORT, FINANCE |
| GET | `/api/v1/admin/permissions` | Staff session |
| GET | `/api/v1/admin/plans` | catalogue.write; ADMIN |
| GET | `/api/v1/admin/provisioning` | provisioning.write; ADMIN, PROVISIONER |
| GET | `/api/v1/admin/reports/summary` | reports.read; ADMIN, FINANCE, EXECUTIVE |
| GET | `/api/v1/admin/staff` | staff.manage; ADMIN |
| GET | `/api/v1/admin/subscriptions/{id}` | orders.read; ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/subscriptions` | orders.read; ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/tickets/{id}` | support.read; ADMIN, SUPPORT |
| GET | `/api/v1/admin/tickets` | support.read; ADMIN, SUPPORT |
| GET | `/api/v1/admin/wallet-renewals/{id}` | renewals.read; ADMIN, SUPPORT, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/wallet-renewals` | renewals.read; ADMIN, SUPPORT, FINANCE, PROVISIONER |
| GET | `/api/v1/admin/wallet-top-ups/{id}` | payments.verify; ADMIN, FINANCE |
| GET | `/api/v1/admin/wallet-top-ups` | payments.verify; ADMIN, FINANCE |
| GET | `/api/v1/auth/session` | Authenticated session |
| GET | `/api/v1/capabilities` | Public |
| GET | `/api/v1/coverage/locations` | Public |
| GET | `/api/v1/health` | Public |
| GET | `/api/v1/me/dashboard` | Customer; owned account only |
| GET | `/api/v1/me/notifications` | Customer; owned account only |
| GET | `/api/v1/me/orders/{id}` | Customer; owned account only |
| GET | `/api/v1/me/orders` | Customer; owned account only |
| GET | `/api/v1/me/payments/{id}/receipt` | Customer; owned account only |
| GET | `/api/v1/me/payments` | Customer; owned account only |
| GET | `/api/v1/me/profile` | Customer; owned account only |
| GET | `/api/v1/me/subscriptions/{id}/renewal-eligibility` | Customer; owned account only |
| GET | `/api/v1/me/subscriptions/{id}` | Customer; owned account only |
| GET | `/api/v1/me/subscriptions` | Customer; owned account only |
| GET | `/api/v1/me/tickets/{id}` | Customer; owned account only |
| GET | `/api/v1/me/tickets` | Customer; owned account only |
| GET | `/api/v1/me/wallet/renewals/{id}` | Customer; owned account only |
| GET | `/api/v1/me/wallet/renewals` | Customer; owned account only |
| GET | `/api/v1/me/wallet/top-ups` | Customer; owned account only |
| GET | `/api/v1/me/wallet/transactions` | Customer; owned account only |
| GET | `/api/v1/me/wallet` | Customer; owned account only |
| GET | `/api/v1/plans/{id}` | Public |
| GET | `/api/v1/plans` | Public |
| PATCH | `/api/v1/admin/coverage/{id}` | coverage.write; ADMIN, PROVISIONER |
| PATCH | `/api/v1/admin/customers/{id}` | customers.write; ADMIN, SALES |
| PATCH | `/api/v1/admin/leads/{id}` | leads.write; ADMIN, SALES |
| PATCH | `/api/v1/admin/plans/{id}` | catalogue.write; ADMIN |
| PATCH | `/api/v1/admin/staff/{id}` | staff.manage; ADMIN |
| PATCH | `/api/v1/admin/subscriptions/{id}/renewal-policy` | provisioning.write; ADMIN, PROVISIONER |
| PATCH | `/api/v1/admin/tickets/{id}` | support.write; ADMIN, SUPPORT |
| PATCH | `/api/v1/me/profile` | Customer; owned account only |
| POST | `/api/v1/admin/coverage` | coverage.write; ADMIN, PROVISIONER |
| POST | `/api/v1/admin/customers/{id}/credentials` | customers.write; ADMIN, SALES |
| POST | `/api/v1/admin/customers/{id}/wallet/adjustments` | wallet.adjust; ADMIN, FINANCE |
| POST | `/api/v1/admin/customers` | customers.write; ADMIN, SALES |
| POST | `/api/v1/admin/integrations/customers/{id}/references` | integrations.write; ADMIN |
| POST | `/api/v1/admin/orders` | orders.write; ADMIN, SALES |
| POST | `/api/v1/admin/payments/{id}/verify` | payments.verify; ADMIN, FINANCE |
| POST | `/api/v1/admin/payments` | orders.write; ADMIN, SALES |
| POST | `/api/v1/admin/plans` | catalogue.write; ADMIN |
| POST | `/api/v1/admin/provisioning/{id}/result` | provisioning.write; ADMIN, PROVISIONER |
| POST | `/api/v1/admin/provisioning` | provisioning.write; ADMIN, PROVISIONER |
| POST | `/api/v1/admin/staff` | staff.manage; ADMIN |
| POST | `/api/v1/admin/tickets/{id}/messages` | support.write; ADMIN, SUPPORT |
| POST | `/api/v1/admin/tickets` | support.write; ADMIN, SUPPORT |
| POST | `/api/v1/admin/wallet-renewals/{id}/process` | provisioning.write; ADMIN, PROVISIONER |
| POST | `/api/v1/admin/wallet-renewals/{id}/resolve` | provisioning.write; ADMIN, PROVISIONER |
| POST | `/api/v1/admin/wallet-top-ups/{id}/verify` | payments.verify; ADMIN, FINANCE |
| POST | `/api/v1/admin/wallet-transactions/{id}/reverse` | wallet.adjust; ADMIN, FINANCE |
| POST | `/api/v1/assistant/guidance` | Public |
| POST | `/api/v1/auth/change-password` | Authenticated session |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/logout` | Authenticated session |
| POST | `/api/v1/auth/recovery` | Public |
| POST | `/api/v1/auth/reset-password` | Public |
| POST | `/api/v1/auth/staff/login` | Public |
| POST | `/api/v1/auth/staff/recovery` | Public |
| POST | `/api/v1/coverage/check` | Public |
| POST | `/api/v1/leads` | Public |
| POST | `/api/v1/me/orders` | Customer; owned account only |
| POST | `/api/v1/me/payments` | Customer; owned account only |
| POST | `/api/v1/me/subscriptions/{id}/wallet-renewals` | Customer; owned account only |
| POST | `/api/v1/me/tickets/{id}/messages` | Customer; owned account only |
| POST | `/api/v1/me/tickets` | Customer; owned account only |
| POST | `/api/v1/me/wallet/top-ups` | Customer; owned account only |
