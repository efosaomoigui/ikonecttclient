import { config } from "./config.js";
import { fixture, rawFixture, demoCredentials } from "./fixtures.js";
import { createLiveAdapter, receiptView } from "./live.js";
import * as C from "./generated/contracts.js";
import { createMockWallet } from "./wallet-fixtures.js";
/** @typedef {import('./types').PortalAdapter} PortalAdapter */
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
/** @returns {PortalAdapter} */
export function createMockAdapter(storage = globalThis.sessionStorage) {
  let authenticated = false,
    password = demoCredentials.password,
    resetUsed = false;
  let tickets = structuredClone(fixture.tickets),
    profile = structuredClone(fixture.profile),
    orders = structuredClone(rawFixture.orders),
    payments = structuredClone(rawFixture.payments);
  const guard = () => {
    if (!authenticated)
      throw new ApiError("Your session has ended. Please sign in again.", 401);
  };
  const wallet = createMockWallet(guard);
  return {
    ...wallet,
    async session() {
      guard();
      return structuredClone(profile);
    },
    async login(accountNumber, value) {
      await new Promise((r) => setTimeout(r, 350));
      if (accountNumber !== demoCredentials.accountNumber || value !== password)
        throw new ApiError("The account number or password is incorrect.", 401);
      authenticated = true;
      storage?.setItem("ikonectt-demo-session", "active");
      return structuredClone(profile);
    },
    async resume() {
      authenticated = storage?.getItem("ikonectt-demo-session") === "active";
      return this.session();
    },
    async logout() {
      authenticated = false;
      storage?.removeItem("ikonectt-demo-session");
    },
    async recover() {
      return {
        message:
          "If the account is eligible, recovery instructions will be sent to its registered contact.",
      };
    },
    async resetPassword(token, next) {
      if (resetUsed || token !== "DEMO-RESET-TOKEN")
        throw new ApiError(
          "This recovery code is invalid or expired. Request a new one.",
        );
      if (next.length < 12) throw new ApiError("Use at least 12 characters.");
      password = next;
      resetUsed = true;
      await this.logout();
    },
    async summary() {
      guard();
      return structuredClone({
        ...fixture,
        services: fixture.services.map(s => ({ ...s, renewalDate: wallet.walletFixtureEndsAt || s.renewalDate })),
        profile,
        tickets,
        orders,
        payments: payments.map((p) => ({
          ...p,
          amount: p.amountMinor / 100,
          status: p.status,
          receiptAvailable: p.status === "CONFIRMED",
        })),
      });
    },
    async createTicket(input) {
      guard();
      const t = {
        ...input,
        id: crypto.randomUUID(),
        reference: `SUP-${Date.now().toString().slice(-6)}`,
        status: "Open",
        createdAt: new Date().toISOString(),
        updates: [
          {
            at: new Date().toISOString(),
            message: "Your request has been received.",
          },
        ],
      };
      tickets.unshift(t);
      return structuredClone(t);
    },
    async changePassword(current, next) {
      guard();
      if (current !== password)
        throw new ApiError("The current password is incorrect.");
      if (next.length < 12) throw new ApiError("Use at least 12 characters.");
      password = next;
      await this.logout();
    },
    async updateProfile(phone) {
      guard();
      C.UpdateProfileRequest.parse({ phone });
      profile.phone = phone;
      return structuredClone(profile);
    },
    async plans() {
      guard();
      return structuredClone(rawFixture.plans);
    },
    async orders() {
      guard();
      return structuredClone(orders);
    },
    async order(id) {
      guard();
      const o = orders.find((o) => o.id === id);
      if (!o) throw new ApiError("Order not found", 404);
      return structuredClone(o);
    },
    async createOrder(input) {
      guard();
      const i = C.CreateOrderRequest.parse(input);
      const p = rawFixture.plans.find((p) => p.id === i.planId);
      if (!p) throw new ApiError("Published plan not found");
      const o = C.Order.parse({
        ...rawFixture.orders[0],
        ...i,
        id: crypto.randomUUID(),
        subscriptionId: i.subscriptionId || null,
        status: "PENDING_PAYMENT",
        planName: p.name,
        amountMinor: p.priceMinor,
        currency: p.currency,
        createdAt: new Date().toISOString(),
      });
      orders.unshift(o);
      return structuredClone(o);
    },
    async reportPayment(input) {
      guard();
      const i = C.ReportPaymentRequest.parse(input);
      const p = C.Payment.parse({
        ...rawFixture.payments[0],
        ...i,
        id: crypto.randomUUID(),
        status: "REPORTED",
        verifiedAt: null,
        createdAt: new Date().toISOString(),
      });
      payments.unshift(p);
      return structuredClone(p);
    },
    async receipt(id) {
      guard();
      const r = rawFixture.receipts.find((r) => r.payment.id === id);
      if (!r)
        throw new ApiError(
          "Receipt is available only for confirmed payment",
          409,
        );
      return receiptView(r);
    },
    async ticket(id) {
      guard();
      const t = tickets.find((t) => t.id === id);
      if (!t) throw new ApiError("Request not found", 404);
      return structuredClone(t);
    },
    async reply(id, message) {
      guard();
      C.TicketMessageRequest.parse({ message });
      const t = tickets.find((t) => t.id === id);
      if (!t) throw new ApiError("Request not found", 404);
      const at = new Date().toISOString();
      t.updates.push({ at, message });
      return {
        id: crypto.randomUUID(),
        ticketId: id,
        authorId: profile.id,
        message,
        createdAt: at,
      };
    },
    async locations() {
      guard();
      return [
        C.CoverageLocation.parse({
          id: rawFixture.customer.buildingId,
          name: "SIMULATED development building",
          level: "BUILDING_ADDRESS",
          parentId: null,
          eligibility: "UNKNOWN",
          planIds: [],
          evidence: null,
          simulated: true,
          verifiedAt: null,
        }),
      ];
    },
    async checkCoverage(input) {
      guard();
      C.CoverageCheckRequest.parse(input);
      return C.CoverageResult.parse({
        buildingId: input.buildingId,
        eligibility: "UNKNOWN",
        planIds: [],
        simulated: true,
        source: "SIMULATED",
        checkedAt: new Date().toISOString(),
      });
    },
    async providerCapabilities() {
      return {
        payments: "simulated",
        provisioning: "simulated",
        coverage: "simulated",
        email: "simulated",
        sms: "simulated",
        usage: "not-connected",
        ai: "guidance-only-no-model",
      };
    },
    async guidance(message) {
      C.AssistantRequest.parse({ message });
      return {
        answer:
          "SIMULATED read-only guidance. Contact support for account or payment assistance.",
        links: [{ label: "Contact support", path: "/me/tickets" }],
        escalationAvailable: true,
        sensitiveActionsAllowed: false,
        simulated: true,
      };
    },
    capabilities: { notifications: false, chat: false, guidance: true },
  };
}
export { createLiveAdapter } from "./live.js";
export const api =
  config.mode === "mock" ? createMockAdapter() : createLiveAdapter();
