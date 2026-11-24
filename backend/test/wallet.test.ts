import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {config as loadEnvironment} from 'dotenv';
import request from 'supertest';
import {PrismaClient} from '@prisma/client';
import {createApp} from '../src/bootstrap';
import {Config} from '../src/core/config';
import {digest,hashPassword} from '../src/core/crypto';
import {RenewalProvider} from '../src/wallet/renewal.provider';
import * as C from '../../contracts';

loadEnvironment({path:'.env.test.local',override:!process.env.TEST_DATABASE_URL,quiet:true} as any);
if(!process.env.TEST_DATABASE_URL||!new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test'))throw Error('Dedicated _test database required');
Object.assign(process.env,{NODE_ENV:'test',DATABASE_URL:process.env.TEST_DATABASE_URL,PROVISIONING_ADAPTER:'simulated',SIMULATOR_SCENARIO:'success',EMAIL_ADAPTER:'simulated',SMS_ADAPTER:'simulated',PAYMENT_ADAPTER:'manual'});
const db=new PrismaClient(),run=randomUUID().slice(0,8);let count=0,passwordHash:string;
let app:Awaited<ReturnType<typeof createApp>>;
const staff:Record<string,{id:string;token:string}>={};
function api(method:'get'|'post'|'patch',url:string,token?:string,body?:any){let r=request(app.getHttpServer())[method]('/api/v1'+url);if(token)r=r.set('Authorization','Bearer '+token);return body===undefined?r:r.send(body)}
async function session(userId:string){const token=randomBytes(32).toString('base64url');await db.session.create({data:{userId,tokenHash:digest(token),expiresAt:new Date(Date.now()+3600000)}});return token}
async function fixture(funds=0){
 const n=++count;
 const customer=await db.customer.create({data:{accountNumber:`S5-${run}-${n}`,kind:'RESIDENTIAL',name:`SIMULATED wallet ${run}-${n}`,email:`wallet-${run}-${n}@example.test`,phone:'+2348000000000'}});
 const user=await db.user.create({data:{kind:'CUSTOMER',name:customer.name,customerId:customer.id,passwordHash}}),token=await session(user.id);
 const plan=await db.plan.create({data:{code:`w-${run}-${n}`,name:`SIMULATED wallet plan ${n}`,kind:'RESIDENTIAL',priceMinor:1950000n,renewalPriceMinor:1950000n,speedMbps:80,billingDays:30,published:true,simulated:true}});
 const building=await db.coverageLocation.create({data:{name:`SIMULATED building ${n}`,level:'BUILDING_ADDRESS',eligibility:'AVAILABLE',simulated:true,plans:{create:{planId:plan.id}}}});
 const subscription=await db.subscription.create({data:{customerId:customer.id,planId:plan.id,buildingId:building.id,status:'ACTIVE',renewalEnabled:true,startsAt:new Date(Date.now()-86400000),endsAt:new Date(Date.now()+86400000),externalServiceId:`SIMULATED-SERVICE-${run}-${n}`,simulated:true}});
 if(funds)await api('post',`/admin/customers/${customer.id}/wallet/adjustments`,staff.FINANCE.token,{amountMinor:funds,reason:'SIMULATED isolated opening correction for test',idempotencyKey:randomUUID()}).expect(200);
 return{customer,user,token,plan,building,subscription};
}
async function topUp(f:Awaited<ReturnType<typeof fixture>>,amount=2500000){const body={amountMinor:amount,currency:'NGN',method:'BANK_TRANSFER',reference:`SIMULATED-TOPUP-${run}-${++count}`,evidence:'SIMULATED test only; no real bank transfer',idempotencyKey:randomUUID()};const r=await api('post','/me/wallet/top-ups',f.token,body).expect(200);return{...r.body,input:body}}
function confirm(id:string){return api('post',`/admin/wallet-top-ups/${id}/verify`,staff.FINANCE.token,{decision:'CONFIRMED',evidence:'SIMULATED verified test evidence'})}
async function reserve(f:Awaited<ReturnType<typeof fixture>>,subscriptionId=f.subscription.id,key=randomUUID()){
 const quote=(await api('get',`/me/subscriptions/${subscriptionId}/renewal-eligibility`,f.token).expect(200)).body;
 return api('post',`/me/subscriptions/${subscriptionId}/wallet-renewals`,f.token,{priceVersion:quote.priceVersion,idempotencyKey:key});
}
async function summary(token:string){return C.WalletSummary.parse((await api('get','/me/wallet',token).expect(200)).body)}
async function reconcileProjection(customerId:string){
 const wallet=await db.wallet.findUniqueOrThrow({where:{customerId}}),sum=await db.walletEntry.aggregate({where:{customerId},_sum:{postedDeltaMinor:true,reservedDeltaMinor:true}});
 assert.equal(wallet.postedMinor,sum._sum.postedDeltaMinor||0n);assert.equal(wallet.reservedMinor,sum._sum.reservedDeltaMinor||0n);assert.ok(wallet.reservedMinor>=0n&&wallet.reservedMinor<=wallet.postedMinor);
}
before(async()=>{
 passwordHash=await hashPassword('SIMULATED-Test-only-'+run);
 for(const role of ['ADMIN','FINANCE','PROVISIONER','SUPPORT'] as const){const user=await db.user.create({data:{kind:'STAFF',email:`wallet-${role}-${run}@example.test`,name:'SIMULATED '+role,roles:[role],passwordHash}});staff[role]={id:user.id,token:await session(user.id)}}
 app=await createApp(true);await app.init();
}, {timeout:60000});
after(async()=>{if(app)await app.close();await db.$disconnect()});

test('every new customer receives a zero wallet; reports are pending and not spendable',async()=>{
 const f=await fixture();assert.equal((await summary(f.token)).availableMinor,0);
 const top=await topUp(f);C.WalletTopUp.parse(top);assert.equal(top.allocation,'WALLET');assert.equal(top.status,'REPORTED');assert.equal(top.evidence,undefined);
 const s=await summary(f.token);assert.equal(s.availableMinor,0);assert.equal(s.pendingTopUpsMinor,2500000);assert.equal(s.pendingTopUpsCount,1);assert.equal(s.topUpInstructions.bankDetails,null);
 assert.equal(await db.walletEntry.count({where:{customerId:f.customer.id}}),0);
});
test('Finance confirmation is exactly-once under repeated and concurrent requests',async()=>{
 const f=await fixture(),top=await topUp(f);
 const results=await Promise.all([confirm(top.id),confirm(top.id),confirm(top.id)]);assert.ok(results.every(r=>r.status===200));
 assert.equal((await summary(f.token)).availableMinor,2500000);assert.equal(await db.walletEntry.count({where:{topUpId:top.id}}),1);
 await confirm(top.id).expect(200);await reconcileProjection(f.customer.id);
});
test('client authority fails closed for local wallet reads and writes without blocking the account',async()=>{
 const f=await fixture(2500000),top=await topUp(f);
 const response=await reserve(f);assert.equal(response.status,200);const renewal=response.body;
 const config=app.get(Config).values, previous=config.WALLET_AUTHORITY;
 config.WALLET_AUTHORITY='client';
 try{
  for(const path of ['/me/wallet','/me/wallet/transactions','/me/wallet/top-ups','/me/wallet/renewals',`/me/wallet/renewals/${renewal.id}`,`/me/subscriptions/${f.subscription.id}/renewal-eligibility`])await api('get',path,f.token).expect(503);
  await api('get',`/admin/customers/${f.customer.id}/wallet/transactions`,staff.SUPPORT.token).expect(503);
  await api('get',`/admin/wallet-top-ups/${top.id}`,staff.FINANCE.token).expect(503);
  await api('get',`/admin/wallet-renewals/${renewal.id}`,staff.PROVISIONER.token).expect(503);
  await api('post','/me/wallet/top-ups',f.token,top.input).expect(503);
  await confirm(top.id).expect(503);
  await api('patch',`/admin/subscriptions/${f.subscription.id}/renewal-policy`,staff.PROVISIONER.token,{enabled:false,reason:'Test only'}).expect(503);
  await api('get','/me/dashboard',f.token).expect(200);
 }finally{config.WALLET_AUTHORITY=previous}
 assert.equal((await summary(f.token)).postedMinor,2500000);
 assert.equal((await db.walletRenewal.findUniqueOrThrow({where:{id:renewal.id}})).status,'RESERVED');
});
test('rejected top-up never credits and cannot later be confirmed',async()=>{
 const f=await fixture(),top=await topUp(f);
 await api('post',`/admin/wallet-top-ups/${top.id}/verify`,staff.FINANCE.token,{decision:'REJECTED',evidence:'SIMULATED definite evidence mismatch'}).expect(200);
 await confirm(top.id).expect(409);assert.equal((await summary(f.token)).availableMinor,0);assert.equal(await db.walletEntry.count({where:{topUpId:top.id}}),0);
});
test('top-up idempotency returns the same report and rejects changed payload',async()=>{
 const f=await fixture(),top=await topUp(f);
 const replay=await api('post','/me/wallet/top-ups',f.token,top.input).expect(200);assert.equal(replay.body.id,top.id);
 await api('post','/me/wallet/top-ups',f.token,{...top.input,amountMinor:1}).expect(409);
 await api('post','/me/wallet/top-ups',f.token,{...top.input,idempotencyKey:randomUUID(),reference:' '+top.reference.toLowerCase()+' '}).expect(409);
});
test('historical/fixture order payment reference cannot also fund a wallet; native fixture upsert remains safe',async()=>{
 const f=await fixture();const order=await db.order.create({data:{customerId:f.customer.id,planId:f.plan.id,buildingId:f.building.id,amountMinor:1950000n,currency:'NGN',planName:f.plan.name,billingDays:30,status:'PAID'}});
 const data={orderId:order.id,customerId:f.customer.id,amountMinor:1950000n,currency:'NGN',method:'BANK_TRANSFER' as const,reference:`SIMULATED-HISTORICAL-${run}-${++count}`,evidence:'SIMULATED prior order payment',verificationEvidence:'SIMULATED verified historical evidence',status:'CONFIRMED' as const,verifiedById:staff.FINANCE.id,verifiedAt:new Date()};
 const payment=await db.payment.create({data});await db.payment.upsert({where:{id:payment.id},create:{...data,id:payment.id},update:{evidence:data.evidence}});
 await api('post','/me/wallet/top-ups',f.token,{amountMinor:1950000,currency:'NGN',method:'BANK_TRANSFER',reference:data.reference.toLowerCase(),evidence:'SIMULATED duplicate allocation attempt',idempotencyKey:randomUUID()}).expect(409);
 assert.equal((await summary(f.token)).postedMinor,0);assert.equal(await db.walletEntry.count({where:{customerId:f.customer.id}}),0);
});
test('customer and Admin display identical authoritative balances and ledger; Support is read-only',async()=>{
 const f=await fixture(2500000),own=await summary(f.token);
 const admin=await api('get',`/admin/customers/${f.customer.id}/wallet`,staff.SUPPORT.token).expect(200);assert.deepEqual(admin.body,own);
 const ownEntries=await api('get','/me/wallet/transactions',f.token).expect(200),staffEntries=await api('get',`/admin/customers/${f.customer.id}/wallet/transactions`,staff.SUPPORT.token).expect(200);assert.deepEqual(staffEntries.body,ownEntries.body);
 await api('post',`/admin/customers/${f.customer.id}/wallet/adjustments`,staff.SUPPORT.token,{amountMinor:1,reason:'SIMULATED forbidden',idempotencyKey:randomUUID()}).expect(403);
 const top=await topUp(f);await api('post',`/admin/wallet-top-ups/${top.id}/verify`,staff.SUPPORT.token,{decision:'CONFIRMED',evidence:'SIMULATED forbidden'}).expect(403);
 await api('get','/admin/wallet-top-ups',staff.SUPPORT.token).expect(403);
 await api('post',`/admin/customers/${f.customer.id}/wallet/adjustments`,staff.PROVISIONER.token,{amountMinor:1,reason:'SIMULATED forbidden',idempotencyKey:randomUUID()}).expect(403);
});
test('25000 top-up ->19500 renewal reserve ->confirmed simulated service debit leaves5500',async()=>{
 const f=await fixture(),top=await topUp(f);await confirm(top.id).expect(200);
 const quote=await api('get',`/me/subscriptions/${f.subscription.id}/renewal-eligibility`,f.token).expect(200);assert.equal(quote.body.eligible,true);assert.equal(quote.body.amountMinor,1950000);
 const key=randomUUID(),body={priceVersion:quote.body.priceVersion,idempotencyKey:key};
 const r=await api('post',`/me/subscriptions/${f.subscription.id}/wallet-renewals`,f.token,body).expect(200);assert.equal(r.body.status,'RESERVED');
 const held=await summary(f.token);assert.equal(held.postedMinor,2500000);assert.equal(held.reservedMinor,1950000);assert.equal(held.availableMinor,550000);
 assert.equal((await db.subscription.findUniqueOrThrow({where:{id:f.subscription.id}})).endsAt?.toISOString(),f.subscription.endsAt?.toISOString());
 const repeat=await api('post',`/me/subscriptions/${f.subscription.id}/wallet-renewals`,f.token,body).expect(200);assert.equal(repeat.body.id,r.body.id);
 const processed=await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);assert.equal(processed.body.status,'SUCCEEDED');assert.equal(processed.body.simulated,true);
 await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);
 const final=await summary(f.token);assert.equal(final.availableMinor,550000);assert.equal(final.postedMinor,550000);assert.equal(final.reservedMinor,0);
 const sub=await db.subscription.findUniqueOrThrow({where:{id:f.subscription.id}});assert.equal(sub.endsAt?.toISOString(),r.body.expectedEndsAt);assert.equal(sub.externalServiceId,f.subscription.externalServiceId);
 assert.equal(await db.walletEntry.count({where:{renewalId:r.body.id,kind:'CAPTURE'}}),1);assert.equal(await db.payment.count({where:{orderId:r.body.orderId}}),0);await reconcileProjection(f.customer.id);
});
test('5500 cannot fund19500 and does not create a hold/order/debit',async()=>{
 const f=await fixture(550000),quote=await api('get',`/me/subscriptions/${f.subscription.id}/renewal-eligibility`,f.token).expect(200);
 assert.equal(quote.body.eligible,false);assert.ok(quote.body.reasonCodes.includes('INSUFFICIENT_FUNDS'));
 await reserve(f).then(r=>assert.equal(r.status,409));assert.equal(await db.walletRenewal.count({where:{customerId:f.customer.id}}),0);assert.equal((await summary(f.token)).availableMinor,550000);
});
test('renewal policy and explicit current renewal price are required; stale consent is rejected',async()=>{
 const f=await fixture(2500000);await db.subscription.update({where:{id:f.subscription.id},data:{renewalEnabled:false}});await db.plan.update({where:{id:f.plan.id},data:{renewalPriceMinor:null}});
 let q=(await api('get',`/me/subscriptions/${f.subscription.id}/renewal-eligibility`,f.token).expect(200)).body;assert.ok(q.reasonCodes.includes('SERVICE_NOT_ENABLED'));assert.ok(q.reasonCodes.includes('PRICE_UNAVAILABLE'));
 await api('patch',`/admin/subscriptions/${f.subscription.id}/renewal-policy`,staff.FINANCE.token,{enabled:true,reason:'SIMULATED forbidden'}).expect(403);
 await api('patch',`/admin/subscriptions/${f.subscription.id}/renewal-policy`,staff.PROVISIONER.token,{enabled:true,reason:'SIMULATED explicit service approval'}).expect(200);
 await db.plan.update({where:{id:f.plan.id},data:{renewalPriceMinor:1950000n}});q=(await api('get',`/me/subscriptions/${f.subscription.id}/renewal-eligibility`,f.token).expect(200)).body;
 await db.plan.update({where:{id:f.plan.id},data:{renewalPriceMinor:2000000n}});
 await api('post',`/me/subscriptions/${f.subscription.id}/wallet-renewals`,f.token,{priceVersion:q.priceVersion,idempotencyKey:randomUUID()}).expect(409);assert.equal((await summary(f.token)).reservedMinor,0);
});
test('concurrent spending on two services cannot overdraw the same wallet',async()=>{
 const f=await fixture(2500000),second=await db.subscription.create({data:{customerId:f.customer.id,planId:f.plan.id,buildingId:f.building.id,status:'ACTIVE',renewalEnabled:true,startsAt:f.subscription.startsAt,endsAt:f.subscription.endsAt,externalServiceId:'SIMULATED-SECOND-'+run,simulated:true}});
 const q1=(await api('get',`/me/subscriptions/${f.subscription.id}/renewal-eligibility`,f.token)).body,q2=(await api('get',`/me/subscriptions/${second.id}/renewal-eligibility`,f.token)).body;
 const results=await Promise.all([api('post',`/me/subscriptions/${f.subscription.id}/wallet-renewals`,f.token,{priceVersion:q1.priceVersion,idempotencyKey:randomUUID()}),api('post',`/me/subscriptions/${second.id}/wallet-renewals`,f.token,{priceVersion:q2.priceVersion,idempotencyKey:randomUUID()})]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);const s=await summary(f.token);assert.equal(s.reservedMinor,1950000);assert.equal(s.availableMinor,550000);await reconcileProjection(f.customer.id);
});
test('two intents for one service cannot create conflicting renewals',async()=>{
 const f=await fixture(5000000),q=(await api('get',`/me/subscriptions/${f.subscription.id}/renewal-eligibility`,f.token)).body;
 const results=await Promise.all([randomUUID(),randomUUID()].map(idempotencyKey=>api('post',`/me/subscriptions/${f.subscription.id}/wallet-renewals`,f.token,{priceVersion:q.priceVersion,idempotencyKey})));
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(await db.walletRenewal.count({where:{customerId:f.customer.id}}),1);
});
test('definite provider failure releases hold and preserves previous service period',async()=>{
 const f=await fixture(2500000),r=await reserve(f);assert.equal(r.status,200);
 app.get(Config).values.SIMULATOR_SCENARIO='failure';try{const result=await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);assert.equal(result.body.status,'FAILED')}finally{app.get(Config).values.SIMULATOR_SCENARIO='success'}
 const s=await summary(f.token);assert.equal(s.availableMinor,2500000);assert.equal(s.reservedMinor,0);assert.equal((await db.subscription.findUniqueOrThrow({where:{id:f.subscription.id}})).endsAt?.toISOString(),f.subscription.endsAt?.toISOString());await reconcileProjection(f.customer.id);
});
test('timeout retains reviewable hold, forbids blind retry, and requires authorized reconciliation',async()=>{
 const f=await fixture(2500000),r=await reserve(f);assert.equal(r.status,200);
 app.get(Config).values.SIMULATOR_SCENARIO='timeout';try{const result=await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);assert.equal(result.body.status,'REQUIRES_REVIEW')}finally{app.get(Config).values.SIMULATOR_SCENARIO='success'}
 const retry=await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);assert.equal(retry.body.status,'REQUIRES_REVIEW');assert.equal((await summary(f.token)).reservedMinor,1950000);
 const resolution={decision:'FAILED',reference:'SIMULATED-RECONCILE-'+run,evidence:'SIMULATED authoritative definitive service failure; no activation',authoritative:true};
 await api('post',`/admin/wallet-renewals/${r.body.id}/resolve`,staff.FINANCE.token,resolution).expect(403);
 await api('post',`/admin/wallet-renewals/${r.body.id}/resolve`,staff.PROVISIONER.token,resolution).expect(200);assert.equal((await summary(f.token)).availableMinor,2500000);
});
test('manual acknowledgement does not settle; confirmed exact service expiry atomically captures once',async()=>{
 const f=await fixture(2500000);app.get(Config).values.PROVISIONING_ADAPTER='manual';
 // Approved non-simulated data for this isolated manual adapter scenario only.
 await db.plan.update({where:{id:f.plan.id},data:{simulated:false}});await db.coverageLocation.update({where:{id:f.building.id},data:{simulated:false}});await db.subscription.update({where:{id:f.subscription.id},data:{simulated:false}});
 try{const r=await reserve(f);assert.equal(r.status,200);const ack=await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);assert.equal(ack.body.status,'PROCESSING');assert.equal((await summary(f.token)).postedMinor,2500000);
 const input={decision:'SUCCEEDED',reference:'SIMULATED-MANUAL-EVIDENCE-'+run,evidence:'SIMULATED authoritative test outcome with exact confirmed period',authoritative:true};
 await api('post',`/admin/wallet-renewals/${r.body.id}/resolve`,staff.PROVISIONER.token,input).expect(400);
 const done=await api('post',`/admin/wallet-renewals/${r.body.id}/resolve`,staff.PROVISIONER.token,{...input,confirmedEndsAt:r.body.expectedEndsAt}).expect(200);assert.equal(done.body.status,'SUCCEEDED');assert.equal((await summary(f.token)).availableMinor,550000);
 await api('post',`/admin/wallet-renewals/${r.body.id}/resolve`,staff.PROVISIONER.token,{...input,confirmedEndsAt:r.body.expectedEndsAt}).expect(200);
 await api('post',`/admin/wallet-renewals/${r.body.id}/resolve`,staff.PROVISIONER.token,{decision:'FAILED',reference:'SIMULATED-conflict',evidence:'SIMULATED conflicting outcome',authoritative:true}).expect(409);
 }finally{app.get(Config).values.PROVISIONING_ADAPTER='simulated'}
});
test('changed service expiry after reservation cannot be silently charged',async()=>{
 const f=await fixture(2500000),r=await reserve(f);assert.equal(r.status,200);
 await db.subscription.update({where:{id:f.subscription.id},data:{endsAt:new Date(Date.now()+10*86400000)}});
 const out=await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);assert.equal(out.body.status,'REQUIRES_REVIEW');assert.equal((await summary(f.token)).reservedMinor,1950000);assert.equal(await db.walletEntry.count({where:{renewalId:r.body.id,kind:'CAPTURE'}}),0);
});
test('authoritative expiry discrepancy remains held for review without debit or date overwrite',async()=>{
 const f=await fixture(2500000);app.get(Config).values.PROVISIONING_ADAPTER='manual';
 await db.plan.update({where:{id:f.plan.id},data:{simulated:false}});await db.coverageLocation.update({where:{id:f.building.id},data:{simulated:false}});await db.subscription.update({where:{id:f.subscription.id},data:{simulated:false}});
 try{
  const r=await reserve(f);assert.equal(r.status,200);await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);
  const result=await api('post',`/admin/wallet-renewals/${r.body.id}/resolve`,staff.PROVISIONER.token,{decision:'SUCCEEDED',reference:'SIMULATED-DISCREPANCY-'+run,evidence:'SIMULATED authoritative outcome has a different service period; hold for policy reconciliation',authoritative:true,confirmedEndsAt:new Date(Date.parse(r.body.expectedEndsAt)+86400000).toISOString()}).expect(200);
  assert.equal(result.body.status,'REQUIRES_REVIEW');const wallet=await summary(f.token);assert.equal(wallet.reservedMinor,1950000);assert.equal(wallet.postedMinor,2500000);
  assert.equal((await db.subscription.findUniqueOrThrow({where:{id:f.subscription.id}})).endsAt?.toISOString(),f.subscription.endsAt?.toISOString());assert.equal(await db.walletEntry.count({where:{renewalId:r.body.id,kind:{in:['CAPTURE','RELEASE']}}}),0);
 }finally{app.get(Config).values.PROVISIONING_ADAPTER='simulated'}
});
test('second renewal preserves permanent provider service identifier',async()=>{
 const f=await fixture(5000000),provider=app.get(RenewalProvider),original=provider.renew.bind(provider),ids:string[]=[];
 provider.renew=async input=>{ids.push(input.externalServiceId);return original(input)};
 try{for(let i=0;i<2;i++){const r=await reserve(f);assert.equal(r.status,200);const out=await api('post',`/admin/wallet-renewals/${r.body.id}/process`,staff.PROVISIONER.token).expect(200);assert.equal(out.body.status,'SUCCEEDED')}}finally{provider.renew=original}
 assert.deepEqual(ids,[f.subscription.externalServiceId,f.subscription.externalServiceId]);assert.equal((await summary(f.token)).availableMinor,1100000);
});
test('controlled credit correction and compensation are idempotent, auditable and cannot consume holds',async()=>{
 const f=await fixture(),input={amountMinor:2500000,reason:'SIMULATED documented correction',idempotencyKey:randomUUID()};
 const entry=await api('post',`/admin/customers/${f.customer.id}/wallet/adjustments`,staff.FINANCE.token,input).expect(200);
 const replay=await api('post',`/admin/customers/${f.customer.id}/wallet/adjustments`,staff.FINANCE.token,input).expect(200);assert.equal(replay.body.id,entry.body.id);
 const held=await reserve(f);assert.equal(held.status,200);const reversal={reason:'SIMULATED reverse correction',idempotencyKey:randomUUID()};
 await api('post',`/admin/wallet-transactions/${entry.body.id}/reverse`,staff.FINANCE.token,reversal).expect(409);
 await api('post',`/admin/wallet-renewals/${held.body.id}/resolve`,staff.PROVISIONER.token,{decision:'FAILED',reference:'SIMULATED-NOT-PROCESSED-'+run,evidence:'SIMULATED verified no service request was initiated',authoritative:true}).expect(200);
 const result=await api('post',`/admin/wallet-transactions/${entry.body.id}/reverse`,staff.FINANCE.token,reversal).expect(200);assert.equal(result.body.reversalOfId,entry.body.id);assert.equal((await summary(f.token)).availableMinor,0);
 await api('post',`/admin/wallet-transactions/${entry.body.id}/reverse`,staff.FINANCE.token,reversal).expect(200);
 await api('post',`/admin/wallet-transactions/${entry.body.id}/reverse`,staff.FINANCE.token,{...reversal,idempotencyKey:randomUUID()}).expect(409);
 assert.ok(await db.auditLog.count({where:{entityId:result.body.id,action:'wallet.credit_reversed'}}));await reconcileProjection(f.customer.id);
});
test('ownership, expiry, strict input and pagination remain enforced',async()=>{
 const f=await fixture(2500000),other=await fixture(),r=await reserve(f);assert.equal(r.status,200);
 await api('get',`/me/wallet/renewals/${r.body.id}`,other.token).expect(404);await api('get',`/me/subscriptions/${f.subscription.id}/renewal-eligibility`,other.token).expect(404);
 await api('post',`/me/subscriptions/${f.subscription.id}/wallet-renewals`,other.token,{priceVersion:f.plan.updatedAt.toISOString(),idempotencyKey:randomUUID()}).expect(404);
 await api('get','/me/wallet',staff.FINANCE.token).expect(403);await api('get',`/admin/customers/${f.customer.id}/wallet`,f.token).expect(403);await api('get','/me/wallet').expect(401);
 await api('post','/me/wallet/top-ups',f.token,{amountMinor:-1,currency:'NGN',reference:'SIMULATED invalid',method:'BANK_TRANSFER',evidence:'SIMULATED invalid',idempotencyKey:randomUUID(),balance:100}).expect(400);
 await api('get','/me/wallet/transactions?limit=101',f.token).expect(400);const page=await api('get','/me/wallet/transactions?limit=1',f.token).expect(200);assert.equal(page.body.limit,1);assert.equal(page.body.items.length,1);
 await db.session.update({where:{tokenHash:digest(f.token)},data:{expiresAt:new Date(Date.now()-1000)}});await api('get','/me/wallet',f.token).expect(401);
});
test('database forbids ledger mutation, direct projection editing, nonzero opening and economic-term changes',async()=>{
 const f=await fixture(2500000),entry=await db.walletEntry.findFirstOrThrow({where:{customerId:f.customer.id}});
 await assert.rejects(()=>db.walletEntry.update({where:{id:entry.id},data:{description:'SIMULATED tamper'}}));await assert.rejects(()=>db.walletEntry.delete({where:{id:entry.id}}));
 await assert.rejects(()=>db.wallet.update({where:{customerId:f.customer.id},data:{postedMinor:9999999n}}));
 await assert.rejects(()=>db.wallet.create({data:{customerId:f.customer.id,postedMinor:1n}}),e=>String(e).includes('Wallets must open at zero'));
 const r=await reserve(f);assert.equal(r.status,200);await assert.rejects(()=>db.walletRenewal.update({where:{id:r.body.id},data:{amountMinor:1n}}));
 await assert.rejects(()=>db.walletRenewal.update({where:{id:r.body.id},data:{status:'SUCCEEDED',confirmedEndsAt:new Date(r.body.expectedEndsAt)}}));
 await reconcileProjection(f.customer.id);
});
test('database requires verified allocation and legitimate service settlement in the same transaction',async()=>{
 const f=await fixture(2500000),top=await topUp(f),wallet=await db.wallet.findUniqueOrThrow({where:{customerId:f.customer.id}});
 const base={walletId:wallet.id,customerId:f.customer.id,amountMinor:2500000n,description:'SIMULATED direct-SQL integrity test',actorId:staff.FINANCE.id,simulated:true,requestFingerprint:'SIMULATED-direct-test'};
 await assert.rejects(()=>db.walletEntry.create({data:{...base,kind:'TOPUP_CREDIT',topUpId:top.id,postedDeltaMinor:2500000n,reservedDeltaMinor:0n,reference:randomUUID(),operationKey:randomUUID()}}));
 await assert.rejects(()=>db.walletTopUp.update({where:{id:top.id},data:{status:'CONFIRMED',verifiedById:staff.FINANCE.id,verifiedAt:new Date(),verificationEvidence:'SIMULATED missing ledger'}}));
 const r=await reserve(f);assert.equal(r.status,200);
 await assert.rejects(()=>db.walletEntry.create({data:{...base,kind:'CAPTURE',renewalId:r.body.id,amountMinor:1950000n,postedDeltaMinor:-1950000n,reservedDeltaMinor:-1950000n,reference:randomUUID(),operationKey:randomUUID()}}));
 const s=await summary(f.token);assert.equal(s.postedMinor,2500000);assert.equal(s.reservedMinor,1950000);await reconcileProjection(f.customer.id);
});
