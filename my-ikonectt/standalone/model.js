// Fictional, browser-only state. Never imported by the integrated API provider.
import * as C from "../generated/contracts.js";
export const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const profiles = [
  { key: "ada", name: "Ada Okafor", kind: "RESIDENTIAL", status: "Expired", balance: 3000000, speed: 80, plan: "Demo Home 80", price: 1950000, ends: "2026-09-21T00:00:00.000Z" },
  { key: "meridian", name: "Meridian Studio", kind: "BUSINESS", status: "Active", balance: 0, speed: 250, plan: "Demo Business 250", price: 7500000, ends: "2026-12-31T00:00:00.000Z" },
];
const at = "2026-10-22T10:00:00.000Z", profileKey = "ikonectt.standalone.profile";
const clone = value => structuredClone(value);
const fail = (message, status = 409) => { throw Object.assign(new Error(message), { status }); };
const unsupported = async () => fail("This demonstration does not use passwords, real payments or a connected provider.");
export function createStandaloneAdapter(storage = globalThis.sessionStorage) {
  let state = null, sequence = 100, intents = new Map();
  const id = () => uuid(++sequence);
  function saveProfile(key) { try { storage?.setItem(profileKey, key); } catch {} }
  function initialize(key) {
    const index = profiles.findIndex(p => p.key === key);
    if (index < 0) return fail("Choose a fictional customer profile.", 400);
    const sample = profiles[index], customerId = uuid(index + 1), planId = uuid(index + 10), buildingId = uuid(index + 30), serviceId = uuid(index + 20);
    sequence = 100; intents = new Map();
    const profile = { id: customerId, name: sample.name, accountNumber: `DEMO-000${index + 1}`, accountNumberSimulated: true,
      kind: sample.kind, customerType: sample.kind === "RESIDENTIAL" ? "Residential" : "Business", status: "ACTIVE",
      email: index ? "accounts@meridian.example.test" : "ada@example.test", phone: "+2348000000000", address: "Fictional Demo Building, Lagos", buildingId, mustChangePassword: false, createdAt: at };
    const plan = C.Plan.parse({ id: planId, code: sample.key + "-illustrative", name: sample.plan, kind: sample.kind,
      priceMinor: sample.price, renewalPriceMinor: sample.price, speedMbps: sample.speed, currency: "NGN", billingDays: 30,
      published: true, simulated: true, features: ["Illustrative demonstration pricing — not an approved production tariff"], createdAt: at, updatedAt: at });
    const service = { id: serviceId, buildingId, planId, name: profile.customerType + " internet", plan: plan.name,
      speedMbps: plan.speedMbps, status: sample.status, address: profile.address, renewalDate: sample.ends,
      monthlyAmount: sample.price / 100, billingDays: 30, currency: "NGN", usage: null, simulated: true };
    const order = C.Order.parse({ id: uuid(index + 40), customerId, planId, buildingId, subscriptionId: serviceId,
      type: "NEW_CONNECTION", status: "COMPLETED", fundingSource: "ORDER_PAYMENT", planName: plan.name,
      amountMinor: sample.price, currency: "NGN", billingDays: 30, createdAt: at, updatedAt: at, simulated: true });
    const receipt = { id: uuid(index + 50), reference: `DEMO-RECEIPT-${index + 1}`, billReference: order.id, description: plan.name,
      amount: sample.price / 100, currency: "NGN", status: "Verified", paidAt: at, method: "Fictional transfer" };
    const ticket = { id: uuid(index + 60), subject: "A question about my connection", reference: `Demo request ${index + 1}`,
      status: "In progress", description: "This is a fictional support conversation for client review.", createdAt: at,
      updates: [{ at, message: "Our demonstration support team is reviewing this sample request." }] };
    state = { key, profile, plan, service, orders: [order], receipts: [receipt], tickets: [ticket], posted: sample.balance,
      held: 0, entries: [], renewals: [], topUps: [], notifications: [{ id: uuid(index + 70), channel: "EMAIL", template: "demo-welcome", status: "SIMULATED", attempts: 0, simulated: true, createdAt: at }] };
    if (sample.balance) entry("SETTLEMENT_CREDIT", sample.balance, sample.balance, 0, { settlementPaymentId: uuid(900 + index), description: "Fictional settled funding supplied with this sample. No real payment." });
    saveProfile(key);
    return clone(profile);
  }
  function guard() { if (!state) fail("Choose a demonstration profile to continue.", 401); }
  function entry(kind, amount, postedDelta, heldDelta, extra = {}) {
    const record = C.WalletEntry.parse({ id: id(), walletId: uuid(80), customerId: state.profile.id, kind, amountMinor: amount,
      postedDeltaMinor: postedDelta, reservedDeltaMinor: heldDelta, postedAfterMinor: state.posted, reservedAfterMinor: state.held,
      reference: `DEMO-WTX-${sequence}`, description: "Fictional demonstration ledger activity", actorId: null,
      topUpId: null, settlementPaymentId: null, renewalId: null, reversalOfId: null, simulated: true, createdAt: at, ...extra });
    state.entries.unshift(record); return record;
  }
  function wallet() {
    guard(); return C.WalletSummary.parse({ customerId: state.profile.id, currency: "NGN", postedMinor: state.posted,
      reservedMinor: state.held, availableMinor: state.posted - state.held, pendingTopUpsMinor: 0, pendingTopUpsCount: 0, simulated: true,
      topUpInstructions: { mode: "MANUAL_REPORT", bankDetails: null, notice: "Standalone demonstration only. No bank details, payment provider or real transfer is used." } });
  }
  function quote(serviceId) {
    guard(); if (serviceId !== state.service.id) fail("Sample service not found.", 404);
    const open = state.renewals.some(r => ["RESERVED", "PROCESSING", "REQUIRES_REVIEW"].includes(r.status));
    const reasonCodes = open ? ["RENEWAL_IN_PROGRESS"] : state.posted - state.held < state.plan.priceMinor ? ["INSUFFICIENT_FUNDS"] : [];
    const from = Math.max(Date.parse(state.service.renewalDate), Date.parse(at));
    return C.RenewalEligibility.parse({ subscriptionId: serviceId, eligible: reasonCodes.length === 0, reasonCodes,
      amountMinor: state.plan.priceMinor, priceVersion: at, billingDays: 30, currentEndsAt: state.service.renewalDate,
      expectedEndsAt: new Date(from + 30 * 86400000).toISOString(), planName: state.plan.name, speedMbps: state.plan.speedMbps, wallet: wallet(), simulated: true });
  }
  function page(items, offset = 0, limit = 25) {
    guard(); const q = C.ListQuery.parse({ offset, limit }); return { items: clone(items.slice(q.offset, q.offset + q.limit)), total: items.length, ...q };
  }
  const find = (items, value, message) => clone(items.find(item => item.id === value) || fail(message, 404));
  return {
    enterDemo: async key => initialize(key),
    demoContext: () => state ? { key: state.key, name: state.profile.name } : null,
    resetDemo: async () => { guard(); return initialize(state.key); },
    session: async () => { guard(); return clone(state.profile); },
    resume: async () => { if (!state) { let key; try { key = storage?.getItem(profileKey); } catch {} if (key && profiles.some(p => p.key === key)) initialize(key); } guard(); return clone(state.profile); },
    logout: async () => { state = null; intents.clear(); try { storage?.removeItem(profileKey); } catch {} },
    login: unsupported, recover: unsupported, resetPassword: unsupported, changePassword: unsupported,
    summary: async () => { guard(); return clone({ profile: state.profile, services: [state.service], bills: [], orders: state.orders,
      payments: [], receipts: state.receipts, tickets: state.tickets, notifications: state.notifications,
      providerCapabilities: { payments: "not-connected", paymentSettlement: "not-connected", usage: "not-connected" }, simulated: true }); },
    wallet: async () => wallet(),
    walletTransactions: async (offset, limit) => { guard(); return page(state.entries, offset, limit); },
    walletTopUps: async (offset, limit) => { guard(); return page(state.topUps, offset, limit); },
    walletRenewals: async (offset, limit) => { guard(); return page(state.renewals, offset, limit); },
    walletRenewal: async value => { guard(); return find(state.renewals, value, "Sample renewal not found."); },
    reportWalletTopUp: unsupported,
    simulateFunding: async amount => {
      guard(); if (![1000000, 2000000, 3000000].includes(amount)) fail("Choose one of the illustrative funding amounts.", 400);
      state.posted += amount;
      entry("SETTLEMENT_CREDIT", amount, amount, 0, { settlementPaymentId: id(), description: "Simulated settled funding. No payment initiation, real transfer or connected provider is implied." });
      return wallet();
    },
    renewalEligibility: async serviceId => quote(serviceId),
    requestWalletRenewal: async (serviceId, input) => {
      guard(); const request = C.WalletRenewalRequest.parse(input), fingerprint = JSON.stringify({ serviceId, priceVersion: request.priceVersion });
      const existing = intents.get(request.idempotencyKey);
      if (existing) { if (existing.fingerprint !== fingerprint) fail("This sample request reference was already used."); return find(state.renewals, existing.id, "Sample renewal not found."); }
      const eligibility = quote(serviceId);
      if (!eligibility.eligible) fail(eligibility.reasonCodes.includes("INSUFFICIENT_FUNDS") ? "Insufficient available demonstration funds." : "A simulated renewal is already pending.");
      if (request.priceVersion !== at) fail("Review the current illustrative quote.");
      const renewalId = id(), orderId = id(), amount = eligibility.amountMinor;
      state.held += amount;
      const renewal = C.WalletRenewal.parse({ id: renewalId, customerId: state.profile.id, subscriptionId: serviceId, orderId,
        planId: state.plan.id, planName: state.plan.name, amountMinor: amount, currency: "NGN", billingDays: 30,
        status: "RESERVED", previousEndsAt: eligibility.currentEndsAt, expectedEndsAt: eligibility.expectedEndsAt, confirmedEndsAt: null,
        providerMode: "simulated", providerReference: null, simulated: true, createdAt: at, updatedAt: at });
      state.renewals.unshift(renewal);
      state.orders.unshift(C.Order.parse({ ...state.orders[0], id: orderId, type: "RENEWAL", fundingSource: "WALLET", status: "FULFILLING", amountMinor: amount }));
      entry("RESERVE", amount, 0, amount, { renewalId, description: "Fictional funds reserved after explicit customer confirmation. Service has not changed." });
      intents.set(request.idempotencyKey, { fingerprint, id: renewalId }); return clone(renewal);
    },
    completeDemoRenewal: async renewalId => {
      guard(); const renewal = state.renewals.find(r => r.id === renewalId);
      if (!renewal) fail("Sample renewal not found.", 404);
      if (renewal.status === "SUCCEEDED") return clone(renewal);
      if (renewal.status !== "RESERVED") fail("Only a reserved demonstration renewal can be completed.");
      state.posted -= renewal.amountMinor; state.held -= renewal.amountMinor;
      renewal.status = "SUCCEEDED"; renewal.confirmedEndsAt = renewal.expectedEndsAt; renewal.providerReference = "DEMO-ONLY-" + renewal.id;
      state.service.status = "Active"; state.service.renewalDate = renewal.confirmedEndsAt;
      state.orders.find(o => o.id === renewal.orderId).status = "COMPLETED";
      entry("CAPTURE", renewal.amountMinor, -renewal.amountMinor, -renewal.amountMinor, { renewalId, description: "Explicit simulated service completion. No ISP request or real activation occurred." });
      return clone(renewal);
    },
    plans: async () => { guard(); return [clone(state.plan)]; },
    orders: async () => { guard(); return clone(state.orders); },
    order: async value => { guard(); return find(state.orders, value, "Sample order not found."); },
    createOrder: async input => {
      guard(); const request = C.CreateOrderRequest.parse(input);
      if (request.planId !== state.plan.id || request.buildingId !== state.profile.buildingId) fail("Choose the sample plan and building.");
      if (request.type !== "NEW_CONNECTION") fail("Use Renew Plan and the wallet for the renewal demonstration.");
      const order = C.Order.parse({ ...state.orders[0], id: id(), type: "NEW_CONNECTION", subscriptionId: null, fundingSource: "ORDER_PAYMENT", status: "PENDING_PAYMENT" });
      state.orders.unshift(order); return clone(order);
    },
    reportPayment: unsupported,
    receipt: async value => { guard(); return find(state.receipts, value, "Sample receipt not found."); },
    ticket: async value => { guard(); return find(state.tickets, value, "Sample request not found."); },
    createTicket: async input => {
      guard(); if (input.subject.trim().length < 5 || input.description.trim().length < 15) fail("Add a subject and at least 15 characters of detail.", 400);
      const ticket = { id: id(), reference: `Demo request ${sequence}`, subject: input.subject.trim(), description: input.description.trim(), status: "Open", createdAt: at, updates: [{ at, message: "Your fictional demonstration request was received locally. Nothing was sent to staff." }] };
      state.tickets.unshift(ticket); return clone(ticket);
    },
    reply: async (value, message) => {
      guard(); const ticket = state.tickets.find(t => t.id === value); if (!ticket) fail("Sample request not found.", 404);
      C.TicketMessageRequest.parse({ message }); ticket.updates.push({ at, message });
      return C.TicketMessage.parse({ id: id(), ticketId: value, authorId: state.profile.id, message, createdAt: at });
    },
    updateProfile: async phone => { guard(); if (phone.trim().length < 7) fail("Enter a sample phone number.", 400); state.profile.phone = phone.trim(); return clone(state.profile); },
    locations: async () => { guard(); return [{ id: state.profile.buildingId, level: "BUILDING_ADDRESS", name: "Fictional Demo Building, Lagos", path: "Demo / Lagos / Fictional Demo Building", eligibility: "AVAILABLE", planIds: [state.plan.id], simulated: true }]; },
    checkCoverage: async input => { guard(); if (input.buildingId !== state.profile.buildingId) fail("Choose the sample building.", 400); return C.CoverageResult.parse({ buildingId: input.buildingId, eligibility: "AVAILABLE", planIds: [state.plan.id], simulated: true, source: "SIMULATED", checkedAt: at }); },
    providerCapabilities: async () => { guard(); return { payments: "not-connected", paymentSettlement: "not-connected", usage: "not-connected", assistant: "not-connected", email: "not-connected", sms: "not-connected" }; },
    guidance: unsupported,
    capabilities: { notifications: true, chat: false, guidance: false },
  };
}
