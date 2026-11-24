import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffRole, UserKind } from '@prisma/client';
import { Database } from '../core/database';
import { digest } from '../core/crypto';

export type Permission = 'customers.read' | 'customers.write' | 'staff.manage' | 'catalogue.write' | 'coverage.write' | 'leads.read' | 'leads.write' | 'orders.read' | 'orders.write' | 'payments.read' | 'payments.verify' | 'provisioning.write' | 'support.read' | 'support.write' | 'reports.read' | 'audit.read' | 'integrations.read' | 'integrations.write' | 'notifications.read' | 'wallet.read' | 'wallet.adjust' | 'renewals.read';
export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  ADMIN: ['customers.read','customers.write','staff.manage','catalogue.write','coverage.write','leads.read','leads.write','orders.read','orders.write','payments.read','payments.verify','provisioning.write','support.read','support.write','reports.read','audit.read','integrations.read','integrations.write','notifications.read','wallet.read','wallet.adjust','renewals.read'],
  SUPPORT: ['wallet.read','renewals.read','customers.read','orders.read','payments.read','support.read','support.write'],
  SALES: ['customers.read','customers.write','leads.read','leads.write','orders.read','orders.write'],
  FINANCE: ['wallet.read','wallet.adjust','renewals.read','customers.read','orders.read','payments.read','payments.verify','reports.read'],
  PROVISIONER: ['renewals.read','customers.read','orders.read','provisioning.write','coverage.write'],
  EXECUTIVE: ['reports.read'],
};
export interface Actor { id: string; kind: UserKind; customerId: string | null; roles: StaffRole[]; mustChangePassword: boolean; sessionId: string; }
export const Public = () => SetMetadata('public', true);
export const Require = (permission: Permission) => SetMetadata('permission', permission);
export const CustomerOnly = () => SetMetadata('customerOnly', true);
export const StaffOnly = () => SetMetadata('staffOnly', true);
export const AllowPasswordSetup = () => SetMetadata('passwordSetup', true);
export const CurrentActor = createParamDecorator((_, context: ExecutionContext): Actor => context.switchToHttp().getRequest().actor);

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly db: Database) {}
  async canActivate(context: ExecutionContext) {
    const metadata = <T>(key: string) => this.reflector.getAllAndOverride<T>(key, [context.getHandler(), context.getClass()]);
    if (metadata<boolean>('public')) return true;
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string' || !/^Bearer [A-Za-z0-9_-]{43}$/.test(authorization)) throw new UnauthorizedException('Authentication required');
    const session = await this.db.session.findUnique({ where: { tokenHash: digest(authorization.slice(7)) }, include: { user: { include: { customer: true } } } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.enabled || session.user.customer?.status === 'CLOSED') throw new UnauthorizedException('Session is invalid or expired');
    const actor: Actor = { id: session.user.id, kind: session.user.kind, roles: session.user.roles, customerId: session.user.customerId, mustChangePassword: session.user.mustChangePassword, sessionId: session.id };
    if (actor.mustChangePassword && !metadata<boolean>('passwordSetup')) throw new ForbiddenException('Password change required');
    const permission = metadata<Permission>('permission');
    if (permission && (actor.kind !== 'STAFF' || !actor.roles.some(role => ROLE_PERMISSIONS[role].includes(permission)))) throw new ForbiddenException('Permission denied');
    if (metadata<boolean>('customerOnly') && actor.kind !== 'CUSTOMER') throw new ForbiddenException('Customer session required');
    if (metadata<boolean>('staffOnly') && actor.kind !== 'STAFF') throw new ForbiddenException('Staff session required');
    request.actor = actor;
    return true;
  }
}
