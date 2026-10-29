import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import * as C from "../generated/contracts.js";
import { createCustomerClient } from "../generated/contracts.js";
import { createLiveAdapter, summaryView } from "../live.js";
import { createMockWallet, walletFixture, walletScenarios } from "../wallet-fixtures.js";
import { rawFixture } from "../fixtures.js";
import { createWalletIntents, settleWalletFailure, validateTopUpDraft, renewalOutcome, renewalReady, walletScreen, loadWalletJourney, serviceRenewalActions, topUpNotice } from "../wallet.js";

const key = "c0000000-0000-4000-8000-000000000001";
const report = { amountMinor: 2500000, currency: "NGN", reference: "SIMULATED-TOPUP-TEST", method: "BANK_TRANSFER", evidence: "SIMULATED evidence, no actual transfer", idempotencyKey: key };
const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const ctx = (data) => ({ ...data, result: {}, intents: createWalletIntents(), esc,
  link: (path, text, cls = "") => `<a href="#/${path}" class="${cls}">${text}</a>`,
  heading: (title, detail) => `<h1>${title}</h1><p>${detail}</p>`,
  details: rows => `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`,
  moneyMinor: amount => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(amount / 100),
  date: value => value, input: () => "",
});

test("wallet UI pins API 1.2.0 and all explicit scenarios satisfy canonical schemas", () => {
  assert.equal(C.API_VERSION, "1.2.0");
  for (const scenario of walletScenarios) {
    const data = walletFixture(scenario);
    C.WalletSummary.parse(data.wallet); C.RenewalEligibility.parse(data.eligibility);
    data.topUps.forEach(record => C.WalletTopUp.parse(record));
    data.entries.forEach(record => C.WalletEntry.parse(record));
    data.renewals.forEach(record => C.WalletRenewal.parse(record));
  }
  const zero = walletFixture("zero");
  assert.ok(rawFixture.payments.some(p => p.status === "CONFIRMED"));
  assert.equal(zero.wallet.availableMinor, 0);
  assert.deepEqual(zero.entries, []);
});

test("customer wallet client uses canonical routes, pagination, strict allocation and server-derived price requests", async () => {
  const fixture = walletFixture("reserved"), calls = [];
  const client = createCustomerClient("http://local", () => undefined, () => {}, async (path, options) => {
    calls.push({ path, body: options.body ? JSON.parse(options.body) : null });
    if (path === "/me/wallet") return fixture.wallet;
    if (path.includes("transactions?")) return { items: [], offset: 25, limit: 25, total: 30 };
    if (path.endsWith("renewal-eligibility")) return fixture.eligibility;
    if (path.endsWith("wallet-renewals")) return fixture.renewals[0];
    return fixture.topUps[0];
  });
  assert.equal((await client.wallet()).availableMinor, 550000);
  assert.equal((await client.walletTransactions(25, 25)).total, 30);
  await client.reportWalletTopUp(report);
  await client.requestWalletRenewal(fixture.eligibility.subscriptionId, { priceVersion: fixture.eligibility.priceVersion, idempotencyKey: key });
  assert.equal(calls[1].path, "/me/wallet/transactions?offset=25&limit=25");
  assert.deepEqual(calls[3].body, { priceVersion: fixture.eligibility.priceVersion, idempotencyKey: key });
  assert.equal(calls[2].body.amountMinor, 2500000);
  const before = calls.length;
  await assert.rejects(async () => client.reportWalletTopUp({ ...report, orderId: rawFixture.orders[0].id }), { code: "VALIDATION" });
  await assert.rejects(async () => client.requestWalletRenewal(fixture.eligibility.subscriptionId, { priceVersion: fixture.eligibility.priceVersion, idempotencyKey: key, amountMinor: 1 }), { code: "VALIDATION" });
  await assert.rejects(async () => client.walletTransactions(-1), { code: "VALIDATION" });
  assert.equal(calls.length, before);
});

test("one intent key survives ambiguous network retries and refuses edited pending payloads", async () => {
  let sequence = 0;
  const intents = createWalletIntents(() => `c0000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`);
  const { idempotencyKey: _, ...draft } = report;
  const first = intents.prepare("top-up", draft);
  settleWalletFailure(intents, "top-up", { status: 0, code: "TIMEOUT" });
  assert.equal(intents.prepare("top-up", draft).idempotencyKey, first.idempotencyKey);
  assert.throws(() => intents.prepare("top-up", { ...draft, amountMinor: 1 }), { code: "LOCAL_PENDING_INTENT" });
  settleWalletFailure(intents, "top-up", { status: 409, code: "LOCAL_PENDING_INTENT" });
  assert.equal(intents.peek("top-up").idempotencyKey, first.idempotencyKey);
  settleWalletFailure(intents, "top-up", { status: 400 });
  assert.notEqual(intents.prepare("top-up", draft).idempotencyKey, first.idempotencyKey);
  intents.clear(); assert.equal(intents.peek("top-up"), null);
});

