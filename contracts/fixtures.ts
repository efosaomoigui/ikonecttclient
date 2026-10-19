import * as C from './index';

// Display/testing fixtures only. These are not live accounts, current commercial prices or coverage claims.
const at = '2026-10-19T00:00:00.000Z';
export const fixtureIds = {
  customer: '10000000-0000-4000-8000-000000000001',
  plan: '20000000-0000-4000-8000-000000000001',
  building: '30000000-0000-4000-8000-000000000001',
  order: '40000000-0000-4000-8000-000000000001',
};
export const simulatedCustomer = C.Customer.parse({
  id: fixtureIds.customer, accountNumber: '88000001', accountNumberSimulated: true,
  kind: 'RESIDENTIAL', name: 'SIMULATED Customer', email: 'simulated@example.test', phone: '+2348000000000',
  status: 'ACTIVE', buildingId: fixtureIds.building, createdAt: at,
});
export const simulatedPlan = C.Plan.parse({
  id: fixtureIds.plan, code: 'simulated-home-30', name: 'SIMULATED Home 30', kind: 'RESIDENTIAL',
  priceMinor: 1500000, currency: 'NGN', speedMbps: 30, billingDays: 30,
  features: ['SIMULATED plan for interface testing'], published: true, simulated: true, createdAt: at, updatedAt: at,
});
export const simulatedOrder = C.Order.parse({
  id: fixtureIds.order, customerId: fixtureIds.customer, planId: fixtureIds.plan, buildingId: fixtureIds.building,
  type: 'NEW_CONNECTION', subscriptionId: null, status: 'PENDING_PAYMENT', amountMinor: 1500000,
  currency: 'NGN', planName: simulatedPlan.name, billingDays: 30, createdAt: at,
});
export const simulatedDashboard = C.Dashboard.parse({
  customer: simulatedCustomer, subscriptions: [], pendingOrders: 1, openTickets: 0,
  usage: null, usageStatus: 'EXTERNAL_PROVIDER_NOT_CONNECTED',
});
export const simulatedCoverage = C.CoverageResult.parse({ buildingId: fixtureIds.building, eligibility: 'UNKNOWN', planIds: [], simulated: true, source: 'SIMULATED', checkedAt: at });
export const fixtures = { simulated: true as const, customer: simulatedCustomer, plan: simulatedPlan, order: simulatedOrder, dashboard: simulatedDashboard, coverage: simulatedCoverage };
