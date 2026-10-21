import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit, ConflictException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Config } from './config';

export type Tx = Prisma.TransactionClient;
@Injectable()
export class Database extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: Config) { super({ datasources: { db: { url: config.values.DATABASE_URL } } }); }
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
  async mutate<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try { return await this.$transaction(fn, { isolationLevel: 'Serializable' }); }
      catch (error) {
        const retryable=error instanceof Prisma.PrismaClientKnownRequestError && (error.code==='P2034' || (error.code==='P2010' && ['40001','40P01'].includes(String(error.meta?.code))));
        if (!retryable) throw error;
      }
    }
    throw new ConflictException('Concurrent update; retry the request');
  }
}
export function audit(tx: Tx, actorId: string | null, action: string, entityType: string, entityId: string, metadata: Prisma.InputJsonObject = {}) {
  return tx.auditLog.create({ data: { actorId, action, entityType, entityId, metadata } });
}
@Global()
@Module({ providers: [Database], exports: [Database] })
export class DatabaseModule {}
