import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import * as C from '../../../contracts';
import { audit, Database, Tx } from '../core/database';
import { Actor } from '../identity/access';
import { Adapters } from '../integrations/adapters';
import { CoverageService } from '../catalogue/catalogue.service';
import { NotificationsService } from '../notifications/notifications.service';

export async function activeCustomer(tx: Tx, customerId: string) {
  const customer = await tx.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new NotFoundException('Customer not found');
  if (customer.status !== 'ACTIVE') throw new ConflictException('Customer account is not active');
  return customer;
}
@Injectable()
export class OrdersService {
  constructor(private readonly db: Database, private readonly coverage: CoverageService) {}
  create(actor: Actor, customerId: string, input: C.Input<typeof C.CreateOrderRequest>) {
    return this.db.mutate(async tx => {
      const customer = await activeCustomer(tx, customerId);
      const plan = await tx.plan.findFirst({ where: { id: input.planId, published: true, kind: customer.kind } });
      if (!plan) throw new BadRequestException('Published plan for this customer type is required');
      const building = await this.coverage.building(tx, input.buildingId);
      if (building.eligibility !== 'AVAILABLE' || !building.plans.some(link => link.planId === input.planId)) throw new ConflictException('Plan eligibility must be verified at this building/address');
      if (input.type === 'NEW_CONNECTION' && input.subscriptionId) throw new BadRequestException('New connections cannot specify a subscription');
      if (input.type !== 'NEW_CONNECTION') {
        const subscription = input.subscriptionId ? await tx.subscription.findFirst({ where: { id: input.subscriptionId, customerId } }) : null;
        if (!subscription) throw new NotFoundException('Owned subscription is required');
        if (subscription.status !== 'ACTIVE' && subscription.status !== 'SUSPENDED') throw new ConflictException('Subscription is not eligible for renewal/change');
        if (subscription.buildingId !== input.buildingId || (input.type === 'RENEWAL' && subscription.planId !== input.planId)) throw new BadRequestException('Renewal must keep the subscription plan and building; plan changes keep the building');
        if (await tx.order.count({ where: { subscriptionId: subscription.id, status: { in: ['PENDING_PAYMENT', 'PAID', 'FULFILLING'] } } })) throw new ConflictException('An open order already exists for this subscription');
      }
      const order = await tx.order.create({ data: { ...input, customerId, amountMinor: plan.priceMinor, currency: plan.currency, planName: plan.name, billingDays: plan.billingDays } });
      await audit(tx, actor.id, 'order.created', 'Order', order.id, { type: input.type });
      return order;
    });
  }
}
@Injectable()
export class PaymentsService {
  constructor(private readonly db: Database, private readonly notifications: NotificationsService) {}
  report(actor: Actor, input: C.Input<typeof C.ReportPaymentRequest>, customerId?: string) {
    return this.db.mutate(async tx => {
      const order = await tx.order.findFirst({ where: { id: input.orderId, ...(customerId ? { customerId } : {}) } });
      if (!order) throw new NotFoundException('Order not found');
      await activeCustomer(tx, order.customerId);
      if (order.status !== 'PENDING_PAYMENT') throw new ConflictException('Order is not awaiting payment');
      if (order.fundingSource !== 'ORDER_PAYMENT') throw new ConflictException('Wallet-funded orders cannot accept order payments');
      if (order.amountMinor !== BigInt(input.amountMinor) || order.currency !== input.currency) throw new BadRequestException('Reported payment must match the order amount and currency');
      const payment = await tx.payment.create({ data: { ...input, customerId: order.customerId, amountMinor: BigInt(input.amountMinor) } });
      await audit(tx, actor.id, 'payment.reported', 'Payment', payment.id);
      return payment;
    });
  }
  verify(actor: Actor, id: string, input: C.Input<typeof C.VerifyPaymentRequest>) {
    return this.db.mutate(async tx => {
      const payment = await tx.payment.findUniqueOrThrow({ where: { id }, include: { order: true, customer: true } });
      if (payment.status === input.decision) return payment;
      if (payment.status !== 'REPORTED') throw new ConflictException('Payment has already been reviewed');
      if (input.decision === 'CONFIRMED') {
        await activeCustomer(tx, payment.customerId);
        if (payment.order.status !== 'PENDING_PAYMENT') throw new ConflictException('Order is no longer awaiting payment');
        if (payment.amountMinor !== payment.order.amountMinor || payment.currency !== payment.order.currency) throw new ConflictException('Payment amount does not match order');
        await tx.order.update({ where: { id: payment.orderId }, data: { status: 'PAID' } });
      }
      const record = await tx.payment.update({ where: { id }, data: { status: input.decision, verificationEvidence: input.evidence, verifiedAt: new Date(), verifiedById: actor.id } });
      await audit(tx, actor.id, `payment.${input.decision.toLowerCase()}`, 'Payment', id, { orderId: payment.orderId });
      await this.notifications.enqueue(tx, { customerId: payment.customerId, destination: payment.customer.email, template: `PAYMENT_${input.decision}`, payload: { paymentId: id, orderId: payment.orderId } });
      return record;
    });
  }
  async receipt(id: string, customerId?: string) {
    const payment = await this.db.payment.findFirst({ where: { id, ...(customerId ? { customerId } : {}) } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'CONFIRMED' || !payment.verifiedAt) throw new ConflictException('Receipt is available only for confirmed payment');
    return { receiptNumber: `IK-${payment.id}`, payment, issuedAt: payment.verifiedAt };
  }
}
@Injectable()
export class ProvisioningService {
  constructor(private readonly db: Database, private readonly adapters: Adapters, private readonly coverage: CoverageService, private readonly notifications: NotificationsService) {}
  async request(actor: Actor, orderId: string) {
    if (this.adapters.config.values.PROVISIONING_ADAPTER === 'disabled') throw new ServiceUnavailableException('Provisioning is not configured');
    const prepared = await this.db.mutate(async tx => {
      const existing = await tx.provisioningRequest.findUnique({ where: { orderId } });
      if (existing) return { request: existing, created: false };
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { plan: true, payments: true } });
      await activeCustomer(tx, order.customerId);
      if (order.status !== 'PAID' || !order.payments.some(payment => payment.status === 'CONFIRMED')) throw new ConflictException('Verified payment is required before provisioning');
      const building = await this.coverage.building(tx, order.buildingId);
      if (building.eligibility !== 'AVAILABLE' || !building.plans.some(link => link.planId === order.planId)) throw new ConflictException('Building/plan eligibility requires review');
      const simulated = this.adapters.config.values.PROVISIONING_ADAPTER === 'simulated';
      // A development fixture can never silently become a real activation.
      if (!simulated && (building.simulated || order.plan.simulated)) throw new ConflictException('Simulated catalogue/coverage cannot be used for real provisioning');
      const subscription = order.subscriptionId ? await tx.subscription.findFirstOrThrow({ where: { id: order.subscriptionId, customerId: order.customerId } }) : await tx.subscription.create({ data: { customerId: order.customerId, planId: order.planId, buildingId: order.buildingId, simulated } });
      const request = await tx.provisioningRequest.create({ data: { orderId, subscriptionId: subscription.id, mode: this.adapters.config.values.PROVISIONING_ADAPTER, simulated } });
      await tx.order.update({ where: { id: orderId }, data: { status: 'FULFILLING', subscriptionId: subscription.id } });
      await audit(tx, actor.id, 'provisioning.requested', 'ProvisioningRequest', request.id, { orderId, simulated });
      return { request, created: true };
    });
    if (!prepared.created) return prepared.request;
    try {
      const order = await this.db.order.findUniqueOrThrow({ where: { id: orderId }, include: { plan: true } });
      const result = await this.adapters.provisioning.request({ requestId: prepared.request.id, customerId: order.customerId, planCode: order.plan.code, buildingId: order.buildingId });
      if (result.data.status !== 'PENDING') return await this.record(actor, prepared.request.id, { status: result.data.status, reference: result.data.reference, evidence: 'SIMULATED provider response' }, true);
      return await this.db.provisioningRequest.update({ where: { id: prepared.request.id }, data: { reference: result.data.reference } });
    } catch {
      // An uncertain provider response is never treated as successful activation or retried blindly.
      return this.record(actor, prepared.request.id, { status: 'REQUIRES_REVIEW', reference: `REVIEW-${prepared.request.id}`, evidence: 'Provider failed or timed out; check authoritative service status before retry' }, true);
    }
  }
  record(actor: Actor, id: string, input: C.Input<typeof C.ProvisionResultRequest>, providerResult = false) {
    return this.db.mutate(async tx => {
      const request = await tx.provisioningRequest.findUniqueOrThrow({ where: { id }, include: { order: { include: { customer: true } }, subscription: true } });
      if (!providerResult && request.mode !== 'manual') throw new ConflictException('Only manual requests accept staff-confirmed outcomes');
      if (request.status === 'ACTIVE') { if (input.status === 'ACTIVE' && request.reference === input.reference) return request; throw new ConflictException('Provisioning has already completed'); }
      if (request.order.status !== 'FULFILLING') throw new ConflictException('Order is not awaiting fulfillment');
      if (input.status === 'ACTIVE') {
        await activeCustomer(tx, request.order.customerId);
        if (!await tx.payment.count({ where: { orderId: request.orderId, status: 'CONFIRMED' } })) throw new ConflictException('Confirmed payment required');
        const now = new Date();
        const renewal = request.order.type === 'RENEWAL';
        const baseDate = renewal && request.subscription.endsAt && request.subscription.endsAt > now ? request.subscription.endsAt : now;
        await tx.subscription.update({ where: { id: request.subscriptionId }, data: { status: 'ACTIVE', planId: request.order.planId, startsAt: request.subscription.startsAt || now, endsAt: new Date(baseDate.getTime() + request.order.billingDays * 86_400_000), externalServiceId: input.reference, simulated: request.simulated } });
        await tx.order.update({ where: { id: request.orderId }, data: { status: 'COMPLETED' } });
      } else if (request.order.type === 'NEW_CONNECTION') {
        await tx.subscription.update({ where: { id: request.subscriptionId }, data: { status: input.status } });
      }
      const record = await tx.provisioningRequest.update({ where: { id }, data: { status: input.status, reference: input.reference, evidence: input.evidence, verifiedById: actor.id, verifiedAt: new Date() } });
      await audit(tx, actor.id, `provisioning.${input.status.toLowerCase()}`, 'ProvisioningRequest', id, { orderId: request.orderId, simulated: request.simulated, source: providerResult ? 'provider' : 'staff' });
      await this.notifications.enqueue(tx, { customerId: request.order.customerId, destination: request.order.customer.email, template: `PROVISIONING_${input.status}`, payload: { orderId: request.orderId, subscriptionId: request.subscriptionId, simulated: request.simulated } });
      return record;
    });
  }
}