test("live financial failures and contract mismatches never become fixture success", async () => {
  const api = createLiveAdapter({ transport: async () => { throw new Error("offline"); } });
  await assert.rejects(api.wallet(), { code: "NETWORK_ERROR" });
  await assert.rejects(api.reportWalletTopUp(report), error => error.status === 0 && /could not be confirmed/.test(error.message));
  const malformed = createLiveAdapter({ transport: async () => ({ availableMinor: 1 }) });
  await assert.rejects(malformed.wallet(), { code: "CONTRACT_MISMATCH" });
  const partial = await loadWalletJourney("overview", null, api, {});
  assert.ok(partial.walletError); assert.equal(partial.wallet, undefined);
});

test("scripted top-up remains unspendable, duplicate reports do not add credit, and reservation is not renewal success", async () => {
  const api = createMockWallet(() => {});
  const first = await api.reportWalletTopUp(report);
  assert.equal(first.status, "REPORTED");
  assert.equal((await api.reportWalletTopUp(report)).id, first.id);
  assert.equal((await api.wallet()).availableMinor, 0);
  assert.equal((await api.wallet()).pendingTopUpsMinor, 2500000);
  assert.equal((await api.walletTransactions()).total, 0);
  await assert.rejects(api.reportWalletTopUp({ ...report, amountMinor: 1 }), { status: 409 });
  await api.previewWalletScenario("funded");
  const quote = await api.renewalEligibility(rawFixture.subscriptions[0].id);
  const request = { priceVersion: quote.priceVersion, idempotencyKey: key };
  const renewal = await api.requestWalletRenewal(quote.subscriptionId, request);
  assert.equal(renewal.status, "RESERVED"); assert.equal(renewal.confirmedEndsAt, null);
  assert.equal((await api.requestWalletRenewal(quote.subscriptionId, request)).id, renewal.id);
  assert.equal((await api.walletTransactions()).total, 2);
  assert.equal((await api.wallet()).reservedMinor, 1950000);
  assert.equal((await api.wallet()).availableMinor, 550000);
});

test("renewal actions depend on authoritative eligibility and success requires a confirmed date", () => {
  const insufficient = walletFixture("succeeded"), quote = insufficient.eligibility;
  const dom = new JSDOM(walletScreen("renew", quote.subscriptionId, ctx({ aux: { quote } })));
  assert.equal(dom.window.document.querySelector('[data-form="wallet-renew"]'), null);
  assert.ok(dom.window.document.querySelector('a[href="#/top-up"]'));
  assert.match(dom.window.document.body.textContent, /below the required/);
  assert.equal(renewalReady({ ...walletFixture("funded").eligibility, priceVersion: null }), false);
  for (const scenario of ["reserved", "processing", "review", "failed"]) {
    const renewal = walletFixture(scenario).renewals[0];
    assert.notEqual(renewalOutcome(renewal)[0], "Renewal completed");
  }
  assert.equal(renewalOutcome({ ...insufficient.renewals[0], confirmedEndsAt: null })[0], "Outcome needs review");
  assert.equal(renewalOutcome(insufficient.renewals[0])[0], "Renewal completed");
  assert.match(topUpNotice({ status: "REPORTED" }), /not yet available/);
  assert.match(topUpNotice({ status: "CONFIRMED" }), /confirmed/);
  assert.match(topUpNotice({ status: "REJECTED" }), /rejected/);
  dom.window.close();
});

test("review state retains protected funds, ledger pagination is linked, and customer text is escaped", () => {
  const data = walletFixture("review");
  const aux = { wallet: data.wallet, renewal: data.renewals[0] };
  const html = walletScreen("renewals", data.renewals[0].id, ctx({ aux }));
  assert.match(html, /provider outcome is uncertain/);
  assert.match(html, /₦19,500/);
  assert.equal(data.wallet.reservedMinor, 1950000);
  const entry = { ...data.entries[0], description: '<img src=x onerror="bad">' };
  const ledger = walletScreen("transactions", null, ctx({ aux: { wallet: data.wallet, entries: { items: [entry], total: 30, offset: 0, limit: 25 } } }));
  const dom = new JSDOM(ledger);
  assert.equal(dom.window.document.querySelector("img"), null);
  assert.ok(dom.window.document.querySelector('a[href="#/transactions/25"]'));
  assert.match(dom.window.document.body.textContent, /Reserved change/);
  dom.window.close();
});

test("top-up review derives validation from canonical request and never accepts financial authority fields", () => {
  const { idempotencyKey: _, ...draft } = report;
  assert.equal(validateTopUpDraft(draft).amountMinor, 2500000);
  assert.throws(() => validateTopUpDraft({ ...draft, balanceMinor: 2500000 }), { status: 400 });
  assert.throws(() => validateTopUpDraft({ ...draft, amountMinor: 0 }), { status: 400 });
});

