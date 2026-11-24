import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { config as loadEnvironment } from 'dotenv';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import * as C from '../../contracts';
import { createApp, openApi } from '../src/bootstrap';
import { Config } from '../src/core/config';
import { Database } from '../src/core/database';
import { decrypt, digest, hashPassword } from '../src/core/crypto';
import { IdentityService } from '../src/identity/identity.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { Simulator, SimulatedLegacyProvider, SimulatedPaymentProvider, SimulatedProvisioningProvider } from '../src/integrations/adapters';

loadEnvironment({ path: '.env.test.local', override: !process.env.TEST_DATABASE_URL, quiet: true } as any);
if (!process.env.TEST_DATABASE_URL || !new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test')) throw new Error('Set TEST_DATABASE_URL to a dedicated database ending in _test');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.PROVISIONING_ADAPTER = 'manual';
process.env.EMAIL_ADAPTER = 'simulated';
process.env.SMS_ADAPTER = 'simulated';
process.env.LEGACY_ADAPTER = 'simulated';
process.env.PAYMENT_ADAPTER = 'manual';
process.env.SIMULATOR_SCENARIO = 'success';

const db = new PrismaClient();
const run = randomUUID().slice(0, 8), password = `Test-only-${run}-Password!`;
let app: Awaited<ReturnType<typeof createApp>>;
let admin: string, support: string, finance: string, sales: string, provisioner: string, executive: string;
let customer: any, other: any, customerToken: string, otherToken: string, plan: any, building: any, unknown: any, order: any, payment: any, provision: any, ticket: any;
const staffIds: Record<string, string> = {};
function api(method: 'get' | 'post' | 'patch', path: string, bearer?: string, body?: any) {
  let req = request(app.getHttpServer())[method](`/api/v1${path}`);
  if (bearer) req = req.set('Authorization', `Bearer ${bearer}`);
  if (body) req = req.send(body);
  return req;
}
async function createCustomer(name: string) {
  const response = await api('post', '/admin/customers', admin, { kind: 'RESIDENTIAL', name: `SIMULATED ${name} ${run}`, email: `${name}-${run}@example.test`, phone: '+2348000000000' }).expect(200);
  C.Customer.parse(response.body.customer);
  assert.match(response.body.customer.accountNumber, /^\d{8}$/);
  await api('post', '/auth/reset-password', undefined, { token: response.body.setupToken, password }).expect(200);
  return response.body;
}

before(async () => {
  const passwordHash = await hashPassword(password);
  for (const role of C.Role.options) {
    const staff = await db.user.create({ data: { kind: 'STAFF', name: `SIMULATED ${role}`, email: `${role.toLowerCase()}-${run}@example.test`, passwordHash, roles: [role] } });
    staffIds[role] = staff.id;
  }
  app = await createApp(true); await app.init();
  const tokens: Record<string, string> = {};
  for (const role of C.Role.options) {
    const result = await api('post', '/auth/staff/login', undefined, { email: `${role.toLowerCase()}-${run}@example.test`, password }).expect(200);
    C.Session.parse(result.body); tokens[role] = result.body.accessToken;
  }
  ({ ADMIN: admin, SUPPORT: support, FINANCE: finance, SALES: sales, PROVISIONER: provisioner, EXECUTIVE: executive } = tokens);
}, { timeout: 60_000 });
after(async () => { if (app) await app.close(); await db.$disconnect(); });

test('starts independently with database health and publishes secured OpenAPI', async () => {
  await api('get', '/health').expect(200);
  const spec = openApi(app);
  assert.ok(Object.keys(spec.paths).length >= 45);
  assert.deepEqual((spec.paths['/api/v1/auth/login'].post as any).security, []);
  assert.deepEqual((spec.paths['/api/v1/admin/payments/{id}/verify'].post as any).security, [{ bearer: [] }]);
  assert.equal((await api('get', '/health')).headers['cache-control'], 'no-store');
});
test('has no public self-registration and protects staff onboarding', async () => {
  await api('post', '/auth/register', undefined, {}).expect(404);
  await api('post', '/admin/customers', undefined, {}).expect(401);
  await api('post', '/admin/customers', support, {}).expect(403);
});
test('staff creates customer identities and setup tokens are single-use', async () => {
  const created = await createCustomer('customer'); customer = created.customer;
  await api('post', '/auth/reset-password', undefined, { token: created.setupToken, password }).expect(400);
  const another = await createCustomer('other'); other = another.customer;
  const first = await api('post', '/auth/login', undefined, { accountNumber: customer.accountNumber, password }).expect(200);
  customerToken = first.body.accessToken;
  const second = await api('post', '/auth/login', undefined, { accountNumber: other.accountNumber, password }).expect(200);
  otherToken = second.body.accessToken;
  const user = await db.user.findUniqueOrThrow({ where: { customerId: customer.id } });
  assert.notEqual(user.passwordHash, password);
  const session = await db.session.findUniqueOrThrow({ where: { tokenHash: digest(customerToken) } });
  assert.notEqual(session.tokenHash, customerToken);
  assert.equal(await db.subscription.count({ where: { customerId: customer.id } }), 0);
});
test('customer profiles, dashboard and session are scoped and typed', async () => {
  const profile = await api('get', '/me/profile', customerToken).expect(200);
  assert.equal(C.Customer.parse(profile.body).id, customer.id);
  C.Dashboard.parse((await api('get', '/me/dashboard', customerToken).expect(200)).body);
  assert.equal((await api('get', '/auth/session', customerToken).expect(200)).body.customerId, customer.id);
  await api('get', '/admin/customers', customerToken).expect(403);
  await api('get', '/me/profile', admin).expect(403);
  await api('patch', '/me/profile', customerToken, { status: 'ACTIVE' }).expect(400);
  await api('patch', '/me/profile', customerToken, { phone: '+2348111111111' }).expect(200);
});
test('role/action permissions include executive-only reporting views', async () => {
  assert.deepEqual((await api('get', '/admin/permissions', executive).expect(200)).body.permissions, ['reports.read']);
  await api('get', '/admin/customers', executive).expect(403);
  await api('get', '/admin/reports/summary', support).expect(403);
  await api('get', '/admin/staff', sales).expect(403);
});
test('plan management rejects unauthorized changes and validates strict inputs', async () => {
  const input = { code: `test-${run}`, name: `SIMULATED plan ${run}`, kind: 'RESIDENTIAL', priceMinor: 1500000, speedMbps: 30, published: true };
  await api('post', '/admin/plans', sales, input).expect(403);
  await api('post', '/admin/plans', admin, { ...input, priceMinor: -1 }).expect(400);
  plan = C.Plan.parse((await api('post', '/admin/plans', admin, input).expect(200)).body);
  C.page(C.Plan).parse((await api('get', '/plans').expect(200)).body);
  await api('get', '/plans?limit=101').expect(400);
  await api('get', '/plans?offset=-1').expect(400);
  await api('get', '/plans/not-an-id').expect(400);
});
test('coverage requires the full geographic hierarchy and address-level verification', async () => {
  await api('post', '/admin/coverage', admin, { name: 'Bad state', level: 'STATE' }).expect(400);
  let parentId: string | undefined;
  for (const level of C.CoverageLevel.options) {
    const input = { name: `SIMULATED ${level} ${run}`, level, ...(parentId ? { parentId } : {}), ...(level === 'BUILDING_ADDRESS' ? { eligibility: 'AVAILABLE', planIds: [plan.id], evidence: 'Test-only address verification' } : {}) };
    const result = await api('post', '/admin/coverage', admin, input).expect(200);
    parentId = result.body.id;
    if (level === 'BUILDING_ADDRESS') building = result.body;
  }
  unknown = (await api('post', '/admin/coverage', admin, { name: `SIMULATED unknown ${run}`, level: 'BUILDING_ADDRESS', parentId: building.parentId }).expect(200)).body;
  const result = await api('post', '/coverage/check', undefined, { buildingId: unknown.id, planId: plan.id }).expect(200);
  assert.equal(C.CoverageResult.parse(result.body).eligibility, 'UNKNOWN');
  await api('post', '/coverage/check', undefined, { buildingId: building.parentId }).expect(404);
  C.page(C.CoverageLocation).parse((await api('get', `/coverage/locations?parentId=${building.parentId}`).expect(200)).body);
});
test('public enquiry records a lead without creating customer or subscription', async () => {
  const before = await db.customer.count();
  const input = { name: `SIMULATED lead ${run}`, email: `lead-${run}@example.test`, phone: '+2348000000000', kind: 'RESIDENTIAL', message: 'Test-only service enquiry', planId: plan.id, consent: true };
  await api('post', '/leads', undefined, { ...input, consent: false }).expect(400);
  const lead = (await api('post', '/leads', undefined, input).expect(200)).body;
  assert.equal(lead.status, 'NEW'); assert.equal(await db.customer.count(), before);
  await api('patch', `/admin/leads/${lead.id}`, sales, { status: 'QUALIFIED', customerId: customer.id }).expect(200);
  C.page(C.Lead).parse((await api('get', '/admin/leads', sales).expect(200)).body);
});
test('orders require a matching customer plan and verified building coverage', async () => {
  await api('post', '/me/orders', customerToken, { planId: plan.id, buildingId: unknown.id }).expect(409);
  order = C.Order.parse((await api('post', '/me/orders', customerToken, { planId: plan.id, buildingId: building.id }).expect(200)).body);
  assert.equal(order.status, 'PENDING_PAYMENT');
  await api('get', `/me/orders/${order.id}`, otherToken).expect(404);
  await api('post', '/admin/provisioning', provisioner, { orderId: order.id }).expect(409);
});
test('plan prices edit directly while historical order amount stays unchanged', async () => {
  await api('patch', `/admin/plans/${plan.id}`, admin, { priceMinor: 1700000 }).expect(200);
  assert.equal((await api('get', `/me/orders/${order.id}`, customerToken).expect(200)).body.amountMinor, 1500000);
  assert.equal((await api('get', `/plans/${plan.id}`).expect(200)).body.priceMinor, 1700000);
});
test('reporting payment neither confirms payment nor activates service', async () => {
  const input = { orderId: order.id, amountMinor: 1500000, currency: 'NGN', reference: `SIMULATED-${run}`, method: 'BANK_TRANSFER', evidence: 'Test-only bank reference' };
  await api('post', '/me/payments', otherToken, input).expect(404);
  await api('post', '/me/payments', customerToken, { ...input, amountMinor: 1 }).expect(400);
  payment = C.Payment.parse((await api('post', '/me/payments', customerToken, input).expect(200)).body);
  assert.equal(payment.status, 'REPORTED');
  await api('post', '/me/payments', customerToken, input).expect(409);
  assert.equal((await api('get', `/me/orders/${order.id}`, customerToken)).body.status, 'PENDING_PAYMENT');
  assert.equal(await db.subscription.count({ where: { customerId: customer.id } }), 0);
  await api('get', `/me/payments/${payment.id}/receipt`, customerToken).expect(409);
});
test('only finance-authorized staff can verify; confirmation still does not activate', async () => {
  const input = { decision: 'CONFIRMED', evidence: 'Test-only independent bank check' };
  await api('post', `/admin/payments/${payment.id}/verify`, support, input).expect(403);
  await api('post', `/admin/payments/${payment.id}/verify`, customerToken, input).expect(403);
  const verified = await api('post', `/admin/payments/${payment.id}/verify`, finance, input).expect(200);
  assert.equal(C.AdminPayment.parse(verified.body).verifiedById, staffIds.FINANCE);
  await api('post', `/admin/payments/${payment.id}/verify`, finance, input).expect(200);
  assert.equal((await api('get', `/me/orders/${order.id}`, customerToken)).body.status, 'PAID');
  assert.equal(await db.subscription.count({ where: { customerId: customer.id } }), 0);
  const receipt = await api('get', `/me/payments/${payment.id}/receipt`, customerToken).expect(200);
  C.Receipt.parse(receipt.body);
  await api('get', `/me/payments/${payment.id}/receipt`, otherToken).expect(404);
  await api('post', `/admin/payments/${payment.id}/verify`, finance, { decision: 'REJECTED', evidence: 'Cannot reverse final confirmation' }).expect(409);
});
test('provisioning remains pending until a separate authorized outcome; retries do not duplicate', async () => {
  await api('post', '/admin/provisioning', support, { orderId: order.id }).expect(403);
  provision = C.Provisioning.parse((await api('post', '/admin/provisioning', provisioner, { orderId: order.id }).expect(200)).body);
  assert.equal(provision.status, 'PENDING');
  const pending = await db.subscription.findUniqueOrThrow({ where: { id: provision.subscriptionId } }); assert.equal(pending.status, 'PENDING');
  assert.equal((await api('post', '/admin/provisioning', provisioner, { orderId: order.id }).expect(200)).body.id, provision.id);
  await api('post', `/admin/provisioning/${provision.id}/result`, finance, { status: 'ACTIVE', reference: `SIMULATED-SERVICE-${run}`, evidence: 'Test-only activation evidence' }).expect(403);
});
test('failed manual provisioning remains unactivated and can move into review', async () => {
  await api('post', `/admin/provisioning/${provision.id}/result`, provisioner, { status: 'FAILED', reference: `SIMULATED-FAILED-${run}`, evidence: 'Test-only failed authoritative result' }).expect(200);
  assert.equal((await db.subscription.findUniqueOrThrow({ where: { id: provision.subscriptionId } })).status, 'FAILED');
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, 'FULFILLING');
  await api('post', `/admin/provisioning/${provision.id}/result`, provisioner, { status: 'REQUIRES_REVIEW', reference: `SIMULATED-REVIEW-${run}`, evidence: 'Test-only reconciliation required' }).expect(200);
});
test('confirmed manual provisioning activates once and records service reference', async () => {
  const input = { status: 'ACTIVE', reference: `SIMULATED-SERVICE-${run}`, evidence: 'Test-only authoritative network check' };
  await api('post', `/admin/provisioning/${provision.id}/result`, provisioner, input).expect(200);
  const initial = await db.subscription.findUniqueOrThrow({ where: { id: provision.subscriptionId } });
  assert.equal(initial.status, 'ACTIVE'); assert.ok(initial.endsAt! > initial.startsAt!);
  await api('post', `/admin/provisioning/${provision.id}/result`, provisioner, input).expect(200);
  assert.equal((await db.subscription.findUniqueOrThrow({ where: { id: initial.id } })).endsAt!.toISOString(), initial.endsAt!.toISOString());
  assert.equal((await api('get', `/me/orders/${order.id}`, customerToken)).body.status, 'COMPLETED');
  await api('get', `/me/subscriptions/${initial.id}`, otherToken).expect(404);
});
test('renewal ownership and duplicate outstanding orders are enforced', async () => {
  const input = { planId: plan.id, buildingId: building.id, type: 'RENEWAL', subscriptionId: provision.subscriptionId };
  await api('post', '/me/orders', otherToken, input).expect(404);
  const renewal = (await api('post', '/me/orders', customerToken, input).expect(200)).body;
  await api('post', '/me/orders', customerToken, input).expect(409);
  const paid = (await api('post', '/me/payments', customerToken, { orderId: renewal.id, amountMinor: renewal.amountMinor, currency: 'NGN', reference: `SIMULATED-RENEW-${run}`, method: 'BANK_TRANSFER', evidence: 'Test-only renewal transfer' }).expect(200)).body;
  await api('post', `/admin/payments/${paid.id}/verify`, finance, { decision: 'CONFIRMED', evidence: 'Test-only renewal verification' }).expect(200);
  const previous = await db.subscription.findUniqueOrThrow({ where: { id: provision.subscriptionId } });
  const fulfillment = (await api('post', '/admin/provisioning', provisioner, { orderId: renewal.id }).expect(200)).body;
  await api('post', `/admin/provisioning/${fulfillment.id}/result`, provisioner, { status: 'ACTIVE', reference: previous.externalServiceId, evidence: 'Test-only renewal result' }).expect(200);
  const extended = await db.subscription.findUniqueOrThrow({ where: { id: previous.id } });
  assert.equal(extended.endsAt!.getTime() - previous.endsAt!.getTime(), renewal.billingDays * 86400000);
});
test('concurrent payment confirmations and provisioning requests cannot duplicate fulfillment', async () => {
  const newOrder = (await api('post', '/me/orders', customerToken, { planId: plan.id, buildingId: building.id }).expect(200)).body;
  const reported = [];
  for (const suffix of ['a', 'b']) reported.push((await api('post', '/me/payments', customerToken, { orderId: newOrder.id, amountMinor: newOrder.amountMinor, currency: 'NGN', reference: `SIMULATED-RACE-${run}-${suffix}`, method: 'BANK_TRANSFER', evidence: 'Test-only concurrent reports' }).expect(200)).body);
  const confirmations = await Promise.all(reported.map(record => api('post', `/admin/payments/${record.id}/verify`, finance, { decision: 'CONFIRMED', evidence: 'Test-only concurrent verification' })));
  assert.deepEqual(confirmations.map(response => response.status).sort(), [200, 409]);
  assert.equal(await db.payment.count({ where: { orderId: newOrder.id, status: 'CONFIRMED' } }), 1);
  const provisioning = await Promise.all([api('post', '/admin/provisioning', provisioner, { orderId: newOrder.id }), api('post', '/admin/provisioning', provisioner, { orderId: newOrder.id })]);
  assert.ok(provisioning.some(response => response.status === 200));
  assert.ok(provisioning.every(response => [200, 409].includes(response.status)));
  assert.equal(await db.provisioningRequest.count({ where: { orderId: newOrder.id } }), 1);
});
test('suspended customers retain read access but cannot purchase', async () => {
  await api('patch', `/admin/customers/${customer.id}`, sales, { status: 'SUSPENDED' }).expect(200);
  await api('get', '/me/dashboard', customerToken).expect(200);
  await api('post', '/me/orders', customerToken, { planId: plan.id, buildingId: building.id }).expect(409);
  await api('patch', `/admin/customers/${customer.id}`, sales, { status: 'ACTIVE' }).expect(200);
});
test('support ticket creation, replies, assignment and status enforce ownership', async () => {
  const input = { subject: 'SIMULATED support test', message: 'Test-only connection question', subscriptionId: provision.subscriptionId };
  await api('post', '/me/tickets', otherToken, input).expect(404);
  ticket = C.TicketDetail.parse((await api('post', '/me/tickets', customerToken, input).expect(200)).body);
  assert.equal(ticket.messages.length, 1);
  await api('get', `/me/tickets/${ticket.id}`, otherToken).expect(404);
  await api('post', `/me/tickets/${ticket.id}/messages`, otherToken, { message: 'Cannot read another customer' }).expect(404);
  await api('post', `/admin/tickets/${ticket.id}/messages`, support, { message: 'Test-only support reply' }).expect(200);
  await api('patch', `/admin/tickets/${ticket.id}`, support, { status: 'IN_PROGRESS', assignedToId: staffIds.FINANCE }).expect(400);
  await api('patch', `/admin/tickets/${ticket.id}`, finance, { status: 'RESOLVED' }).expect(403);
  await api('patch', `/admin/tickets/${ticket.id}`, support, { status: 'RESOLVED', assignedToId: staffIds.SUPPORT }).expect(200);
  await api('patch', `/admin/tickets/${ticket.id}`, support, { status: 'RESOLVED', assignedToId: staffIds.SUPPORT }).expect(200);
  await api('patch', `/admin/tickets/${ticket.id}`, support, { status: 'CLOSED', assignedToId: staffIds.SUPPORT }).expect(200);
  await api('post', `/me/tickets/${ticket.id}/messages`, customerToken, { message: 'Closed ticket reply' }).expect(409);
  const readback = C.TicketDetail.parse((await api('get', `/me/tickets/${ticket.id}`, customerToken).expect(200)).body);
  assert.equal(readback.status, 'CLOSED');
  assert.deepEqual(readback.messages.map(entry => entry.message), [input.message, 'Test-only support reply']);
  const notifications = await db.notification.findMany({ where: { customerId: customer.id, template: { in: ['TICKET_RESOLVED', 'TICKET_CLOSED'] } } });
  assert.deepEqual(notifications.map(row => row.template).sort(), ['TICKET_CLOSED', 'TICKET_RESOLVED']);
  for (const row of notifications) assert.deepEqual(decrypt(row.encryptedPayload, process.env.NOTIFICATION_ENCRYPTION_KEY!), { ticketId: ticket.id });
});
test('notifications expose metadata, keep credential payloads encrypted and simulate without delivery', async () => {
  const row = await db.notification.findFirstOrThrow({ where: { customerId: customer.id, template: 'ACCOUNT_SETUP' } });
  assert.ok(!row.encryptedPayload.includes('token'));
  assert.ok(decrypt(row.encryptedPayload, process.env.NOTIFICATION_ENCRYPTION_KEY!).token);
  const listed = await api('get', '/me/notifications', customerToken).expect(200);
  C.page(C.Notification).parse(listed.body);
  assert.ok(!JSON.stringify(listed.body).includes('encryptedPayload'));
  const result = await app.get(NotificationsService).dispatchOne();
  assert.equal(result.processed, true); assert.equal(result.simulated, true);
});
test('reporting and append-only audit contain required operational trail', async () => {
  C.Report.parse((await api('get', '/admin/reports/summary', executive).expect(200)).body);
  const logs = await db.auditLog.findMany({ where: { entityId: payment.id } });
  assert.ok(logs.some(row => row.action === 'payment.confirmed' && row.actorId === staffIds.FINANCE));
  assert.ok(!JSON.stringify(logs).includes(password));
  await assert.rejects(db.auditLog.update({ where: { id: logs[0].id }, data: { action: 'tampered' } }));
  C.page(C.Audit).parse((await api('get', '/admin/audit', admin).expect(200)).body);
});
test('legacy lookup is labeled simulated and verified external mappings preserve internal identity', async () => {
  const lookup = await api('get', '/admin/integrations/legacy/lookup?reference=SIMULATED-LEGACY-001', admin).expect(200);
  assert.equal(lookup.body.simulated, true);
  const reference = await api('post', `/admin/integrations/customers/${customer.id}/references`, admin, { system: `SIMULATED-CRM-${run}`, externalId: `SIMULATED-ID-${run}` }).expect(200);
  C.ExternalReference.parse(reference.body);
  const remapped = await api('patch', `/admin/customers/${other.id}`, sales, { accountNumber: `OFFICIAL-${run}` }).expect(200);
  assert.equal(remapped.body.id, other.id); assert.equal(remapped.body.accountNumberSimulated, false);
  await api('get', '/me/profile', otherToken).expect(401);
});
test('assistant boundary provides guidance and escalation without writes', async () => {
  const counts = [await db.order.count(), await db.payment.count(), await db.provisioningRequest.count()];
  const reply = await api('post', '/assistant/guidance', undefined, { message: 'Activate my service and verify this payment' }).expect(200);
  assert.equal(C.AssistantResponse.parse(reply.body).sensitiveActionsAllowed, false);
  assert.deepEqual([await db.order.count(), await db.payment.count(), await db.provisioningRequest.count()], counts);
});
test('recovery is generic; reset is single-use and revokes existing sessions', async () => {
  const known = await api('post', '/auth/recovery', undefined, { accountNumber: customer.accountNumber }).expect(200);
  const missing = await api('post', '/auth/recovery', undefined, { accountNumber: 'NONEXISTENT' }).expect(200);
  assert.deepEqual(known.body, missing.body);
  const queued = await db.notification.findFirstOrThrow({ where: { customerId: customer.id, template: 'PASSWORD_RECOVERY' }, orderBy: { createdAt: 'desc' } });
  const resetToken = decrypt(queued.encryptedPayload, process.env.NOTIFICATION_ENCRYPTION_KEY!).token;
  await api('post', '/auth/reset-password', undefined, { token: resetToken, password: password + 'changed' }).expect(200);
  await api('get', '/me/profile', customerToken).expect(401);
  await api('post', '/auth/reset-password', undefined, { token: resetToken, password }).expect(400);
  customerToken = (await api('post', '/auth/login', undefined, { accountNumber: customer.accountNumber, password: password + 'changed' }).expect(200)).body.accessToken;
});
test('closed accounts cannot use prior sessions and disabled staff cannot authenticate', async () => {
  await api('patch', `/admin/customers/${customer.id}`, sales, { status: 'CLOSED' }).expect(200);
  await api('get', '/me/profile', customerToken).expect(401);
  await api('patch', `/admin/staff/${staffIds.SUPPORT}`, admin, { enabled: false }).expect(200);
  await api('get', '/admin/tickets', support).expect(401);
});
test('password change gate prevents operational access and logout revokes sessions', async () => {
  await db.user.update({ where: { id: staffIds.SALES }, data: { mustChangePassword: true } });
  await api('get', '/admin/leads', sales).expect(403);
  await api('get', '/auth/session', sales).expect(200);
  await api('post', '/auth/change-password', sales, { currentPassword: password, password: password + 'new' }).expect(200);
  await api('get', '/auth/session', sales).expect(401);
  await api('post', '/auth/logout', executive).expect(200);
  await api('get', '/admin/reports/summary', executive).expect(401);
});
test('simulators provide success, failure and timeout without real providers', async () => {
  const paymentProvider = new SimulatedPaymentProvider(new Simulator('success'));
  assert.equal((await paymentProvider.initiate({ orderId: order.id, amountMinor: 100, currency: 'NGN', idempotencyKey: run })).data.status, 'PENDING');
  const provider = new SimulatedProvisioningProvider(new Simulator('success'));
  assert.equal((await provider.request({ requestId: run, customerId: customer.id, planCode: plan.code, buildingId: building.id })).simulated, true);
  for (const scenario of ['failure', 'timeout'] as const) await assert.rejects(new SimulatedLegacyProvider(new Simulator(scenario)).lookup('SIMULATED-LEGACY-001'));
});
test('production/staging refuse simulated adapters', () => {
  const env = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  try { assert.throws(() => new Config(), /Simulated adapters/); } finally { process.env.NODE_ENV = env; }
});
test('login rechecks the credential before issuing a session', async () => {
  const email = `rotation-race-${run}@example.test`;
  const staff = await db.user.create({ data: { kind: 'STAFF', name: 'SIMULATED rotation race', email, roles: ['SUPPORT'], passwordHash: await hashPassword(password) } });
  const replacementHash = await hashPassword(`Replacement-${run}-Password!`);
  const appDb = app.get(Database);
  const mutate = appDb.mutate;
  // Rotate after the login has verified the old hash and before the real session transaction.
  appDb.mutate = async function(fn) {
    appDb.mutate = mutate;
    await db.user.update({ where: { id: staff.id }, data: { passwordHash: replacementHash } });
    return mutate.call(appDb, fn) as ReturnType<typeof appDb.mutate>;
  } as typeof appDb.mutate;
  try {
    await assert.rejects(app.get(IdentityService).login(email, password, true), /Invalid credentials/);
    assert.equal(await db.session.count({ where: { userId: staff.id } }), 0);
  } finally { appDb.mutate = mutate; }
});
test('production requires client wallet authority while retaining manual order workflows', () => {
  const overrides = { NODE_ENV: 'production', CORS_ORIGINS: 'https://portal.example.test', WALLET_AUTHORITY: 'local', EMAIL_ADAPTER: 'disabled', SMS_ADAPTER: 'disabled', LEGACY_ADAPTER: 'disabled' };
  const previous = Object.fromEntries(Object.keys(overrides).map(key => [key, process.env[key]]));
  Object.assign(process.env, overrides);
  try {
    assert.throws(() => new Config(), /Production requires WALLET_AUTHORITY=client/);
    process.env.WALLET_AUTHORITY = 'client';
    const { values } = new Config();
    assert.equal(values.WALLET_AUTHORITY, 'client');
    assert.equal(values.PAYMENT_ADAPTER, 'manual');
    assert.equal(values.PROVISIONING_ADAPTER, 'manual');
    assert.equal(values.COVERAGE_ADAPTER, 'native');
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
test('production staff onboarding requires an approved account identifier', async () => {
  const config = app.get(Config);
  const mode = config.values.NODE_ENV;
  const profile = { kind: 'RESIDENTIAL', name: 'Test-only production guard', email: `production-guard-${run}@example.test`, phone: '+2348000000000' };
  config.values.NODE_ENV = 'production';
  try {
    await api('post', '/admin/customers', admin, profile).expect(400);
    assert.equal(await db.customer.count({ where: { email: profile.email } }), 0);
    const accountNumber = `APPROVED-${run}`;
    const { body } = await api('post', '/admin/customers', admin, { ...profile, accountNumber }).expect(200);
    assert.equal(body.customer.accountNumber, accountNumber);
    assert.equal(body.customer.accountNumberSimulated, false);
  } finally {
    config.values.NODE_ENV = mode;
  }
});
test('staff recovery is generic and does not disclose credential tokens', async () => {
  const result = await api('post', '/auth/staff/recovery', undefined, { email: `finance-${run}@example.test` }).expect(200);
  const unknown = await api('post', '/auth/staff/recovery', undefined, { email: `unknown-${run}@example.test` }).expect(200);
  assert.deepEqual(result.body, unknown.body); assert.deepEqual(result.body, { ok: true });
});
test('malformed JSON and oversized request bodies receive bounded validation errors', async () => {
  const invalid = await request(app.getHttpServer()).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{invalid').expect(400);
  C.ErrorResponse.parse(invalid.body);
  await request(app.getHttpServer()).post('/api/v1/auth/login').send({ accountNumber: 'x'.repeat(40000), password: 'x' }).expect(413);
});
test('login endpoint rate limiting rejects excessive authentication attempts', async () => {
  let throttled = false;
  for (let i = 0; i < 10; i++) { const response = await api('post', '/auth/login', undefined, { accountNumber: 'NONEXISTENT', password: 'bad' }); if (response.status === 429) { throttled = true; break; } assert.equal(response.status, 401); }
  assert.ok(throttled);
});
