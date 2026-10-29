import { config } from "./config.js";
import { walletScenarios } from "./wallet-fixtures.js";
import { ReportWalletTopUpRequest } from "./generated/contracts.js";

export const walletRoutes = ["wallet", "top-up", "top-ups", "transactions", "renew", "renewals"];
export function validateTopUpDraft(input) {
  const parsed = ReportWalletTopUpRequest.omit({ idempotencyKey: true }).safeParse(input);
  if (!parsed.success) throw Object.assign(new Error("Check the top-up amount, reference and payment evidence."), { status: 400 });
  return parsed.data;
}
export function renewalReady(quote) {
  return !!(quote?.eligible && quote.amountMinor > 0 && quote.priceVersion && quote.expectedEndsAt && quote.billingDays);
}
export function topUpNotice(topUp) {
  if (topUp.status === "CONFIRMED") return "Top-up confirmed. Check Wallet for the authoritative available balance.";
  if (topUp.status === "REJECTED") return "Top-up rejected. This report has not created wallet credit.";
  return "Top-up reported for Finance verification. These funds are not yet available to spend.";
}
export function settleWalletFailure(intents, operation, error) {
  if (error.status >= 400 && error.status < 500 && error.code !== "LOCAL_PENDING_INTENT") intents.complete(operation);
}
export function createWalletIntents(uuid = () => crypto.randomUUID()) {
  const pending = new Map();
  return {
    prepare(operation, payload) {
      const fingerprint = JSON.stringify(Object.fromEntries(Object.entries(payload).sort(([a], [b]) => a.localeCompare(b))));
      const old = pending.get(operation);
      if (old && old.fingerprint !== fingerprint)
        throw Object.assign(new Error("An earlier request is still unconfirmed. Retry the same details or check wallet history before starting another."), { status: 409, code: "LOCAL_PENDING_INTENT" });
      if (!old) pending.set(operation, { fingerprint, payload: structuredClone(payload), idempotencyKey: uuid() });
      return { ...structuredClone(pending.get(operation).payload), idempotencyKey: pending.get(operation).idempotencyKey };
    },
    peek(operation) { const entry = pending.get(operation); return entry ? structuredClone(entry) : null; },
    complete(operation) { pending.delete(operation); },
    clear() { pending.clear(); },
  };
}

export async function loadWalletJourney(route, id, api, data) {
  if (route === "overview") {
    try { return { wallet: await api.wallet() }; }
    catch (error) { if (error.status === 401) throw error; return { walletError: error.message }; }
  }
  if (route === "services") {
    const eligibility = {}, eligibilityErrors = {};
    await Promise.all(data.services.filter(service => !id || id === service.id).map(async service => {
      try { eligibility[service.id] = await api.renewalEligibility(service.id); }
      catch (error) { if (error.status === 401) throw error; eligibilityErrors[service.id] = error.message; }
    }));
    return { eligibility, eligibilityErrors };
  }
  if (route === "renew") return { quote: await api.renewalEligibility(id) };
  if (route === "renewals" && id && !/^\d+$/.test(id)) {
    const [renewal, wallet] = await Promise.all([api.walletRenewal(id), api.wallet()]);
    return { renewal, wallet };
  }
  if (!walletRoutes.includes(route)) return {};
  const wallet = await api.wallet();
  const offset = id ? Number(id) : 0;
  if (!Number.isSafeInteger(offset) || offset < 0) throw Object.assign(new Error("Invalid history page."), { status: 400 });
  if (route === "transactions") return { wallet, entries: await api.walletTransactions(offset) };
  if (route === "top-ups") return { wallet, topUps: await api.walletTopUps(offset) };
  if (route === "renewals") return { wallet, renewals: await api.walletRenewals(offset) };
  if (route === "wallet") {
    const [topUps, renewals] = await Promise.all([api.walletTopUps(0, 5), api.walletRenewals(0, 5)]);
    return { wallet, topUps, renewals };
  }
  return { wallet };
}

