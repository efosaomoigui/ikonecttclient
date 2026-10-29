// Paths and wire shapes from Agent 1 contracts v1.0.0, contracts/index.ts + README.md.
// This frontend view model deliberately keeps internal customer IDs off customer screens.
import { config } from "./config.js";
import { createCustomerClient } from "./generated/contracts.js";
const title = (value) =>
  String(value ?? "Unknown")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());
export function profileView(c) {
  return { ...c, customerType: title(c.kind), address: null };
}
export function customerGreeting(name) {
  const value = String(name ?? "").trim();
  if (!value || /\b(simulated|development|demo|fixture|test|stage\s*\d+)\b/i.test(value))
    return "Welcome back";
  return `Hello, ${value.split(/\s+/)[0]}`;
}
export function ticketView(t) {
  const messages = t.messages || [];
  return {
    id: t.id,
    reference: `Request ${t.id.slice(0, 8)}`,
    subject: t.subject,
    category: null,
    status: title(t.status),
    createdAt: t.createdAt,
    description: messages[0]?.message || "No request message is available.",
    updates: messages.map((m) => ({ at: m.createdAt, message: m.message })),
  };
}
export function summaryView({
  customer,
  subscriptions,
  plans,
  orders,
  payments,
  tickets,
  receipts,
  notifications = [],
  providerCapabilities = {},
}) {
  return {
    profile: profileView(customer),
    pendingOrders: orders.filter(
      (o) => !["COMPLETED", "CANCELLED"].includes(o.status),
    ).length,
    services: subscriptions.map((s) => {
      const p = plans.find((p) => p.id === s.planId);
      return {
        id: s.id,
        buildingId: s.buildingId,
        planId: s.planId,
        name: title(customer.kind) + " internet",
        plan: p?.name || "Your subscribed plan",
        speedMbps: p?.speedMbps ?? null,
        status: title(s.status),
        address: null,
        renewalDate: s.endsAt,
        monthlyAmount: p ? p.priceMinor / 100 : null,
        billingDays: p?.billingDays ?? null,
        currency: p?.currency || "NGN",
        usage: null,
        simulated: s.simulated,
      };
    }),
    bills: [],
    orders,
    payments: payments.map((p) => ({
      ...p,
      amount: p.amountMinor / 100,
      status: title(p.status),
      receiptAvailable: p.status === "CONFIRMED",
    })),
    receipts: receipts
      .map((r) => receiptView(r, orders))
      .sort((a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt)),
    tickets: tickets
      .map(ticketView)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    notifications,
    providerCapabilities,
    simulated:
      customer.accountNumberSimulated ||
      subscriptions.some((s) => s.simulated) ||
      orders.some((o) => plans.some((p) => p.id === o.planId && p.simulated)),
  };
}
export function receiptView(r, orders = []) {
  return {
    id: r.payment.id,
    reference: r.receiptNumber,
    billReference: r.payment.orderId,
    description:
      orders.find((o) => o.id === r.payment.orderId)?.planName ||
      "Service payment",
    amount: r.payment.amountMinor / 100,
    currency: r.payment.currency,
    status: "Verified",
    paidAt: r.issuedAt,
    method: title(r.payment.method),
  };
}
export function createLiveAdapter({ base = config.apiBase, transport } = {}) {
  let token, principal, expiryTimer, snapshot;
  let summaryVersion = 0;
  const capabilities = { notifications: true, chat: false, guidance: false };
  const clear = () => {
    token = undefined;
    principal = undefined;
    snapshot = undefined;
    summaryVersion++;
    clearTimeout(expiryTimer);
  };
  const expired = () => {
    const hadToken = !!token;
    clear();
    if (hadToken && typeof globalThis.dispatchEvent === "function")
      globalThis.dispatchEvent(new Event("ikonectt:session-expired"));
  };
  const client = createCustomerClient(
    base,
    () => token,
    expired,
    transport,
    config.timeoutMs,
  );
  const account = async () => {
    principal = await client.session();
    if (principal.mustChangePassword)
      return {
        name: "Your account",
        accountNumber: "",
        mustChangePassword: true,
      };
    return profileView(await client.profile());
  };
  return {
    capabilities,
    async login(accountNumber, password) {
      snapshot = undefined;
      summaryVersion++;
      const session = await client.login({ accountNumber, password });
      if (session.principal.kind !== "CUSTOMER")
        throw new Error("Please use a customer account to access My Ikonectt.");
      token = session.accessToken;
      principal = session.principal;
      clearTimeout(expiryTimer);
      expiryTimer = setTimeout(
        expired,
        Math.max(0, Date.parse(session.expiresAt) - Date.now()),
      );
      expiryTimer.unref?.();
      if (principal.mustChangePassword)
        return {
          name: "Your account",
          accountNumber,
          mustChangePassword: true,
        };
      return profileView(await client.profile());
    },
    session: account,
    async resume() {
      if (!token)
        throw Object.assign(new Error("Please sign in to continue."), {
          status: 401,
        });
      return account();
    },
    async logout() {
      try {
        if (token) await client.logout();
      } finally {
        clear();
      }
    },
    async recover(accountNumber) {
      await client.recover({ accountNumber });
      return {
        message:
          "If the account is eligible, recovery instructions will be sent to its registered contact.",
      };
    },
    async resetPassword(resetToken, password) {
      await client.reset({ token: resetToken, password });
      clear();
    },
    async changePassword(currentPassword, password) {
      await client.changePassword({ currentPassword, password });
      clear();
    },
    async summary(route = "overview", profile) {
      const tick = ++summaryVersion;
      const next = {
        subscriptions: [], plans: [], orders: [], payments: [], tickets: [],
        receipts: [], notifications: [], providerCapabilities: {}, ...snapshot,
      };
      if (profile) next.customer = profile;
      const resources = {
        subscriptions: () => client.subscriptions(),
        plans: () => client.plans(),
        orders: () => client.orders(),
        payments: () => client.payments(),
        tickets: () => client.tickets(),
        notifications: () => client.notifications(),
        providerCapabilities: () => client.capabilities(),
      };
      const groups = {
        overview: Object.keys(resources),
        services: ["subscriptions", "plans", "orders"],
        orders: ["subscriptions", "plans", "orders"],
        billing: ["orders", "payments"],
        "payment-report": ["orders"],
        support: ["tickets"],
        notifications: ["notifications"],
      };
      const required = groups[route] || [];
      await Promise.all([
        ...required.map(async (key) => { next[key] = await resources[key](); }),
        ...(!profile ? [client.dashboard().then((dashboard) => { next.customer = dashboard.customer; })] : []),
      ]);
      if (required.includes("providerCapabilities"))
        capabilities.guidance = next.providerCapabilities.ai === "guidance-only-no-model";
      if (required.includes("payments")) next.receipts = (
        await Promise.all(
          next.payments
            .filter((p) => p.status === "CONFIRMED")
            .map((p) =>
              client.receipt(p.id).catch((e) => {
                if (e.status === 409) return null;
                throw e;
              }),
            ),
        )
      ).filter(Boolean);
      if (tick === summaryVersion) snapshot = next;
      return summaryView(next);
    },
    async updateProfile(phone) {
      return profileView(await client.updateProfile({ phone }));
    },
    plans: () => client.plans(),
    orders: () => client.orders(),
    order: (id) => client.order(id),
    createOrder: (input) => client.createOrder(input),
    reportPayment: (input) => client.reportPayment(input),
    async receipt(id) {
      return receiptView(await client.receipt(id));
    },
    async ticket(id) {
      return ticketView(await client.ticket(id));
    },
    async createTicket(input) {
      return ticketView(
        await client.createTicket({
          subject: input.subject,
          message: input.description,
        }),
      );
    },
    reply: (id, message) => client.reply(id, { message }),
    locations: (filters) => client.locations(filters),
    checkCoverage: (input) => client.coverage(input),
    async providerCapabilities() {
      const result = await client.capabilities();
      capabilities.guidance = result.ai === "guidance-only-no-model";
      return result;
    },
    guidance: (message) => client.guidance(message),
    wallet: () => client.wallet(),
    walletTransactions: (offset, limit) => client.walletTransactions(offset, limit),
    walletTopUps: (offset, limit) => client.walletTopUps(offset, limit),
    reportWalletTopUp: (input) => client.reportWalletTopUp(input),
    walletRenewals: (offset, limit) => client.walletRenewals(offset, limit),
    walletRenewal: (id) => client.walletRenewal(id),
    renewalEligibility: (id) => client.renewalEligibility(id),
    requestWalletRenewal: (id, input) => client.requestWalletRenewal(id, input),
  };
}
