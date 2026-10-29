import { z } from 'zod';
import * as C from '../vendor/contracts';
import { ROLE_PERMISSIONS, type StaffRole } from '../vendor/permissions';
import { modules, type RecordData } from './modules';
import { fixtures, uuid } from './fixtures';
import { standaloneFixtures } from './demo-fixtures';
import { STANDALONE_DEMO } from './runtime';
import {CreatedCustomer,PermissionSnapshot,SetupCredentials,parseResponse,type ListOptions} from './contracts';
export type Session = z.infer<typeof C.Session>;
const freshFixtures = () => STANDALONE_DEMO ? standaloneFixtures() : fixtures();
export class ApiError extends Error {
    constructor(message: string, public status = 400, public code?:string, public requestId?:string, public details?:unknown, public retryAfter?:number) { super(message); }
}
export class WorkspaceApi {
    session: Session | null = null;
    mode: 'live' | 'mock' = 'live';
    data = freshFixtures();
    permissions: string[] = [];
    onExpired = () => { };
    constructor(private readonly baseUrl='',private readonly fetcher:typeof fetch=(...args)=>fetch(...args)){}
    async request(path: string, method = 'GET', body?: unknown): Promise<any> {
        if (STANDALONE_DEMO)
            throw new ApiError('Standalone demonstration: real sign-in, recovery and backend requests are unavailable. Use Review the application.',400,'STANDALONE_DEMO');
        const sessionAtStart = this.session;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
            const r = await this.fetcher(`${this.baseUrl.replace(/\/$/,'')}${C.API_PREFIX}${path}`, { method, signal: controller.signal, cache: 'no-store', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(this.session ? { Authorization: `Bearer ${this.session.accessToken}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
            const payload = await r.json().catch(() => null);
            if (sessionAtStart && sessionAtStart !== this.session)
                throw new ApiError('This session has ended.', 401);
            if (!r.ok) {
                if (r.status === 401 && this.session) {
                    this.clear();
                    this.onExpired();
                }
                const retryAfter = Number(r.headers.get('retry-after')) || undefined;
                const message = r.status === 429
                    ? `Too many requests. Please wait ${retryAfter ? `${Math.ceil(retryAfter)} seconds` : 'a minute'} before trying again.`
                    : payload?.message || `Request failed (${r.status})`;
                throw new ApiError(message, r.status,payload?.code,payload?.requestId,payload?.details,retryAfter);
            }
            if (payload === null)
                throw new ApiError('The service returned an invalid response.', 502);
            return payload;
        }
        catch (e) {
            if (e instanceof ApiError)
                throw e;
            throw new ApiError(e instanceof Error && e.name === 'AbortError' ? 'The service timed out. Please retry.' : 'Cannot reach the shared backend. Check the service connection.', 503);
        }
        finally {
            clearTimeout(timer);
        }
    }
    clear() { this.session = null; this.permissions = []; this.data = freshFixtures(); }
    setSession(session: Session) {
        if(session.principal.kind!=='STAFF')throw new ApiError('Staff access is required.',403);
        this.session=session;
        this.permissions=this.mode==='mock'?Array.from(new Set(session.principal.roles.flatMap(role=>ROLE_PERMISSIONS[role]))):[];
    }
    assert(permission: string) { if (!this.session || Date.parse(this.session.expiresAt) <= Date.now()) {
        this.clear();
        this.onExpired();
        throw new ApiError('Your session has expired. Sign in again.', 401);
    } if (!this.permissions.includes(permission))
        throw new ApiError('You do not have permission for this action.', 403); }
    async login(email: string, password: string) { this.mode = 'live'; const input = C.StaffLoginRequest.parse({ email, password }); try {
        this.setSession(C.Session.parse(await this.request('/auth/staff/login', 'POST', input)));
        if (!this.session!.principal.mustChangePassword)
            await this.refreshPermissions();
    }
    catch (e) {
        this.clear();
        throw e;
    } }
    async refreshPermissions() { if (this.mode === 'mock')
        return; const result = parseResponse(PermissionSnapshot,await this.request('/admin/permissions')); this.permissions = result.permissions; if (this.session)
        this.session.principal.roles = result.roles; }
    async validateSession(){
        if(!this.session)throw new ApiError('Sign in to continue.',401);
        if(this.mode==='mock')return this.session.principal;
        const principal=parseResponse(C.Session.shape.principal,await this.request('/auth/session'));
        if(principal.kind!=='STAFF'){this.clear();throw new ApiError('Staff access is required.',403)}
        this.session!.principal=principal;
        if(principal.mustChangePassword)this.permissions=[];else await this.refreshPermissions();
        return principal;
    }
    async recover(email:string){this.mode='live';return parseResponse(C.Ok,await this.request('/auth/staff/recovery','POST',C.StaffRecoveryRequest.parse({email})))}
    async resetPassword(token:string,password:string){this.mode='live';return parseResponse(C.Ok,await this.request('/auth/reset-password','POST',C.ResetPasswordRequest.parse({token,password})))}
    async changePassword(currentPassword:string,password:string){if(this.mode!=='live')throw new ApiError('Password changes require the shared backend.');const result=parseResponse(C.Ok,await this.request('/auth/change-password','POST',C.ChangePasswordRequest.parse({currentPassword,password})));this.clear();return result}
    async credentials(id:string){this.assert('customers.write');if(this.mode!=='live')throw new ApiError('Credential setup requires the shared backend.');return parseResponse(SetupCredentials,await this.request(`/admin/customers/${C.Id.parse(id)}/credentials`,'POST'))}
    preview(role: StaffRole) { this.mode = 'mock'; this.data = freshFixtures(); this.setSession({ accessToken: 'SIMULATED', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600000).toISOString(), principal: { id: uuid(80), kind: 'STAFF', customerId: null, roles: [role], mustChangePassword: false } }); }
    async logout() { try {
        if (this.mode === 'live' && this.session)
            await this.request('/auth/logout', 'POST');
    }
    finally {
        this.clear();
    } }
    async list(key: string): Promise<RecordData[]> {
        const m = modules[key];
        this.assert(m.permission);
        if (this.mode === 'mock')
            return this.data[key].map(item => m.schema.parse(structuredClone(item)));
        let all: RecordData[] = [];
        let offset = 0;
        while (true) {
            const page = await this.listPage(key,{offset,limit:100});
            all.push(...page.items);
            offset += page.items.length;
            if (offset >= page.total)
                break;
            if (!page.items.length)
                throw new ApiError('The service returned an incomplete page.', 502);
        }
        return all;
    }
    async listPage(key:string,options:ListOptions={}){
        const m=modules[key];this.assert(m.permission);
        const query=(key==='coverage'?C.CoverageQuery.strict():C.ListQuery).parse(options);
        if(this.mode==='mock'){
            const coverage=query as z.infer<typeof C.CoverageQuery>;
            const data=this.data[key].filter(x=>(!coverage.level||x.level===coverage.level)&&(!coverage.parentId||x.parentId===coverage.parentId));
            return {items:data.slice(query.offset,query.offset+query.limit).map(x=>m.schema.parse(structuredClone(x))),total:data.length,offset:query.offset,limit:query.limit};
        }
        return parseResponse(C.page(m.schema),await this.request(`${m.path}?${new URLSearchParams(Object.entries(query).map(([k,v])=>[k,String(v)]))}`));
    }
    async detail(key:string,id:string):Promise<RecordData>{
        const m=modules[key];this.assert(m.permission);C.Id.parse(id);
        if(this.mode==='live'&&['customers','leads','orders','payments','subscriptions','tickets','walletTopUps','walletRenewals'].includes(key))return parseResponse(key==='tickets'?C.TicketDetail:m.schema,await this.request(`${m.path}/${id}`));
        const record=(await this.list(key)).find(x=>x.id===id);if(!record)throw new ApiError('Record not found.',404);return key==='tickets'?{...record,messages:await this.messages(id)}:record;
    }
    async publicOptions(key:'plans'|'coverage'){
        if(this.mode==='mock')return this.data[key].map(x=>modules[key].schema.parse(x));
        const path=key==='plans'?'/plans':'/coverage/locations';let offset=0;const all:RecordData[]=[];
        while(true){const p=parseResponse(C.page(modules[key].schema),await this.request(`${path}?offset=${offset}&limit=100`));all.push(...p.items);offset+=p.items.length;if(offset>=p.total)break;if(!p.items.length)throw new ApiError('The service returned an incomplete page.',502)}
        return all;
    }
    audit(action: string, entityType: string, entityId: string) { this.data.audit.unshift({ id: crypto.randomUUID(), actorId: this.session!.principal.id, action, entityType, entityId, metadata: { simulated: true }, createdAt: new Date().toISOString() }); }
    async save(key: string, input: RecordData, id?: string) {
        const m = modules[key];
        this.assert(m.write || '__denied');
        const schema = id ? m.update : m.input;
        if (!schema)
            throw new ApiError('This operation is not supported by the contract.');
        const body = schema.parse(input);
        if (this.mode === 'live'){
            const schema=key==='customers'&&!id?CreatedCustomer:key==='tickets'&&!id?C.TicketDetail:m.schema;
            return parseResponse(schema,await this.request(`${m.path}${id ? `/${C.Id.parse(id)}${key === 'provisioning' ? '/result' : ''}` : ''}`, id && key !== 'provisioning' ? 'PATCH' : 'POST', body));
        }
        if (key === 'coverage' && !id) {
            const levels = C.CoverageLevel.options;
            const pos = levels.indexOf(body.level);
            const parent = this.data.coverage.find(x => x.id === body.parentId);
            if (pos === 0 ? !!body.parentId : (!parent || parent.level !== levels[pos - 1]))
                throw new ApiError('Choose a parent at the preceding hierarchy level.');
        }
        if (id) {
            const item = this.data[key].find(x => x.id === id);
            if (!item)
                throw new ApiError('Record not found.', 404);
            if (key === 'staff' && item.roles.includes('ADMIN') && (body.enabled === false || (body.roles && !body.roles.includes('ADMIN'))) && !this.data.staff.some(x => x.id !== id && x.enabled && x.roles.includes('ADMIN')))
                throw new ApiError('At least one enabled administrator is required.');
            if (key === 'provisioning') {
                if (item.mode.toLowerCase() !== 'manual')
                    throw new ApiError('Only manual requests accept staff-confirmed outcomes.');
                if (item.status === 'ACTIVE')
                    throw new ApiError('This request has already been completed.', 409);
                const sub = this.data.subscriptions.find(x => x.id === item.subscriptionId);
                const order = this.data.orders.find(x => x.id === item.orderId);
                if (order?.status !== 'FULFILLING')
                    throw new ApiError('Order is not awaiting fulfillment.');
                if (body.status === 'ACTIVE' && !this.data.payments.some(p => p.orderId === item.orderId && p.status === 'CONFIRMED'))
                    throw new ApiError('Confirmed payment is required.');
                if (sub) {
                    sub.status = body.status;
                    if (body.status === 'ACTIVE') {
                        sub.startsAt = new Date().toISOString();
                        sub.endsAt = new Date(Date.now() + order.billingDays * 86400000).toISOString();
                        sub.externalServiceId = body.reference;
                        order.status = 'COMPLETED';
                    }
                }
            }
            Object.assign(item, body);
            this.audit('UPDATE', key, id);
            return structuredClone(item);
        }
        const item = { id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        if (key === 'customers') {
            Object.assign(item, { accountNumber: `SIM-${String(this.data.customers.length + 10000001)}`, accountNumberSimulated: true, status: 'ACTIVE', buildingId: body.buildingId || null });
            if (STANDALONE_DEMO) this.data.walletSummaries.push(C.WalletSummary.parse({
                customerId: item.id, currency: 'NGN', postedMinor: 0, reservedMinor: 0,
                availableMinor: 0, pendingTopUpsMinor: 0, pendingTopUpsCount: 0, simulated: true,
                topUpInstructions: { mode: 'MANUAL_REPORT', bankDetails: null,
                    notice: 'Standalone fictional wallet. No transfer, bank settlement or live provider is connected.' }
            }));
        }
        if (key === 'plans')
            Object.assign(item, { simulated: true });
        if (key === 'coverage')
            Object.assign(item, { parentId: body.parentId || null, evidence: body.evidence || null, simulated: true, verifiedAt: null });
        if (key === 'staff') {
            delete item.password;
            Object.assign(item, { enabled: true });
        }
        if (key === 'tickets') {
            if (!this.data.customers.some(c => c.id === body.customerId))
                throw new ApiError('Customer not found.');
            Object.assign(item, { status: 'OPEN', assignedToId: null, subscriptionId: body.subscriptionId || null });
            delete item.message;
            this.data.messages.push({ id: crypto.randomUUID(), ticketId: item.id, authorId: this.session!.principal.id, message: body.message, createdAt: item.createdAt });
        }
        if (key === 'payments') {
            const order = this.data.orders.find(x => x.id === body.orderId);
            if (!order)
                throw new ApiError('Order not found.');
            if (order.status !== 'PENDING_PAYMENT' || order.amountMinor !== body.amountMinor || order.currency !== body.currency)
                throw new ApiError('Report must match an order awaiting payment.');
            if (this.data.payments.some(x => x.reference === body.reference))
                throw new ApiError('Payment reference already exists.', 409);
            Object.assign(item, { customerId: order.customerId, status: 'REPORTED', verificationEvidence: null, verifiedById: null, verifiedAt: null });
        }
        if (key === 'provisioning') {
            const order = this.data.orders.find(x => x.id === body.orderId);
            if (!order || order.status !== 'PAID' || !this.data.payments.some(p => p.orderId === order.id && p.status === 'CONFIRMED'))
                throw new ApiError('Confirmed payment is required before fulfillment.');
            if (this.data.provisioning.some(p => p.orderId === body.orderId))
                throw new ApiError('A provisioning request already exists for this order.', 409);
            const building = this.data.coverage.find(x => x.id === order.buildingId);
            if (building?.eligibility !== 'AVAILABLE' || !building.planIds.includes(order.planId))
                throw new ApiError('Verified address eligibility is required.');
            const sub = { id: crypto.randomUUID(), customerId: order.customerId, planId: order.planId, buildingId: order.buildingId, status: 'PENDING', startsAt: null, endsAt: null, externalServiceId: null, simulated: true };
            this.data.subscriptions.push(sub);
            Object.assign(item, { subscriptionId: sub.id, status: 'PENDING', mode: 'manual', reference: null, simulated: true });
            order.status = 'FULFILLING';
        }
        if (key === 'orders') {
            const plan = this.data.plans.find(p => p.id === body.planId);
            const customer = this.data.customers.find(c => c.id === body.customerId);
            const building = this.data.coverage.find(c => c.id === body.buildingId);
            if (!plan || !customer || building?.level !== 'BUILDING_ADDRESS')
                throw new ApiError('Select an existing customer, plan and building.');
            if (customer.status !== 'ACTIVE')
                throw new ApiError('Customer account is not active.');
            if (!plan.published || plan.kind !== customer.kind)
                throw new ApiError('A published plan for this customer type is required.');
            if (body.type !== 'NEW_CONNECTION') {
                const sub = this.data.subscriptions.find(x => x.id === body.subscriptionId && x.customerId === customer.id);
                if (!sub || !['ACTIVE', 'SUSPENDED'].includes(sub.status) || sub.buildingId !== body.buildingId)
                    throw new ApiError('An eligible customer subscription is required.');
                if (body.type === 'RENEWAL' && sub.planId !== body.planId)
                    throw new ApiError('Renewal must keep the subscription plan.');
            }
            if (building.eligibility !== 'AVAILABLE' || !building.planIds.includes(plan.id))
                throw new ApiError('The selected plan is not eligible at this address.');
            Object.assign(item, { status: 'PENDING_PAYMENT', subscriptionId: body.subscriptionId || null, amountMinor: plan.priceMinor, currency: 'NGN', planName: plan.name, billingDays: plan.billingDays });
        }
        this.data[key].unshift(item);
        this.audit('CREATE', key, item.id);
        return structuredClone(item);
    }
    async verify(id: string, input: unknown) { this.assert('payments.verify'); const body = C.VerifyPaymentRequest.parse(input); if (this.mode === 'live')
        return parseResponse(C.AdminPayment,await this.request(`/admin/payments/${C.Id.parse(id)}/verify`, 'POST', body)); const p = this.data.payments.find(x => x.id === id); if (!p)
        throw new ApiError('Payment not found.', 404); if (p.status === body.decision)
        return structuredClone(p); if (p.status !== 'REPORTED')
        throw new ApiError('This payment has already been reviewed.', 409); const order = this.data.orders.find(x => x.id === p.orderId); if (body.decision === 'CONFIRMED' && (order?.status !== 'PENDING_PAYMENT' || order.amountMinor !== p.amountMinor))
        throw new ApiError('Order is no longer awaiting this payment.'); p.status = body.decision; p.verificationEvidence = body.evidence; p.verifiedById = this.session!.principal.id; p.verifiedAt = new Date().toISOString(); if (body.decision === 'CONFIRMED' && order)
        order.status = 'PAID'; this.audit(`PAYMENT_${body.decision}`, 'payments', id); return structuredClone(p); }
    async messages(id: string) { this.assert('support.read'); return this.mode === 'mock' ? this.data.messages.filter(x => x.ticketId === id) : C.TicketDetail.parse(await this.request(`/admin/tickets/${id}`)).messages; }
    async reply(id: string, message: string) { this.assert('support.write'); const body = C.TicketMessageRequest.parse({ message }); if (this.mode === 'live')
        return parseResponse(C.TicketMessage,await this.request(`/admin/tickets/${C.Id.parse(id)}/messages`, 'POST', body)); this.data.messages.push({ id: crypto.randomUUID(), ticketId: id, authorId: this.session!.principal.id, message, createdAt: new Date().toISOString() }); this.audit('SUPPORT_MESSAGE', 'tickets', id); }
    async receipt(id: string) { this.assert('payments.read'); if (this.mode === 'live')
        return C.Receipt.parse(await this.request(`/admin/payments/${id}/receipt`)); const p = this.data.payments.find(x => x.id === id); if (p?.status !== 'CONFIRMED')
        throw new ApiError('A receipt is available after confirmation.'); return { receiptNumber: `SAMPLE-${id.slice(-4)}`, payment: p, issuedAt: p.verifiedAt }; }
    async report() { this.assert('reports.read'); if (this.mode === 'live')
        return C.Report.parse(await this.request('/admin/reports/summary')); return C.Report.parse({ customers: this.data.customers.length, leads: this.data.leads.length, orders: this.data.orders.length, openTickets: this.data.tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length, confirmedPaymentsMinor: this.data.payments.filter(p => p.status === 'CONFIRMED').reduce((n, p) => n + p.amountMinor, 0), currency: 'NGN', subscriptionsByStatus: C.SubscriptionStatus.options.map(status => ({ status, count: this.data.subscriptions.filter(s => s.status === status).length })), includesSimulatedData: true }); }
    async integrations() { this.assert('integrations.read'); if (this.mode === 'live')
        return parseResponse(z.record(z.string()),await this.request('/admin/integrations')); return [{ name: 'Legacy CRM', mode: 'disabled' }, { name: 'Coverage adapter', mode: 'simulated' }, { name: 'Payment provider', mode: 'manual' }, { name: 'Payment settlement', mode: 'not-connected' }, { name: 'Provisioning adapter', mode: 'manual' }, { name: 'Notifications', mode: 'disabled' }]; }
    async references(id: string) { this.assert('integrations.read'); return this.mode === 'mock' ? this.data.references.filter(x => x.customerId === id) : z.array(C.ExternalReference).parse(await this.request(`/admin/integrations/customers/${id}/references`)); }
    async linkReference(id: string, input: unknown) { this.assert('integrations.write'); const body = C.ExternalReferenceRequest.parse(input); if (this.mode === 'live')
        return parseResponse(C.ExternalReference,await this.request(`/admin/integrations/customers/${C.Id.parse(id)}/references`, 'POST', body)); if (this.data.references.some(x => (x.customerId === id && x.system === body.system) || (x.system === body.system && x.externalId === body.externalId)))
        throw new ApiError('This reference is already linked.', 409); const r = { id: crypto.randomUUID(), customerId: id, ...body, createdAt: new Date().toISOString() }; this.data.references.push(r); this.audit('REFERENCE_LINKED', 'customers', id); return r; }
}
