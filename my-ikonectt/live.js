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
  let token, principal, expiryTimer;
  const capabilities = { notifications: true, chat: false, guidance: false };
  const clear = () => {
    token = undefined;
    principal = undefined;
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
    async summary() {
      const [
        dashboard,
        subscriptions,
        plans,
        orders,
        payments,
        tickets,
        notifications,
        providerCapabilities,
      ] = await Promise.all([
        client.dashboard(),
        client.subscriptions(),
        client.plans(),
        client.orders(),
        client.payments(),
        client.tickets(),
        client.notifications(),
        client.capabilities(),
      ]);
      capabilities.guidance =
        providerCapabilities.ai === "guidance-only-no-model";
      const receipts = (
        await Promise.all(
          payments
            .filter((p) => p.status === "CONFIRMED")
            .map((p) =>
              client.receipt(p.id).catch((e) => {
                if (e.status === 409) return null;
                throw e;
              }),
            ),
        )
      ).filter(Boolean);
      return summaryView({
        customer: dashboard.customer,
        subscriptions,
        plans,
        orders,
        payments,
        tickets,
        receipts,
        notifications,
        providerCapabilities,
      });
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
  };
}
