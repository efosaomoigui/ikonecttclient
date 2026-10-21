import { z } from 'zod';

export const API_VERSION = '1.2.0';
export const API_PREFIX = '/api/v1';
export const Id = z.string().uuid();
const Text = z.string().trim().min(1).max(250);
export const Password = z.string().min(12).max(128);
export const CustomerKind = z.enum(['RESIDENTIAL', 'BUSINESS']);
export const CustomerStatus = z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']);
export const Role = z.enum(['ADMIN', 'SUPPORT', 'SALES', 'FINANCE', 'PROVISIONER', 'EXECUTIVE']);
export const CoverageLevel = z.enum(['COUNTRY', 'STATE', 'CITY_LGA', 'DISTRICT_AREA', 'STREET_ESTATE', 'BUILDING_ADDRESS']);
export const Eligibility = z.enum(['AVAILABLE', 'UNAVAILABLE', 'PLANNED', 'REQUIRES_REVIEW', 'UNKNOWN']);
export const OrderStatus = z.enum(['PENDING_PAYMENT', 'PAID', 'FULFILLING', 'COMPLETED', 'CANCELLED']);
export const SubscriptionStatus = z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'FAILED', 'REQUIRES_REVIEW']);
export const PaymentStatus = z.enum(['REPORTED', 'CONFIRMED', 'REJECTED']);
export const TicketStatus = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const LeadStatus = z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED']);
export const Money = z.number().int().nonnegative().max(1_000_000_000_000);
export const ListQuery = z.object({ offset: z.coerce.number().int().min(0).default(0), limit: z.coerce.number().int().min(1).max(100).default(25) }).strict();
export const LoginRequest = z.object({ accountNumber: Text, password: z.string().min(1).max(128) }).strict();
export const StaffLoginRequest = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) }).strict();
export const RecoveryRequest = z.object({ accountNumber: Text }).strict();
export const StaffRecoveryRequest = z.object({ email: z.string().email().max(254) }).strict();
export const ResetPasswordRequest = z.object({ token: z.string().min(32).max(200), password: Password }).strict();
export const ChangePasswordRequest = z.object({ currentPassword: z.string().min(1).max(128), password: Password }).strict();
export const CreateCustomerRequest = z.object({ kind: CustomerKind, name: Text, email: z.string().email().max(254), phone: z.string().trim().min(7).max(30), accountNumber: z.string().trim().min(4).max(40).regex(/^[A-Za-z0-9-]+$/).optional(), buildingId: Id.optional() }).strict();
export const UpdateCustomerRequest = CreateCustomerRequest.omit({ accountNumber: true }).partial().extend({ accountNumber: z.string().min(4).max(40).regex(/^[A-Za-z0-9-]+$/).optional(), status: CustomerStatus.optional() }).strict();
export const UpdateProfileRequest = z.object({ phone: z.string().trim().min(7).max(30) }).strict();
export const CreateStaffRequest = z.object({ name: Text, email: z.string().email().max(254), password: Password, roles: z.array(Role).min(1).max(6) }).strict();
export const UpdateStaffRequest = z.object({ roles: z.array(Role).min(1).max(6).optional(), enabled: z.boolean().optional() }).strict();
export const PlanInput = z.object({ code: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/), name: Text, kind: CustomerKind, priceMinor: Money.positive(), currency: z.literal('NGN').default('NGN'), speedMbps: z.number().int().positive().max(100000), billingDays: z.number().int().min(1).max(366).default(30), features: z.array(Text).max(30).default([]), published: z.boolean().default(false), renewalPriceMinor: Money.positive().nullable().optional() }).strict();
export const PlanUpdate = PlanInput.partial().strict();
export const CoverageInput = z.object({ name: Text, level: CoverageLevel, parentId: Id.optional(), eligibility: Eligibility.default('UNKNOWN'), planIds: z.array(Id).max(100).default([]), evidence: z.string().max(1000).optional() }).strict();
export const CoverageUpdate = z.object({ eligibility: Eligibility, planIds: z.array(Id).max(100), evidence: z.string().trim().min(3).max(1000) }).strict();
export const CoverageQuery = z.object({ parentId: Id.optional(), level: CoverageLevel.optional() }).merge(ListQuery);
export const CoverageCheckRequest = z.object({ buildingId: Id, planId: Id.optional() }).strict();
export const CreateLeadRequest = z.object({ name: Text, email: z.string().email().max(254), phone: z.string().min(7).max(30), kind: CustomerKind, message: z.string().trim().min(3).max(4000), planId: Id.optional(), buildingId: Id.optional(), consent: z.literal(true) }).strict();
export const UpdateLeadRequest = z.object({ status: LeadStatus, customerId: Id.optional() }).strict();
export const CreateOrderRequest = z.object({ planId: Id, buildingId: Id, type: z.enum(['NEW_CONNECTION', 'RENEWAL', 'PLAN_CHANGE']).default('NEW_CONNECTION'), subscriptionId: Id.optional() }).strict();
export const StaffOrderRequest = CreateOrderRequest.extend({ customerId: Id }).strict();
export const ReportPaymentRequest = z.object({ orderId: Id, amountMinor: Money.positive(), currency: z.literal('NGN'), reference: z.string().trim().min(3).max(150), method: z.enum(['BANK_TRANSFER', 'OTHER']), evidence: z.string().trim().min(3).max(2000) }).strict();
export const VerifyPaymentRequest = z.object({ decision: z.enum(['CONFIRMED', 'REJECTED']), evidence: z.string().trim().min(3).max(2000) }).strict();
export const ProvisionRequest = z.object({ orderId: Id }).strict();
export const ProvisionResultRequest = z.object({ status: z.enum(['ACTIVE', 'FAILED', 'REQUIRES_REVIEW']), reference: z.string().trim().min(3).max(150), evidence: z.string().trim().min(3).max(2000) }).strict();
export const CreateTicketRequest = z.object({ subject: Text, message: z.string().trim().min(3).max(4000), subscriptionId: Id.optional() }).strict();
export const UpdateTicketRequest = z.object({ status: TicketStatus, assignedToId: Id.optional() }).strict();
export const TicketMessageRequest = z.object({ message: z.string().trim().min(1).max(4000) }).strict();
export const ExternalReferenceRequest = z.object({ system: Text, externalId: Text }).strict();
export const AssistantRequest = z.object({ message: z.string().trim().min(1).max(1000) }).strict();

