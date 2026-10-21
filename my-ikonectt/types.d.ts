import type * as C from "./vendor/index";
// Presentation models derived from the authoritative, pinned API wire schemas.
export type Profile = C.CustomerProfile & {
  customerType: string;
  address: string | null;
};
export type AuthProfile =
  | Profile
  | { name: string; accountNumber: string; mustChangePassword: true };
export type Service = Pick<
  C.SubscriptionContract,
  "id" | "buildingId" | "planId" | "simulated"
> & {
  name: string;
  plan: string;
  speedMbps: number | null;
  status: string;
  address: string | null;
  renewalDate: string | null;
  monthlyAmount: number | null;
  currency: string;
  usage: null;
};
export interface Bill {
  id: string;
  reference: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
}
export interface Receipt {
  id: string;
  reference: string;
  billReference: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  method: string;
}
export interface TicketInput {
  subject: string;
  description: string;
}
export type Ticket = Pick<C.TicketContract, "id" | "subject" | "createdAt"> & {
  reference: string;
  description: string;
  category?: null;
  status: string;
  updates: { at: string; message: string }[];
};
export type PaymentView = Omit<C.PaymentContract, "status"> & {
  amount: number;
  status: string;
  receiptAvailable: boolean;
};
export interface Summary {
  profile: Profile;
  services: Service[];
  bills: Bill[];
  receipts: Receipt[];
  tickets: Ticket[];
  orders: C.OrderContract[];
  payments: PaymentView[];
  simulated: boolean;
  notifications: C.Input<typeof C.Notification>[];
  providerCapabilities: Record<string, string>;
}
export interface PortalAdapter {
  session(): Promise<AuthProfile>;
  resume(): Promise<AuthProfile>;
  login(accountNumber: string, password: string): Promise<AuthProfile>;
  logout(): Promise<void>;
  recover(accountNumber: string): Promise<{ message: string }>;
  resetPassword(token: string, password: string): Promise<void>;
  changePassword(current: string, next: string): Promise<void>;
  summary(route?: string, profile?: Profile): Promise<Summary>;
  updateProfile(phone: string): Promise<Profile>;
  plans(): Promise<C.PlanContract[]>;
  orders(): Promise<C.OrderContract[]>;
  order(id: string): Promise<C.OrderContract>;
  createOrder(
    input: C.Input<typeof C.CreateOrderRequest>,
  ): Promise<C.OrderContract>;
  reportPayment(
    input: C.Input<typeof C.ReportPaymentRequest>,
  ): Promise<C.PaymentContract>;
  receipt(id: string): Promise<Receipt>;
  ticket(id: string): Promise<Ticket>;
  createTicket(input: TicketInput): Promise<Ticket>;
  reply(id: string, message: string): Promise<C.Input<typeof C.TicketMessage>>;
  locations(
    filters?: Record<string, string>,
  ): Promise<C.Input<typeof C.CoverageLocation>[]>;
  checkCoverage(
    input: C.Input<typeof C.CoverageCheckRequest>,
  ): Promise<C.Input<typeof C.CoverageResult>>;
  providerCapabilities(): Promise<Record<string, string>>;
  guidance(message: string): Promise<C.Input<typeof C.AssistantResponse>>;
  wallet(): Promise<C.Input<typeof C.WalletSummary>>;
  walletTransactions(offset?: number, limit?: number): Promise<C.Input<ReturnType<typeof C.page<typeof C.WalletEntry>>>>;
  walletTopUps(offset?: number, limit?: number): Promise<C.Input<ReturnType<typeof C.page<typeof C.WalletTopUp>>>>;
  reportWalletTopUp(input: C.Input<typeof C.ReportWalletTopUpRequest>): Promise<C.Input<typeof C.WalletTopUp>>;
  walletRenewals(offset?: number, limit?: number): Promise<C.Input<ReturnType<typeof C.page<typeof C.WalletRenewal>>>>;
  walletRenewal(id: string): Promise<C.Input<typeof C.WalletRenewal>>;
  renewalEligibility(id: string): Promise<C.Input<typeof C.RenewalEligibility>>;
  requestWalletRenewal(id: string, input: C.Input<typeof C.WalletRenewalRequest>): Promise<C.Input<typeof C.WalletRenewal>>;
  previewWalletScenario?(scenario: string): Promise<void>;
  capabilities: { notifications: boolean; chat: boolean; guidance: boolean };
}
