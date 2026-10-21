import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WorkspaceApi } from '../src/api';
import { WalletApi } from '../src/wallet-api';
import { uuid } from '../src/fixtures';
import * as C from '../vendor/contracts';
import type { StaffRole } from '../vendor/permissions';
const key = uuid(500);
function setup(role: StaffRole = 'ADMIN', fetcher?: typeof fetch) {
    const api = new WorkspaceApi('', fetcher); api.preview(role);
    if (fetcher) api.mode = 'live';
    return { api, wallet: new WalletApi(api) };
}
test('wallet reads use canonical summaries, ledger pages and explicit read-only simulation', async () => {
    const { api, wallet } = setup();
    const s = await wallet.summary(uuid(1));
    assert.equal(s.availableMinor, 550000); assert.equal(s.simulated, true);
    const ledger = await wallet.transactions(uuid(1));
    assert.equal(ledger.items.length, 3); assert.equal(ledger.items[2].kind, 'CAPTURE');
    assert.ok(ledger.items.every(e => C.WalletEntry.safeParse(e).success));
    const before = structuredClone(api.data);
    await assert.rejects(wallet.adjustment(uuid(1), { amountMinor: 100, reason: 'test correction', idempotencyKey: key }), /read-only/);
    await assert.rejects(wallet.verify(uuid(201), { decision: 'CONFIRMED', evidence: 'test evidence' }), /read-only/);
    await assert.rejects(wallet.process(uuid(211)), /read-only/);
    assert.deepEqual(api.data, before);
});
test('Support cannot access top-up evidence, corrections or renewal mutations; Finance cannot process and Provisioner cannot credit', async () => {
    let calls = 0;
    const transport: typeof fetch = async () => { calls++; throw Error('unexpected transport'); };
    const support = setup('SUPPORT', transport);
    await assert.rejects(support.api.list('walletTopUps'), /permission/);
    await assert.rejects(support.api.detail('walletTopUps', uuid(201)), /permission/);
    await assert.rejects(support.wallet.adjustment(uuid(1), { amountMinor: 100, reason: 'invalid authority', idempotencyKey: key }), /permission/);
    await assert.rejects(support.wallet.reverse(uuid(230), { reason: 'invalid authority', idempotencyKey: key }), /permission/);
    await assert.rejects(support.wallet.verify(uuid(201), { decision: 'CONFIRMED', evidence: 'invalid authority' }), /permission/);
    await assert.rejects(support.wallet.policy(uuid(60), { enabled: true, reason: 'invalid authority' }), /permission/);
    const finance = setup('FINANCE', transport);
    await assert.rejects(finance.wallet.process(uuid(211)), /permission/);
    await assert.rejects(finance.wallet.resolve(uuid(211), { decision: 'FAILED', reference: 'ref', evidence: 'not authorized', authoritative: true }), /permission/);
    const provisioner = setup('PROVISIONER', transport);
    await assert.rejects(provisioner.wallet.adjustment(uuid(1), { amountMinor: 100, reason: 'invalid authority', idempotencyKey: key }), /permission/);
    await assert.rejects(provisioner.wallet.summary(uuid(1)), /permission/);
    assert.equal(calls, 0);
});
test('wallet live failures never fall back to fixture balance or financial success', async () => {
    const { api, wallet } = setup('FINANCE', async () => { throw Error('offline'); });
    const before = structuredClone(api.data);
    await assert.rejects(wallet.summary(uuid(1)), /Cannot reach/);
    await assert.rejects(wallet.transactions(uuid(1)), /Cannot reach/);
    await assert.rejects(wallet.adjustment(uuid(1), { amountMinor: 100, reason: 'correction', idempotencyKey: key }), /Cannot reach/);
    assert.equal(api.mode, 'live'); assert.deepEqual(api.data, before);
});
test('controlled credits/reversals reject invalid amounts or injected balance and send the reviewed UUID unchanged', async () => {
    const calls: { path: string; method?: string; body: any }[] = [];
    const { api, wallet } = setup('FINANCE', async (url, init) => {
        calls.push({ path: String(url), method: init?.method, body: JSON.parse(String(init?.body)) });
        return Response.json(api.data.walletEntries[0]);
    });
    for (const amountMinor of [0, -1, 1.5]) await assert.rejects(wallet.adjustment(uuid(1), { amountMinor, reason: 'reason', idempotencyKey: key }));
    await assert.rejects(wallet.adjustment(uuid(1), { amountMinor: 100, reason: 'reason', idempotencyKey: key, balance: 9000 } as any));
    assert.equal(calls.length, 0);
    const body = { amountMinor: 100, reason: 'documented correction', idempotencyKey: key };
    await wallet.adjustment(uuid(1), body); await wallet.adjustment(uuid(1), body);
    assert.deepEqual(calls[0].body, calls[1].body);
    assert.equal(calls[0].path, `/api/v1/admin/customers/${uuid(1)}/wallet/adjustments`);
    await wallet.reverse(uuid(230), { reason: 'reverse erroneous credit', idempotencyKey: uuid(501) });
    assert.equal(calls[2].path, `/api/v1/admin/wallet-transactions/${uuid(230)}/reverse`);
    assert.ok(!('amountMinor' in calls[2].body));
});
test('renewal processing preserves uncertain backend state and resolution sends only authoritative supplied values', async () => {
    const calls: { path: string; method?: string; body: any }[] = [];
    const { api, wallet } = setup('PROVISIONER', async (url, init) => {
        calls.push({ path: String(url), method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : null });
        return Response.json(String(url).endsWith('/renewal-policy') ? { ...api.data.subscriptions[0], renewalEnabled: true } : api.data.walletRenewals[1]);
    });
    const result = await wallet.process(uuid(211)); assert.equal(result.status, 'REQUIRES_REVIEW');
    assert.equal(calls[0].body, null);
    await wallet.policy(uuid(60), { enabled: true, reason: 'approved renewal policy' });
    assert.equal(calls[1].method, 'PATCH');
    await wallet.resolve(uuid(211), { decision: 'SUCCEEDED', authoritative: true, reference: 'verified reference', evidence: 'verified provider evidence', confirmedEndsAt: '2026-11-20T08:00:00.000Z' });
    assert.equal(calls[2].body.confirmedEndsAt, '2026-11-20T08:00:00.000Z');
    await assert.rejects(wallet.resolve(uuid(211), { decision: 'SUCCEEDED', authoritative: false, reference: 'reference', evidence: 'evidence' } as any));
});
test('wallet backend 401 expires the session and malformed summaries are errors', async () => {
    const { api, wallet } = setup('SUPPORT', async () => Response.json({ message: 'Revoked' }, { status: 401 }));
    await assert.rejects(wallet.summary(uuid(1)), /Revoked/); assert.equal(api.session, null);
    const invalid = setup('SUPPORT', async () => Response.json({ availableMinor: 0 }));
    await assert.rejects(invalid.wallet.summary(uuid(1)), /does not match/);
});
test('canonical Admin wallet operation map includes every consumed financial and policy route', async () => {
    const spec = await import('../vendor/operations.json');
    for (const op of ['GET /api/v1/admin/customers/{id}/wallet', 'GET /api/v1/admin/customers/{id}/wallet/transactions', 'POST /api/v1/admin/customers/{id}/wallet/adjustments', 'POST /api/v1/admin/wallet-transactions/{id}/reverse', 'GET /api/v1/admin/wallet-top-ups/{id}', 'POST /api/v1/admin/wallet-top-ups/{id}/verify', 'GET /api/v1/admin/wallet-renewals/{id}', 'POST /api/v1/admin/wallet-renewals/{id}/process', 'POST /api/v1/admin/wallet-renewals/{id}/resolve', 'PATCH /api/v1/admin/subscriptions/{id}/renewal-policy']) assert.ok(spec.operations.includes(op), op);
});