// Response schemas deliberately exclude credentials, tokens, internal payment evidence and staff-only notes.
export const Customer = z.object({ id: Id, accountNumber: z.string(), accountNumberSimulated: z.boolean(), kind: CustomerKind, name: z.string(), email: z.string(), phone: z.string(), status: CustomerStatus, buildingId: Id.nullable(), createdAt: z.string().datetime() });
export const Plan = PlanInput.extend({ id: Id, simulated: z.boolean(), createdAt: z.string().datetime(), updatedAt: z.string().datetime() });
export const CoverageLocation = CoverageInput.extend({ id: Id, parentId: Id.nullable(), evidence: z.string().nullable(), simulated: z.boolean(), verifiedAt: z.string().datetime().nullable() });
export const CoverageResult = z.object({ buildingId: Id, eligibility: Eligibility, planIds: z.array(Id), simulated: z.boolean(), source: z.enum(['NATIVE', 'SIMULATED']), checkedAt: z.string().datetime() });
export const Order = z.object({ id: Id, customerId: Id, planId: Id, buildingId: Id, type: z.enum(['NEW_CONNECTION', 'RENEWAL', 'PLAN_CHANGE']), fundingSource: z.enum(['ORDER_PAYMENT','WALLET']).optional(), subscriptionId: Id.nullable(), status: OrderStatus, amountMinor: Money, currency: z.string(), planName: z.string(), billingDays: z.number().int(), createdAt: z.string().datetime() });
export const Payment = z.object({ id: Id, orderId: Id, customerId: Id, amountMinor: Money, currency: z.string(), method: z.string(), reference: z.string(), status: PaymentStatus, verifiedAt: z.string().datetime().nullable(), createdAt: z.string().datetime() });
export const AdminPayment = Payment.extend({ evidence: z.string(), verificationEvidence: z.string().nullable(), verifiedById: Id.nullable() });
export const Receipt = z.object({ receiptNumber: z.string(), payment: Payment, issuedAt: z.string().datetime() });
export const Subscription = z.object({ id: Id, customerId: Id, planId: Id, buildingId: Id, status: SubscriptionStatus, startsAt: z.string().datetime().nullable(), endsAt: z.string().datetime().nullable(), externalServiceId: z.string().nullable(), simulated: z.boolean(), renewalEnabled: z.boolean().optional() });
export const Ticket = z.object({ id: Id, customerId: Id, subscriptionId: Id.nullable(), subject: z.string(), status: TicketStatus, assignedToId: Id.nullable(), createdAt: z.string().datetime() });
export const TicketMessage = z.object({ id: Id, ticketId: Id, authorId: Id, message: z.string(), createdAt: z.string().datetime() });
export const TicketDetail = Ticket.extend({ messages: z.array(TicketMessage) });
export const Lead = z.object({ id: Id, name: z.string(), email: z.string(), phone: z.string(), kind: CustomerKind, message: z.string(), planId: Id.nullable(), buildingId: Id.nullable(), customerId: Id.nullable(), status: LeadStatus, consent: z.boolean(), createdAt: z.string().datetime() });
export const Staff = z.object({ id: Id, name: z.string(), email: z.string(), roles: z.array(Role), enabled: z.boolean(), createdAt: z.string().datetime() });
export const Session = z.object({ accessToken: z.string(), tokenType: z.literal('Bearer'), expiresAt: z.string().datetime(), principal: z.object({ id: Id, kind: z.enum(['STAFF', 'CUSTOMER']), customerId: Id.nullable(), roles: z.array(Role), mustChangePassword: z.boolean() }) });
export const Ok = z.object({ ok: z.literal(true) });
export const Notification = z.object({ id: Id, channel: z.enum(['EMAIL', 'SMS']), template: z.string(), status: z.enum(['QUEUED', 'SENT', 'FAILED', 'SIMULATED']), attempts: z.number().int(), simulated: z.boolean(), createdAt: z.string().datetime() });
export const Dashboard = z.object({ customer: Customer, subscriptions: z.array(Subscription), pendingOrders: z.number().int(), openTickets: z.number().int(), usage: z.null(), usageStatus: z.literal('EXTERNAL_PROVIDER_NOT_CONNECTED') });
export const Report = z.object({ customers: z.number().int(), leads: z.number().int(), orders: z.number().int(), openTickets: z.number().int(), confirmedPaymentsMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), currency: z.literal('NGN'), subscriptionsByStatus: z.array(z.object({ status: SubscriptionStatus, count: z.number().int() })), includesSimulatedData: z.boolean() });
export const Provisioning = z.object({ id: Id, orderId: Id, subscriptionId: Id, status: z.enum(['PENDING', 'ACTIVE', 'FAILED', 'REQUIRES_REVIEW']), mode: z.string(), reference: z.string().nullable(), simulated: z.boolean(), createdAt: z.string().datetime() });
export const Audit = z.object({ id: Id, actorId: Id.nullable(), action: z.string(), entityType: z.string(), entityId: z.string(), metadata: z.record(z.unknown()), createdAt: z.string().datetime() });
export const ExternalReference = ExternalReferenceRequest.extend({ id: Id, customerId: Id, createdAt: z.string().datetime() });
export const AssistantResponse = z.object({ answer: z.string(), links: z.array(z.object({ label: z.string(), path: z.string() })), escalationAvailable: z.literal(true), sensitiveActionsAllowed: z.literal(false), simulated: z.boolean() });
export const ErrorResponse = z.object({ statusCode: z.number().int(), code: z.string(), message: z.string(), requestId: z.string(), details: z.unknown().optional() });
export const page = <T extends z.ZodTypeAny>(item: T) => z.object({ items: z.array(item), total: z.number().int(), offset: z.number().int(), limit: z.number().int() });

