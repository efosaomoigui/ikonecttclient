import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SkipThrottle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { ConfigModule } from './core/config';
import { Database, DatabaseModule } from './core/database';
import { AccessGuard, Public } from './identity/access';
import { IdentityModule } from './identity/identity.controller';
import { IntegrationsModule } from './integrations/adapters';
import { NotificationsModule } from './notifications/notifications.service';
import { CustomersModule } from './customers/customers.controller';
import { CoverageModule, PlansModule } from './catalogue/catalogue.controller';
import { LeadsModule } from './leads/leads.controller';
import { OrdersModule, PaymentsModule, ProvisioningModule, SubscriptionsModule } from './commerce/commerce.controller';
import { SupportModule } from './support/support.controller';
import { AdminModule, AuditModule, LegacyModule, NotificationApiModule, ReportingModule } from './admin/admin.controller';
import { AssistantModule } from './assistant/assistant.controller';
import { Contract } from './core/http';
import { WalletModule } from './wallet/wallet.controller';
import { z } from 'zod';

@ApiTags('Health') @Controller('health')
class HealthController {
  constructor(private readonly db: Database) {}
  @Public() @SkipThrottle() @Get() @Contract(z.object({ status: z.literal('ok'), database: z.literal('connected') }))
  async health() { await this.db.$queryRaw`SELECT 1`; return { status: 'ok', database: 'connected' }; }
}
@Module({
  imports: [ConfigModule, DatabaseModule, IntegrationsModule, NotificationsModule,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    IdentityModule, CustomersModule, PlansModule, CoverageModule, LeadsModule,
    OrdersModule, PaymentsModule, SubscriptionsModule, ProvisioningModule, SupportModule,
    AdminModule, ReportingModule, AuditModule, LegacyModule, NotificationApiModule, AssistantModule, WalletModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_GUARD, useClass: AccessGuard }],
})
export class AppModule {}