const reasons = {
  ACCOUNT_INACTIVE: "Your account must be active before renewal.",
  SERVICE_NOT_ENABLED: "Self-service renewal is not enabled for this service. Contact support.",
  SERVICE_STATE: "This service is not in a renewable state.",
  MISSING_SERVICE_DATES: "Required service dates or provider information need staff verification.",
  PRICE_UNAVAILABLE: "An approved renewal price is not available. Contact support.",
  PLAN_UNAVAILABLE: "The current plan is not available for renewal.",
  COVERAGE_REVIEW: "Building coverage needs verification before renewal.",
  PROVIDER_UNAVAILABLE: "The renewal provider is not currently available.",
  RENEWAL_IN_PROGRESS: "A renewal is already in progress. Check its status before trying again.",
  INSUFFICIENT_FUNDS: "Your available wallet balance is below the required renewal amount.",
};
export function renewalMessages(quote) { return quote.reasonCodes.map(code => reasons[code] || "Contact support to check renewal eligibility."); }
export function renewalOutcome(renewal) {
  return {
    RESERVED: ["Funds reserved", "Awaiting authorized processing. Reserving funds does not renew or activate service."],
    PROCESSING: ["Renewal processing", "The service outcome is not yet confirmed. Funds remain reserved."],
    REQUIRES_REVIEW: ["Review required", "The provider outcome is uncertain. Funds remain reserved while staff reconcile the request. Do not submit another renewal."],
    SUCCEEDED: renewal.confirmedEndsAt
      ? ["Renewal completed", "The confirmed service outcome and renewal date are shown below."]
      : ["Outcome needs review", "A confirmed renewal date is unavailable. Contact support before submitting another renewal."],
    FAILED: ["Renewal failed", "The request did not complete. Check the wallet ledger for the released reservation; the prior service is preserved."],
  }[renewal.status] || ["Status unavailable", "Contact support to verify the renewal."];
}
const simulation = (record) => record?.simulated ? '<p class="subtle-note">SIMULATED development record · no live bank transfer or ISP operation is implied.</p>' : "";
const kindNames = { TOPUP_CREDIT: "Manual top-up credit", SETTLEMENT_CREDIT: "Settled wallet funding", RESERVE: "Funds reserved", CAPTURE: "Renewal debit", RELEASE: "Reservation released", ADJUSTMENT_CREDIT: "Credit correction", REVERSAL: "Credit reversed" };
const pager = (page, route, link) => `<nav class="wallet-pagination" aria-label="${route} pages"><span>${page.total ? page.offset + 1 : 0}–${page.offset + page.items.length} of ${page.total}</span><div>${page.offset ? link(`${route}/${Math.max(0, page.offset - page.limit)}`, "Previous", "text-link") : ""}${page.offset + page.items.length < page.total ? link(`${route}/${page.offset + page.limit}`, "Next", "text-link") : ""}</div></nav>`;

export function walletSummaryCard(wallet, error, { esc, link, moneyMinor }) {
  if (error) return `<article class="panel wallet-summary"><h2>Wallet</h2><p role="alert">${esc(error)}</p><button class="button outline small" data-retry>Retry wallet</button></article>`;
  if (!wallet) return "";
  return `<article class="panel wallet-summary"><div><p class="eyebrow">WALLET AVAILABLE</p><h2>${moneyMinor(wallet.availableMinor, wallet.currency)}</h2><p>${wallet.pendingTopUpsCount ? `${wallet.pendingTopUpsCount} top-up report(s) awaiting verification · ${moneyMinor(wallet.pendingTopUpsMinor, wallet.currency)} not yet available` : "Internal account credit for eligible service renewals."}</p>${wallet.reservedMinor ? `<p>${moneyMinor(wallet.reservedMinor, wallet.currency)} reserved for pending renewals.</p>` : ""}</div><div class="wallet-actions">${link("top-up", "Top Up Wallet ↗", "button small")}${link("transactions", "View Transactions", "button outline small")}</div></article>`;
}

export function serviceRenewalActions(service, aux, { esc, link, moneyMinor }) {
  const quote = aux.eligibility?.[service.id];
  const error = aux.eligibilityErrors?.[service.id];
  return `<div class="service-renewal"><div class="wallet-actions">${renewalReady(quote) ? link(`renew/${service.id}`, "Renew Plan ↗", "button small") : quote ? link(`renew/${service.id}`, "View renewal options", "text-link") : ""}${link("top-up", "Top Up Wallet", "text-link")}</div>${quote ? `<p class="subtle-note">Renewal price: ${quote.amountMinor === null ? "Unavailable" : moneyMinor(quote.amountMinor, quote.wallet.currency)} · Available wallet: ${moneyMinor(quote.wallet.availableMinor, quote.wallet.currency)}</p>` : error ? `<p class="subtle-note" role="alert">Renewal check unavailable: ${esc(error)}</p>` : ""}</div>`;
}

