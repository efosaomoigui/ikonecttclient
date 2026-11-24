import { Global, Injectable, Module } from '@nestjs/common';
import { Database, Tx } from '../core/database';
import { Config } from '../core/config';
import { encrypt, decrypt } from '../core/crypto';
import { Adapters } from '../integrations/adapters';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: Database, private readonly config: Config, private readonly adapters: Adapters) {}
  enqueue(tx: Tx, input: { customerId?: string; destination: string; template: string; payload: Record<string, unknown>; channel?: 'EMAIL' | 'SMS' }) {
    const { payload, ...data } = input;
    return tx.notification.create({ data: { ...data, channel: input.channel || 'EMAIL', encryptedPayload: encrypt(payload, this.config.values.NOTIFICATION_ENCRYPTION_KEY) } });
  }
  // Durable DB outbox. SKIP LOCKED + lease lets multiple workers claim distinct jobs.
  // Providers must honor idempotencyKey across retries after delivery/commit interruption.
  async dispatchOne() {
    const job = await this.db.$transaction(async tx => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM "Notification" WHERE status = 'QUEUED' AND "availableAt" <= NOW() AND ("leaseUntil" IS NULL OR "leaseUntil" < NOW()) ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT 1`;
      if (!rows[0]) return null;
      return tx.notification.update({ where: { id: rows[0].id }, data: { leaseUntil: new Date(Date.now() + 60_000), attempts: { increment: 1 } } });
    });
    if (!job) return { processed: false };
    try {
      const adapter = job.channel === 'EMAIL' ? this.adapters.email : this.adapters.sms;
      const result = await adapter.send({ idempotencyKey: job.id, destination: job.destination, template: job.template, payload: decrypt(job.encryptedPayload, this.config.values.NOTIFICATION_ENCRYPTION_KEY) });
      await this.db.notification.update({ where: { id: job.id }, data: { status: result.simulated ? 'SIMULATED' : 'SENT', simulated: result.simulated, encryptedPayload: '', leaseUntil: null } });
      return { processed: true, simulated: result.simulated };
    } catch {
      await this.db.notification.update({ where: { id: job.id }, data: { status: job.attempts >= 5 ? 'FAILED' : 'QUEUED', leaseUntil: null, availableAt: new Date(Date.now() + 60_000 * 2 ** job.attempts) } });
      return { processed: true, failed: true };
    }
  }
}
@Global()
@Module({ providers: [NotificationsService], exports: [NotificationsService] })
export class NotificationsModule {}
