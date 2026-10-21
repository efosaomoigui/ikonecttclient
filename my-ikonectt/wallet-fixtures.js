import * as C from "./generated/contracts.js";
import { rawFixture } from "./fixtures.js";

// Scripted, schema-checked presentation states only. No financial engine runs in the portal.
export const walletScenarios = ["zero", "reported", "funded", "reserved", "processing", "review", "succeeded", "failed"];
const ids = {
  wallet: "a0000000-0000-4000-8000-000000000001",
  topUp: "a0000000-0000-4000-8000-000000000002",
  renewal: "a0000000-0000-4000-8000-000000000003",
  order: "a0000000-0000-4000-8000-000000000004",
};
const at = "2026-10-21T10:00:00.000Z";
export function walletFixture(scenario = "zero") {
  if (!walletScenarios.includes(scenario)) throw new Error("Unknown SIMULATED wallet scenario.");
  const held = ["reserved", "processing", "review"].includes(scenario);
  const funded = !["zero", "reported"].includes(scenario);
  const succeeded = scenario === "succeeded";
  const wallet = C.WalletSummary.parse({
    customerId: rawFixture.customer.id, currency: "NGN",
    postedMinor: succeeded ? 550000 : funded ? 2500000 : 0,
    reservedMinor: held ? 1950000 : 0,
    availableMinor: held || succeeded ? 550000 : funded ? 2500000 : 0,
    pendingTopUpsMinor: scenario === "reported" ? 2500000 : 0,
    pendingTopUpsCount: scenario === "reported" ? 1 : 0,
    simulated: true,
    topUpInstructions: { mode: "MANUAL_REPORT", bankDetails: null,
      notice: "SIMULATED preview. Obtain payment instructions through an approved Ikonectt channel. No bank details or payment gateway have been supplied." },
  });
  const topUp = C.WalletTopUp.parse({ id: ids.topUp, customerId: wallet.customerId,
    allocation: "WALLET", amountMinor: 2500000, currency: "NGN",
    reference: "SIMULATED-WALLET-TOPUP", method: "BANK_TRANSFER",
    status: scenario === "reported" ? "REPORTED" : "CONFIRMED",
    verifiedAt: scenario === "reported" ? null : at, simulated: true, createdAt: at });
  const status = { reserved: "RESERVED", processing: "PROCESSING", review: "REQUIRES_REVIEW", succeeded: "SUCCEEDED", failed: "FAILED" }[scenario];
  const renewal = status ? C.WalletRenewal.parse({ id: ids.renewal, customerId: wallet.customerId,
    subscriptionId: rawFixture.subscriptions[0].id, orderId: ids.order, planId: rawFixture.plans[0].id,
    planName: rawFixture.plans[0].name, amountMinor: 1950000, currency: "NGN", billingDays: 30,
    status, previousEndsAt: "2026-11-01T00:00:00.000Z", expectedEndsAt: "2026-12-01T00:00:00.000Z",
    confirmedEndsAt: succeeded ? "2026-12-01T00:00:00.000Z" : null,
    providerMode: "simulated", providerReference: succeeded ? "SIMULATED-RENEWAL-CONFIRMED" : null,
    simulated: true, createdAt: at, updatedAt: at }) : null;
  const entry = (kind, number, values) => C.WalletEntry.parse({
    id: `b0000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
    walletId: ids.wallet, customerId: wallet.customerId, kind, amountMinor: 1950000,
    postedDeltaMinor: 0, reservedDeltaMinor: 0, postedAfterMinor: 2500000, reservedAfterMinor: 0,
    reference: `SIMULATED-${kind}`, description: "SIMULATED development ledger entry",
    actorId: null, topUpId: null, renewalId: ids.renewal, reversalOfId: null,
    simulated: true, createdAt: at, ...values });
  const entries = funded ? [entry("TOPUP_CREDIT", 1, { amountMinor: 2500000, postedDeltaMinor: 2500000, topUpId: ids.topUp, renewalId: null })] : [];
  if (renewal) entries.unshift(entry("RESERVE", 2, { reservedDeltaMinor: 1950000, reservedAfterMinor: 1950000 }));
  if (succeeded) entries.unshift(entry("CAPTURE", 3, { postedDeltaMinor: -1950000, reservedDeltaMinor: -1950000, postedAfterMinor: 550000 }));
  if (scenario === "failed") entries.unshift(entry("RELEASE", 4, { reservedDeltaMinor: -1950000 }));
  const eligibility = C.RenewalEligibility.parse({ subscriptionId: rawFixture.subscriptions[0].id,
    eligible: scenario === "funded" || scenario === "failed",
    reasonCodes: held ? ["RENEWAL_IN_PROGRESS"] : scenario === "funded" || scenario === "failed" ? [] : ["INSUFFICIENT_FUNDS"],
    amountMinor: 1950000, priceVersion: at, billingDays: 30,
    currentEndsAt: succeeded ? "2026-12-01T00:00:00.000Z" : "2026-11-01T00:00:00.000Z",
    expectedEndsAt: succeeded ? "2026-12-31T00:00:00.000Z" : "2026-12-01T00:00:00.000Z",
    planName: rawFixture.plans[0].name, speedMbps: rawFixture.plans[0].speedMbps, wallet, simulated: true });
  return { wallet, topUps: scenario === "zero" ? [] : [topUp], renewals: renewal ? [renewal] : [], entries, eligibility };
}

export function createMockWallet(guard) {
  let state = walletFixture(), intents = new Map();
  const clone = (value) => structuredClone(value);
  const list = (items, schema, offset = 0, limit = 25) => {
    guard(); const q = C.ListQuery.parse({ offset, limit });
    return C.page(schema).parse({ items: clone(items.slice(q.offset, q.offset + q.limit)), total: items.length, ...q });
  };
  const issue = (message, status = 409) => { throw Object.assign(new Error(message), { status }); };
  return {
    async wallet() { guard(); return clone(state.wallet); },
    async walletTransactions(offset, limit) { return list(state.entries, C.WalletEntry, offset, limit); },
    async walletTopUps(offset, limit) { return list(state.topUps, C.WalletTopUp, offset, limit); },
    async walletRenewals(offset, limit) { return list(state.renewals, C.WalletRenewal, offset, limit); },
    async walletRenewal(id) { guard(); const value = state.renewals.find(r => r.id === id); if (!value) issue("SIMULATED renewal not found.", 404); return clone(value); },
    async renewalEligibility(id) { guard(); if (id !== rawFixture.subscriptions[0].id) issue("Service not found.", 404); return clone(state.eligibility); },
    async reportWalletTopUp(input) {
      guard(); const body = C.ReportWalletTopUpRequest.parse(input), existing = intents.get(body.idempotencyKey);
      if (existing) { if (existing.payload !== JSON.stringify(body)) issue("This intent already has different details."); return clone(existing.result); }
      if (body.amountMinor !== 2500000) issue("The SIMULATED scenario uses a fixed ₦25,000 top-up. Live reporting accepts the server's permitted amounts.", 400);
      if (state.topUps.length) issue("This SIMULATED scenario already contains a top-up. Choose another development scenario to reset it.");
      state = walletFixture("reported"); state.topUps[0].reference = body.reference; state.topUps[0].method = body.method;
      const result = clone(state.topUps[0]); intents.set(body.idempotencyKey, { payload: JSON.stringify(body), result }); return result;
    },
    async requestWalletRenewal(id, input) {
      guard(); const body = C.WalletRenewalRequest.parse(input), existing = intents.get(body.idempotencyKey);
      if (existing) { if (existing.payload !== JSON.stringify(body)) issue("This intent already has a different price version."); return clone(existing.result); }
      if (id !== state.eligibility.subscriptionId) issue("Service not found.", 404);
      if (!state.eligibility.eligible || body.priceVersion !== state.eligibility.priceVersion) issue("Renewal is not eligible. Review the current quote.");
      state = walletFixture("reserved"); const result = clone(state.renewals[0]);
      intents.set(body.idempotencyKey, { payload: JSON.stringify(body), result }); return result;
    },
    async previewWalletScenario(scenario) { guard(); state = walletFixture(scenario); intents.clear(); },
    get walletFixtureEndsAt() { return state.renewals.find(r => r.status === "SUCCEEDED")?.confirmedEndsAt || null; },
  };
}