export function walletScreen(route, id, { aux, result, intents, esc, link, heading, details, moneyMinor, date, input }) {
  if (!walletRoutes.includes(route)) return null;
  const wallet = aux.wallet || aux.quote?.wallet;
  const money = n => moneyMinor(n, wallet?.currency || "NGN");
  const back = link("wallet", "← Wallet", "back");
  const preview = config.mode === "mock" ? `<details class="demo wallet-demo"><summary>SIMULATED development scenarios</summary><p>These fixed presentation states never change a live wallet. The top-up fixture uses ₦25,000.</p><div class="wallet-actions">${walletScenarios.map(name => `<button class="button outline small" data-wallet-scenario="${name}">${name}</button>`).join("")}</div></details>` : "";
  const balances = `<div class="wallet-balances"><article class="panel"><p>Available balance</p><h2>${money(wallet.availableMinor)}</h2><p>Ready for eligible renewals</p></article><article class="panel"><p>Reserved funds</p><h2>${money(wallet.reservedMinor)}</h2><p>Held for pending renewals</p></article><article class="panel"><p>Pending top-ups</p><h2>${money(wallet.pendingTopUpsMinor)}</h2><p>Awaiting Finance verification · not spendable</p></article></div>`;
  const records = (items, render, empty) => items.length ? `<div class="list">${items.map(render).join("")}</div>` : `<p class="subtle-note">${empty}</p>`;
  const topUps = (page) => records(page.items, t => `<div class="list-row wallet-record"><div><h3>${esc(t.reference)}</h3><small>${date(t.createdAt)} · ${esc(t.status.replaceAll("_", " "))}${t.simulated ? " · SIMULATED" : ""}</small></div><strong>${money(t.amountMinor)}</strong></div>`, "No wallet top-ups reported.");
  const renewals = (page) => records(page.items, r => link(`renewals/${r.id}`, `<div><h3>${esc(r.planName)}</h3><small>${date(r.createdAt)} · ${esc(renewalOutcome(r)[0])}${r.simulated ? " · SIMULATED" : ""}</small></div><strong>${money(r.amountMinor)} ↗</strong>`, "list-row wallet-record"), "No wallet-funded renewals.");
  if (route === "wallet") return heading("Wallet", "Verified internal account credit for eligible service renewals.") + simulation(wallet) + balances + `<div class="wallet-actions wallet-page-actions">${link("top-up", "Top Up Wallet ↗", "button")}${link("transactions", "View Transactions", "button outline")}</div><article class="panel"><div class="section-heading compact"><h2>Top-up reports</h2>${link("top-ups", "View all", "text-link")}</div>${topUps(aux.topUps)}</article><article class="panel"><div class="section-heading compact"><h2>Service renewals</h2>${link("renewals", "View all", "text-link")}</div>${renewals(aux.renewals)}</article><p class="subtle-note">Adding wallet funds does not activate or renew service. Choose and confirm each renewal separately. Wallet funds are internal account credits; withdrawals, transfers and external payments are not available.</p>` + preview;
  if (route === "transactions") {
    const delta = n => `${n > 0 ? "+" : ""}${money(n)}`;
    return back + heading("Wallet Transactions", "Recorded ledger activity. Reservations and released holds are separate from posted credits and debits.") + simulation(wallet) + `<article class="panel">${records(aux.entries.items, entry => `<div class="wallet-ledger-entry"><div class="row"><h3>${esc(kindNames[entry.kind] || entry.kind)}</h3><span class="pill">Recorded</span></div><p>${esc(entry.description)}</p>${details([["Date", date(entry.createdAt)], ["Reference", entry.reference], ...(entry.settlementPaymentId ? [["Settlement payment reference", entry.settlementPaymentId]] : []), ...(entry.kind === "SETTLEMENT_CREDIT" && entry.actorId === null ? [["Posted by", "System settlement"]] : []), ["Posted change", delta(entry.postedDeltaMinor)], ["Reserved change", delta(entry.reservedDeltaMinor)], ["Posted balance after entry", money(entry.postedAfterMinor)], ["Reserved after entry", money(entry.reservedAfterMinor)]])}${entry.renewalId ? link(`renewals/${entry.renewalId}`, "View related renewal", "text-link") : entry.topUpId ? link("top-ups", "View top-up reports", "text-link") : ""}${simulation(entry)}</div>`, "No wallet transactions yet.")}${pager(aux.entries, "transactions", link)}</article>` + preview;
  }
  if (route === "top-ups") return back + heading("Wallet Top-ups", "Manual reports become available after Finance verification. Verified provider settlements post directly to Wallet Transactions.") + simulation(wallet) + `<article class="panel">${topUps(aux.topUps)}${pager(aux.topUps, "top-ups", link)}</article>${link("top-up", "Top Up Wallet ↗", "button")}` + preview;
  if (route === "top-up") {
    if (config.standaloneDemo) return back + heading("Top Up Wallet", "Simulate settled funding using illustrative amounts. No actual payment is made.") + `<div class="wallet-top-up-layout"><div class="wallet-top-up-form"><form data-form="demo-funding" class="panel form-panel"><label>Illustrative settled amount<select name="demoAmount"><option value="1000000">₦10,000</option><option value="2000000">₦20,000</option><option value="3000000">₦30,000</option></select></label><p>This simulates a settled funding event and a fictional ledger credit. It does not initiate a payment, activate service or request renewal.</p><p class="form-error" role="alert"></p><button class="button" type="submit">Simulate settled funding ↗</button></form></div><aside class="panel wallet-payment-instructions"><h2>Payment instructions</h2><p>No bank details, checkout or provider connection is used in this standalone demonstration. Never enter real payment information.</p><p class="subtle-note">Funding and service status remain independent. Choose Renew Plan and confirm separately to demonstrate a renewal.</p></aside></div>`;
    const draft = result.walletDraft || intents.peek("top-up")?.payload;
    const review = draft ? `<article class="panel form-panel"><h2>Review top-up report</h2>${details([["Amount", money(draft.amountMinor)], ["Reference", draft.reference], ["Method", draft.method.replaceAll("_", " ")], ["Allocation", "Wallet credit after verification"]])}<p>No money is charged here. Reporting a payment does not increase your available balance.</p>${intents.peek("top-up") ? '<p class="notice">The earlier result is unconfirmed. Retry the same report or check top-up history.</p>' : ""}<form data-form="wallet-top-up-confirm"><label class="wallet-consent"><input type="checkbox" required> I confirm these details and want to submit this payment report.</label><p class="form-error" role="alert"></p><button class="button" type="submit">Confirm payment report ↗</button></form><div class="wallet-actions"><button class="button outline small" data-wallet-edit ${intents.peek("top-up") ? "disabled" : ""}>Edit details</button>${link("top-ups", "Check top-up history", "text-link")}</div></article>` : `<form data-form="wallet-top-up-review" class="panel form-panel">${input("amount", "Amount paid (NGN)", "text", 'inputmode="decimal" placeholder="e.g. 25000.00"')}${input("reference", "Payment reference", "text", 'minlength="3" maxlength="150"')}<label>Payment method<select name="method"><option value="BANK_TRANSFER">Bank transfer</option><option value="OTHER">Other</option></select></label><label>Payment evidence<textarea name="evidence" minlength="3" maxlength="2000" rows="4" required placeholder="Provide the payment date and relevant reference. Do not include passwords or card details."></textarea></label><p class="form-error" role="alert"></p><button class="button" type="submit">Review top-up report ↗</button></form>`;
    return back + heading("Top Up Wallet", "Report a payment intended for wallet credit, separately from order payments.") + simulation(wallet) + `<div class="wallet-top-up-layout"><div class="wallet-top-up-form">${review}</div><aside class="panel wallet-payment-instructions" aria-labelledby="wallet-instructions-heading"><h2 id="wallet-instructions-heading">Payment instructions</h2><p>${esc(wallet.topUpInstructions.notice)}</p><p class="subtle-note">Bank account details are not available here. Obtain instructions through an approved Ikonectt channel before making a payment.</p></aside></div>` + preview;
  }
  if (route === "renew") {
    const quote = aux.quote;
    const ready = renewalReady(quote);
    const pending = intents.peek(`renew:${id}`);
    const changed = pending && pending.payload.priceVersion !== quote.priceVersion;
    const warning = !ready ? renewalMessages(quote).map(message => `<p>${esc(message)}</p>`).join("") || "<p>A complete renewal quote is unavailable. Contact support.</p>" : "";
    return link(`services/${id}`, "← Service details", "back") + heading("Renew Plan", config.standaloneDemo ? "Review the illustrative renewal quote before reserving fictional wallet funds." : "Review the current backend-approved renewal quote before reserving wallet funds.") + simulation(quote) + `<article class="panel form-panel"><h2>${esc(quote.planName)}</h2>${details([["Plan speed", quote.speedMbps === null ? "Unavailable" : `${quote.speedMbps} Mbps`], ["Renewal amount", quote.amountMinor === null ? "Unavailable" : money(quote.amountMinor)], ["Available wallet", money(wallet.availableMinor)], ["Reserved funds", money(wallet.reservedMinor)], ["Current expiry", quote.currentEndsAt ? date(quote.currentEndsAt) : "Unavailable"], ["Expected expiry", quote.expectedEndsAt ? date(quote.expectedEndsAt) : "Unavailable"], ["Billing period", quote.billingDays ? `${quote.billingDays} days` : "Unavailable"]])}${warning ? `<div class="notice" role="status">${warning}</div>` : ""}${pending && (!ready || changed) ? `<form data-form="wallet-renew-retry" data-id="${esc(id)}"><p>Check the outcome of the renewal you already confirmed. This reuses the original request reference and quote; it does not accept a new price.</p><p class="form-error" role="alert"></p><button class="button outline" type="submit">Check previous request</button></form>` : ""}${ready && !changed ? `<form data-form="wallet-renew" data-id="${esc(id)}"><p>Confirmation reserves funds. Renewal completes only after an authorized service outcome is confirmed.</p><label class="wallet-consent"><input type="checkbox" required> I approve this quoted renewal and reservation of ${money(quote.amountMinor)}.</label><p class="form-error" role="alert"></p><button class="button" type="submit">Confirm and reserve funds ↗</button></form>` : changed ? '<p role="alert">An earlier renewal request is unconfirmed and its quote has changed. Check renewal history before submitting another request.</p>' : ""}<div class="wallet-actions">${link("top-up", "Top Up Wallet", "button outline small")}${link("renewals", "Check renewal history", "text-link")}<button class="button outline small" data-retry>Review current quote</button></div></article>` + preview;
  }
  if (aux.renewal) {
    const r = aux.renewal, outcome = renewalOutcome(r);
    return back + heading(outcome[0], outcome[1]) + simulation(r) + `<article class="panel"><h2>${esc(r.planName)}</h2>${details([["Renewal reference", r.id], ["Status", r.status.replaceAll("_", " ")], ["Amount", money(r.amountMinor)], ["Previous expiry", date(r.previousEndsAt)], ["Expected expiry", date(r.expectedEndsAt)], ["Confirmed expiry", r.confirmedEndsAt ? date(r.confirmedEndsAt) : "Not confirmed"], ["Available wallet", money(wallet.availableMinor)], ["Reserved funds", money(wallet.reservedMinor)], ["Provider mode", r.providerMode.toUpperCase()], ["Provider reference", r.providerReference || "Not supplied"]])}<div class="wallet-actions">${link(`services/${r.subscriptionId}`, "View Service", "button outline small")}${link(`orders/${r.orderId}`, "View related order", "text-link")}${link("transactions", "View Transactions", "text-link")}<button class="button outline small" data-retry>Refresh status</button></div></article>` + preview;
  }
  return back + heading("Wallet Renewals", "Track reservations, confirmed outcomes and requests awaiting staff review.") + simulation(wallet) + `<article class="panel">${renewals(aux.renewals)}${pager(aux.renewals, "renewals", link)}</article>` + preview;
}
