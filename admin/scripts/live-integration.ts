// Explicit local-development acceptance. Credentials are read in memory, never printed or written.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,basename} from 'node:path';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {WorkspaceApi,ApiError} from '../src/api';
import * as C from '../vendor/contracts';
import {ROLE_PERMISSIONS,type StaffRole} from '../vendor/permissions';

const option=(name:string)=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1]};
const accountsFile=option('--accounts');
const origin=option('--origin')||'http://127.0.0.1:3013';
if(!accountsFile||!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))throw new Error('Provide --accounts pointing to the helper-owned development account file and a loopback --origin.');
const accounts=JSON.parse(readFileSync(resolve(accountsFile),'utf8'));
if(accounts.dataset!=='ikonectt-stage2-v1'||!/^ikonectt_development(?:_\d{13})?$/.test(accounts.database)||basename(accountsFile)!==`accounts-${accounts.database}.json`)throw new Error('Only the designated SIMULATED development dataset is permitted.');
const run=randomUUID().slice(0,8);
const checks:string[]=[];
const clients:WorkspaceApi[]=[];
const record=(name:string)=>{checks.push(name);console.log('PASS '+name)};
const sensitiveFetch:typeof fetch=async(input,options)=>{
    for(let attempt=0;attempt<3;attempt++){
        const response=await fetch(input,options);
        if(response.status!==429||attempt===2)return response;
        const ms=Math.min(65000,Math.max(1000,(Number(response.headers.get('retry-after'))||61)*1000+100));
        console.log('Respecting backend request quota before retry.');
        for(let remaining=ms;remaining>0;remaining-=Math.min(remaining,15000))await new Promise(r=>setTimeout(r,Math.min(remaining,15000)));
    }
    throw new Error('Request quota did not clear.');
};
const make=()=>{const api=new WorkspaceApi(origin,sensitiveFetch);clients.push(api);return api};
const expected=async(work:Promise<unknown>,status:number)=>assert.rejects(work,(error:unknown)=>error instanceof ApiError&&error.status===status,`Expected actual HTTP ${status}`);
async function main(){
    const health=await sensitiveFetch(`${origin}/api/v1/health`);assert.equal(health.status,200);assert.equal((await health.json()).database,'connected');
    record('Development API and database are reachable through the Admin same-origin proxy');
    const roles={} as Record<StaffRole,WorkspaceApi>;
    for(const role of C.Role.options){
        const account=accounts.staff.find((x:any)=>x.role===role);assert.ok(account,`Development role ${role} exists`);
        const api=make();await api.login(account.email,account.password);
        assert.equal(api.session!.principal.mustChangePassword,false,'Use completed shared-role setup; do not change shared passwords');
        await api.validateSession();
        assert.deepEqual([...api.permissions].sort(),[...ROLE_PERMISSIONS[role]].sort());roles[role]=api;
    }
    record('All six real role accounts authenticate, validate their sessions and consume server permissions');
    const {ADMIN:admin,SUPPORT:support,SALES:sales,FINANCE:finance,PROVISIONER:provisioner,EXECUTIVE:executive}=roles;
    const tempPassword=randomUUID()+randomUUID();
    const staff=await admin.save('staff',{name:`SIMULATED Agent3 acceptance ${run}`,email:`simulated.agent3.${run}@example.test`,password:tempPassword,roles:['SUPPORT']});
    const temp=make();await temp.login(staff.email,tempPassword);assert.equal(temp.session!.principal.mustChangePassword,true);
    await expected(temp.request('/admin/permissions'),403);
    const firstToken=temp.session!.accessToken;const nextPassword=randomUUID()+randomUUID();await temp.changePassword(tempPassword,nextPassword);
    await expected(temp.request('/auth/session','GET',undefined).then(()=>{throw new Error('Unauthenticated session unexpectedly accepted')}),401);
    await expected(admin.request('/auth/session','GET',undefined).then(async()=>{const r=await sensitiveFetch(`${origin}/api/v1/auth/session`,{headers:{Authorization:`Bearer ${firstToken}`}});if(r.status!==401)throw new Error('Password-change session remained valid');throw new ApiError('Revoked',r.status)}),401);
    await temp.login(staff.email,nextPassword);await temp.validateSession();assert.equal(temp.session!.principal.mustChangePassword,false);
    record('Isolated staff account enforces first-password change and revokes the old session');
    const recovery=await make().recover(`unknown.agent3.${run}@example.test`);assert.equal(recovery.ok,true);
    await expected(make().resetPassword(randomUUID()+randomUUID(),randomUUID()+randomUUID()),400);
    record('Staff recovery returns a generic acknowledgement; invalid reset token is rejected');

    const plan=await admin.save('plans',{code:`simulated-agent3-${run}`,name:`SIMULATED Agent3 Home ${run}`,kind:'RESIDENTIAL',priceMinor:2200000,currency:'NGN',speedMbps:75,billingDays:30,features:['SIMULATED acceptance only'],published:true});
    assert.ok((await sales.publicOptions('plans')).some(p=>p.id===plan.id));
    record('B: created/published plan is visible through the public catalogue API');
    let parent:string|undefined;let building:any;
    for(const level of C.CoverageLevel.options){building=await provisioner.save('coverage',{name:`SIMULATED Agent3 ${level} ${run}`,level,...(parent?{parentId:parent}:{}),eligibility:'UNKNOWN',planIds:[]});parent=building.id}
    const unknown=C.CoverageResult.parse(await admin.request('/coverage/check','POST',{buildingId:building.id,planId:plan.id}));assert.equal(unknown.eligibility,'UNKNOWN');
    await provisioner.save('coverage',{eligibility:'AVAILABLE',planIds:[plan.id],evidence:`SIMULATED address verification ${run}`},building.id);
    const eligible=C.CoverageResult.parse(await admin.request('/coverage/check','POST',{buildingId:building.id,planId:plan.id}));assert.equal(eligible.eligibility,'AVAILABLE');assert.ok(eligible.planIds.includes(plan.id));
    record('C: six-level hierarchy, UNKNOWN and building-level plan eligibility agree with coverage API');
    const created=await sales.save('customers',{name:`SIMULATED Agent3 Customer ${run}`,kind:'RESIDENTIAL',email:`simulated.customer.${run}@example.test`,phone:'+2348000000000',buildingId:building.id});
    assert.ok(C.Id.safeParse(created.customer.id).success);assert.notEqual(created.customer.id,created.customer.accountNumber);assert.equal(created.customer.accountNumberSimulated,true);
    const customerPassword=randomUUID()+randomUUID();await make().resetPassword(created.setupToken,customerPassword);
    await expected(make().resetPassword(created.setupToken,customerPassword),400);
    const customerSession=C.Session.parse(await make().request('/auth/login','POST',{accountNumber:created.customer.accountNumber,password:customerPassword}));
    const customer=make();customer.session=customerSession;
    const dashboard=C.Dashboard.parse(await customer.request('/me/dashboard'));assert.equal(dashboard.customer.id,created.customer.id);
    record('A: staff onboarding, single-use credential setup and customer authentication/dashboard use the same database');
    const lead=await admin.request('/leads','POST',{name:`SIMULATED Agent3 Lead ${run}`,email:`simulated.lead.${run}@example.test`,phone:'+2348000000000',kind:'RESIDENTIAL',message:'SIMULATED acceptance enquiry',planId:plan.id,buildingId:building.id,consent:true});
    const linked=await sales.save('leads',{status:'QUALIFIED',customerId:created.customer.id},lead.id);assert.equal(linked.customerId,created.customer.id);
    await admin.linkReference(created.customer.id,{system:`SIMULATED-AGENT3-${run}`,externalId:`SIMULATED-EXTERNAL-${run}`});assert.equal((await admin.references(created.customer.id)).length,1);
    record('Lead status/customer linkage and authorized external CRM references persist');

    const order=await sales.save('orders',{customerId:created.customer.id,planId:plan.id,buildingId:building.id,type:'NEW_CONNECTION'});
    await admin.save('plans',{priceMinor:2300000},plan.id);
    assert.equal((await sales.detail('orders',order.id)).amountMinor,2200000);
    record('Direct plan-price edit does not rewrite a historical order amount');
    const payment=await sales.save('payments',{orderId:order.id,amountMinor:order.amountMinor,currency:'NGN',reference:`SIMULATED-AGENT3-TRANSFER-${run}`,method:'BANK_TRANSFER',evidence:'SIMULATED reported evidence'});
    assert.equal(payment.status,'REPORTED');assert.equal((await admin.detail('orders',order.id)).status,'PENDING_PAYMENT');await expected(admin.receipt(payment.id),409);
    await expected(support.request(`/admin/payments/${payment.id}/verify`,'POST',{decision:'CONFIRMED',evidence:'SIMULATED denied operation'}),403);
    await expected(support.request('/admin/provisioning','POST',{orderId:order.id}),403);
    await expected(support.request('/admin/staff'),403);await expected(executive.request('/admin/customers'),403);
    await expected(sales.request(`/admin/coverage/${building.id}`,'PATCH',{eligibility:'UNAVAILABLE',planIds:[],evidence:'SIMULATED denied operation'}),403);
    record('F: real server rejects unauthorized verification, provisioning, staff management and coverage mutation');
    await finance.verify(payment.id,{decision:'CONFIRMED',evidence:`SIMULATED bank verification ${run}`});
    const paid=await admin.detail('orders',order.id);assert.equal(paid.status,'PAID');assert.equal(paid.subscriptionId,null);
    assert.equal((await admin.list('subscriptions')).filter(s=>s.customerId===created.customer.id).length,0);
    assert.equal((await finance.receipt(payment.id)).payment.status,'CONFIRMED');
    const activation=await provisioner.save('provisioning',{orderId:order.id});
    assert.equal(activation.simulated,true,'Development provider must remain labeled simulated');
    assert.ok(['ACTIVE','PENDING','REQUIRES_REVIEW','FAILED'].includes(activation.status));
    const subscription=await admin.detail('subscriptions',activation.subscriptionId);assert.equal(subscription.status,activation.status);
    const repeated=await provisioner.save('provisioning',{orderId:order.id});assert.equal(repeated.id,activation.id);
    record('D: finance confirmation sets PAID without activation; separate backend provisioning returns a labeled SIMULATED result without duplication');
    // Exercise a genuine manual result on an isolated owned pending request when the provider is manual.
    // With the shared development simulator, staff result overrides are deliberately rejected by the backend.
    if(activation.mode==='simulated')await expected(provisioner.save('provisioning',{status:'ACTIVE',reference:'SIMULATED-not-a-manual-override',evidence:'SIMULATED rejected manual override'},activation.id),409);
    const rejectionOrder=await sales.save('orders',{customerId:created.customer.id,planId:plan.id,buildingId:building.id});
    const rejectionPayment=await sales.save('payments',{orderId:rejectionOrder.id,amountMinor:rejectionOrder.amountMinor,currency:'NGN',reference:`SIMULATED-AGENT3-REJECT-${run}`,method:'BANK_TRANSFER',evidence:'SIMULATED evidence for rejection'});
    await finance.verify(rejectionPayment.id,{decision:'REJECTED',evidence:'SIMULATED rejected bank evidence'});assert.equal((await admin.detail('orders',rejectionOrder.id)).status,'PENDING_PAYMENT');
    record('Payment rejection preserves unpaid order state; simulated provisioning cannot accept a manual result override');

    const ticket=C.TicketDetail.parse(await customer.request('/me/tickets','POST',{subject:`SIMULATED Agent3 Ticket ${run}`,message:'SIMULATED customer support request'}));
    assert.ok((await support.detail('tickets',ticket.id)).messages.some((m:any)=>m.message==='SIMULATED customer support request'));
    await support.save('tickets',{status:'IN_PROGRESS',assignedToId:accounts.staff.find((x:any)=>x.role==='SUPPORT').id},ticket.id);
    await support.reply(ticket.id,'SIMULATED staff response visible to the customer');
    await support.save('tickets',{status:'RESOLVED'},ticket.id);
    const customerTicket=C.TicketDetail.parse(await customer.request(`/me/tickets/${ticket.id}`));assert.equal(customerTicket.status,'RESOLVED');assert.ok(customerTicket.messages.some(m=>m.message.includes('staff response')));
    record('E: customer ticket, staff assignment/reply/resolution and customer conversation agree');
    const replacement=await sales.credentials(created.customer.id);assert.ok(replacement.setupToken);assert.equal(replacement.setupExpiresInMinutes,30);
    const report=await executive.report();assert.ok(report.customers>0);assert.equal(report.includesSimulatedData,true);
    const audit=await admin.list('audit');assert.ok(audit.some(a=>a.entityId===order.id));assert.ok(audit.some(a=>a.entityId===payment.id));
    await admin.list('notifications');await admin.integrations();
    record('Summary reporting, audit events, notification metadata and provider modes read actual backend data');
    await admin.save('staff',{enabled:false},staff.id);await expected(temp.request('/auth/session'),401);
    const prior=admin.session!.accessToken;await admin.logout();const revoked=await sensitiveFetch(`${origin}/api/v1/auth/session`,{headers:{Authorization:`Bearer ${prior}`}});assert.equal(revoked.status,401);
    record('Disabled isolated staff and explicit logout revoke real server sessions');
    const summary={title:'IKONECTT — ADMIN/CRM STAGE 2 INTEGRATION REPORT',status:'PASS',at:new Date().toISOString(),database:accounts.database,transportOrigin:origin,checks,scope:'Real HTTP/database development acceptance; provider provisioning result is SIMULATED. No production deployment, browser visual assertion or credential disclosure.',records:{customerId:created.customer.id,planId:plan.id,buildingId:building.id,orderId:order.id,paymentId:payment.id,ticketId:ticket.id}};
    mkdirSync(new URL('../test-results/',import.meta.url),{recursive:true});writeFileSync(new URL('../test-results/live-integration.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
    console.log(`PASS ${checks.length} live acceptance groups; redacted summary saved in admin/test-results/live-integration.json`);
}
try{await main()}catch(error){const failure=error instanceof ApiError?`HTTP ${error.status} ${error.code||''} (${error.requestId||'no request id'})`:error instanceof Error?error.message:'Acceptance failed';console.error('FAIL '+failure);process.exitCode=1}finally{for(const api of clients){if(api.mode==='live'&&api.session){try{await api.logout()}catch{api.clear()}}}}
