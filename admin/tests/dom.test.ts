import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const assetDir = new URL('../dist/assets/', import.meta.url);
const bundle = readFileSync(new URL(readdirSync(assetDir).find(x => x.endsWith('.js'))!, assetDir), 'utf8');
async function waitFor(fn: () => boolean) { for (let i = 0; i < 150; i++) {
    if (fn())
        return;
    await new Promise(r => setTimeout(r, 10));
} assert.fail('DOM state did not arrive'); }
function boot() { const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'http://localhost/admin/', runScripts: 'outside-only', pretendToBeVisual: true }); Object.assign(dom.window, { structuredClone: globalThis.structuredClone, fetch: async () => { throw Error('No live backend in DOM test'); } }); dom.window.eval(bundle); return dom; }
function click(dom: JSDOM, selector: string) { const el = dom.window.document.querySelector<HTMLElement>(selector); assert.ok(el, selector); el.click(); }
async function preview(dom: JSDOM, role = 'ADMIN') { click(dom, '.preview-box summary'); (dom.window.document.querySelector('#preview-role') as HTMLSelectElement).value = role; click(dom, '[data-action=preview]'); await waitFor(() => !!dom.window.document.querySelector('.metrics,.workspace-note')); }
async function go(dom: JSDOM, path: string) { dom.window.location.hash = `#/${path}`; await waitFor(() => !!dom.window.document.querySelector(`a[aria-current=page][href="#/${path}"]`)); await waitFor(() => !dom.window.document.querySelector('.loading')); }
test('DOM: login validation, password toggle and labeled simulation', async () => { const dom = boot(); try {
    const doc = dom.window.document;
    assert.equal(doc.querySelector<HTMLDetailsElement>('.preview-box')!.open, false);
    assert.equal(doc.querySelectorAll('.login-help a').length, 2);
    assert.equal(doc.querySelectorAll('.login-help button').length, 0);
    assert.equal(doc.querySelector<HTMLInputElement>('input[name=email]')!.type, 'email');
    assert.ok(doc.querySelector<HTMLInputElement>('input[name=password]')!.required);
    click(dom, '[data-action=password]');
    assert.equal(doc.querySelector<HTMLInputElement>('input[name=password]')!.type, 'text');
    await preview(dom);
    assert.match(doc.querySelector('.demo-banner')!.textContent!, /Simulation mode/);
    assert.ok(doc.querySelectorAll('.metric').length >= 6);
    assert.equal(doc.querySelectorAll('svg').length > 10, true);
}
finally {
    dom.window.close();
} });
test('DOM: every permitted admin screen mounts without rendering a page error', async () => { const dom = boot(); try {
    await preview(dom);
    for (const path of ['leads', 'customers', 'plans', 'coverage', 'orders', 'subscriptions', 'payments', 'provisioning', 'tickets', 'reports', 'staff', 'integrations', 'notifications', 'audit', 'settings']) {
        await go(dom, path);
        assert.equal(dom.window.document.querySelector('.error-state'), null, path);
        assert.ok(dom.window.document.querySelector('h1')!.textContent, path);
    }
}
finally {
    dom.window.close();
} });
test('DOM: navigation groups collapse independently and retain their state across navigation', async () => { const dom = boot(); try {
    await preview(dom);
    const doc = dom.window.document;
    const group = () => doc.querySelector<HTMLButtonElement>('[data-group="Customers & sales"]')!;
    const links = () => doc.getElementById(group().getAttribute('aria-controls')!)!;
    assert.equal(group().getAttribute('aria-expanded'), 'true');
    group().click();
    assert.equal(group().getAttribute('aria-expanded'), 'false');
    assert.equal(links().hidden, true);
    assert.equal(doc.querySelector('[data-group="Services & operations"]')!.getAttribute('aria-expanded'), 'true');
    await go(dom, 'plans');
    assert.equal(links().hidden, true);
    group().click();
    assert.equal(links().hidden, false);
    click(dom, 'a[href="#/customers"]');
    await waitFor(() => !!doc.querySelector('a[aria-current=page][href="#/customers"]'));
    assert.equal(group().getAttribute('aria-expanded'), 'true');
}
finally {
    dom.window.close();
} });
test('DOM: Support wallet is read-only, ledger is labeled and top-up evidence is inaccessible', async () => { const dom = boot(); try {
    await preview(dom, 'SUPPORT');
    const doc = dom.window.document;
    assert.equal(doc.querySelector('a[href="#/walletTopUps"]'), null);
    await go(dom, 'customers'); click(dom, '[data-detail]');
    await waitFor(() => !!doc.querySelector('[data-action^="wallet:view:"]'));
    assert.match(doc.querySelector('.modal')!.textContent!, /Available credit/);
    click(dom, '[data-action^="wallet:view:"]');
    await waitFor(() => !!doc.querySelector('[aria-label="Wallet transactions"]'));
    assert.match(doc.querySelector('#wallet-view')!.textContent!, /SIMULATED read-only/);
    assert.match(doc.querySelector('#wallet-view')!.textContent!, /confirmed service debit/i);
    assert.equal(doc.querySelector('[data-action^="wallet:credit:"]'), null);
    assert.equal(doc.querySelector('[data-action^="wallet:reverse:"]'), null);
    assert.equal(doc.querySelector('[data-action^="wallet:topup-detail:"]'), null);
    click(dom, '[data-action=close]');
    await go(dom, 'walletRenewals'); click(dom, '[data-detail]');
    await waitFor(() => !!doc.querySelector('.modal'));
    assert.equal(doc.querySelector('[data-action^="wallet:process:"]'), null);
    assert.equal(doc.querySelector('[data-action^="wallet:resolve:"]'), null);
} finally { dom.window.close(); } });
test('DOM: Finance sees controlled corrections and uncertain renewal funds but cannot reconcile providers', async () => { const dom = boot(); try {
    await preview(dom, 'FINANCE'); const doc = dom.window.document;
    await go(dom, 'customers'); click(dom, '[data-detail]');
    await waitFor(() => !!doc.querySelector('[data-action^="wallet:view:"]'));
    click(dom, '[data-action^="wallet:view:"]');
    await waitFor(() => !!doc.querySelector('[data-action^="wallet:credit:"]'));
    click(dom, '[data-action^="wallet:credit:"]');
    assert.ok(doc.querySelector('[name=amountMinor]')); assert.equal(doc.querySelector('[name=balance]'), null);
    assert.ok(doc.querySelector('textarea[name=reason]'));
    assert.match(doc.querySelector('#wallet-operation')!.textContent!, /positive credit correction/);
    click(dom, '[data-action=close]');
    await go(dom, 'walletRenewals');
    const rows = [...doc.querySelectorAll('tbody tr')]; rows.find(r => /Requires Review/i.test(r.textContent!))!.querySelector<HTMLButtonElement>('[data-detail]')!.click();
    await waitFor(() => !!doc.querySelector('.modal'));
    assert.match(doc.querySelector('.modal')!.textContent!, /Funds remain reserved/);
    assert.equal(doc.querySelector('[data-action^="wallet:resolve:"]'), null);
} finally { dom.window.close(); } });
test('DOM: Provisioner reconciliation requires evidence and expiry while Finance reviews separate wallet allocation', async () => { const dom = boot(); try {
    await preview(dom, 'PROVISIONER'); const doc = dom.window.document;
    assert.equal(doc.querySelector('a[href="#/walletTopUps"]'), null);
    await go(dom, 'walletRenewals');
    [...doc.querySelectorAll('tbody tr')].find(r => /Requires Review/i.test(r.textContent!))!.querySelector<HTMLButtonElement>('[data-detail]')!.click();
    await waitFor(() => !!doc.querySelector('[data-action^="wallet:resolve:"]'));
    click(dom, '[data-action^="wallet:resolve:"]');
    await waitFor(() => !!doc.querySelector('#wallet-operation'));
    assert.ok(doc.querySelector('[name=authoritative][required]'));
    assert.ok(doc.querySelector('[name=confirmedEndsAt]'));
    assert.match(doc.querySelector('#wallet-operation')!.textContent!, /authoritative expiry/);
} finally { dom.window.close(); } });
test('DOM: catalogue renewal price is explicit and blank removes it rather than using connection price', async () => { const dom = boot(); try {
    await preview(dom); const doc = dom.window.document;
    await go(dom, 'plans'); click(dom, '[data-detail]');
    await waitFor(() => !!doc.querySelector('[data-edit]'));
    click(dom, '[data-edit]'); await waitFor(() => !!doc.querySelector('#record-form'));
    const price = doc.querySelector<HTMLInputElement>('[name=renewalPriceMinor]')!;
    assert.equal(price.required, false); assert.equal(price.min, '1');
    price.value = '1950000';
    doc.querySelector<HTMLFormElement>('#record-form')!.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => !doc.querySelector('.modal'));
    await waitFor(() => !doc.querySelector('.loading'));
    click(dom, '[data-detail]'); await waitFor(() => !!doc.querySelector('.detail-grid'));
    assert.match(doc.querySelector('.detail-grid')!.textContent!, /Approved renewal price.*19,500/s);
    click(dom, '[data-edit]'); await waitFor(() => !!doc.querySelector('#record-form'));
    doc.querySelector<HTMLInputElement>('[name=renewalPriceMinor]')!.value = '';
    doc.querySelector<HTMLFormElement>('#record-form')!.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => !doc.querySelector('.modal'));
    await waitFor(() => !doc.querySelector('.loading'));
    click(dom, '[data-detail]'); await waitFor(() => !!doc.querySelector('.detail-grid'));
    const renewal = [...doc.querySelectorAll('.detail-grid > div')].find(x => x.querySelector('dt')!.textContent === 'Approved renewal price')!;
    assert.equal(renewal.querySelector('dd')!.textContent, '—');
} finally { dom.window.close(); } });
test('DOM: customer search, detail, create form and saved record', async () => { const dom = boot(); try {
    await preview(dom);
    await go(dom, 'customers');
    const doc = dom.window.document;
    const search = doc.querySelector<HTMLInputElement>('#search')!;
    search.value = 'Meridian';
    search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.equal(doc.querySelectorAll('tbody tr').length, 1);
    click(dom, '[data-detail]');
    await waitFor(() => !!doc.querySelector('.modal'));
    assert.match(doc.querySelector('.modal')!.textContent!, /External CRM references/);
    click(dom, '[data-action=close]');
    click(dom, '[data-action=create]');
    await waitFor(() => !!doc.querySelector('#record-form'));
    const form = doc.querySelector<HTMLFormElement>('#record-form')!;
    for (const [key, value] of Object.entries({ name: 'DOM Customer', email: 'dom@example.test', phone: '+2348000000000' }))
        (form.elements.namedItem(key) as HTMLInputElement).value = value;
    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => !doc.querySelector('.modal'));
    await waitFor(() => !doc.querySelector('.loading'));
    assert.equal(doc.querySelector('.error-state'), null);
    const currentSearch = doc.querySelector<HTMLInputElement>('#search')!;
    currentSearch.value = 'DOM Customer';
    currentSearch.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.match(doc.querySelector('tbody')!.textContent!, /DOM Customer/);
}
finally {
    dom.window.close();
} });
test('DOM: support role cannot navigate to staff administration or verify payments', async () => { const dom = boot(); try {
    await preview(dom, 'SUPPORT');
    const doc = dom.window.document;
    assert.equal(doc.querySelector('a[href="#/staff"]'), null);
    assert.equal(doc.querySelector('a[href="#/plans"]'), null);
    await go(dom, 'payments');
    click(dom, '[data-detail]');
    await waitFor(() => !!doc.querySelector('.modal'));
    assert.equal(doc.querySelector('[data-action^="verify:"]'), null);
    click(dom, '[data-action=close]');
    dom.window.location.hash = '#/staff';
    await waitFor(() => !!doc.querySelector('.error-state'));
    assert.match(doc.querySelector('.error-state')!.textContent!, /permission/i);
}
finally {
    dom.window.close();
} });
test('DOM: empty search, filter reset, modal Escape and logout work', async () => { const dom = boot(); try {
    await preview(dom);
    await go(dom, 'leads');
    const doc = dom.window.document;
    const search = doc.querySelector<HTMLInputElement>('#search')!;
    search.value = 'no-match-123';
    search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.match(doc.querySelector('.empty')!.textContent!, /No matching/);
    click(dom, '[data-action=clear]');
    assert.equal(doc.querySelectorAll('tbody tr').length, 5);
    click(dom, '[data-detail]');
    await waitFor(() => !!doc.querySelector('.modal'));
    doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(doc.querySelector('.modal'), null);
    click(dom, '[data-action=account]');
    click(dom, '[data-action=logout]');
    await waitFor(() => !!doc.querySelector('#login-form'));
    assert.equal(doc.querySelector('.workspace'), null);
}
finally {
    dom.window.close();
} });
test('CSS includes mobile navigation, dialog containment and reduced-motion handling', () => { const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8'); assert.match(css, /@media\(max-width:700px\)/); assert.match(css, /\.sidebar\.open/); assert.match(css, /prefers-reduced-motion/); assert.match(css, /100dvh/); assert.match(css, /overflow-x:auto/); });

test('DOM: recovery and reset controls acknowledge errors without storing tokens', async()=>{
 const dom=boot();try{const doc=dom.window.document;click(dom,'[data-action=recovery]');assert.ok(doc.querySelector('#auth-help-form input[name=email]'));click(dom,'[data-action=reset-password]');const form=doc.querySelector('#auth-help-form');assert.ok(form);(form.querySelector('[name=token]') as HTMLInputElement).value='sample-token-'.repeat(4);(form.querySelector('[name=password]') as HTMLInputElement).value='Example Password 123!';(form.querySelector('[name=confirmPassword]') as HTMLInputElement).value='Different Password 123!';form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await waitFor(()=>!!form.querySelector('.form-error')?.textContent);assert.match(form.querySelector('.form-error')!.textContent!,/do not match/);assert.equal(dom.window.localStorage.length,0);assert.equal(dom.window.sessionStorage.length,0);click(dom,'[data-action=close]');assert.equal(doc.querySelector('[name=token]'),null)}finally{dom.window.close()}
});
test('DOM: parent coverage forms lock final eligibility and hide unsupported edits',async()=>{
 const dom=boot();try{await preview(dom);await go(dom,'coverage');const doc=dom.window.document;click(dom,'[data-action=create]');await waitFor(()=>!!doc.querySelector('#record-form'));assert.equal(doc.querySelector<HTMLSelectElement>('[name=eligibility]')!.disabled,true);const level=doc.querySelector<HTMLSelectElement>('[name=level]')!;level.value='BUILDING_ADDRESS';level.dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.equal(doc.querySelector<HTMLSelectElement>('[name=eligibility]')!.disabled,false);assert.equal(doc.querySelector<HTMLSelectElement>('[name=parentId]')!.options.length,2);click(dom,'[data-action=close]');click(dom,'[data-detail]');await waitFor(()=>!!doc.querySelector('.modal'));assert.equal(doc.querySelector('[data-edit]'),null)}finally{dom.window.close()}
});

test('DOM: ticket detail renders nested API messages only in the conversation', async () => {
 const dom=boot(); try {
  await preview(dom); await go(dom,'tickets'); const doc=dom.window.document;
  click(dom,'[data-detail]'); await waitFor(()=>!!doc.querySelector('.message'));
  assert.match(doc.querySelector('.message')!.textContent!,/Sample customer message/);
  assert.doesNotMatch(doc.querySelector('.detail-grid')!.textContent!,/Messages|\[object Object\]/);
 } finally { dom.window.close(); }
});

test('DOM: order selectors distinguish repeated plans using reference and status', async () => {
 const dom=boot(); try {
  await preview(dom); await go(dom,'payments'); const doc=dom.window.document;
  click(dom,'[data-action=create]'); await waitFor(()=>!!doc.querySelector('[name=orderId]'));
  const options=[...doc.querySelector<HTMLSelectElement>('[name=orderId]')!.options].filter(o=>o.value);
  assert.ok(options.length>1);
  for(const option of options) {
   assert.ok(option.textContent!.includes(option.value.slice(0,8)));
   assert.ok(option.textContent!.includes(option.value.slice(-6)));
   assert.match(option.textContent!,/Pending Payment|Paid|Completed|Fulfilling/);
  }
  assert.equal(new Set(options.map(o=>o.textContent)).size,options.length);
 } finally { dom.window.close(); }
});