test("an uncertain renewal can recover its original request after eligibility or price changes", () => {
  const quote = walletFixture("funded").eligibility;
  const intents = createWalletIntents(() => key);
  const operation = `renew:${quote.subscriptionId}`;
  const original = intents.prepare(operation, { priceVersion: quote.priceVersion });
  for (const changedQuote of [
    { ...quote, eligible: false, reasonCodes: ["RENEWAL_IN_PROGRESS"] },
    { ...quote, priceVersion: "2026-10-22T00:00:00.000Z" },
  ]) {
    const context = ctx({ aux: { quote: changedQuote } });
    context.intents = intents;
    const dom = new JSDOM(walletScreen("renew", quote.subscriptionId, context));
    assert.ok(dom.window.document.querySelector('[data-form="wallet-renew-retry"]'));
    assert.equal(dom.window.document.querySelector('[data-form="wallet-renew"]'), null);
    assert.deepEqual(intents.prepare(operation, { priceVersion: quote.priceVersion }), original);
    assert.match(dom.window.document.body.textContent, /original request reference and quote/);
    dom.window.close();
  }
});

test("zero and positive wallets remain independent of active and inactive subscription displays", async () => {
  for (const status of ["ACTIVE", "SUSPENDED"]) {
    for (const scenario of ["zero", "funded"]) {
      const fixture = walletFixture(scenario);
      const subscription = C.Subscription.parse({ ...rawFixture.subscriptions[0], status });
      const original = structuredClone(subscription);
      const data = summaryView({ ...rawFixture, subscriptions: [subscription] });
      const calls = [];
      const api = {
        wallet: async () => { calls.push("wallet"); return fixture.wallet; },
        requestWalletRenewal: async () => { throw new Error("Funding must not renew a service"); },
      };
      const aux = await loadWalletJourney("overview", null, api, data);
      assert.equal(aux.wallet.availableMinor, scenario === "zero" ? 0 : 2500000);
      assert.equal(data.services[0].status, status === "ACTIVE" ? "Active" : "Suspended");
      assert.equal(data.services[0].renewalDate, original.endsAt);
      assert.deepEqual(subscription, original);
      assert.deepEqual(calls, ["wallet"]);
      const context = ctx({ aux: { ...aux, topUps: { items: [] }, renewals: { items: [] } } });
      const dom = new JSDOM(walletScreen("wallet", null, context));
      assert.match(dom.window.document.body.textContent, /Available balance/);
      assert.equal(dom.window.document.querySelector("form"), null);
      dom.window.close();
    }
  }
});

test("funded services still require authoritative eligibility and explicit customer renewal consent", () => {
  const quote = walletFixture("funded").eligibility;
  for (const status of ["Active", "Suspended"]) {
    const service = { id: quote.subscriptionId, status };
    const denied = { ...quote, eligible: false, reasonCodes: ["SERVICE_NOT_ENABLED"] };
    assert.doesNotMatch(serviceRenewalActions(service, { eligibility: { [service.id]: denied } }, ctx({})), /Renew Plan/);
    const context = ctx({ aux: { quote } });
    const dom = new JSDOM(walletScreen("renew", service.id, context));
    const form = dom.window.document.querySelector('[data-form="wallet-renew"]');
    assert.ok(form);
    const consent = form.querySelector('input[type="checkbox"]');
    assert.ok(consent.required);
    assert.equal(consent.checked, false);
    assert.match(form.textContent, /Confirm and reserve funds/);
    assert.equal(dom.window.document.querySelectorAll("form").length, 1);
    dom.window.close();
  }
});

test("canonical settled funding is visible as an immutable system credit with a plain source reference", () => {
  const fixture = walletFixture("funded");
  const sourceId = "d0000000-0000-4000-8000-000000000001";
  const entry = C.WalletEntry.parse({ ...fixture.entries[0], kind: "SETTLEMENT_CREDIT",
    settlementPaymentId: sourceId, topUpId: null, actorId: null,
    description: 'Verified settled funding <script>unsafe</script>' });
  const context = ctx({ aux: { wallet: fixture.wallet, entries: { items: [entry], offset: 0, limit: 25, total: 1 } } });
  const dom = new JSDOM(walletScreen("transactions", null, context));
  assert.match(dom.window.document.body.textContent, /Settled wallet funding/);
  assert.match(dom.window.document.body.textContent, /System settlement/);
  assert.match(dom.window.document.body.textContent, new RegExp(sourceId));
  assert.equal(dom.window.document.querySelector("script"), null);
  assert.equal(dom.window.document.querySelector("a, button, form"), dom.window.document.querySelector('a[href="#/wallet"]'));
  assert.equal(dom.window.document.querySelectorAll('a[href*="settlement"]').length, 0);
  assert.equal(dom.window.document.querySelectorAll("button, form").length, 0);
  dom.window.close();
  // Existing manual-credit records without the additive field still validate.
  C.WalletEntry.parse(fixture.entries[0]);
});