export type LoginInput = z.infer<typeof LoginRequest>;
export type CustomerProfile = z.infer<typeof Customer>;
export type PlanContract = z.infer<typeof Plan>;
export type SessionContract = z.infer<typeof Session>;
export type DashboardContract = z.infer<typeof Dashboard>;
export type OrderContract = z.infer<typeof Order>;
export type PaymentContract = z.infer<typeof Payment>;
export type SubscriptionContract = z.infer<typeof Subscription>;
export type TicketContract = z.infer<typeof Ticket>;
export type ApiError = z.infer<typeof ErrorResponse>;
export type Input<T extends z.ZodTypeAny> = z.infer<T>;

// Thin client usable by either frontend; keep the bearer token in memory and never in URLs.
export function createApiClient(baseUrl: string, getToken: () => string | undefined = () => undefined) {
  return async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${API_PREFIX}${path}`, {
      ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    const payload = await response.json();
    if (!response.ok) throw Object.assign(new Error(payload.message), { status: response.status, ...payload });
    return payload as T;
  };
}

// Stage 5A internal account-credit extension. Historical order payments remain order allocated.
const Reason=z.string().trim().min(3).max(1000);
const Key=z.string().uuid();
const DateTime=z.string().datetime();
const SignedMoney=z.number().int().min(-1_000_000_000_000).max(1_000_000_000_000);
export const WalletEntryKind=z.enum(['TOPUP_CREDIT','SETTLEMENT_CREDIT','RESERVE','CAPTURE','RELEASE','ADJUSTMENT_CREDIT','REVERSAL']);
export const WalletRenewalStatus=z.enum(['RESERVED','PROCESSING','REQUIRES_REVIEW','SUCCEEDED','FAILED']);
export const RenewalReason=z.enum(['ACCOUNT_INACTIVE','SERVICE_NOT_ENABLED','SERVICE_STATE','MISSING_SERVICE_DATES','PRICE_UNAVAILABLE','PLAN_UNAVAILABLE','COVERAGE_REVIEW','PROVIDER_UNAVAILABLE','RENEWAL_IN_PROGRESS','INSUFFICIENT_FUNDS']);
export const WalletSummary=z.object({customerId:Id,currency:z.literal('NGN'),postedMinor:Money,reservedMinor:Money,availableMinor:Money,pendingTopUpsMinor:Money,pendingTopUpsCount:z.number().int().nonnegative(),simulated:z.boolean(),topUpInstructions:z.object({mode:z.literal('MANUAL_REPORT'),bankDetails:z.null(),notice:z.string()})});
export const WalletEntry=z.object({id:Id,walletId:Id,customerId:Id,kind:WalletEntryKind,amountMinor:Money.positive(),postedDeltaMinor:SignedMoney,reservedDeltaMinor:SignedMoney,postedAfterMinor:Money,reservedAfterMinor:Money,reference:z.string(),description:z.string(),actorId:Id.nullable(),topUpId:Id.nullable(),settlementPaymentId:Id.nullable().optional(),renewalId:Id.nullable(),reversalOfId:Id.nullable(),simulated:z.boolean(),createdAt:DateTime});
export const ReportWalletTopUpRequest=z.object({amountMinor:Money.positive(),currency:z.literal('NGN'),reference:z.string().trim().min(3).max(150),method:z.enum(['BANK_TRANSFER','OTHER']),evidence:z.string().trim().min(3).max(2000),idempotencyKey:Key}).strict();
export const WalletTopUp=z.object({id:Id,customerId:Id,allocation:z.literal('WALLET'),amountMinor:Money.positive(),currency:z.literal('NGN'),reference:z.string(),method:z.enum(['BANK_TRANSFER','OTHER']),status:PaymentStatus,verifiedAt:DateTime.nullable(),simulated:z.boolean(),createdAt:DateTime});
export const AdminWalletTopUp=WalletTopUp.extend({evidence:z.string(),verificationEvidence:z.string().nullable(),verifiedById:Id.nullable()});
export const WalletAdjustmentRequest=z.object({amountMinor:Money.positive(),reason:Reason,idempotencyKey:Key}).strict();
export const WalletReversalRequest=z.object({reason:Reason,idempotencyKey:Key}).strict();
export const WalletRenewalRequest=z.object({priceVersion:DateTime,idempotencyKey:Key}).strict();
export const RenewalPolicyRequest=z.object({enabled:z.boolean(),reason:Reason}).strict();
export const RenewalResolutionRequest=z.object({decision:z.enum(['SUCCEEDED','FAILED']),reference:z.string().trim().min(3).max(150),evidence:z.string().trim().min(3).max(2000),authoritative:z.literal(true),confirmedEndsAt:DateTime.optional()}).strict();
export const WalletRenewal=z.object({id:Id,customerId:Id,subscriptionId:Id,orderId:Id,planId:Id,planName:z.string(),amountMinor:Money.positive(),currency:z.literal('NGN'),billingDays:z.number().int().positive(),status:WalletRenewalStatus,previousEndsAt:DateTime,expectedEndsAt:DateTime,confirmedEndsAt:DateTime.nullable(),providerMode:z.enum(['manual','simulated','disabled']),providerReference:z.string().nullable(),simulated:z.boolean(),createdAt:DateTime,updatedAt:DateTime});
export const AdminWalletRenewal=WalletRenewal.extend({resolutionEvidence:z.string().nullable(),resolvedById:Id.nullable()});
export const RenewalEligibility=z.object({subscriptionId:Id,eligible:z.boolean(),reasonCodes:z.array(RenewalReason),amountMinor:Money.nullable(),priceVersion:DateTime.nullable(),billingDays:z.number().int().positive().nullable(),currentEndsAt:DateTime.nullable(),expectedEndsAt:DateTime.nullable(),planName:z.string(),speedMbps:z.number().int().positive().nullable(),wallet:WalletSummary,simulated:z.boolean()});
export const WalletTopUpQuery=ListQuery.extend({customerId:Id.optional(),status:PaymentStatus.optional()}).strict();
export const WalletRenewalQuery=ListQuery.extend({customerId:Id.optional(),status:WalletRenewalStatus.optional()}).strict();
