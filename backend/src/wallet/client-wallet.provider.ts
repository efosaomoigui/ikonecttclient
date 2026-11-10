import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';
import { Database } from '../core/database';

const amount = z.number().int().min(0).max(1_000_000_000_000);
const balance = z.object({
  walletId: z.string().min(1),
  currency: z.literal('NGN'),
  postedMinor: amount,
  reservedMinor: amount,
  availableMinor: amount,
}).refine(value => value.postedMinor - value.reservedMinor === value.availableMinor);

export const CLIENT_WALLET_SYSTEM = 'client-wallet';

// Internal adapter contract. A concrete transport must verify the source and map
// the client's documented response into this shape. The ID comes from the reply.
export abstract class ClientWalletProvider {
  abstract fetchBalance(walletId: string, signal: AbortSignal): Promise<unknown>;
}

@Injectable()
export class UnconfiguredClientWalletProvider extends ClientWalletProvider {
  async fetchBalance(): Promise<never> {
    throw new Error('Client wallet transport is unconfigured');
  }
}

@Injectable()
export class ClientWalletBalances {
  private readonly logger = new Logger(ClientWalletBalances.name);
  private readonly pending = new Map<string, Promise<z.infer<typeof balance>>>();

  constructor(private readonly db: Database, private readonly provider: ClientWalletProvider) {}

  get(customerId: string) {
    const pending = this.pending.get(customerId);
    if (pending) return pending;

    const request = this.fetch(customerId).finally(() => this.pending.delete(customerId));
    this.pending.set(customerId, request);
    return request;
  }

  private async fetch(customerId: string) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const mapping = await this.db.externalReference.findUnique({
        where: { customerId_system: { customerId, system: CLIENT_WALLET_SYSTEM } },
        select: { externalId: true },
      });
      if (!mapping?.externalId.trim()) throw new Error('Missing wallet mapping');

      const controller = new AbortController();
      const deadline = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error('Wallet balance lookup timed out'));
        }, 4000);
      });
      const raw = await Promise.race([this.provider.fetchBalance(mapping.externalId, controller.signal), deadline]);
      const result = balance.parse(raw);
      if (result.walletId !== mapping.externalId) throw new Error('Wallet mismatch');
      return result;
    } catch {
      this.logger.warn('Client wallet balance could not be verified');
      throw new ServiceUnavailableException('Your wallet balance cannot currently be verified. Please try again later.');
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}
