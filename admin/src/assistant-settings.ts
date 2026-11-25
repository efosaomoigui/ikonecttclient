import * as C from '../vendor/contracts';
import { WorkspaceApi } from './api';
import { parseResponse } from './contracts';

const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export class AssistantSettingsView {
    constructor(private readonly api: WorkspaceApi, private readonly host: HTMLElement, private readonly current: () => boolean) {}

    private async request(path: string, method = 'GET', body?: unknown) {
        this.api.assert('staff.manage');
        if (this.api.mode !== 'live') throw new Error('Provider and contact configuration require the persistent backend.');
        return this.api.request(path, method, body);
    }

    async assistant(message = '') {
        const settings = parseResponse(C.AssistantSettingsView, await this.request('/admin/assistant/settings'));
        if (!this.current()) return;
        this.host.innerHTML = `<div class="page-heading"><div><div class="eyebrow">IKONECTT / ADMINISTRATION</div><h1>AI Assistant</h1><p>Configure the client’s provider and control grounded conversational assistance.</p></div></div><section class="panel panel-pad"><h2>Configuration status</h2><dl class="detail-grid"><div><dt>Credentials</dt><dd>${settings.credentialConfigured ? 'Configured ••••••••' : 'Not configured'}</dd></div><div><dt>Credential source</dt><dd>${escape(settings.credentialSource)}</dd></div><div><dt>Last connection test</dt><dd>${escape(settings.lastTestStatus)}</dd></div><div><dt>Published knowledge articles</dt><dd>${settings.knowledgePublished}</dd></div><div><dt>AI requests today (UTC)</dt><dd>${settings.usageToday} / ${settings.dailyRequestLimit}</dd></div></dl><p class="muted">Published FAQs, current plans and coverage remain available when model assistance is disabled or unavailable.</p></section><form id="assistant-settings" class="panel panel-pad compact-form"><h2>Provider settings</h2><label class="check-label"><input type="checkbox" name="enabled"${settings.enabled ? ' checked' : ''}>Enable model assistance</label><label>Supported provider<select name="provider"><option value="openai">OpenAI</option></select></label><label>Model identifier<input name="model" required maxlength="100" value="${escape(settings.model)}" autocomplete="off"></label><label>Replace API credential<input name="apiKey" type="password" autocomplete="new-password" maxlength="300" placeholder="Leave blank to keep the saved credential"></label><p class="muted">The saved key is encrypted on the server and never returned to this page. API usage is billed to the provider account that owns the key.</p><label>Maximum response tokens<input name="maxOutputTokens" type="number" required min="64" max="600" value="${settings.maxOutputTokens}"></label><label>Daily model request limit<input name="dailyRequestLimit" type="number" required min="1" max="1000" value="${settings.dailyRequestLimit}"></label><p id="assistant-feedback" role="status">${escape(message)}</p><div class="wallet-actions"><button type="submit" class="btn primary">Save configuration</button><button type="button" class="btn" id="assistant-test">Test saved connection</button><button type="button" class="btn" id="assistant-revoke">Revoke credential</button></div><label class="check-label"><input type="checkbox" id="confirm-revoke">I authorize revoking the configured credential.</label></form>`;
        const form = this.host.querySelector<HTMLFormElement>('#assistant-settings')!;
        const feedback = this.host.querySelector<HTMLElement>('#assistant-feedback')!;
        const perform = async (action: () => Promise<string>) => {
            form.querySelectorAll<HTMLButtonElement>('button').forEach(button => button.disabled = true);
            feedback.textContent = 'Saving or verifying configuration…';
            try { const result = await action(); if (this.current()) await this.assistant(result); }
            catch { if (this.current()) feedback.textContent = 'The configuration operation could not be completed. Check server availability and configuration, then retry.'; }
            finally { form.querySelectorAll<HTMLButtonElement>('button').forEach(button => button.disabled = false); }
        };
        form.onsubmit = event => {
            event.preventDefault();
            const fields = new FormData(form);
            const key = String(fields.get('apiKey') || '').trim();
            form.querySelector<HTMLInputElement>('[name=apiKey]')!.value = '';
            const input = { enabled: fields.has('enabled'), provider: 'openai', model: String(fields.get('model') || '').trim(), maxOutputTokens: Number(fields.get('maxOutputTokens')), dailyRequestLimit: Number(fields.get('dailyRequestLimit')), ...(key ? { apiKey: key } : {}) };
            void perform(async () => { await this.request('/admin/assistant/settings', 'PATCH', C.AssistantSettingsInput.parse(input)); return 'Configuration saved. Test the saved connection to verify the model and credential.'; });
        };
        this.host.querySelector<HTMLButtonElement>('#assistant-test')!.onclick = () => { void perform(async () => {
            const result = parseResponse(C.AssistantConnectionResult, await this.request('/admin/assistant/test', 'POST'));
            return result.ok ? 'Connection verified. The saved model produced a valid response.' : 'Connection could not be verified. Check the saved credential, model access, provider billing, server encryption configuration and usage limit.';
        }); };
        this.host.querySelector<HTMLButtonElement>('#assistant-revoke')!.onclick = () => {
            if (!this.host.querySelector<HTMLInputElement>('#confirm-revoke')!.checked) { feedback.textContent = 'Confirm revocation before continuing.'; return; }
            void perform(async () => { await this.request('/admin/assistant/revoke', 'POST'); return 'Credential revoked. Model assistance requires a configured credential.'; });
        };
    }

    async contact(message = '') {
        const settings = parseResponse(C.ContactSettings, await this.request('/admin/contact-settings'));
        if (!this.current()) return;
        this.host.innerHTML = `<div class="page-heading"><div><div class="eyebrow">IKONECTT / ADMINISTRATION</div><h1>Contact settings</h1><p>Manage the customer-support destination used by the website and assistant.</p></div></div><form id="contact-settings" class="panel panel-pad compact-form"><label>Official WhatsApp destination<input name="whatsappUrl" type="url" required maxlength="300" value="${escape(settings.whatsappUrl)}"></label><p class="muted">Use the approved WhatsApp destination.</p><dl class="detail-grid"><div><dt>Customer care</dt><dd>${escape(settings.customerCareEmail)}</dd></div><div><dt>Official customer portal</dt><dd>${escape(settings.portalUrl)}</dd></div></dl><p role="status">${escape(message)}</p><button class="btn primary" type="submit">Save contact settings</button></form>`;
        const form = this.host.querySelector<HTMLFormElement>('#contact-settings')!;
        form.onsubmit = async event => {
            event.preventDefault();
            const button = form.querySelector<HTMLButtonElement>('button')!;
            button.disabled = true;
            try { await this.request('/admin/contact-settings', 'PATCH', { whatsappUrl: String(new FormData(form).get('whatsappUrl') || '').trim() }); if (this.current()) await this.contact('Contact settings saved.'); }
            catch { if (this.current()) form.querySelector('[role=status]')!.textContent = 'Could not save the destination. Check the approved WhatsApp URL and retry.'; }
            finally { button.disabled = false; }
        };
    }
}
