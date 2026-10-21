import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { WalletUi } from '../src/wallet-ui';
import { WalletApi } from '../src/wallet-api';
import { WorkspaceApi } from '../src/api';
import { uuid } from '../src/fixtures';
test('wallet UI freezes one reviewed financial intent and UUID across an ambiguous network retry', async () => {
    const dom = new JSDOM('<body></body>', { url: 'http://localhost/admin/' });
    const previousDocument = globalThis.document;
    const previousFormData = globalThis.FormData;
    Object.assign(globalThis, { document: dom.window.document, FormData: dom.window.FormData });
    const requests: any[] = [];
    const api: WorkspaceApi = new WorkspaceApi('', async (_url, init): Promise<Response> => {
        requests.push(JSON.parse(String(init?.body)));
        if (requests.length === 1) throw Error('Connection lost after submit');
        return Response.json(api.data.walletEntries[0]);
    });
    api.preview('FINANCE'); api.mode = 'live';
    let refreshed = false;
    const ui = new WalletUi({ api, walletApi: new WalletApi(api), openModal: html => { document.body.innerHTML = html; }, closeModal: () => { document.body.innerHTML = ''; }, modalHeader: t => `<h2>${t}</h2>`, button: (label, action) => `<button type="button" data-action="${action}">${label}</button>`, esc: v => String(v ?? ''), money: n => String(n), badge: v => String(v), date: v => v, toast: () => {}, friendly: e => e instanceof Error ? e.message : String(e), refresh: async () => {}, details: async () => {} });
    try {
        await ui.action(`wallet:credit:${uuid(1)}`);
        const form = document.querySelector<HTMLFormElement>('form')!;
        const amount = form.querySelector<HTMLInputElement>('[name=amountMinor]')!;
        amount.value = '2500000';
        form.querySelector<HTMLTextAreaElement>('[name=reason]')!.value = 'Approved correction from reviewed evidence';
        form.querySelector<HTMLInputElement>('[name=reviewed]')!.checked = true;
        await form.onsubmit!(new dom.window.Event('submit', { cancelable: true }) as any);
        assert.equal(requests.length, 1); assert.equal(amount.disabled, true);
        assert.match(form.querySelector('.form-error')!.textContent!, /same reviewed request/);
        assert.ok(requests[0].idempotencyKey);
        // Even if disabled form values are changed programmatically, retry sends the captured intent.
        amount.value = '999';
        await form.onsubmit!(new dom.window.Event('submit', { cancelable: true }) as any);
        refreshed = !!document.querySelector('#wallet-view');
        assert.deepEqual(requests[0], requests[1]);
        assert.equal(requests[1].amountMinor, 2500000);
        assert.equal(refreshed, true);
    } finally {
        Object.assign(globalThis, { document: previousDocument, FormData: previousFormData }); dom.window.close();
    }
});
test('wallet UI keeps a known reversed credit in history without offering a second reversal', async () => {
    const dom = new JSDOM('<body></body>');
    const previousDocument = globalThis.document;
    Object.assign(globalThis, { document: dom.window.document });
    const api = new WorkspaceApi(); api.preview('FINANCE');
    const basis = api.data.walletEntries[0];
    api.data.walletEntries.unshift(
        { ...basis, id: uuid(601), kind: 'ADJUSTMENT_CREDIT', amountMinor: 10000, postedDeltaMinor: 10000, postedAfterMinor: 560000, reference: 'SIMULATED-CREDIT-CORRECTION', topUpId: null },
        { ...basis, id: uuid(602), kind: 'REVERSAL', amountMinor: 10000, postedDeltaMinor: -10000, postedAfterMinor: 550000, reference: 'SIMULATED-CREDIT-REVERSAL', topUpId: null, reversalOfId: uuid(601) }
    );
    const ui = new WalletUi({ api, walletApi: new WalletApi(api), openModal: html => { document.body.innerHTML = html; }, closeModal: () => { document.body.innerHTML = ''; }, modalHeader: t => `<h2>${t}</h2>`, button: (label, action) => `<button type="button" data-action="${action}">${label}</button>`, esc: v => String(v ?? ''), money: n => String(n), badge: v => String(v), date: v => v, toast: () => {}, friendly: e => String(e), refresh: async () => {}, details: async () => {} });
    try {
        await ui.view(uuid(1));
        const rows = [...document.querySelectorAll('tbody tr')];
        const correction = rows.find(row => row.textContent!.includes('SIMULATED-CREDIT-CORRECTION'))!;
        assert.match(correction.textContent!, /Reversed/);
        assert.equal(correction.querySelector('[data-action^="wallet:reverse:"]'), null);
        assert.ok(rows.some(row => row.textContent!.includes('SIMULATED-CREDIT-REVERSAL')));
    } finally { Object.assign(globalThis, { document: previousDocument }); dom.window.close(); }
});
test('Admin wallet display is independent of zero/positive credit and active/inactive service', async () => {
    for (const availableMinor of [0, 550000]) for (const serviceStatus of ['ACTIVE', 'SUSPENDED']) {
        const calls: { url: string; method: string; body: unknown }[] = [];
        const api: WorkspaceApi = new WorkspaceApi('', async (url, init): Promise<Response> => {
            calls.push({ url: String(url), method: init?.method || 'GET', body: init?.body });
            return Response.json({ ...api.data.walletSummaries[0], availableMinor, postedMinor: availableMinor, reservedMinor: 0, pendingTopUpsMinor: 0, pendingTopUpsCount: 0 });
        });
        api.preview('SUPPORT'); api.mode = 'live';
        api.data.subscriptions = [{ ...api.data.subscriptions[0], customerId: uuid(1), status: serviceStatus }];
        const ui = new WalletUi({ api, walletApi: new WalletApi(api), openModal: () => { throw Error('Unexpected service or financial dialog'); }, closeModal: () => {}, modalHeader: t => t, button: (label, action) => `<button data-action="${action}">${label}</button>`, esc: v => String(v ?? ''), money: n => `${n} minor`, badge: v => String(v), date: v => v, toast: () => {}, friendly: e => String(e), refresh: async () => {}, details: async () => {} });
        const html = await ui.customerSummary(uuid(1));
        assert.match(html, new RegExp(`<dd>${availableMinor} minor</dd>`), `${availableMinor}/${serviceStatus}`);
        assert.match(html, /Available credit/);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, `/api/v1/admin/customers/${uuid(1)}/wallet`);
        assert.equal(calls[0].method, 'GET'); assert.equal(calls[0].body, undefined);
        assert.ok(!html.includes('wallet:process:') && !html.includes('wallet:resolve:'));
    }
});
test('canonical settlement credit renders system actor and plain source reference without reversal or invented endpoint', async () => {
    const dom = new JSDOM('<body></body>');
    const previousDocument = globalThis.document;
    Object.assign(globalThis, { document: dom.window.document });
    const calls: { url: string; method: string }[] = [];
    const api: WorkspaceApi = new WorkspaceApi('', async (url, init): Promise<Response> => {
        calls.push({ url: String(url), method: init?.method || 'GET' });
        if (String(url).includes('/transactions?')) return Response.json({ items: api.data.walletEntries.filter(e => e.customerId === uuid(1)), total: 4, offset: 0, limit: 25 });
        return Response.json({ ...api.data.walletSummaries[0], postedMinor: 560000, availableMinor: 560000 });
    });
    api.preview('FINANCE'); api.mode = 'live';
    api.data.walletEntries.unshift({ ...api.data.walletEntries[0], id: uuid(610), kind: 'SETTLEMENT_CREDIT', amountMinor: 10000, postedDeltaMinor: 10000, postedAfterMinor: 560000, actorId: null, settlementPaymentId: uuid(611), topUpId: null, reference: 'WTX-SIMULATED-SETTLEMENT', description: 'SIMULATED authenticated provider settlement fixture only' });
    const notices: string[] = [];
    const ui = new WalletUi({ api, walletApi: new WalletApi(api), openModal: html => { document.body.innerHTML = html; }, closeModal: () => { document.body.innerHTML = ''; }, modalHeader: t => `<h2>${t}</h2>`, button: (label, action) => `<button type="button" data-action="${action}">${label}</button>`, esc: v => String(v ?? ''), money: n => String(n), badge: v => String(v), date: v => v, toast: m => { notices.push(m); }, friendly: e => e instanceof Error ? e.message : String(e), refresh: async () => {}, details: async () => {} });
    try {
        await ui.view(uuid(1));
        const settlement = [...document.querySelectorAll('tbody tr')].find(row => row.textContent!.includes('WTX-SIMULATED-SETTLEMENT'))!;
        assert.match(settlement.textContent!, /Settled wallet funding/);
        assert.match(settlement.textContent!, /System/);
        assert.match(settlement.textContent!, new RegExp(`Settlement payment ${uuid(611)}`));
        assert.equal(settlement.querySelector('button,a'), null);
        const manual = [...document.querySelectorAll('tbody tr')].find(row => row.textContent!.includes('SIMULATED-WALLET-1'))!;
        assert.match(manual.textContent!, /Manual top-up credit/);
        await ui.action(`wallet:reverse:${uuid(1)}:${uuid(610)}`);
        assert.equal(document.querySelector('#wallet-operation'), null);
        assert.ok(notices.some(m => /eligible credit entry/.test(m)));
        assert.equal(calls.length, 2);
        assert.ok(calls.every(c => c.method === 'GET' && c.url.includes('/wallet')));
        assert.ok(!calls.some(c => c.url.includes('/settlements') || c.url.includes('/provision') || c.url.includes('/renewal')));
    } finally { Object.assign(globalThis, { document: previousDocument }); dom.window.close(); }
});
