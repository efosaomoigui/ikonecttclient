import * as C from "./vendor/index";
import { z } from "zod";
export type Transport = <T>(path: string, options?: RequestInit) => Promise<T>;
export class CustomerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly requestId?: string,
  ) {
    super(message);
  }
}
export function createCustomerClient(
  base: string,
  getToken: () => string | undefined,
  onUnauthorized: () => void,
  transport?: Transport,
  timeoutMs = 12000,
) {
  const send =
    transport || C.createApiClient(base.replace(/\/api\/v1\/?$/, ""), getToken);
  async function request<S extends z.ZodTypeAny>(
    path: string,
    schema: S,
    method = "GET",
    body?: unknown,
  ): Promise<z.infer<S>> {
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await send<unknown>(path, {
        method,
        signal: controller.signal,
        cache: "no-store",
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const parsed = schema.safeParse(result);
      if (!parsed.success)
        throw new CustomerApiError(
          "The server returned an unexpected response. Please retry or contact support.",
          502,
          "CONTRACT_MISMATCH",
        );
      return parsed.data;
    } catch (error) {
      const e = error as Error & {
        status?: number;
        statusCode?: number;
        code?: string;
        requestId?: string;
      };
      const status = e.status || e.statusCode || 0;
      if (status === 401) onUnauthorized();
      if (e instanceof CustomerApiError) throw e;
      const uncertain = method === "POST" && path.startsWith("/me/");
      if (e.name === "AbortError")
        throw new CustomerApiError(
          uncertain
            ? "The result could not be confirmed. Check your account history before submitting again."
            : "The request timed out. Please try again.",
          0,
          "TIMEOUT",
        );
      throw new CustomerApiError(
        status
          ? e.message
          : uncertain
            ? "The result could not be confirmed. Check your account history before submitting again."
            : "We couldn’t reach Ikonectt. Check your connection and try again.",
        status,
        e.code || (status ? "API_ERROR" : "NETWORK_ERROR"),
        e.requestId,
      );
    } finally {
      clearTimeout(timer);
    }
  }
  function parse<S extends z.ZodTypeAny>(
    schema: S,
    input: unknown,
  ): z.infer<S> {
    const parsed = schema.safeParse(input);
    if (!parsed.success)
      throw new CustomerApiError(
        "Please check " +
          parsed.error.issues
            .map((issue) => issue.path.join(" ") || "the form")
            .filter((value, index, array) => array.indexOf(value) === index)
            .join(", ") +
          ".",
        400,
        "VALIDATION",
      );
    return parsed.data;
  }
  const query = (
    path: string,
    values: Record<string, string | number | undefined>,
  ) =>
    path +
    "?" +
    new URLSearchParams(
      Object.entries(values)
        .filter(
          (entry): entry is [string, string | number] => entry[1] !== undefined,
        )
        .map(([k, v]) => [k, String(v)]),
    );
  async function all<S extends z.ZodTypeAny>(
    path: string,
    schema: S,
    filters: Record<string, string> = {},
  ): Promise<z.infer<S>[]> {
    const records: z.infer<S>[] = [];
    let offset = 0;
    while (true) {
      const result = await request(
        query(path, { ...filters, offset, limit: 100 }),
        C.page(schema),
      );
      records.push(...result.items);
      offset += result.items.length;
      if (offset >= result.total || !result.items.length) return records;
    }
  }
  return {
    login: (input: C.Input<typeof C.LoginRequest>) =>
      request("/auth/login", C.Session, "POST", parse(C.LoginRequest, input)),
    session: () => request("/auth/session", C.Session.shape.principal),
    logout: () => request("/auth/logout", C.Ok, "POST"),
    recover: (input: C.Input<typeof C.RecoveryRequest>) =>
      request("/auth/recovery", C.Ok, "POST", parse(C.RecoveryRequest, input)),
    reset: (input: C.Input<typeof C.ResetPasswordRequest>) =>
      request(
        "/auth/reset-password",
        C.Ok,
        "POST",
        parse(C.ResetPasswordRequest, input),
      ),
    changePassword: (input: C.Input<typeof C.ChangePasswordRequest>) =>
      request(
        "/auth/change-password",
        C.Ok,
        "POST",
        parse(C.ChangePasswordRequest, input),
      ),
    profile: () => request("/me/profile", C.Customer),
    updateProfile: (input: C.Input<typeof C.UpdateProfileRequest>) =>
      request(
        "/me/profile",
        C.Customer,
        "PATCH",
        parse(C.UpdateProfileRequest, input),
      ),
    dashboard: () => request("/me/dashboard", C.Dashboard),
    subscriptions: () => all("/me/subscriptions", C.Subscription),
    plans: () => all("/plans", C.Plan),
    orders: () => all("/me/orders", C.Order),
    order: (id: string) => request("/me/orders/" + parse(C.Id, id), C.Order),
    createOrder: (input: C.Input<typeof C.CreateOrderRequest>) =>
      request(
        "/me/orders",
        C.Order,
        "POST",
        parse(C.CreateOrderRequest, input),
      ),
    payments: () => all("/me/payments", C.Payment),
    reportPayment: (input: C.Input<typeof C.ReportPaymentRequest>) =>
      request(
        "/me/payments",
        C.Payment,
        "POST",
        parse(C.ReportPaymentRequest, input),
      ),
    receipt: (id: string) =>
      request("/me/payments/" + parse(C.Id, id) + "/receipt", C.Receipt),
    tickets: () => all("/me/tickets", C.Ticket),
    ticket: (id: string) =>
      request("/me/tickets/" + parse(C.Id, id), C.TicketDetail),
    createTicket: (input: C.Input<typeof C.CreateTicketRequest>) =>
      request(
        "/me/tickets",
        C.TicketDetail,
        "POST",
        parse(C.CreateTicketRequest, input),
      ),
    reply: (id: string, input: C.Input<typeof C.TicketMessageRequest>) =>
      request(
        "/me/tickets/" + parse(C.Id, id) + "/messages",
        C.TicketMessage,
        "POST",
        parse(C.TicketMessageRequest, input),
      ),
    notifications: () => all("/me/notifications", C.Notification),
    locations: (filters: Record<string, string> = {}) =>
      all("/coverage/locations", C.CoverageLocation, filters),
    coverage: (input: C.Input<typeof C.CoverageCheckRequest>) =>
      request(
        "/coverage/check",
        C.CoverageResult,
        "POST",
        parse(C.CoverageCheckRequest, input),
      ),
    capabilities: () => request("/capabilities", z.record(z.string())),
    guidance: (message: string) =>
      request(
        "/assistant/guidance",
        C.AssistantResponse,
        "POST",
        parse(C.AssistantRequest, { message }),
      ),
    wallet: () => request("/me/wallet", C.WalletSummary),
    walletTransactions: (offset = 0, limit = 25) =>
      request(query("/me/wallet/transactions", parse(C.ListQuery, { offset, limit })), C.page(C.WalletEntry)),
    walletTopUps: (offset = 0, limit = 25) =>
      request(query("/me/wallet/top-ups", parse(C.ListQuery, { offset, limit })), C.page(C.WalletTopUp)),
    reportWalletTopUp: (input: C.Input<typeof C.ReportWalletTopUpRequest>) =>
      request("/me/wallet/top-ups", C.WalletTopUp, "POST", parse(C.ReportWalletTopUpRequest, input)),
    walletRenewals: (offset = 0, limit = 25) =>
      request(query("/me/wallet/renewals", parse(C.ListQuery, { offset, limit })), C.page(C.WalletRenewal)),
    walletRenewal: (id: string) => request("/me/wallet/renewals/" + parse(C.Id, id), C.WalletRenewal),
    renewalEligibility: (id: string) =>
      request("/me/subscriptions/" + parse(C.Id, id) + "/renewal-eligibility", C.RenewalEligibility),
    requestWalletRenewal: (id: string, input: C.Input<typeof C.WalletRenewalRequest>) =>
      request("/me/subscriptions/" + parse(C.Id, id) + "/wallet-renewals", C.WalletRenewal, "POST", parse(C.WalletRenewalRequest, input)),
  };
}
