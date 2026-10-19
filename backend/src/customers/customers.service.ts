import { BadRequestException, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import * as C from '../../../contracts';
import { audit, Database } from '../core/database';
import { Actor } from '../identity/access';
import { IdentityService } from '../identity/identity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CoverageService } from '../catalogue/catalogue.service';

@Injectable()
export class CustomersService {
  constructor(private readonly db: Database, private readonly identity: IdentityService, private readonly notifications: NotificationsService, private readonly coverage: CoverageService) {}
  async create(actor: Actor, input: C.Input<typeof C.CreateCustomerRequest>) {
    return this.db.mutate(async tx => {
      if (input.buildingId) await this.coverage.building(tx, input.buildingId);
      const accountNumber = input.accountNumber || String(randomInt(10_000_000, 100_000_000));
      const customer = await tx.customer.create({ data: { ...input, accountNumber, accountNumberSimulated: !input.accountNumber } });
      const user = await tx.user.create({ data: { kind: 'CUSTOMER', name: customer.name, customerId: customer.id, mustChangePassword: true } });
      const setupToken = await this.identity.createSetup(tx, user.id);
      await this.notifications.enqueue(tx, { customerId: customer.id, destination: customer.email, template: 'ACCOUNT_SETUP', payload: { accountNumber, token: setupToken, expiresInMinutes: 30 } });
      await audit(tx, actor.id, 'customer.created', 'Customer', customer.id, { generatedAccountNumber: !input.accountNumber });
      return { customer, setupToken, setupExpiresInMinutes: 30 };
    });
  }
  async update(actor: Actor, id: string, input: C.Input<typeof C.UpdateCustomerRequest>) {
    return this.db.mutate(async tx => {
      if (input.buildingId) await this.coverage.building(tx, input.buildingId);
      const customer = await tx.customer.update({ where: { id }, data: { ...input, ...(input.accountNumber ? { accountNumberSimulated: false } : {}) } });
      if (input.name) await tx.user.updateMany({ where: { customerId: id }, data: { name: input.name } });
      if (input.status === 'CLOSED' || input.accountNumber) {
        const user = await tx.user.findUnique({ where: { customerId: id } });
        if (user) await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
      }
      await audit(tx, actor.id, 'customer.updated', 'Customer', id, { fields: Object.keys(input) });
      return customer;
    });
  }
  async setup(actor: Actor, id: string) {
    return this.db.mutate(async tx => {
      const customer = await tx.customer.findUniqueOrThrow({ where: { id }, include: { user: true } });
      if (!customer.user || !customer.user.enabled || customer.status === 'CLOSED') throw new BadRequestException('Customer account cannot receive credentials');
      const setupToken = await this.identity.createSetup(tx, customer.user.id);
      await this.notifications.enqueue(tx, { customerId: id, destination: customer.email, template: 'ACCOUNT_SETUP', payload: { accountNumber: customer.accountNumber, token: setupToken, expiresInMinutes: 30 } });
      await audit(tx, actor.id, 'customer.setup_issued', 'Customer', id);
      return { setupToken, setupExpiresInMinutes: 30 };
    });
  }
  profile(id: string) { return this.db.customer.findUniqueOrThrow({ where: { id } }); }
  async dashboard(customerId: string) {
    const [customer, subscriptions, pendingOrders, openTickets] = await Promise.all([
      this.profile(customerId), this.db.subscription.findMany({ where: { customerId } }),
      this.db.order.count({ where: { customerId, status: { in: ['PENDING_PAYMENT', 'PAID', 'FULFILLING'] } } }),
      this.db.ticket.count({ where: { customerId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);
    return { customer, subscriptions, pendingOrders, openTickets, usage: null, usageStatus: 'EXTERNAL_PROVIDER_NOT_CONNECTED' };
  }
  updateProfile(actor: Actor, input: C.Input<typeof C.UpdateProfileRequest>) {
    return this.db.mutate(async tx => {
      const customer = await tx.customer.update({ where: { id: actor.customerId! }, data: input });
      await audit(tx, actor.id, 'customer.profile_updated', 'Customer', customer.id, { fields: Object.keys(input) });
      return customer;
    });
  }
}
