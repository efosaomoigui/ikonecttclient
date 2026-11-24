import { BadRequestException, Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import * as C from '../../../contracts';
import { audit, Database } from '../core/database';
import { hashPassword } from '../core/crypto';
import { Contract, paginated, present, ZodPipe } from '../core/http';
import { Actor, CurrentActor, CustomerOnly, Require, ROLE_PERMISSIONS, StaffOnly } from '../identity/access';
import { Adapters } from '../integrations/adapters';

@ApiTags('Admin staff') @ApiBearerAuth() @Controller('admin/staff')
export class StaffController {
  constructor(private readonly db: Database) {}
  @Require('staff.manage') @Get() @Contract(C.page(C.Staff), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Staff), await paginated(this.db.user, query, { kind: 'STAFF' })); }
  @Require('staff.manage') @Post() @Contract(C.Staff, C.CreateStaffRequest)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.CreateStaffRequest)) input: C.Input<typeof C.CreateStaffRequest>) {
    const passwordHash = await hashPassword(input.password);
    return present(C.Staff, await this.db.mutate(async tx => {
      const user = await tx.user.create({ data: { kind: 'STAFF', name: input.name, email: input.email.toLowerCase(), roles: input.roles, passwordHash, mustChangePassword: true } });
      await audit(tx, actor.id, 'staff.created', 'User', user.id, { roles: input.roles });
      return user;
    }));
  }
  @Require('staff.manage') @Patch(':id') @Contract(C.Staff, C.UpdateStaffRequest)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.UpdateStaffRequest)) input: C.Input<typeof C.UpdateStaffRequest>) {
    return present(C.Staff, await this.db.mutate(async tx => {
      const user = await tx.user.findFirstOrThrow({ where: { id, kind: 'STAFF' } });
      if (user.roles.includes('ADMIN') && (input.enabled === false || (input.roles && !input.roles.includes('ADMIN')))) {
        const otherAdmins = await tx.user.count({ where: { kind: 'STAFF', id: { not: id }, enabled: true, roles: { has: 'ADMIN' } } });
        if (!otherAdmins) throw new BadRequestException('At least one enabled administrator is required');
      }
      const record = await tx.user.update({ where: { id }, data: input });
      await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
      await audit(tx, actor.id, 'staff.updated', 'User', id, { fields: Object.keys(input) });
      return record;
    }));
  }
}
@ApiTags('Admin permissions') @ApiBearerAuth() @Controller('admin')
export class PermissionsController {
  @StaffOnly() @Get('permissions') @Contract(z.object({ roles: z.array(C.Role), permissions: z.array(z.string()) }))
  get(@CurrentActor() actor: Actor) { return { roles: actor.roles, permissions: [...new Set(actor.roles.flatMap(role => ROLE_PERMISSIONS[role]))] }; }
}
@ApiTags('Admin reporting') @ApiBearerAuth() @Controller('admin/reports')
export class ReportsController {
  constructor(private readonly db: Database) {}
  @Require('reports.read') @Get('summary') @Contract(C.Report)
  async summary() {
    return present(C.Report, await this.db.$transaction(async tx => {
      const [customers, leads, orders, openTickets, total, grouped, simulatedPlans, simulatedAccounts, simulatedSubscriptions] = await Promise.all([
        tx.customer.count(), tx.lead.count(), tx.order.count(), tx.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        tx.payment.aggregate({ where: { status: 'CONFIRMED' }, _sum: { amountMinor: true } }),
        tx.subscription.groupBy({ by: ['status'], _count: { _all: true } }),
        tx.plan.count({ where: { simulated: true } }), tx.customer.count({ where: { accountNumberSimulated: true } }), tx.subscription.count({ where: { simulated: true } }),
      ]);
      return { customers, leads, orders, openTickets, confirmedPaymentsMinor: total._sum.amountMinor || 0n, currency: 'NGN', subscriptionsByStatus: grouped.map(group => ({ status: group.status, count: group._count._all })), includesSimulatedData: !!(simulatedPlans || simulatedAccounts || simulatedSubscriptions) };
    }, { isolationLevel: 'RepeatableRead' }));
  }
}
@ApiTags('Audit') @ApiBearerAuth() @Controller('admin/audit')
export class AuditController {
  constructor(private readonly db: Database) {}
  @Require('audit.read') @Get() @Contract(C.page(C.Audit), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Audit), await paginated(this.db.auditLog, query)); }
}
@ApiTags('Legacy integrations') @ApiBearerAuth() @Controller('admin/integrations')
export class LegacyController {
  constructor(private readonly db: Database, private readonly adapters: Adapters) {}
  @Require('integrations.read') @Get() @Contract(z.record(z.string()))
  get() { return this.adapters.capabilities(); }
  @Require('integrations.read') @Get('legacy/lookup') @Contract(z.object({ data: z.object({ externalId: z.string(), accountReference: z.string(), name: z.string() }).nullable(), simulated: z.boolean(), provider: z.string() }), undefined, z.object({ reference: z.string().min(1).max(250) }))
  lookup(@Query(new ZodPipe(z.object({ reference: z.string().min(1).max(250) }).strict())) query: { reference: string }) { return this.adapters.legacy.lookup(query.reference); }
  @Require('integrations.read') @Get('customers/:id/references') @Contract(z.array(C.ExternalReference))
  async references(@Param('id', new ZodPipe(C.Id)) id: string) { return present(z.array(C.ExternalReference), await this.db.externalReference.findMany({ where: { customerId: id } })); }
  @Require('integrations.write') @Post('customers/:id/references') @Contract(C.ExternalReference, C.ExternalReferenceRequest)
  async link(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.ExternalReferenceRequest)) input: C.Input<typeof C.ExternalReferenceRequest>) {
    return present(C.ExternalReference, await this.db.mutate(async tx => {
      const record = await tx.externalReference.create({ data: { ...input, customerId: id } });
      await audit(tx, actor.id, 'customer.external_reference_linked', 'Customer', id, { system: input.system });
      return record;
    }));
  }
}
@ApiTags('Notifications') @ApiBearerAuth() @Controller()
export class NotificationController {
  constructor(private readonly db: Database) {}
  @Require('notifications.read') @Get('admin/notifications') @Contract(C.page(C.Notification), undefined, C.ListQuery)
  async admin(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Notification), await paginated(this.db.notification, query)); }
  @CustomerOnly() @Get('me/notifications') @Contract(C.page(C.Notification), undefined, C.ListQuery)
  async customer(@CurrentActor() actor: Actor, @Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) {
    if (actor.kind !== 'CUSTOMER') throw new BadRequestException('Customer session required');
    return present(C.page(C.Notification), await paginated(this.db.notification, query, { customerId: actor.customerId }));
  }
}
@Module({ controllers: [StaffController, PermissionsController] })
export class AdminModule {}
@Module({ controllers: [ReportsController] })
export class ReportingModule {}
@Module({ controllers: [AuditController] })
export class AuditModule {}
@Module({ controllers: [LegacyController] })
export class LegacyModule {}
@Module({ controllers: [NotificationController] })
export class NotificationApiModule {}
