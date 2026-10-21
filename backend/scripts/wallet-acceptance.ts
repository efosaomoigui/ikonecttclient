// Isolated local development acceptance. Load the configured owner .env explicitly.
// Never log credentials, setup codes, bearer tokens or submitted financial evidence.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {PrismaClient} from '@prisma/client';
import * as C from '../../contracts';
import {createApp} from '../src/bootstrap';
import {Config} from '../src/core/config';
import {WalletService} from '../src/wallet/wallet.service';
import {digest} from '../src/core/crypto';
import {Actor} from '../src/identity/access';
const root=path.resolve(__dirname,'../..'),local=path.join(root,'.platform');
const owner=JSON.parse(fs.readFileSync(path.join(local,'config.json'),'utf8')).backendRoot;
const state=JSON.parse(fs.readFileSync(path.join(owner,'.local/development/database.json'),'utf8'));
require('./development-safety.cjs').assertOwnedDevelopment(state,process.env,path.join(owner,'.local/development'));
assert.equal(process.env.PROVISIONING_ADAPTER,'simulated');
const manifestFile=path.join(owner,'.local/development',`accounts-${state.database}.json`);
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
const db=new PrismaClient(),run=randomUUID().slice(0,8),checks:any[]=[],staff:Record<string,C.SessionContract>={},customers:any[]=[];
let phase='preflight',internalApp:Awaited<ReturnType<typeof createApp>>|undefined;
const evidence:any={run,startedAt:new Date().toISOString(),contractVersion:C.API_VERSION,environment:'local development',simulation:true,checks};
async function call<T extends z.ZodTypeAny>(token:string|undefined,schema:T,route:string,method='GET',body?:unknown):Promise<z.infer<T>>{
 return schema.parse(await C.createApiClient('http://127.0.0.1:4000',()=>token)(route,{method,...(body===undefined?{}:{body:JSON.stringify(body)})}));
}
const role=(name:string)=>staff[name].accessToken;
const pass=(name:string,details:any={})=>{checks.push({name,status:'PASS',...details});console.log('PASS '+name)};
async function denied(fn:()=>Promise<unknown>,status:number){await assert.rejects(fn,e=>(e as any).status===status)}
async function customer(label:string){
 const client=C.createApiClient('http://127.0.0.1:4000',()=>role('ADMIN'));
 const created:any=await client('/admin/customers',{method:'POST',body:JSON.stringify(C.CreateCustomerRequest.parse({kind:'RESIDENTIAL',name:`SIMULATED Stage5A ${label} ${run}`,email:`stage5a-${label}-${run}@example.test`,phone:'+2348000000000'}))});
 const profile=C.Customer.parse(created.customer),password='Local-Stage5A-'+randomBytes(24).toString('base64url');
 await call(undefined,C.Ok,'/auth/reset-password','POST',C.ResetPasswordRequest.parse({token:created.setupToken,password}));
 const session=await call(undefined,C.Session,'/auth/login','POST',{accountNumber:profile.accountNumber,password});
 assert.equal(session.principal.customerId,profile.id);assert.equal(session.principal.mustChangePassword,false);
 const value={profile,password,token:session.accessToken};customers.push(value);return value;
}
async function activeService(c:any,plan:any,building:any,label:string){
 const order=await call(c.token,C.Order,'/me/orders','POST',{planId:plan.id,buildingId:building.id,type:'NEW_CONNECTION'});
 const reference=`SIMULATED-S5A-SERVICE-${label}-${run}`;
 const payment=await call(c.token,C.Payment,'/me/payments','POST',{orderId:order.id,amountMinor:order.amountMinor,currency:'NGN',method:'BANK_TRANSFER',reference,evidence:'SIMULATED development setup; no real transfer'});
 await call(role('FINANCE'),C.AdminPayment,`/admin/payments/${payment.id}/verify`,'POST',{decision:'CONFIRMED',evidence:'SIMULATED initial-service fixture verification; no real bank claim'});
 const provision=await call(role('PROVISIONER'),C.Provisioning,'/admin/provisioning','POST',{orderId:order.id});assert.equal(provision.status,'ACTIVE');assert.equal(provision.simulated,true);
 const sub=await call(role('PROVISIONER'),C.Subscription,`/admin/subscriptions/${provision.subscriptionId}/renewal-policy`,'PATCH',{enabled:true,reason:'SIMULATED explicit renewal eligibility for this isolated service'});
 assert.equal(sub.renewalEnabled,true);assert.equal((await call(c.token,C.WalletSummary,'/me/wallet')).availableMinor,0);
 return{sub,reference,paymentId:payment.id};
}
async function credit(c:any,label:string){
 const input={amountMinor:2500000,currency:'NGN',method:'BANK_TRANSFER',reference:`SIMULATED-S5A-TOPUP-${label}-${run}`,evidence:'SIMULATED acceptance only; no real transfer',idempotencyKey:randomUUID()};
 const top=await call(c.token,C.WalletTopUp,'/me/wallet/top-ups','POST',input);
 const pending=await call(c.token,C.WalletSummary,'/me/wallet');assert.equal(pending.availableMinor,0);assert.equal(pending.pendingTopUpsMinor,2500000);
 for(let i=0;i<2;i++)await call(role('FINANCE'),C.AdminWalletTopUp,`/admin/wallet-top-ups/${top.id}/verify`,'POST',{decision:'CONFIRMED',evidence:'SIMULATED Finance verification; no live bank integration'});
 const wallet=await call(c.token,C.WalletSummary,'/me/wallet');assert.equal(wallet.availableMinor,2500000);
 const entries=await call(c.token,C.page(C.WalletEntry),'/me/wallet/transactions');assert.equal(entries.items.filter(e=>e.topUpId===top.id).length,1);return top;
}
async function reserve(c:any,subId:string){
 const quote=await call(c.token,C.RenewalEligibility,`/me/subscriptions/${subId}/renewal-eligibility`);assert.equal(quote.eligible,true);assert.equal(quote.amountMinor,1950000);
 const input={priceVersion:quote.priceVersion,idempotencyKey:randomUUID()};
 const result=await call(c.token,C.WalletRenewal,`/me/subscriptions/${subId}/wallet-renewals`,'POST',input);
 const replay=await call(c.token,C.WalletRenewal,`/me/subscriptions/${subId}/wallet-renewals`,'POST',input);assert.equal(replay.id,result.id);
 const wallet=await call(c.token,C.WalletSummary,'/me/wallet');assert.equal(wallet.postedMinor,2500000);assert.equal(wallet.reservedMinor,1950000);assert.equal(wallet.availableMinor,550000);return result;
}
async function main(){
 const capabilities:any=await C.createApiClient('http://127.0.0.1:4000')('/capabilities');assert.equal(capabilities.provisioning,'simulated');assert.equal(capabilities.payments,'disabled');
 for(const name of ['ADMIN','FINANCE','PROVISIONER','SUPPORT']){const a=manifest.staff.find((v:any)=>v.role===name);staff[name]=await call(undefined,C.Session,'/auth/staff/login','POST',{email:a.email,password:a.password});assert.equal(staff[name].principal.mustChangePassword,false)}
 phase='isolated catalogue';
 const plan=await call(role('ADMIN'),C.Plan,'/admin/plans','POST',{code:`stage5a-${run}`,name:`SIMULATED Stage5A ${run}`,kind:'RESIDENTIAL',priceMinor:1950000,renewalPriceMinor:1950000,currency:'NGN',speedMbps:80,billingDays:30,published:true});
 await db.plan.update({where:{id:plan.id},data:{simulated:true}});
 let parentId:string|undefined,building:any;
 for(const level of C.CoverageLevel.options){building=await call(role('ADMIN'),C.CoverageLocation,'/admin/coverage','POST',{name:`SIMULATED Stage5A ${level} ${run}`,level,...(parentId?{parentId}:{}),eligibility:level==='BUILDING_ADDRESS'?'AVAILABLE':'UNKNOWN',planIds:level==='BUILDING_ADDRESS'?[plan.id]:[],evidence:'SIMULATED isolated development mapping'});await db.coverageLocation.update({where:{id:building.id},data:{simulated:true}});parentId=building.id}
 phase='API scenarios A B C E F';
 const first=await customer('api'),other=await customer('isolation'),service=await activeService(first,plan,building,'api');
 await denied(()=>call(first.token,C.WalletTopUp,'/me/wallet/top-ups','POST',{amountMinor:1950000,currency:'NGN',reference:service.reference.toLowerCase(),method:'BANK_TRANSFER',evidence:'SIMULATED prohibited duplicate allocation',idempotencyKey:randomUUID()}),409);
 pass('F historical/order allocation protection and zero wallet after order payment',{customerId:first.profile.id,paymentId:service.paymentId});
 const top=await credit(first,'api');pass('A reported funds pending; Finance confirmation creates2500000 exactly once',{topUpId:top.id,availableMinor:2500000});
 const held=await reserve(first,service.sub.id);assert.equal(held.status,'RESERVED');
 await denied(()=>call(role('FINANCE'),C.AdminWalletRenewal,`/admin/wallet-renewals/${held.id}/process`,'POST'),403);
 await denied(()=>call(other.token,C.WalletRenewal,`/me/wallet/renewals/${held.id}`),404);
 const done=await call(role('PROVISIONER'),C.AdminWalletRenewal,`/admin/wallet-renewals/${held.id}/process`,'POST');assert.equal(done.status,'SUCCEEDED');assert.equal(done.simulated,true);
 const wallet=await call(first.token,C.WalletSummary,'/me/wallet');assert.equal(wallet.availableMinor,550000);assert.equal(wallet.reservedMinor,0);
 const renewed=await call(first.token,C.Subscription,`/me/subscriptions/${service.sub.id}`);assert.equal(renewed.endsAt,done.expectedEndsAt);assert.equal(renewed.externalServiceId,service.sub.externalServiceId);
 pass('B separate Provisioner confirms SIMULATED renewal; final available550000',{renewalId:held.id,orderId:held.orderId,subscriptionId:service.sub.id});
 const insufficient=await call(first.token,C.RenewalEligibility,`/me/subscriptions/${service.sub.id}/renewal-eligibility`);assert.equal(insufficient.eligible,false);assert.ok(insufficient.reasonCodes.includes('INSUFFICIENT_FUNDS'));
 await denied(()=>call(first.token,C.WalletRenewal,`/me/subscriptions/${service.sub.id}/wallet-renewals`,'POST',{priceVersion:insufficient.priceVersion,idempotencyKey:randomUUID()}),409);assert.equal((await call(first.token,C.WalletSummary,'/me/wallet')).availableMinor,550000);pass('C insufficient funds reject without another debit');
 const staffWallet=await call(role('SUPPORT'),C.WalletSummary,`/admin/customers/${first.profile.id}/wallet`);assert.deepEqual(staffWallet,wallet);
 const history=await call(first.token,C.page(C.WalletEntry),'/me/wallet/transactions'),staffHistory=await call(role('SUPPORT'),C.page(C.WalletEntry),`/admin/customers/${first.profile.id}/wallet/transactions`);assert.deepEqual(history,staffHistory);
 await denied(()=>call(role('SUPPORT'),C.WalletEntry,`/admin/customers/${first.profile.id}/wallet/adjustments`,'POST',{amountMinor:1,reason:'SIMULATED unauthorized attempt',idempotencyKey:randomUUID()}),403);pass('E shared customer/Support balances and history; Support cannot credit');
 phase='timeout review fixture';
 const timeout=await customer('timeout'),timeoutService=await activeService(timeout,plan,building,'timeout');await credit(timeout,'timeout');const timeoutRenewal=await reserve(timeout,timeoutService.sub.id);
 // Test-only in-process adapter configuration. No public toggle and no global .env change.
 internalApp=await createApp(true);await internalApp.init();internalApp.get(Config).values.SIMULATOR_SCENARIO='timeout';
 const sessionRecord=await db.session.findUniqueOrThrow({where:{tokenHash:digest(role('PROVISIONER'))}});
 const actor:Actor={id:staff.PROVISIONER.principal.id,kind:'STAFF',roles:['PROVISIONER'],customerId:null,mustChangePassword:false,sessionId:sessionRecord.id};
 const timeoutResult=await internalApp.get(WalletService).process(actor,timeoutRenewal.id);assert.equal(timeoutResult.status,'REQUIRES_REVIEW');await internalApp.close();internalApp=undefined;
 const repeated=await call(role('PROVISIONER'),C.AdminWalletRenewal,`/admin/wallet-renewals/${timeoutRenewal.id}/process`,'POST');assert.equal(repeated.status,'REQUIRES_REVIEW');
 const protectedFunds=await call(timeout.token,C.WalletSummary,'/me/wallet');assert.equal(protectedFunds.postedMinor,2500000);assert.equal(protectedFunds.reservedMinor,1950000);assert.equal(protectedFunds.availableMinor,550000);
 pass('D timeout retains1950000 hold and review; repeated live process never retries blindly',{renewalId:timeoutRenewal.id,customerId:timeout.profile.id,fixtureMethod:'same backend service with test-only in-process timeout adapter; subsequent read/retry via real HTTP'});
 phase='browser preparation';const browser=await customer('browser'),browserService=await activeService(browser,plan,building,'browser');
 const safe=(c:any,sub:any)=>({customerId:c.profile.id,accountNumber:c.profile.accountNumber,password:c.password,subscriptionId:sub.id});
 fs.writeFileSync(path.join(local,'stage5a-accounts.json'),JSON.stringify({run,staffManifest:manifestFile,planId:plan.id,buildingId:building.id,renewalPriceMinor:1950000,browser:safe(browser,browserService.sub),timeout:{...safe(timeout,timeoutService.sub),renewalId:timeoutRenewal.id}},null,2)+'\n',{mode:0o600});
 evidence.browser={customerId:browser.profile.id,accountNumber:browser.profile.accountNumber,subscriptionId:browserService.sub.id,planId:plan.id,buildingId:building.id,openingAvailableMinor:0};evidence.timeout={customerId:timeout.profile.id,accountNumber:timeout.profile.accountNumber,subscriptionId:timeoutService.sub.id,renewalId:timeoutRenewal.id};evidence.status='PASS';
}
main().catch(error=>{evidence.status='FAIL';evidence.failingPhase=phase;console.error('FAIL '+phase+' ('+(error instanceof Error?error.name:'unknown')+')');process.exitCode=1}).finally(async()=>{
 if(internalApp)await internalApp.close().catch(()=>{});
 for(const c of customers)await call(c.token,C.Ok,'/auth/logout','POST').catch(()=>{});
 for(const s of Object.values(staff))await call(s.accessToken,C.Ok,'/auth/logout','POST').catch(()=>{});
 await db.$disconnect();evidence.finishedAt=new Date().toISOString();fs.mkdirSync(path.join(root,'docs/stage5a'),{recursive:true});fs.writeFileSync(path.join(root,'docs/stage5a',`api-acceptance-${run}.json`),JSON.stringify(evidence,null,2)+'\n');console.log('Credential-free Stage5A acceptance evidence recorded');
});
