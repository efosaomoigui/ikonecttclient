// Real HTTP acceptance using the two shipped frontend adapters. Never log credentials.
// Run with: node admin/node_modules/tsx/dist/cli.mjs scripts/platform-acceptance.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {WorkspaceApi} from '../admin/src/api.ts';
import {createLiveAdapter} from '../my-ikonectt/live.js';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const config=JSON.parse(fs.readFileSync(path.join(root,'.platform/config.json')));
const requireBackend=createRequire(path.join(root,'backend/package.json'));
const env=requireBackend('dotenv').parse(fs.readFileSync(path.join(config.backendRoot,'.env')));
assert.equal(env.NODE_ENV,'development');
assert.equal(new URL(env.DATABASE_URL).hostname,'127.0.0.1');
assert.equal(env.PROVISIONING_ADAPTER,'simulated');
const dbState=JSON.parse(fs.readFileSync(path.join(config.backendRoot,'.local/development/database.json')));
requireBackend('./scripts/development-safety.cjs').assertOwnedDevelopment(dbState,env,path.join(config.backendRoot,'.local/development'));
const manifestPath=path.join(config.backendRoot,'.local/development',`accounts-${dbState.database}.json`);
const manifest=JSON.parse(fs.readFileSync(manifestPath));
const {PrismaClient}=requireBackend('@prisma/client');
const db=new PrismaClient({datasources:{db:{url:env.DATABASE_URL}}});
const run=randomUUID().slice(0,8),checks=[],staff={},clients=[];
const evidence={run,startedAt:new Date().toISOString(),environment:'local development',contractVersion:'1.0.1',simulation:true,checks};
const output=path.join(root,'docs/stage4',`api-acceptance-${run}.json`);
fs.mkdirSync(path.dirname(output),{recursive:true});
const pass=(name,details={})=>{checks.push({name,status:'PASS',...details});console.log('PASS '+name)};
async function denied(action,status){await assert.rejects(action,error=>error.status===status);}
async function raw(route,{token,method='GET',body}={}){
  const response=await fetch('http://127.0.0.1:4000/api/v1'+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status,body:await response.json(),headers:response.headers};
}
async function customer(label){
  const created=await staff.ADMIN.save('customers',{kind:'RESIDENTIAL',name:`SIMULATED Stage4 ${label} ${run}`,email:`stage4-${label}-${run}@example.test`,phone:'+2348000000000'});
  const password='Development-'+randomBytes(24).toString('base64url');
  const adapter=createLiveAdapter();clients.push(adapter);
  await adapter.resetPassword(created.setupToken,password);
  await denied(()=>adapter.resetPassword(created.setupToken,password),400);
  const profile=await adapter.login(created.customer.accountNumber,password);
  assert.equal(profile.id,created.customer.id);
  assert.equal((await adapter.session()).mustChangePassword,undefined);
  return {adapter,profile,password};
}
try{
  const liveCapabilities=await raw('/capabilities');
  assert.equal(liveCapabilities.status,200);
  assert.equal(liveCapabilities.body.provisioning,'simulated');
  assert.ok(['disabled','manual','simulated'].includes(liveCapabilities.body.payments));
  for(const role of ['ADMIN','FINANCE','PROVISIONER','SUPPORT']){
    const account=manifest.staff.find(item=>item.role===role);
    const api=new WorkspaceApi('http://127.0.0.1:3013');
    await api.login(account.email,account.password);staff[role]=api;
    assert.equal(api.session.principal.mustChangePassword,false);
  }
  pass('Live Admin proxy and role sessions');
  const first=await customer('customer'),other=await customer('isolation');
  pass('Admin creation, single-use setup and intended customer login',{customerId:first.profile.id,accountNumber:first.profile.accountNumber});
  const user=await db.user.findUniqueOrThrow({where:{customerId:first.profile.id}});
  assert.equal(user.mustChangePassword,false);
  const plan=await staff.ADMIN.save('plans',{code:`stage4-${run}`,name:`SIMULATED Stage4 ${run}`,kind:'RESIDENTIAL',priceMinor:1900000,speedMbps:80,billingDays:30,published:true});
  // Only this run's newly created records are marked simulated; no existing data is changed.
  await db.plan.update({where:{id:plan.id},data:{simulated:true}});
  await staff.ADMIN.save('plans',{priceMinor:1950000},plan.id);
  const portalPlan=(await first.adapter.plans()).find(item=>item.id===plan.id);
  assert.equal(portalPlan.priceMinor,1950000);assert.equal(portalPlan.simulated,true);
  let parentId;
  for(const level of ['COUNTRY','STATE','CITY_LGA','DISTRICT_AREA','STREET_ESTATE']){
    const location=await staff.ADMIN.save('coverage',{name:`SIMULATED Stage4 ${level} ${run}`,level,...(parentId?{parentId}:{}),eligibility:'UNKNOWN'});
    await db.coverageLocation.update({where:{id:location.id},data:{simulated:true}});parentId=location.id;
  }
  const building=await staff.ADMIN.save('coverage',{name:`SIMULATED Stage4 Building ${run}`,level:'BUILDING_ADDRESS',parentId,eligibility:'UNKNOWN'});
  await db.coverageLocation.update({where:{id:building.id},data:{simulated:true}});
  assert.equal((await first.adapter.checkCoverage({buildingId:building.id,planId:plan.id})).eligibility,'UNKNOWN');
  await staff.ADMIN.save('coverage',{eligibility:'AVAILABLE',planIds:[plan.id],evidence:`SIMULATED Stage4 ${run} local check`},building.id);
  assert.equal((await first.adapter.checkCoverage({buildingId:building.id,planId:plan.id})).eligibility,'AVAILABLE');
  pass('Admin plan and building updates reach portal; UNKNOWN preserved',{planId:plan.id,buildingId:building.id,priceMinor:1950000});
  const order=await first.adapter.createOrder({planId:plan.id,buildingId:building.id,type:'NEW_CONNECTION'});
  assert.equal((await staff.ADMIN.detail('orders',order.id)).customerId,first.profile.id);
  assert.equal(order.amountMinor,1950000);assert.equal(order.status,'PENDING_PAYMENT');
  const payment=await first.adapter.reportPayment({orderId:order.id,amountMinor:order.amountMinor,currency:'NGN',method:'BANK_TRANSFER',reference:`SIMULATED-STAGE4-${run}`,evidence:'SIMULATED development transfer; no real money'});
  assert.equal(payment.status,'REPORTED');
  await denied(()=>first.adapter.receipt(payment.id),409);
  const report=(await staff.FINANCE.list('payments')).find(item=>item.id===payment.id);assert.ok(report);
  // Bypass UI permission guards to verify backend denial too.
  assert.equal((await raw(`/admin/payments/${payment.id}/verify`,{token:staff.SUPPORT.session.accessToken,method:'POST',body:{decision:'CONFIRMED',evidence:'SIMULATED unauthorized attempt'}})).status,403);
  assert.equal((await raw('/admin/provisioning',{token:staff.FINANCE.session.accessToken,method:'POST',body:{orderId:order.id}})).status,403);
  await staff.FINANCE.verify(payment.id,{decision:'CONFIRMED',evidence:'SIMULATED Stage4 Finance verification; no bank integration'});
  const paid=await first.adapter.summary();
  assert.equal(paid.orders.find(item=>item.id===order.id).status,'PAID');assert.equal(paid.services.length,0);
  assert.equal(paid.payments.find(item=>item.id===payment.id).amount,19500);
  assert.equal((await first.adapter.receipt(payment.id)).amount,19500);
  pass('Customer order, Finance confirmation, NGN formatting and PAID without activation',{orderId:order.id,paymentId:payment.id,amountMinor:1950000,portalAmount:19500});
  const provision=await staff.PROVISIONER.save('provisioning',{orderId:order.id});
  assert.equal(provision.simulated,true);assert.equal(provision.status,'ACTIVE');
  const active=await first.adapter.summary();
  assert.equal(active.services.length,1);assert.equal(active.services[0].status,'Active');assert.equal(active.services[0].simulated,true);
  assert.equal(active.services[0].usage,null);assert.equal(active.orders.find(item=>item.id===order.id).status,'COMPLETED');
  pass('Separate authorized simulated provisioning reaches portal subscription',{provisioningId:provision.id,subscriptionId:provision.subscriptionId});
  const ticket=await first.adapter.createTicket({subject:`SIMULATED Stage4 support ${run}`,description:'SIMULATED customer asks for installation guidance'});
  await staff.SUPPORT.reply(ticket.id,'SIMULATED support reply from integrated Admin');
  await staff.SUPPORT.save('tickets',{status:'RESOLVED'},ticket.id);
  const conversation=await first.adapter.ticket(ticket.id);
  assert.equal(conversation.status,'Resolved');assert.ok(conversation.updates.some(item=>item.message.includes('integrated Admin')));
  pass('Customer support ticket, staff reply and status synchronize',{ticketId:ticket.id,messages:conversation.updates.length});
  await denied(()=>other.adapter.order(order.id),404);await denied(()=>other.adapter.receipt(payment.id),404);
  await denied(()=>other.adapter.ticket(ticket.id),404);await denied(()=>other.adapter.reply(ticket.id,'SIMULATED forbidden'),404);
  pass('Cross-customer order, receipt, ticket and reply isolation');
  const page=await staff.ADMIN.listPage('orders',{limit:1,offset:0});assert.equal(page.limit,1);assert.equal(page.items.length,1);assert.ok(page.total>1);
  assert.equal((await staff.ADMIN.request('/admin/orders')).limit,25);
  assert.equal((await raw('/admin/orders?limit=101',{token:staff.ADMIN.session.accessToken})).status,400);
  const invalid=await raw('/admin/orders/not-an-id',{token:staff.ADMIN.session.accessToken});assert.equal(invalid.status,400);assert.ok(invalid.body.requestId);assert.ok(invalid.body.code);
  assert.equal((await raw('/me/profile',{token:staff.ADMIN.session.accessToken})).status,403);
  const capabilities=await first.adapter.providerCapabilities();
  evidence.providerCapabilities=capabilities;
  assert.equal(capabilities.provisioning,'simulated');
  assert.equal((await raw('/auth/session')).status,401);
  const revoked=staff.SUPPORT.session.accessToken;await staff.SUPPORT.logout();
  assert.equal((await raw('/auth/session',{token:revoked})).status,401);
  pass('Pagination, structured errors, staff/customer boundary and revoked sessions');
  // An additional prepared account has no orders, payments or services. Browser owners create its journey.
  if(!process.argv.includes('--api-only')){
    const browser=await customer('browser');
    const browserFile=path.join(root,'.platform/browser-accounts.json');
    fs.writeFileSync(browserFile,JSON.stringify({run,staffManifest:manifestPath,customer:{id:browser.profile.id,accountNumber:browser.profile.accountNumber,password:browser.password},planId:plan.id,buildingId:building.id,priceMinor:1950000},null,2)+'\n',{mode:0o600});
    evidence.browser={customerId:browser.profile.id,accountNumber:browser.profile.accountNumber,planId:plan.id,buildingId:building.id};
  }
  evidence.status='PASS';
}catch(error){
  evidence.status='FAIL';evidence.failure={name:error.name,message:'Acceptance stopped; inspect the failing assertion locally without publishing sensitive payloads'};
  console.error('FAIL acceptance stopped: '+error.name);process.exitCode=1;
}finally{
  for(const adapter of clients)await adapter.logout().catch(()=>{});
  for(const api of Object.values(staff))await api.logout().catch(()=>{});
  await db.$disconnect();evidence.finishedAt=new Date().toISOString();
  fs.writeFileSync(output,JSON.stringify(evidence,null,2)+'\n');console.log('Credential-free evidence: '+output);
}
