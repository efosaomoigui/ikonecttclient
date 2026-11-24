import { Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as C from '../../../contracts';
import { audit, Database } from '../core/database';
import { Contract, paginated, present, ZodPipe } from '../core/http';
import { Actor, CurrentActor, CustomerOnly, Require } from '../identity/access';
import { CoverageModule } from '../catalogue/catalogue.controller';
import { OrdersService, PaymentsService, ProvisioningService } from './commerce.service';

@ApiTags('Customer orders') @ApiBearerAuth() @CustomerOnly() @Controller('me/orders')
export class CustomerOrdersController {
  constructor(private readonly db: Database, private readonly orders: OrdersService) {}
  @Get() @Contract(C.page(C.Order), undefined, C.ListQuery)
  async list(@CurrentActor() actor: Actor, @Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Order), await paginated(this.db.order, query, { customerId: actor.customerId! })); }
  @Get(':id') @Contract(C.Order)
  async get(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Order, await this.db.order.findFirstOrThrow({ where: { id, customerId: actor.customerId! } })); }
  @Post() @Contract(C.Order, C.CreateOrderRequest)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.CreateOrderRequest)) input: C.Input<typeof C.CreateOrderRequest>) { return present(C.Order, await this.orders.create(actor, actor.customerId!, input)); }
}
@ApiTags('Admin orders') @ApiBearerAuth() @Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly db: Database, private readonly orders: OrdersService) {}
  @Require('orders.read') @Get() @Contract(C.page(C.Order), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Order), await paginated(this.db.order, query)); }
  @Require('orders.read') @Get(':id') @Contract(C.Order)
  async get(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Order, await this.db.order.findUniqueOrThrow({ where: { id } })); }
  @Require('orders.write') @Post() @Contract(C.Order, C.StaffOrderRequest)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.StaffOrderRequest)) input: C.Input<typeof C.StaffOrderRequest>) {
    const { customerId, ...order } = input;
    return present(C.Order, await this.orders.create(actor, customerId, order));
  }
}
@ApiTags('Customer payments') @ApiBearerAuth() @CustomerOnly() @Controller('me/payments')
export class CustomerPaymentsController {
  constructor(private readonly db: Database, private readonly payments: PaymentsService) {}
  @Get() @Contract(C.page(C.Payment), undefined, C.ListQuery)
  async list(@CurrentActor() actor: Actor, @Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Payment), await paginated(this.db.payment, query, { customerId: actor.customerId! })); }
  @Post() @Contract(C.Payment, C.ReportPaymentRequest)
  async report(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.ReportPaymentRequest)) input: C.Input<typeof C.ReportPaymentRequest>) { return present(C.Payment, await this.payments.report(actor, input, actor.customerId!)); }
  @Get(':id/receipt') @Contract(C.Receipt)
  async receipt(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Receipt, await this.payments.receipt(id, actor.customerId!)); }
}
@ApiTags('Admin payments') @ApiBearerAuth() @Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly db: Database, private readonly payments: PaymentsService) {}
  @Require('payments.read') @Get() @Contract(C.page(C.AdminPayment), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.AdminPayment), await paginated(this.db.payment, query)); }
  @Require('payments.read') @Get(':id') @Contract(C.AdminPayment)
  async get(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.AdminPayment, await this.db.payment.findUniqueOrThrow({ where: { id } })); }
  @Require('orders.write') @Post() @Contract(C.AdminPayment, C.ReportPaymentRequest)
  async report(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.ReportPaymentRequest)) input: C.Input<typeof C.ReportPaymentRequest>) { return present(C.AdminPayment, await this.payments.report(actor, input)); }
  @Require('payments.verify') @Post(':id/verify') @Contract(C.AdminPayment, C.VerifyPaymentRequest)
  async verify(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.VerifyPaymentRequest)) input: C.Input<typeof C.VerifyPaymentRequest>) { return present(C.AdminPayment, await this.payments.verify(actor, id, input)); }
  @Require('payments.read') @Get(':id/receipt') @Contract(C.Receipt)
  async receipt(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Receipt, await this.payments.receipt(id)); }
}
@ApiTags('Customer subscriptions') @ApiBearerAuth() @CustomerOnly() @Controller('me/subscriptions')
export class CustomerSubscriptionsController {
  constructor(private readonly db: Database) {}
  @Get() @Contract(C.page(C.Subscription), undefined, C.ListQuery)
  async list(@CurrentActor() actor: Actor, @Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) {
    const [items, total] = await Promise.all([this.db.subscription.findMany({ where: { customerId: actor.customerId! }, skip: query.offset, take: query.limit, orderBy: { id: 'asc' } }), this.db.subscription.count({ where: { customerId: actor.customerId! } })]);
    return present(C.page(C.Subscription), { items, total, ...query });
  }
  @Get(':id') @Contract(C.Subscription)
  async get(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Subscription, await this.db.subscription.findFirstOrThrow({ where: { id, customerId: actor.customerId! } })); }
}
@ApiTags('Admin subscriptions') @ApiBearerAuth() @Controller('admin/subscriptions')
export class AdminSubscriptionsController {
  constructor(private readonly db: Database) {}
  @Require('orders.read') @Get() @Contract(C.page(C.Subscription), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) {
    const [items, total] = await Promise.all([this.db.subscription.findMany({ skip: query.offset, take: query.limit, orderBy: { id: 'asc' } }), this.db.subscription.count()]);
    return present(C.page(C.Subscription), { items, total, ...query });
  }
  @Require('orders.read') @Get(':id') @Contract(C.Subscription)
  async get(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Subscription, await this.db.subscription.findUniqueOrThrow({ where: { id } })); }
}
@ApiTags('Admin provisioning') @ApiBearerAuth() @Controller('admin/provisioning')
export class AdminProvisioningController {
  constructor(private readonly db: Database, private readonly provisioning: ProvisioningService) {}
  @Require('provisioning.write') @Get() @Contract(C.page(C.Provisioning), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Provisioning), await paginated(this.db.provisioningRequest, query)); }
  @Require('provisioning.write') @Post() @Contract(C.Provisioning, C.ProvisionRequest)
  async request(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.ProvisionRequest)) input: C.Input<typeof C.ProvisionRequest>) { return present(C.Provisioning, await this.provisioning.request(actor, input.orderId)); }
  @Require('provisioning.write') @Post(':id/result') @Contract(C.Provisioning, C.ProvisionResultRequest)
  async result(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.ProvisionResultRequest)) input: C.Input<typeof C.ProvisionResultRequest>) { return present(C.Provisioning, await this.provisioning.record(actor, id, input)); }
}
@Module({ imports: [CoverageModule], controllers: [CustomerOrdersController, AdminOrdersController], providers: [OrdersService] })
export class OrdersModule {}
@Module({ controllers: [CustomerPaymentsController, AdminPaymentsController], providers: [PaymentsService] })
export class PaymentsModule {}
@Module({ controllers: [CustomerSubscriptionsController, AdminSubscriptionsController] })
export class SubscriptionsModule {}
@Module({ imports: [CoverageModule], controllers: [AdminProvisioningController], providers: [ProvisioningService] })
export class ProvisioningModule {}
