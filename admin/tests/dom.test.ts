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
async function preview(dom: JSDOM, role = 'ADMIN') { (dom.window.document.querySelector('#preview-role') as HTMLSelectElement).value = role; click(dom, '[data-action=preview]'); await waitFor(() => !!dom.window.document.querySelector('.metrics,.workspace-note')); }
async function go(dom: JSDOM, path: string) { dom.window.location.hash = `#/${path}`; await waitFor(() => !!dom.window.document.querySelector(`a[aria-current=page][href="#/${path}"]`)); await waitFor(() => !dom.window.document.querySelector('.loading')); }
test('DOM: login validation, password toggle and labeled simulation', async () => { const dom = boot(); try {
    const doc = dom.window.document;
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
    for (const path of ['leads', 'customers', 'plans', 'coverage', 'orders', 'subscriptions', 'payments', 'provisioning', 'tickets', 'reports', 'staff', 'integrations', 'audit', 'settings']) {
        await go(dom, path);
        assert.equal(dom.window.document.querySelector('.error-state'), null, path);
        assert.ok(dom.window.document.querySelector('h1')!.textContent, path);
    }
}
finally {
    dom.window.close();
} });
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
