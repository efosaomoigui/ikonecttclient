import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { WorkspaceApi, ApiError } from '../src/api';
import { modules } from '../src/modules';
import { ROLE_PERMISSIONS, type StaffRole } from '../vendor/permissions';
import { uuid } from '../src/fixtures';
import * as C from '../vendor/contracts';
import { integrationState } from '../src/integrations';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const preview = (role: StaffRole = 'ADMIN') => { const api = new WorkspaceApi(); api.preview(role); return api; };
test('failed activation validation leaves subscription and order unchanged', async () => {
    const api = preview();
    const request = api.data.provisioning[0];
    api.data.payments = api.data.payments.filter(p => p.orderId !== request.orderId);
    const before = structuredClone(api.data.subscriptions);
    await assert.rejects(api.save('provisioning', {status:'ACTIVE',reference:'test-reference',evidence:'test evidence'}, request.id), /Confirmed payment/);
    assert.deepEqual(api.data.subscriptions, before);
    assert.equal(request.status, 'PENDING');
});
test('integration states never represent manual or simulated providers as connected', () => { assert.equal(integrationState({ mode: 'simulated' }).status, 'SIMULATED'); assert.equal(integrationState({ mode: 'manual' }).status, 'NOT_CONFIGURED'); assert.equal(integrationState({ mode: 'disabled' }).status, 'NOT_CONFIGURED'); assert.equal(integrationState({ mode: 'native-address-registry' }).status, 'CONNECTED'); assert.equal(integrationState({ status: 'ERROR' }).status, 'ERROR'); });
test('all simulated list records conform to Agent 1 response schemas', async () => { const api = preview(); for (const key of Object.keys(modules)) {
    const rows = await api.list(key);
    assert.ok(rows.length, key);
    for (const row of rows)
        assert.doesNotThrow(() => modules[key].schema.parse(row), key);
} });
test('role matrix rejects every inaccessible list before any transport', async () => { let requests = 0; globalThis.fetch = async () => { requests++; throw Error('unexpected request'); }; for (const role of Object.keys(ROLE_PERMISSIONS) as StaffRole[]) {
    const api = preview(role);
    for (const [key, m] of Object.entries(modules)) {
        if (!(ROLE_PERMISSIONS[role] as readonly string[]).includes(m.permission))
            await assert.rejects(api.list(key), (e: unknown) => e instanceof ApiError && e.status === 403);
    }
} assert.equal(requests, 0); });
test('support cannot create customers, administer staff or verify a payment', async () => { const api = preview('SUPPORT'); await assert.rejects(api.save('customers', { name: 'x' }), /permission/); await assert.rejects(api.save('staff', { name: 'x' }), /permission/); await assert.rejects(api.verify(uuid(50), { decision: 'CONFIRMED', evidence: 'checked' }), /permission/); });
test('staff-created account separates stable ID from account number and validates input', async () => { const api = preview('SALES'); await assert.rejects(api.save('customers', { name: 'Missing fields' })); const customer = await api.save('customers', { name: 'Test Customer', kind: 'RESIDENTIAL', email: 'test@example.test', phone: '+2348000000000' }); assert.ok(C.Id.safeParse(customer.id).success); assert.notEqual(customer.id, customer.accountNumber); assert.equal(customer.accountNumberSimulated, true); assert.ok(!('password' in customer)); assert.equal(api.data.audit[0].entityId, customer.id); });
test('payment verification is audited and never creates or activates a subscription', async () => { const api = preview('FINANCE'); const before = structuredClone(api.data.subscriptions); const result = await api.verify(uuid(50), { decision: 'CONFIRMED', evidence: 'Bank statement checked: test reference' }); assert.equal(result.status, 'CONFIRMED'); assert.equal(result.verifiedById, api.session!.principal.id); assert.ok(result.verifiedAt); assert.ok(result.verificationEvidence.includes('Bank statement')); assert.equal(api.data.orders.find(o => o.id === uuid(40))!.status, 'PAID'); assert.deepEqual(api.data.subscriptions, before); assert.equal(api.data.audit[0].action, 'PAYMENT_CONFIRMED'); await assert.rejects(api.verify(uuid(50), { decision: 'REJECTED', evidence: 'another decision' }), /already/); });
test('reported payment is not a receipt; confirmed payment has a receipt', async () => { const api = preview(); await assert.rejects(api.receipt(uuid(50)), /confirmation/); const receipt = await api.receipt(uuid(51)); assert.equal(receipt.payment.status, 'CONFIRMED'); });
test('payment report must match order amount and creates no activation', async () => { const api = preview(); const input = { orderId: uuid(40), amountMinor: 1, currency: 'NGN', reference: 'SAMPLE-NEW', method: 'BANK_TRANSFER', evidence: 'Sample bank evidence' }; await assert.rejects(api.save('payments', input), /match/); const p = await api.save('payments', { ...input, amountMinor: 3500000 }); assert.equal(p.status, 'REPORTED'); assert.equal(api.data.orders.find(o => o.id === uuid(40))!.status, 'PENDING_PAYMENT'); });
test('manual provisioning requires paid order, then explicit evidenced result', async () => { const api = preview(); await assert.rejects(api.save('provisioning', { orderId: uuid(40) }), /Confirmed payment/); const record = await api.save('provisioning', { orderId: uuid(41) }); assert.equal(record.status, 'PENDING'); assert.equal(api.data.subscriptions.find(s => s.id === record.subscriptionId)!.status, 'PENDING'); await api.save('provisioning', { status: 'ACTIVE', reference: 'TEST-SERVICE-001', evidence: 'Verified service activation' }, record.id); const sub = api.data.subscriptions.find(s => s.id === record.subscriptionId)!; assert.equal(sub.status, 'ACTIVE'); assert.ok(sub.endsAt); assert.equal(api.data.orders.find(o => o.id === uuid(41))!.status, 'COMPLETED'); });
test('coverage hierarchy rejects skipped levels and preserves UNKNOWN', async () => { const api = preview(); await assert.rejects(api.save('coverage', { name: 'Bad building', level: 'BUILDING_ADDRESS', parentId: uuid(20) }), /preceding/); const r = await api.save('coverage', { name: 'Sample second state', level: 'STATE', parentId: uuid(20) }); assert.equal(r.eligibility, 'UNKNOWN'); });
test('last enabled administrator cannot be removed', async () => { const api = preview(); await assert.rejects(api.save('staff', { enabled: false }, uuid(80)), /At least one/); await assert.rejects(api.save('staff', { roles: ['SUPPORT'] }, uuid(80)), /At least one/); });
test('support create, assignment, messages and closure use a shared ticket', async () => { const api = preview('SUPPORT'); const ticket = await api.save('tickets', { customerId: uuid(1), subject: 'Test issue', message: 'Please check connection' }); await api.save('tickets', { status: 'IN_PROGRESS', assignedToId: uuid(80) }, ticket.id); await api.reply(ticket.id, 'We are checking this request.'); assert.equal((await api.messages(ticket.id)).length, 2); await api.save('tickets', { status: 'CLOSED' }, ticket.id); assert.equal(api.data.tickets.find(t => t.id === ticket.id)!.status, 'CLOSED'); });
test('live login consumes server permissions, bearer stays in memory, and logout revokes', async () => { const api = new WorkspaceApi(); const calls: {
    url: string;
    options: RequestInit;
}[] = []; globalThis.fetch = async (url, options = {}) => { calls.push({ url: String(url), options }); if (String(url).endsWith('/auth/staff/login'))
    return Response.json({ accessToken: 'secret-token', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600000).toISOString(), principal: { id: uuid(80), kind: 'STAFF', customerId: null, roles: ['ADMIN'], mustChangePassword: false } }); if (String(url).endsWith('/admin/permissions'))
    return Response.json({ roles: ['ADMIN'], permissions: ['customers.read'] }); return Response.json({ ok: true }); }; await api.login('staff@example.test', 'test-password'); assert.deepEqual(api.permissions, ['customers.read']); assert.equal(calls[0].url, '/api/v1/auth/staff/login'); assert.equal((calls[1].options.headers as Record<string, string>).Authorization, 'Bearer secret-token'); assert.ok(!calls.some(c => c.url.includes('secret-token'))); await assert.rejects(api.save('staff', {}), /permission/); await api.logout(); assert.equal(calls.at(-1)!.url, '/api/v1/auth/logout'); assert.equal(api.session, null); });
