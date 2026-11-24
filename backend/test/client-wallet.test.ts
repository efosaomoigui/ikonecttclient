import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Database } from '../src/core/database';
import { ClientWalletBalances } from '../src/wallet/client-wallet.provider';

const valid = { walletId: 'external-wallet', currency: 'NGN', postedMinor: 120, reservedMinor: 20, availableMinor: 100 };

function mappedDatabase(externalId?: string) {
  return {
    externalReference: {
      async findUnique(query: unknown) {
        assert.deepEqual(query, {
          where: { customerId_system: { customerId: 'customer', system: 'client-wallet' } },
          select: { externalId: true },
        });
        return externalId ? { externalId } : null;
      },
    },
  } as unknown as Database;
}

test('coalesces concurrent reads for the mapped customer and fetches again on the next visit', async () => {
  let calls = 0;
  const balances = new ClientWalletBalances(mappedDatabase(valid.walletId), {
    async fetchBalance(walletId) {
      assert.equal(walletId, valid.walletId);
      calls++;
      return valid;
    },
  });
  assert.deepEqual(await Promise.all([balances.get('customer'), balances.get('customer')]), [valid, valid]);
  assert.equal(calls, 1);
  await balances.get('customer');
  assert.equal(calls, 2);
});

test('rejects missing mapping, mismatched identity and inconsistent money without fallback', async () => {
  const unmapped = new ClientWalletBalances(mappedDatabase(), {
    async fetchBalance() { assert.fail('Unmapped customers must not reach the provider'); },
  });
  await assert.rejects(unmapped.get('customer'), { status: 503 });
  for (const response of [{ ...valid, walletId: 'wrong' }, { ...valid, availableMinor: 101 }]) {
    const balances = new ClientWalletBalances(mappedDatabase(valid.walletId), {
      async fetchBalance() { return response; },
    });
    await assert.rejects(balances.get('customer'), { status: 503 });
  }
});
