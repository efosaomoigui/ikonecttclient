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

// One canonical dataset for both UI fixtures and the guarded development database initializer.
// IDs are stable; initialization preserves existing records rather than overwriting developers' work.
const devId = (group: number, number: number) => `${group}0000000-0000-4000-8000-${String(number).padStart(12,'0')}`;
const businessPlan = C.Plan.parse({ ...simulatedPlan, id: devId(2,2), code: 'simulated-business-100', name: 'SIMULATED Business 100', kind: 'BUSINESS', speedMbps: 100, priceMinor: 10500000 });
const businessCustomer = C.Customer.parse({ ...simulatedCustomer, id: devId(1,2), accountNumber: '88000002', kind: 'BUSINESS', name: 'SIMULATED Business Customer', email: 'simulated-business@example.test' });
const suspendedCustomer = C.Customer.parse({ ...simulatedCustomer, id: devId(1,3), accountNumber: '88000003', status: 'SUSPENDED', name: 'SIMULATED Suspended Customer', email: 'simulated-suspended@example.test' });
const parents = C.CoverageLevel.options.slice(0,5).map((level,index) => C.CoverageLocation.parse({ id: devId(3,101+index), name: `SIMULATED ${level}`, level, parentId: index ? devId(3,100+index) : null, eligibility: 'UNKNOWN', planIds: [], evidence: null, simulated: true, verifiedAt: null }));
const buildings = C.Eligibility.options.map((eligibility,index) => C.CoverageLocation.parse({ id: devId(3,index+1), name: `SIMULATED ${eligibility} Building`, level: 'BUILDING_ADDRESS', parentId: parents[4].id, eligibility, planIds: eligibility === 'AVAILABLE' ? [simulatedPlan.id,businessPlan.id] : [], evidence: eligibility === 'UNKNOWN' ? null : 'SIMULATED eligibility; not a production coverage claim', simulated: true, verifiedAt: eligibility === 'UNKNOWN' ? null : at }));
const staff = C.Role.options.map((role,index) => ({ id: devId(5,index+1), role, name: `SIMULATED ${role} Staff`, email: `simulated.${role.toLowerCase()}@example.test` }));
const scenarios = [
  { key: 'reported', customerId: simulatedCustomer.id, planId: simulatedPlan.id, orderStatus: 'PENDING_PAYMENT', paymentStatus: 'REPORTED', subscriptionStatus: null, provisioningStatus: null },
  { key: 'paid-awaiting-provisioning', customerId: businessCustomer.id, planId: businessPlan.id, orderStatus: 'PAID', paymentStatus: 'CONFIRMED', subscriptionStatus: null, provisioningStatus: null },
  { key: 'active', customerId: simulatedCustomer.id, planId: simulatedPlan.id, orderStatus: 'COMPLETED', paymentStatus: 'CONFIRMED', subscriptionStatus: 'ACTIVE', provisioningStatus: 'ACTIVE' },
  { key: 'failed', customerId: simulatedCustomer.id, planId: simulatedPlan.id, orderStatus: 'FULFILLING', paymentStatus: 'CONFIRMED', subscriptionStatus: 'FAILED', provisioningStatus: 'FAILED' },
  { key: 'timeout-review', customerId: businessCustomer.id, planId: businessPlan.id, orderStatus: 'FULFILLING', paymentStatus: 'CONFIRMED', subscriptionStatus: 'REQUIRES_REVIEW', provisioningStatus: 'REQUIRES_REVIEW' },
  { key: 'rejected-payment', customerId: simulatedCustomer.id, planId: simulatedPlan.id, orderStatus: 'PENDING_PAYMENT', paymentStatus: 'REJECTED', subscriptionStatus: null, provisioningStatus: null },
  { key: 'pending-provisioning', customerId: businessCustomer.id, planId: businessPlan.id, orderStatus: 'FULFILLING', paymentStatus: 'CONFIRMED', subscriptionStatus: 'PENDING', provisioningStatus: 'PENDING' },
] as const;
export const developmentFixtures = {
  dataset: 'ikonectt-stage2-v1', simulated: true as const, createdAt: at,
  plans: [simulatedPlan,businessPlan], customers: [simulatedCustomer,businessCustomer,suspendedCustomer],
  locations: [...parents,...buildings], staff,
  scenarios: scenarios.map((scenario,index) => {
    const plan = [simulatedPlan,businessPlan].find(plan => plan.id === scenario.planId)!;
    const subscriptionId = scenario.subscriptionStatus ? devId(7,index+1) : null;
    return {
      key: scenario.key,
      order: C.Order.parse({ ...simulatedOrder, id: devId(4,index+1), customerId: scenario.customerId, planId: plan.id, status: scenario.orderStatus, subscriptionId, amountMinor: plan.priceMinor, planName: plan.name }),
      payment: C.AdminPayment.parse({ id: devId(8,index+1), orderId: devId(4,index+1), customerId: scenario.customerId, amountMinor: plan.priceMinor, currency: 'NGN', method: 'BANK_TRANSFER', reference: `SIMULATED-STAGE2-${scenario.key}`, evidence: 'SIMULATED transfer evidence', verificationEvidence: scenario.paymentStatus === 'REPORTED' ? null : 'SIMULATED verification', status: scenario.paymentStatus, verifiedAt: scenario.paymentStatus === 'REPORTED' ? null : at, verifiedById: scenario.paymentStatus === 'REPORTED' ? null : staff.find(staff => staff.role === 'FINANCE')!.id, createdAt: at }),
      subscription: scenario.subscriptionStatus ? C.Subscription.parse({ id: subscriptionId, customerId: scenario.customerId, planId: plan.id, buildingId: fixtureIds.building, status: scenario.subscriptionStatus, startsAt: scenario.subscriptionStatus === 'ACTIVE' ? at : null, endsAt: scenario.subscriptionStatus === 'ACTIVE' ? '2026-11-18T00:00:00.000Z' : null, externalServiceId: scenario.subscriptionStatus === 'ACTIVE' ? 'SIMULATED-SERVICE-STAGE2' : null, simulated: true }) : null,
      provisioning: scenario.provisioningStatus ? C.Provisioning.parse({ id: devId(9,index+1), orderId: devId(4,index+1), subscriptionId, status: scenario.provisioningStatus, mode: 'simulated', reference: `SIMULATED-${scenario.key}`, simulated: true, createdAt: at }) : null,
    };
  }),
  tickets: [
    C.Ticket.parse({ id: devId(6,101), customerId: simulatedCustomer.id, subscriptionId: devId(7,3), subject: 'SIMULATED open support request', status: 'OPEN', assignedToId: null, createdAt: at }),
    C.Ticket.parse({ id: devId(6,102), customerId: businessCustomer.id, subscriptionId: null, subject: 'SIMULATED closed support request', status: 'CLOSED', assignedToId: staff.find(staff => staff.role === 'SUPPORT')!.id, createdAt: at }),
  ],
  leads: [
    C.Lead.parse({ id: devId(6,201), name: 'SIMULATED Residential Enquiry', email: 'simulated-lead@example.test', phone: '+2348000000000', kind: 'RESIDENTIAL', message: 'SIMULATED enquiry only', planId: simulatedPlan.id, buildingId: null, customerId: null, status: 'NEW', consent: true, createdAt: at }),
    C.Lead.parse({ id: devId(6,202), name: 'SIMULATED Business Enquiry', email: 'simulated-business-lead@example.test', phone: '+2348000000000', kind: 'BUSINESS', message: 'SIMULATED qualified enquiry', planId: businessPlan.id, buildingId: fixtureIds.building, customerId: businessCustomer.id, status: 'QUALIFIED', consent: true, createdAt: at }),
  ],
};