test('backend 403 remains an error and never switches to simulated data', async () => { const api = preview(); api.mode = 'live'; globalThis.fetch = async () => Response.json({ message: 'Permission denied' }, { status: 403 }); await assert.rejects(api.list('customers'), (e: unknown) => e instanceof ApiError && e.status === 403); assert.equal(api.mode, 'live'); });
test('401 and local expiry clear the session', async () => { const api = preview(); api.mode = 'live'; let expired = 0; api.onExpired = () => expired++; globalThis.fetch = async () => Response.json({ message: 'Expired' }, { status: 401 }); await assert.rejects(api.list('customers')); assert.equal(api.session, null); assert.equal(expired, 1); api.preview('ADMIN'); api.session!.expiresAt = new Date(0).toISOString(); await assert.rejects(api.list('customers'), /expired/); assert.equal(api.session, null); });
test('live tickets and external references use the actual controller routes', async () => { const api = preview(); api.mode = 'live'; const paths: string[] = []; globalThis.fetch = async (url) => { paths.push(String(url)); return Response.json(String(url).includes('/tickets/') ? { ...api.data.tickets[0], messages: api.data.messages.filter(m => m.ticketId === uuid(70)) } : []); }; await api.messages(uuid(70)); await api.references(uuid(1)); assert.equal(paths[0], `/api/v1/admin/tickets/${uuid(70)}`); assert.equal(paths[1], `/api/v1/admin/integrations/customers/${uuid(1)}/references`); });
test('live pagination consumes all pages without assuming first page is complete', async () => { const api = preview(); api.mode = 'live'; const calls: string[] = []; const customer = api.data.customers[0]; globalThis.fetch = async (url) => { calls.push(String(url)); const second = String(url).includes('offset=1'); return Response.json({ items: [{ ...customer, id: second ? uuid(2) : uuid(1) }], offset: second ? 1 : 0, limit: 100, total: 2 }); }; assert.equal((await api.list('customers')).length, 2); assert.equal(calls.length, 2); assert.match(calls[1], /offset=1/); });
