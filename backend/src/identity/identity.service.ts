import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Config } from '../core/config';
import { audit, Database, Tx } from '../core/database';
import { digest, hashPassword, token, verifyPassword } from '../core/crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { Actor } from './access';
import { User } from '@prisma/client';

@Injectable()
export class IdentityService {
  constructor(private readonly db: Database, private readonly config: Config, private readonly notifications: NotificationsService) {}
  async login(identifier: string, password: string, staff = false) {
    const user = staff ? await this.db.user.findUnique({ where: { email: identifier.toLowerCase() }, include: { customer: true } }) : (await this.db.customer.findUnique({ where: { accountNumber: identifier }, include: { user: true } }))?.user;
    const matches = await verifyPassword(password, user?.passwordHash);
    if (!user || !matches || !user.enabled || user.kind !== (staff ? 'STAFF' : 'CUSTOMER')) throw new UnauthorizedException('Invalid credentials');
    const accessToken = token(), expiresAt = new Date(Date.now() + this.config.values.SESSION_HOURS * 3_600_000);
    const principal = await this.db.mutate(async tx => {
      // Serialize session issuance against a concurrent password reset or account change.
      await tx.$queryRaw`SELECT id FROM "User" WHERE id=${user.id}::uuid FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: user.id }, include: { customer: true } });
      if (!current || !current.enabled || current.kind !== user.kind || current.passwordHash !== user.passwordHash ||
          (staff ? current.email !== identifier.toLowerCase() : !current.customer || current.customer.status === 'CLOSED' || current.customer.accountNumber !== identifier)) {
        throw new UnauthorizedException('Invalid credentials');
      }
      await tx.session.create({ data: { userId: current.id, tokenHash: digest(accessToken), expiresAt } });
      await audit(tx, current.id, 'identity.login', 'User', current.id);
      return this.principal(current);
    });
    return { accessToken, tokenType: 'Bearer', expiresAt, principal };
  }
  principal(user: Pick<User, 'id' | 'kind' | 'customerId' | 'roles' | 'mustChangePassword'>) {
    return { id: user.id, kind: user.kind, customerId: user.customerId, roles: user.roles, mustChangePassword: user.mustChangePassword };
  }
  async logout(actor: Actor) {
    await this.db.mutate(async tx => { await tx.session.update({ where: { id: actor.sessionId }, data: { revokedAt: new Date() } }); await audit(tx, actor.id, 'identity.logout', 'User', actor.id); });
    return { ok: true };
  }
  async createSetup(tx: Tx, userId: string) {
    const setupToken = token();
    await tx.passwordReset.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
    await tx.passwordReset.create({ data: { userId, tokenHash: digest(setupToken), expiresAt: new Date(Date.now() + 30 * 60_000) } });
    return setupToken;
  }
  async recover(accountNumber: string) {
    await this.db.mutate(async tx => {
      const customer = await tx.customer.findUnique({ where: { accountNumber }, include: { user: true } });
      if (customer?.user?.enabled && customer.status !== 'CLOSED') {
        const resetToken = await this.createSetup(tx, customer.user.id);
        await this.notifications.enqueue(tx, { customerId: customer.id, destination: customer.email, template: 'PASSWORD_RECOVERY', payload: { token: resetToken, expiresInMinutes: 30 } });
        await audit(tx, null, 'identity.recovery_requested', 'Customer', customer.id);
      }
    });
    // Equal-cost hashing reduces timing distinction; tokens are never returned to anonymous callers.
    await verifyPassword('recovery-padding', null);
    return { ok: true };
  }
  async recoverStaff(email: string) {
    await this.db.mutate(async tx => {
      const user = await tx.user.findUnique({ where: { email: email.toLowerCase() } });
      if (user?.kind === 'STAFF' && user.enabled && user.email) {
        const resetToken = await this.createSetup(tx, user.id);
        await this.notifications.enqueue(tx, { destination: user.email, template: 'STAFF_PASSWORD_RECOVERY', payload: { token: resetToken, expiresInMinutes: 30 } });
        await audit(tx, null, 'identity.staff_recovery_requested', 'User', user.id);
      }
    });
    await verifyPassword('recovery-padding', null);
    return { ok: true };
  }
  async reset(resetToken: string, password: string) {
    const passwordHash = await hashPassword(password);
    await this.db.mutate(async tx => {
      const reset = await tx.passwordReset.findUnique({ where: { tokenHash: digest(resetToken) }, include: { user: { include: { customer: true } } } });
      if (!reset || reset.usedAt || reset.expiresAt <= new Date() || !reset.user.enabled || reset.user.customer?.status === 'CLOSED') throw new BadRequestException('Reset token is invalid or expired');
      await tx.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash, mustChangePassword: false } });
      await tx.passwordReset.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: new Date() } });
      await tx.session.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: new Date() } });
      await audit(tx, reset.userId, 'identity.password_reset', 'User', reset.userId);
    });
    return { ok: true };
  }
  async change(actor: Actor, currentPassword: string, password: string) {
    const passwordHash = await hashPassword(password);
    await this.db.mutate(async tx => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: actor.id } });
      if (!await verifyPassword(currentPassword, user.passwordHash)) throw new UnauthorizedException('Invalid credentials');
      await tx.user.update({ where: { id: actor.id }, data: { passwordHash, mustChangePassword: false } });
      await tx.session.updateMany({ where: { userId: actor.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.passwordReset.updateMany({ where: { userId: actor.id, usedAt: null }, data: { usedAt: new Date() } });
      await audit(tx, actor.id, 'identity.password_changed', 'User', actor.id);
    });
    return { ok: true };
  }
}
