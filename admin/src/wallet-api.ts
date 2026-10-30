import * as C from '../vendor/contracts';
import type { WorkspaceApi } from './api';
import { parseResponse } from './contracts';
import { z } from 'zod';

export class WalletApi {
    constructor(private api: WorkspaceApi) {}
    private live() {
        if (this.api.mode !== 'live') throw new Error('Wallet financial actions require the shared backend. This preview is read-only.');
    }
    async summary(customerId: string) {
        this.api.assert('wallet.read'); C.Id.parse(customerId);
        if (this.api.mode === 'mock') return C.WalletSummary.parse(this.api.data.walletSummaries.find(x => x.customerId === customerId));
        return parseResponse(C.WalletSummary, await this.api.request(`/admin/customers/${customerId}/wallet`));
    }
    async transactions(customerId: string, offset = 0) {
        this.api.assert('wallet.read'); C.Id.parse(customerId);
        const query = C.ListQuery.parse({ offset, limit: 25 });
        if (this.api.mode === 'mock') {
            const rows = this.api.data.walletEntries.filter(x => x.customerId === customerId);
            return C.page(C.WalletEntry).parse({ items: rows.slice(offset, offset + 25), total: rows.length, ...query });
        }
        return parseResponse(C.page(C.WalletEntry), await this.api.request(`/admin/customers/${customerId}/wallet/transactions?offset=${query.offset}&limit=${query.limit}`));
    }
    async adjustment(customerId: string, input: z.input<typeof C.WalletAdjustmentRequest>) {
        this.api.assert('wallet.adjust'); C.Id.parse(customerId); const body = C.WalletAdjustmentRequest.parse(input); this.live();
        return parseResponse(C.WalletEntry, await this.api.request(`/admin/customers/${customerId}/wallet/adjustments`, 'POST', body));
    }
    async reverse(entryId: string, input: z.input<typeof C.WalletReversalRequest>) {
        this.api.assert('wallet.adjust'); C.Id.parse(entryId); const body = C.WalletReversalRequest.parse(input); this.live();
        return parseResponse(C.WalletEntry, await this.api.request(`/admin/wallet-transactions/${entryId}/reverse`, 'POST', body));
    }
    async verify(topUpId: string, input: z.input<typeof C.VerifyPaymentRequest>) {
        this.api.assert('payments.verify'); C.Id.parse(topUpId); const body = C.VerifyPaymentRequest.parse(input); this.live();
        return parseResponse(C.AdminWalletTopUp, await this.api.request(`/admin/wallet-top-ups/${topUpId}/verify`, 'POST', body));
    }
    async policy(subscriptionId: string, input: z.input<typeof C.RenewalPolicyRequest>) {
        this.api.assert('provisioning.write'); C.Id.parse(subscriptionId); const body = C.RenewalPolicyRequest.parse(input); this.live();
        return parseResponse(C.Subscription, await this.api.request(`/admin/subscriptions/${subscriptionId}/renewal-policy`, 'PATCH', body));
    }
    async process(renewalId: string) {
        this.api.assert('provisioning.write'); C.Id.parse(renewalId); this.live();
        return parseResponse(C.AdminWalletRenewal, await this.api.request(`/admin/wallet-renewals/${renewalId}/process`, 'POST'));
    }
    async resolve(renewalId: string, input: z.input<typeof C.RenewalResolutionRequest>) {
        this.api.assert('provisioning.write'); C.Id.parse(renewalId); const body = C.RenewalResolutionRequest.parse(input); this.live();
        return parseResponse(C.AdminWalletRenewal, await this.api.request(`/admin/wallet-renewals/${renewalId}/resolve`, 'POST', body));
    }
}
