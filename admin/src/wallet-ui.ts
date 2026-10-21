import type { WorkspaceApi } from './api';
import type { WalletApi } from './wallet-api';
import * as C from '../vendor/contracts';
import type { RecordData } from './modules';
import { z } from 'zod';

type Context = {
    api: WorkspaceApi; walletApi: WalletApi;
    openModal: (html: string, wide?: boolean) => void; closeModal: () => void;
    modalHeader: (title: string, subtitle: string) => string;
    button: (label: string, action: string, style?: string, icon?: string) => string;
    esc: (v: unknown) => string; money: (n: number) => string; badge: (v: unknown) => string; date: (v: string) => string;
    toast: (message: string, error?: boolean) => void; friendly: (error: unknown) => string;
    refresh: () => Promise<void>; details: (key: string, id: string) => Promise<void>;
};
export class WalletUi {
    private entries = new Map<string, z.infer<typeof C.WalletEntry>>();
    constructor(private c: Context) {}
    private allowed(p: string) { return this.c.api.permissions.includes(p); }
    private error(e: unknown) { return this.c.esc(this.c.friendly(e)); }
    private previewNotice() { return this.c.api.mode === 'mock' ? '<div class="notice">SIMULATED read-only wallet preview. Financial actions require the shared backend.</div>' : ''; }
    private summaryHtml(s: z.infer<typeof C.WalletSummary>) {
        const c = this.c;
        return `${s.simulated ? '<div class="notice">SIMULATED development wallet.</div>' : ''}<dl class="wallet-summary">${[['Available credit', s.availableMinor], ['Reserved funds', s.reservedMinor], ['Unverified top-ups', s.pendingTopUpsMinor]].map(([label, amount]) => `<div><dt>${label}</dt><dd>${c.money(Number(amount))}</dd></div>`).join('')}</dl><p class="footnote">${s.pendingTopUpsCount} top-up report(s) awaiting verification. Reserved and unverified funds are not available to spend. Internal account credit only.</p>`;
    }
    async customerSummary(id: string) {
        const c = this.c;
        try {
            const s = await c.walletApi.summary(id);
            return `<div class="related-block"><h3>Customer wallet</h3>${this.summaryHtml(s)}${c.button('View wallet transactions', `wallet:view:${id}`)}</div>`;
        } catch (e) {
            return `<div class="related-block"><h3>Customer wallet</h3><p role="alert">${this.error(e)}</p>${c.button('Retry wallet', `wallet:view:${id}`)}</div>`;
        }
    }
    async view(id: string, offset = 0) {
        const c = this.c; c.api.assert('wallet.read');
        c.openModal(c.modalHeader('Customer wallet', 'Internal account credit') + '<div class="modal-body" id="wallet-view"><p role="status">Loading wallet and transactions…</p></div>', true);
        const root = document.querySelector<HTMLElement>('#wallet-view')!;
        const session = c.api.session;
        try {
            const [s, page] = await Promise.all([c.walletApi.summary(id), c.walletApi.transactions(id, offset)]);
            if (!root.isConnected || c.api.session !== session) return;
            this.entries = new Map(page.items.map(e => [e.id, e]));
            const reversed = new Set(page.items.filter(e => e.kind === 'REVERSAL').map(e => e.reversalOfId));
            root.innerHTML = this.previewNotice() + this.summaryHtml(s) + `<p class="footnote">Customer reference: <code>${c.esc(id)}</code></p><div class="wallet-actions">${c.button('Refresh wallet', `wallet:view:${id}:${offset}`)}${this.allowed('wallet.adjust') ? c.button('Record credit correction', `wallet:credit:${id}`) : ''}</div><h3>Transaction history</h3><p class="footnote">Credits, confirmed service debits and reservation movements are separate ledger entries. History is immutable; corrections add compensating entries.</p>${page.items.length ? `<div class="table-scroll" tabindex="0" role="region" aria-label="Wallet transactions"><table><thead><tr><th>Date / actor</th><th>Entry / reference</th><th class="numeric">Amount</th><th class="numeric">Posted change</th><th class="numeric">Reserved change</th><th>Related record</th><th>Correction</th></tr></thead><tbody>${page.items.map(e => `<tr><td>${c.esc(new Date(e.createdAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }))} WAT<br><code>${c.esc(e.actorId || 'System')}</code></td><td>${c.badge(e.kind === 'SETTLEMENT_CREDIT' ? 'Settled wallet funding' : e.kind === 'TOPUP_CREDIT' ? 'Manual top-up credit' : e.kind)}${e.simulated ? c.badge('SIMULATED') : ''}<p>${c.esc(e.description)}</p><code>${c.esc(e.reference)}</code></td><td class="numeric">${c.money(e.amountMinor)}</td><td class="numeric">${c.money(e.postedDeltaMinor)}</td><td class="numeric">${c.money(e.reservedDeltaMinor)}</td><td>${e.topUpId ? (this.allowed('payments.verify') ? c.button('Top-up details', `wallet:topup-detail:${e.topUpId}`) : `<code>${c.esc(e.topUpId)}</code>`) : ''}${e.renewalId && this.allowed('renewals.read') ? c.button('Renewal details', `wallet:renewal-detail:${e.renewalId}`) : ''}${e.settlementPaymentId ? `Settlement payment <code>${c.esc(e.settlementPaymentId)}</code>` : ''}${e.reversalOfId ? `Reversal of <code>${c.esc(e.reversalOfId)}</code>` : ''}</td><td>${this.allowed('wallet.adjust') && ['TOPUP_CREDIT', 'ADJUSTMENT_CREDIT'].includes(e.kind) && !reversed.has(e.id) ? c.button('Reverse credit', `wallet:reverse:${id}:${e.id}`) : reversed.has(e.id) ? 'Reversed' : '—'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No wallet transactions.</p>'}<div class="wallet-actions"><span>${page.total} ledger entries</span>${offset > 0 ? c.button('Previous entries', `wallet:view:${id}:${Math.max(0, offset - 25)}`) : ''}${offset + page.items.length < page.total ? c.button('Next entries', `wallet:view:${id}:${offset + page.limit}`) : ''}</div><p class="footnote">${c.esc(s.topUpInstructions.notice)}</p>`;
        } catch (e) {
            if (root.isConnected && c.api.session === session) root.innerHTML = `<p role="alert">${this.error(e)}</p>${c.button('Retry wallet', `wallet:view:${id}:${offset}`)}`;
        }
    }
    topUpActions(r: RecordData) {
        return `<div class="notice">Manual wallet report. Unverified reports are not spendable. Finance confirmation credits this wallet once. Approved-provider settlement, when connected, credits funds automatically; neither path activates or renews service.</div>${r.simulated ? '<div class="notice">SIMULATED development top-up.</div>' : ''}${r.status === 'REPORTED' && this.allowed('payments.verify') ? this.c.button('Review wallet top-up', `wallet:verify:${r.id}`, 'primary') : ''}`;
    }
    renewalActions(r: RecordData) {
        return `<div class="notice">${r.simulated ? 'SIMULATED development renewal. ' : ''}${r.status === 'SUCCEEDED' ? 'Backend-confirmed renewal outcome.' : r.status === 'FAILED' ? 'Definite failure; reserved funds released by the backend.' : 'Funds remain reserved. A request acknowledgement or timeout is not service success.'} Provider: ${this.c.esc(r.providerMode)}.</div><p class="footnote">Expected period end (quote): ${this.c.esc(r.expectedEndsAt)}. Confirmed end: ${this.c.esc(r.confirmedEndsAt || 'Not confirmed')}.</p>${this.allowed('provisioning.write') ? `${r.status === 'RESERVED' ? this.c.button('Process reserved renewal', `wallet:process:${r.id}`, 'primary') : ''}${['PROCESSING', 'REQUIRES_REVIEW'].includes(r.status) ? this.c.button('Reconcile provider outcome', `wallet:resolve:${r.id}`) : ''}` : ''}`;
    }
    policyAction(r: RecordData) {
        return `<div class="notice">Renewal policy: ${r.renewalEnabled === true ? 'Enabled' : 'Disabled'}. An active service alone is not eligible; the backend checks approved price, coverage, service data, wallet funds and pending renewals.</div>${this.c.button('Manage renewal policy', `wallet:policy:${r.id}`)}`;
    }
    private form(title: string, fields: string, submitLabel: string, submit: (fd: FormData) => Promise<unknown>, complete: () => Promise<void>) {
        const c = this.c;
        c.openModal(c.modalHeader(title, 'Authorized, audited operation') + `<form id="wallet-operation"><div class="modal-body">${this.previewNotice()}${fields}<label class="check-label"><input type="checkbox" name="reviewed" required>I have reviewed and authorize this operation.</label><p class="form-error" role="alert"></p></div><footer class="modal-footer">${c.button('Cancel', 'close')}<button class="btn primary" type="submit">${submitLabel}</button></footer></form>`);
        const form = document.querySelector<HTMLFormElement>('#wallet-operation')!;
        const outcome = form.querySelector<HTMLSelectElement>('[name=decision]');
        const expiry = form.querySelector<HTMLInputElement>('[name=confirmedEndsAt]');
        if (outcome && expiry) {
            const syncExpiry = () => { expiry.required = outcome.value === 'SUCCEEDED'; };
            outcome.onchange = syncExpiry; syncExpiry();
        }
        let intent: FormData | undefined;
        form.onsubmit = async e => {
            e.preventDefault();
            if (!form.reportValidity()) return;
            const b = form.querySelector<HTMLButtonElement>('[type=submit]')!;
            b.disabled = true;
            form.querySelector('.form-error')!.textContent = '';
            intent ??= new FormData(form);
            // Freeze one reviewed intent, including its idempotency key, across ambiguous network failures.
            form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea').forEach(el => el.disabled = true);
            try { await submit(intent); }
            catch (error) {
                if (form.isConnected && (error instanceof z.ZodError || (error instanceof Error && error.message === 'Authoritative end date and time is required for success.'))) {
                    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea').forEach(el => el.disabled = false);
                    form.querySelector('.form-error')!.textContent = c.friendly(error);
                    intent = undefined; b.disabled = false;
                    return;
                }
                if (form.isConnected) { form.querySelector('.form-error')!.textContent = `${c.friendly(error)} Retry submits the same reviewed request. Cancel to review a different operation; check current records before a new financial intent.`; b.textContent = 'Retry reviewed request'; b.disabled = false; }
                return;
            }
            if (!form.isConnected) return;
            c.closeModal(); c.toast('Operation recorded by the backend.');
            try { await complete(); } catch (error) { c.toast(`Recorded, but the refreshed view could not load: ${c.friendly(error)}`, true); }
        };
    }
    private reason() { return '<label>Reason<textarea name="reason" required minlength="3" maxlength="1000" rows="3"></textarea></label>'; }
    async action(action: string) {
        const c = this.c;
        const [, kind, id, extra] = action.split(':');
        const sourceModal = document.querySelector('.modal');
        const session = c.api.session;
        const stale = () => session !== c.api.session || sourceModal !== document.querySelector('.modal');
        try {
            if (kind === 'view') return await this.view(id, Number(extra || 0));
            if (kind === 'topup-detail') return await c.details('walletTopUps', id);
            if (kind === 'renewal-detail') return await c.details('walletRenewals', id);
            if (kind === 'credit' || kind === 'reverse') {
                c.api.assert('wallet.adjust');
                const key = crypto.randomUUID();
                const entry = extra ? this.entries.get(extra) : undefined;
                if (kind === 'reverse' && (!entry || entry.customerId !== id || !['TOPUP_CREDIT', 'ADJUSTMENT_CREDIT'].includes(entry.kind))) throw new Error('Reopen the wallet and select an eligible credit entry.');
                this.form(kind === 'credit' ? 'Record wallet credit correction' : 'Reverse wallet credit', `<p>${kind === 'credit' ? 'Add a documented positive credit correction. This does not edit the balance or verify a payment.' : `Reverse the full original credit of ${c.money(entry!.amountMinor)} with a compensating entry. Original reference: ${c.esc(entry!.reference)}. The backend requires sufficient unreserved funds and rejects an already reversed entry.`}</p><p class="footnote">Customer: <code>${c.esc(id)}</code>. No service refunds, arbitrary debits, transfers or withdrawals.</p>${kind === 'credit' ? '<label>Credit amount in kobo<input name="amountMinor" type="number" step="1" min="1" max="1000000000000" required><small>100 kobo = NGN 1. Enter an integer.</small></label>' : ''}${this.reason()}`, kind === 'credit' ? 'Record credit correction' : 'Reverse original credit', fd => kind === 'credit' ? c.walletApi.adjustment(id, { amountMinor: Number(fd.get('amountMinor')), reason: String(fd.get('reason')), idempotencyKey: key }) : c.walletApi.reverse(extra, { reason: String(fd.get('reason')), idempotencyKey: key }), () => this.view(id));
                return;
            }
            if (kind === 'verify') {
                c.api.assert('payments.verify');
                const r = await c.api.detail('walletTopUps', id);
                if (stale()) return;
                if (r.status !== 'REPORTED') throw new Error('This wallet top-up has already been reviewed. Refresh its details.');
                this.form('Review wallet top-up', `<p>Wallet funding: ${c.money(r.amountMinor)}. Customer <code>${c.esc(r.customerId)}</code>.</p><p>Payment reference: ${c.esc(r.reference)}</p><p>Reported evidence: ${c.esc(r.evidence)}</p><p>Confirm only after checking payment evidence. Rejection creates no credit. Service activation is unchanged.</p><label>Decision<select name="decision"><option value="CONFIRMED">Confirm wallet funding</option><option value="REJECTED">Reject wallet funding</option></select></label><label>Verification evidence<textarea name="evidence" required minlength="3" maxlength="2000" rows="3"></textarea></label>`, 'Record wallet decision', fd => c.walletApi.verify(id, { decision: String(fd.get('decision')) as 'CONFIRMED' | 'REJECTED', evidence: String(fd.get('evidence')) }), async () => { await c.refresh(); await c.details('walletTopUps', id); });
                return;
            }
            c.api.assert('provisioning.write');
            if (kind === 'policy') {
                const r = await c.api.detail('subscriptions', id);
                if (stale()) return;
                this.form('Manage subscription renewal policy', `<p>Service <code>${c.esc(id)}</code>. Current policy: ${r.renewalEnabled === true ? 'Enabled' : 'Disabled'}. Enabling this policy alone does not guarantee eligibility, debit funds or activate service.</p><label>Renewal policy<select name="enabled"><option value="false"${r.renewalEnabled !== true ? ' selected' : ''}>Disabled</option><option value="true"${r.renewalEnabled === true ? ' selected' : ''}>Enabled</option></select></label>${this.reason()}`, 'Save renewal policy', fd => c.walletApi.policy(id, { enabled: fd.get('enabled') === 'true', reason: String(fd.get('reason')) }), async () => { await c.refresh(); await c.details('subscriptions', id); });
                return;
            }
            const r = await c.api.detail('walletRenewals', id);
            if (stale()) return;
            if (kind === 'process') {
                if (r.status !== 'RESERVED') throw new Error('Only a reserved renewal may be processed. Inspect its current status.');
                this.form('Process reserved renewal', `<p>Plan: ${c.esc(r.planName)}. Reserved amount: ${c.money(r.amountMinor)}. Provider: ${c.esc(r.providerMode)}${r.simulated ? ' · SIMULATED' : ''}.</p><p>This requests the separate service workflow once. Manual acknowledgement and uncertain outcomes retain the hold; only a confirmed outcome completes renewal.</p>`, 'Process renewal', () => c.walletApi.process(id), async () => { await c.refresh(); await c.details('walletRenewals', id); });
            } else if (kind === 'resolve') {
                if (!['PROCESSING', 'REQUIRES_REVIEW'].includes(r.status)) throw new Error('This renewal is not awaiting reconciliation.');
                this.form('Reconcile renewal outcome', `<p>Renewal <code>${c.esc(id)}</code>. Reserved: ${c.money(r.amountMinor)}.</p><p>Expected period end from the backend: ${c.esc(r.expectedEndsAt)}. Enter the actual authoritative expiry, not an acknowledgement or estimate.</p><div class="notice">An uncertain outcome or a confirmed expiry different from the reserved period requires review and escalation. Keep funds protected. Never record failure to release funds when the service succeeded.</div><label>Confirmed provider outcome<select name="decision"><option value="SUCCEEDED">Confirmed success</option><option value="FAILED">Definite failure</option></select></label><label>Authoritative end date and time (UTC)<input name="confirmedEndsAt" type="text" placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"><small>Required for success; omit for definite failure.</small></label><label>Provider / manual reference<input name="reference" required minlength="3" maxlength="150"></label><label>Authoritative outcome evidence<textarea name="evidence" required minlength="3" maxlength="2000" rows="3"></textarea></label><label class="check-label"><input name="authoritative" type="checkbox" required>I attest this is the authoritative service outcome.</label>`, 'Record authoritative outcome', fd => {
                    const decision = String(fd.get('decision')) as 'SUCCEEDED' | 'FAILED';
                    const confirmedEndsAt = String(fd.get('confirmedEndsAt') || '').trim();
                    if (decision === 'SUCCEEDED' && !confirmedEndsAt) throw new Error('Authoritative end date and time is required for success.');
                    return c.walletApi.resolve(id, { decision, reference: String(fd.get('reference')), evidence: String(fd.get('evidence')), authoritative: true, ...(decision === 'SUCCEEDED' ? { confirmedEndsAt } : {}) });
                }, async () => { await c.refresh(); await c.details('walletRenewals', id); });
            }
        } catch (e) { c.toast(c.friendly(e), true); }
    }
}
