// Generated from Agent 1 backend/src/identity/access.ts. Do not edit.
export const ROLE_PERMISSIONS = {
  ADMIN: ['customers.read','customers.write','staff.manage','catalogue.write','coverage.write','leads.read','leads.write','orders.read','orders.write','payments.read','payments.verify','provisioning.write','support.read','support.write','reports.read','audit.read','integrations.read','integrations.write','notifications.read'],
  SUPPORT: ['customers.read','orders.read','payments.read','support.read','support.write'],
  SALES: ['customers.read','customers.write','leads.read','leads.write','orders.read','orders.write'],
  FINANCE: ['customers.read','orders.read','payments.read','payments.verify','reports.read'],
  PROVISIONER: ['customers.read','orders.read','provisioning.write','coverage.write'],
  EXECUTIVE: ['reports.read'],
} as const;
export type StaffRole = keyof typeof ROLE_PERMISSIONS;
export type Permission = typeof ROLE_PERMISSIONS[StaffRole][number];
