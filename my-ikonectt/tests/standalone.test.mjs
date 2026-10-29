import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createStandaloneAdapter, uuid } from "../standalone/model.js";
const storage = () => { const m = new Map(); return { getItem: k => m.get(k), setItem: (k,v) => m.set(k,v), removeItem: k => m.delete(k) }; };

test("standalone entry is passwordless, fictional and guarded from unselected profiles", async () => {
  const api = createStandaloneAdapter(storage());
  await assert.rejects(api.resume(), { status: 401 });
  await assert.rejects(api.enterDemo("unknown"), { status: 400 });
  const customer = await api.enterDemo("ada");
  assert.equal(customer.name, "Ada Okafor"); assert.equal(customer.id, uuid(1));
  const summary = await api.summary();
  assert.equal(summary.services[0].status, "Expired");
  assert.equal((await api.wallet()).availableMinor, 3000000);
  assert.equal(summary.receipts[0].amount, 19500);
  assert.equal((await api.renewalEligibility(uuid(20))).eligible, true);
  await assert.rejects(api.login("anything", "anything"), /does not use passwords/);
  await api.logout(); await assert.rejects(api.wallet(), { status: 401 });
});

test("standalone renewal explicitly reserves then separately completes, preserving service until completion", async () => {
  const api = createStandaloneAdapter(storage()); await api.enterDemo("ada");
  const before = (await api.summary()).services[0]; const quote = await api.renewalEligibility(before.id);
  const request = { priceVersion: quote.priceVersion, idempotencyKey: uuid(700) };
  await assert.rejects(api.requestWalletRenewal(before.id, { ...request, amountMinor: 1 }));
  const renewal = await api.requestWalletRenewal(before.id, request);
  assert.equal(renewal.status, "RESERVED"); assert.equal(renewal.confirmedEndsAt, null);
  assert.equal((await api.wallet()).postedMinor, 3000000); assert.equal((await api.wallet()).reservedMinor, 1950000);
  assert.equal((await api.wallet()).availableMinor, 1050000);
  assert.deepEqual((await api.summary()).services[0], before);
  assert.equal((await api.requestWalletRenewal(before.id, request)).id, renewal.id);
  assert.equal((await api.walletTransactions()).total, 2);
  await api.completeDemoRenewal(renewal.id);
  assert.equal((await api.wallet()).postedMinor, 1050000); assert.equal((await api.wallet()).reservedMinor, 0);
  assert.equal((await api.summary()).services[0].status, "Active");
  assert.equal((await api.walletRenewal(renewal.id)).confirmedEndsAt, quote.expectedEndsAt);
  assert.equal((await api.renewalEligibility(before.id)).eligible, false);
  assert.deepEqual((await api.renewalEligibility(before.id)).reasonCodes, ["INSUFFICIENT_FUNDS"]);
  await api.completeDemoRenewal(renewal.id); assert.equal((await api.walletTransactions()).total, 3);
  await assert.rejects(api.requestWalletRenewal(before.id, { ...request, idempotencyKey: uuid(701) }), /Insufficient/);
});

test("settled-funding simulation is independent of active and expired service, with no API requests", async () => {
  const previous = globalThis.fetch; let calls = 0;
  globalThis.fetch = () => { calls++; throw new Error("Unexpected network request"); };
  try {
    for (const profile of ["ada", "meridian"]) {
      const api = createStandaloneAdapter(storage()); await api.enterDemo(profile);
      const before = (await api.summary()).services[0];
      if (profile === "meridian") { assert.equal((await api.wallet()).availableMinor, 0); assert.equal(before.status, "Active"); }
      await api.simulateFunding(1000000);
      assert.deepEqual((await api.summary()).services[0], before);
      assert.equal((await api.walletTransactions()).items[0].kind, "SETTLEMENT_CREDIT");
      assert.equal((await api.wallet()).availableMinor, profile === "ada" ? 4000000 : 1000000);
      await assert.rejects(api.simulateFunding(1), { status: 400 });
      await api.checkCoverage({ buildingId: before.buildingId }); await api.plans(); await api.locations();
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = previous; }
});

test("demo support, profile isolation, reset and refresh restore documented sample state", async () => {
  const shared = storage(), api = createStandaloneAdapter(shared); await api.enterDemo("ada");
  const created = await api.createTicket({ subject: "Sample support request", description: "A fictional connection question for this demonstration." });
  await api.reply(created.id, "A fictional follow-up response.");
  assert.equal((await api.ticket(created.id)).updates.length, 2);
  assert.equal((await api.summary()).tickets.length, 2);
  await api.simulateFunding(1000000);
  const reloaded = createStandaloneAdapter(shared); await reloaded.resume();
  assert.equal((await reloaded.wallet()).availableMinor, 3000000);
  assert.equal((await reloaded.summary()).tickets.length, 1);
  await api.enterDemo("meridian"); assert.equal((await api.wallet()).availableMinor, 0);
  await assert.rejects(api.ticket(created.id), { status: 404 });
  await api.simulateFunding(2000000); await api.resetDemo(); assert.equal((await api.wallet()).availableMinor, 0);
});

test("standalone deployment policy forbids backend connections and real form navigation", () => {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url)));
  assert.equal(config.buildCommand, "npm run build:demo"); assert.equal(config.outputDirectory, "dist-demo");
  assert.equal(config.installCommand, "npm ci --include=dev");
  const headers = config.headers[0].headers;
  const csp = headers.find(h => h.key === "Content-Security-Policy").value;
  assert.match(csp, /connect-src 'none'/); assert.match(csp, /form-action 'none'/);
  assert.match(headers.find(h => h.key === "X-Robots-Tag").value, /noindex/);
});
