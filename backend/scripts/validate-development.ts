import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import * as C from '../../contracts';
import { developmentFixtures as F } from '../../contracts/fixtures';
import { Database } from '../src/core/database';
import { digest } from '../src/core/crypto';
import { DevelopmentAccounts, developmentContext, saveAccounts } from './development-context';

async function main() {
  const context = developmentContext();
  const origin = process.env.DEV_API_ORIGIN || 'http://127.0.0.1:4000';
  if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) throw new Error('Validation targets a loopback development API only');
  const accounts: DevelopmentAccounts = JSON.parse(readFileSync(context.accountsFile,'utf8'));
  if (accounts.database !== context.database || accounts.dataset !== F.dataset) throw new Error('Run dev:fixtures for the current database first');
  const db = new Database(context.config);
  const checks: string[] = [];
  const record = (name: string) => { checks.push(name); console.log('PASS ' + name); };
  const persist = () => saveAccounts(context.accountsFile,accounts);
  const run = randomUUID().slice(0,8);
  async function api(method: string, path: string, bearer?: string, body?: unknown, expected = 200, base = origin): Promise<any> {
    for (let attempt=0; attempt<3; attempt++) {
      const response = await fetch(base+'/api/v1'+path,{ method, headers: { 'Content-Type':'application/json', ...(bearer ? { Authorization:'Bearer '+bearer } : {}) }, ...(body === undefined ? {} : { body:JSON.stringify(body) }) });
      if (response.status === 429 && expected !== 429 && attempt < 2) {
        const seconds = Math.min(65,Math.max(1,Number(response.headers.get('retry-after') || 61)));
        console.log(`Authentication/request quota respected; waiting ${seconds}s before retry`);
        let remaining = seconds*1000+100;
        while (remaining > 0) { const duration=Math.min(remaining,30000); await new Promise(resolve=>setTimeout(resolve,duration)); remaining-=duration; }
        continue;
      }
      const payload = await response.json();
      assert.equal(response.status,expected,`${method} ${path}: expected ${expected}, received ${response.status}`);
      if (expected >= 400) C.ErrorResponse.parse(payload);
      return payload;
    }
    throw new Error('Request quota did not clear');
  }
  try {
    assert.equal((await api('GET','/health')).database,'connected');
    const specification = await (await fetch(origin+'/api/docs-json')).json() as any;
    assert.equal(specification.info.version,C.API_VERSION);
    record('Development API health and published contract version');
    const staffTokens: Record<string,string> = {};
    for (const staff of accounts.staff) {
      let session = C.Session.parse(await api('POST','/auth/staff/login',undefined,{email:staff.email,password:staff.password}));
      if (session.principal.mustChangePassword) {
        await api('GET','/admin/permissions',session.accessToken,undefined,403);
        const nextPassword=randomUUID()+randomUUID();
        await api('POST','/auth/change-password',session.accessToken,{currentPassword:staff.password,password:nextPassword});
        await api('GET','/auth/session',session.accessToken,undefined,401);
        staff.password=nextPassword; staff.mustChangePassword=false; persist();
        session=C.Session.parse(await api('POST','/auth/staff/login',undefined,{email:staff.email,password:staff.password}));
      }
      staffTokens[staff.role]=session.accessToken;
      assert.equal((await api('GET','/admin/permissions',session.accessToken)).roles.includes(staff.role),true);
    }
    const {ADMIN:admin,SUPPORT:support,SALES:sales,FINANCE:finance,PROVISIONER:provisioner,EXECUTIVE:executive}=staffTokens;
    record('All six staff roles authenticate; initial password gate and session revocation');
    for (const customer of accounts.customers) if (!customer.password) {
      assert.ok(customer.setupToken && customer.setupExpiresAt && new Date(customer.setupExpiresAt)>new Date(),'Customer setup expired: run dev:fixtures to reissue an unused setup token');
      const nextPassword=randomUUID()+randomUUID();
      await api('POST','/auth/reset-password',undefined,{token:customer.setupToken,password:nextPassword});
      await api('POST','/auth/reset-password',undefined,{token:customer.setupToken,password:nextPassword},400);
      customer.password=nextPassword; delete customer.setupToken; delete customer.setupExpiresAt; persist();
    }
    const residential=accounts.customers.find(account=>account.id===F.customers[0].id)!;
    const business=accounts.customers.find(account=>account.id===F.customers[1].id)!;
    const residentialToken=C.Session.parse(await api('POST','/auth/login',undefined,{accountNumber:residential.accountNumber,password:residential.password})).accessToken;
    const businessToken=C.Session.parse(await api('POST','/auth/login',undefined,{accountNumber:business.accountNumber,password:business.password})).accessToken;
    assert.equal(C.Dashboard.parse(await api('GET','/me/dashboard',residentialToken)).usage,null);
    record('Residential/business setup, single-use tokens, login and unavailable usage');

    const created=await api('POST','/admin/customers',sales,{kind:'RESIDENTIAL',name:`DEVELOPMENT Workflow ${run}`,email:`workflow-${run}@example.test`,phone:'+2348000000000'});
    const customer=C.Customer.parse(created.customer);
    assert.ok(await db.customer.findUnique({where:{id:customer.id}}),'API and validation must use the same development database');
    const password=randomUUID()+randomUUID();
    await api('POST','/auth/reset-password',undefined,{token:created.setupToken,password});
    const session=C.Session.parse(await api('POST','/auth/login',undefined,{accountNumber:customer.accountNumber,password}));
    const owner=session.accessToken;
    C.Dashboard.parse(await api('GET','/me/dashboard',owner));
    assert.equal(await db.subscription.count({where:{customerId:customer.id}}),0);
    assert.ok(await db.session.findUnique({where:{tokenHash:digest(owner)}}));
    const identity=await db.user.findUniqueOrThrow({where:{customerId:customer.id}});
    assert.notEqual(identity.passwordHash,password);
    record('A: staff onboarding -> secure setup -> customer login -> dashboard; same real database');

    const plan=C.Plan.parse(await api('POST','/admin/plans',admin,{code:`development-${run}`,name:`DEVELOPMENT Validation Plan ${run}`,kind:'RESIDENTIAL',priceMinor:1500000,speedMbps:30,published:true}));
    await db.plan.update({where:{id:plan.id},data:{simulated:true}});
    await api('PATCH',`/admin/plans/${plan.id}`,admin,{features:['SIMULATED validation offer; not production pricing']});
    const street=F.locations.find(location=>location.level==='STREET_ESTATE')!;
    const building=C.CoverageLocation.parse(await api('POST','/admin/coverage',admin,{name:`DEVELOPMENT Building ${run}`,level:'BUILDING_ADDRESS',parentId:street.id,eligibility:'AVAILABLE',planIds:[plan.id],evidence:'SIMULATED development eligibility'}));
    await db.coverageLocation.update({where:{id:building.id},data:{simulated:true}});
    const unknown=F.locations.find(location=>location.eligibility==='UNKNOWN' && location.level==='BUILDING_ADDRESS')!;
    assert.equal(C.CoverageResult.parse(await api('POST','/coverage/check',undefined,{buildingId:unknown.id})).eligibility,'UNKNOWN');
    assert.equal(C.CoverageResult.parse(await api('POST','/coverage/check',undefined,{buildingId:building.id,planId:plan.id})).eligibility,'AVAILABLE');
    assert.equal(C.Plan.parse(await api('GET',`/plans/${plan.id}`)).simulated,true);
    record('B: published plans, geographic parent hierarchy, eligibility and UNKNOWN behavior');

    const order=C.Order.parse(await api('POST','/me/orders',owner,{planId:plan.id,buildingId:building.id}));
    await api('PATCH',`/admin/plans/${plan.id}`,admin,{priceMinor:1700000});
    assert.equal((await api('GET',`/me/orders/${order.id}`,owner)).amountMinor,1500000);
    const payment=C.Payment.parse(await api('POST','/me/payments',owner,{orderId:order.id,amountMinor:order.amountMinor,currency:'NGN',method:'BANK_TRANSFER',reference:`DEVELOPMENT-${run}`,evidence:'SIMULATED transfer evidence'}));
    await api('GET',`/me/payments/${payment.id}/receipt`,owner,undefined,409);
    await api('POST',`/admin/payments/${payment.id}/verify`,support,{decision:'CONFIRMED',evidence:'Unauthorized support attempt'},403);
    await api('POST','/admin/provisioning',provisioner,{orderId:order.id},409);
    await api('POST',`/admin/payments/${payment.id}/verify`,finance,{decision:'CONFIRMED',evidence:'SIMULATED authorized financial verification'});
    assert.equal((await db.order.findUniqueOrThrow({where:{id:order.id}})).status,'PAID');
    assert.equal(await db.subscription.count({where:{customerId:customer.id}}),0);
    await api('POST','/admin/provisioning',support,{orderId:order.id},403);
    const fulfillment=C.Provisioning.parse(await api('POST','/admin/provisioning',provisioner,{orderId:order.id}));
    assert.equal(fulfillment.simulated,true); assert.equal(fulfillment.status,'ACTIVE');
    const repeated=await api('POST','/admin/provisioning',provisioner,{orderId:order.id}); assert.equal(repeated.id,fulfillment.id);
    assert.equal(await db.provisioningRequest.count({where:{orderId:order.id}}),1);
    C.Receipt.parse(await api('GET',`/me/payments/${payment.id}/receipt`,owner));
    await api('GET',`/me/orders/${order.id}`,businessToken,undefined,404);
    await api('GET',`/me/subscriptions/${fulfillment.subscriptionId}`,businessToken,undefined,404);
    record('C: payment report/finance confirmation -> PAID without activation -> separate authorized simulated provisioning');

    const ticket=C.TicketDetail.parse(await api('POST','/me/tickets',owner,{subject:`DEVELOPMENT Support ${run}`,message:'SIMULATED support workflow',subscriptionId:fulfillment.subscriptionId}));
    C.TicketDetail.parse(await api('GET',`/admin/tickets/${ticket.id}`,support));
    await api('PATCH',`/admin/tickets/${ticket.id}`,support,{status:'IN_PROGRESS',assignedToId:F.staff.find(staff=>staff.role==='SUPPORT')!.id});
    await api('POST',`/admin/tickets/${ticket.id}/messages`,support,{message:'SIMULATED staff response'});
    assert.equal(C.TicketDetail.parse(await api('GET',`/me/tickets/${ticket.id}`,owner)).messages.length,2);
    await api('GET',`/me/tickets/${ticket.id}`,businessToken,undefined,404);
    await api('PATCH',`/admin/tickets/${ticket.id}`,support,{status:'CLOSED'});
    record('D: support creation, assignment, reply, customer conversation, closure and ownership isolation');

    const customerCount=await db.customer.count();
    const lead=await api('POST','/leads',undefined,{name:`DEVELOPMENT Lead ${run}`,email:`lead-${run}@example.test`,phone:'+2348000000000',kind:'RESIDENTIAL',message:'SIMULATED enquiry',consent:true,planId:plan.id});
    C.Lead.parse(await api('GET',`/admin/leads/${lead.id}`,sales));
    await api('PATCH',`/admin/leads/${lead.id}`,sales,{status:'QUALIFIED',customerId:customer.id});
    assert.equal(await db.customer.count(),customerCount);
    record('E: anonymous consented enquiry -> staff follow-up/linking; no automatic customer creation');

    await api('POST','/admin/staff',support,{name:'Forbidden',email:`forbidden-${run}@example.test`,password:randomUUID(),roles:['ADMIN']},403);
    await api('GET','/admin/customers',executive,undefined,403);
    await api('GET','/admin/customers',owner,undefined,403);
    await api('PATCH','/me/profile',owner,{email:'forbidden@example.test'},400);
    await api('POST','/auth/register',undefined,{},404);
    C.Report.parse(await api('GET','/admin/reports/summary',executive));
    assert.ok(await db.auditLog.findFirst({where:{entityId:payment.id,action:'payment.confirmed',actorId:F.staff.find(staff=>staff.role==='FINANCE')!.id}}));
    const log=await db.auditLog.findFirstOrThrow({where:{entityId:payment.id}});
    await assert.rejects(db.auditLog.update({where:{id:log.id},data:{action:'tampered'}}));
    record('F: role/action and highest-role restrictions, customer isolation and immutable audit trail');

    // Actual loopback API instances, same persistent DB and real adapters; no mocked services.
    const {createApp}=await import('../src/bootstrap');
    const previousScenario=process.env.SIMULATOR_SCENARIO;
    for(const scenario of ['failure','timeout']) {
      process.env.SIMULATOR_SCENARIO=scenario;
      const scenarioApp=await createApp(true);
      try {
        await scenarioApp.listen(0,'127.0.0.1'); const scenarioOrigin=await scenarioApp.getUrl();
        const pending=await api('POST','/me/orders',owner,{planId:plan.id,buildingId:building.id});
        const reported=await api('POST','/me/payments',owner,{orderId:pending.id,amountMinor:pending.amountMinor,currency:'NGN',method:'BANK_TRANSFER',reference:`DEVELOPMENT-${run}-${scenario}`,evidence:'SIMULATED scenario'});
        await api('POST',`/admin/payments/${reported.id}/verify`,finance,{decision:'CONFIRMED',evidence:'SIMULATED scenario verification'});
        const result=await api('POST','/admin/provisioning',provisioner,{orderId:pending.id},200,scenarioOrigin);
        assert.equal(result.status,'REQUIRES_REVIEW'); assert.equal(result.simulated,true);
        assert.notEqual((await db.subscription.findUniqueOrThrow({where:{id:result.subscriptionId}})).status,'ACTIVE');
      } finally {await scenarioApp.close();}
    }
    process.env.SIMULATOR_SCENARIO=previousScenario;
    record('Real API/provider failure and timeout produce labeled REQUIRES_REVIEW without activation');
    for(const scenario of F.scenarios) {
      const record=await db.order.findUniqueOrThrow({where:{id:scenario.order.id}}); assert.equal(record.status,scenario.order.status);
    }
    record('Canonical pending/failed/active/rejected/timeout scenario records remain persisted');
    await api('POST','/auth/logout',owner); await api('GET','/me/dashboard',owner,undefined,401);
    record('Logout revokes the real customer session');
    const summary={status:'PASS',at:new Date().toISOString(),database:context.database,contractVersion:C.API_VERSION,checks,simulated:true,productionDeployment:false};
    writeFileSync(join(context.directory,'workflow-validation.json'),JSON.stringify(summary,null,2)+'\n');
    console.log(`Development workflow verification complete: ${checks.length} checks; credentials/tokens excluded from report`);
  } finally {await db.$disconnect();}
}
main().catch(error=>{console.error(error instanceof Error ? `${error.name}: ${error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[redacted]')}`:'Development validation failed');process.exitCode=1;});
