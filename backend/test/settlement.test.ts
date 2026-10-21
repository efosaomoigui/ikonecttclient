import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {config as loadEnvironment} from 'dotenv';
import request from 'supertest';
import {PrismaClient} from '@prisma/client';
import {createApp} from '../src/bootstrap';
import {Config} from '../src/core/config';
import {Database} from '../src/core/database';
import {digest,hashPassword} from '../src/core/crypto';
import {Actor} from '../src/identity/access';
import {SettlementService} from '../src/wallet/settlement.service';
import {SettlementFixtureAdapter} from './support/settlement.adapter';
import * as C from '../../contracts';
loadEnvironment({path:'.env.test.local',override:!process.env.TEST_DATABASE_URL,quiet:true} as any);
if(!process.env.TEST_DATABASE_URL||!new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test'))throw Error('Dedicated _test database required');
Object.assign(process.env,{NODE_ENV:'test',DATABASE_URL:process.env.TEST_DATABASE_URL,PAYMENT_ADAPTER:'disabled',PROVISIONING_ADAPTER:'simulated',SIMULATOR_SCENARIO:'success',EMAIL_ADAPTER:'disabled',SMS_ADAPTER:'disabled'});
const db=new PrismaClient(),run=randomUUID().slice(0,8),adapter=new SettlementFixtureAdapter();
let app:Awaited<ReturnType<typeof createApp>>,service:SettlementService,passwordHash:string,counter=0;
const staff:Record<string,{id:string;token:string}>={};
async function session(userId:string){const token=randomBytes(32).toString('base64url');await db.session.create({data:{userId,tokenHash:digest(token),expiresAt:new Date(Date.now()+3600000)}});return token}
function api(method:'get'|'post',url:string,token?:string,body?:any){let r=request(app.getHttpServer())[method]('/api/v1'+url);if(token)r=r.set('Authorization','Bearer '+token);return body===undefined?r:r.send(body)}
async function fixture(status:'ACTIVE'|'SUSPENDED'='SUSPENDED'){
 const n=++counter,customer=await db.customer.create({data:{accountNumber:`SET-${run}-${n}`,accountNumberSimulated:true,kind:'RESIDENTIAL',name:'SIMULATED settlement customer',email:`settlement-${run}-${n}@example.test`,phone:'+2348000000000'}});
 const user=await db.user.create({data:{kind:'CUSTOMER',name:customer.name,customerId:customer.id,passwordHash}}),token=await session(user.id);
 const plan=await db.plan.create({data:{code:`settlement-${run}-${n}`,name:'SIMULATED settlement plan',kind:'RESIDENTIAL',priceMinor:1950000n,renewalPriceMinor:1950000n,speedMbps:80,billingDays:30,published:true,simulated:true}});
 const building=await db.coverageLocation.create({data:{name:'SIMULATED settlement building',level:'BUILDING_ADDRESS',eligibility:'AVAILABLE',simulated:true,plans:{create:{planId:plan.id}}}});
 const sub=await db.subscription.create({data:{customerId:customer.id,planId:plan.id,buildingId:building.id,status,renewalEnabled:true,startsAt:new Date('2026-01-01T00:00:00Z'),endsAt:new Date('2026-02-01T00:00:00Z'),externalServiceId:'SIMULATED-'+randomUUID(),simulated:true}});
 const actor:Actor={id:user.id,kind:'CUSTOMER',customerId:customer.id,roles:[],mustChangePassword:false,sessionId:randomUUID()};
 return{customer,user,token,sub,plan,building,actor};
}
async function registration(f:Awaited<ReturnType<typeof fixture>>,amountMinor=2500000){
 const input={providerPaymentId:'SIMULATED-PROVIDER-'+randomUUID(),merchantReference:'SIMULATED-MERCHANT-'+randomUUID(),amountMinor,currency:'NGN' as const,idempotencyKey:randomUUID()};
 const payment=await service.register(f.actor,input);
 adapter.remote.set(payment.providerPaymentId,{...adapter.identity(),account:payment.providerAccount,eventId:'replaced-by-authenticated-envelope',paymentId:payment.id,providerPaymentId:payment.providerPaymentId,merchantReference:payment.merchantReference,amountMinor,currency:'NGN',status:'SETTLED',settledAt:'2026-10-20T12:00:00.000Z',settlementReference:'SIMULATED-SETTLED-'+payment.id,authenticated:true,authoritativeLookup:true});
 return{payment,input};
}
async function summary(token:string){return C.WalletSummary.parse((await api('get','/me/wallet',token).expect(200)).body)}
before(async()=>{
 passwordHash=await hashPassword('SIMULATED-Settlement-test-'+run);
 for(const role of ['FINANCE','SUPPORT','PROVISIONER'] as const){const u=await db.user.create({data:{kind:'STAFF',email:`settlement-${role}-${run}@example.test`,name:'SIMULATED '+role,roles:[role],passwordHash}});staff[role]={id:u.id,token:await session(u.id)}}
 app=await createApp(true);await app.init();service=new SettlementService(app.get(Database),app.get(Config),adapter);
},{timeout:60000});
after(async()=>{if(app)await app.close();await db.$disconnect()});

test('settlement integration stays disabled and has no public callback or checkout route',async()=>{
 const f=await fixture();await assert.rejects(()=>app.get(SettlementService).register(f.actor,{providerPaymentId:'SIMULATED-disabled',merchantReference:'SIMULATED-disabled',amountMinor:1,currency:'NGN',idempotencyKey:randomUUID()}));
 await assert.rejects(()=>app.get(SettlementService).ingest({body:Buffer.from('{}'),headers:{}}));
 const capabilities=(await api('get','/capabilities').expect(200)).body;assert.equal(capabilities.paymentSettlement,'not-connected');
 await api('post','/webhooks/payment-settlement',undefined,{}).expect(404);await api('post','/me/wallet/settlements',f.token,{}).expect(404);
 assert.equal((await summary(f.token)).availableMinor,0);
});
test('registered initiation, pending and failed provider outcomes never credit or change a service',async()=>{
 const f=await fixture(),{payment}=await registration(f);assert.equal((await summary(f.token)).availableMinor,0);
 for(const status of ['INITIATED','PENDING','FAILED'] as const){adapter.remote.get(payment.providerPaymentId)!.status=status;const result=await service.ingest(adapter.envelope(payment,randomUUID(),{status:'SETTLED',authenticated:true}));assert.equal(result.event.outcome,'IGNORED');assert.equal(result.entry,null)}
 assert.equal((await summary(f.token)).availableMinor,0);assert.deepEqual(await db.subscription.findUnique({where:{id:f.sub.id}}),f.sub);
 assert.equal(await db.walletRenewal.count({where:{customerId:f.customer.id}}),0);assert.equal(await db.provisioningRequest.count({where:{subscriptionId:f.sub.id}}),0);
});
test('unverified, tampered, stale and lookup-failed events cannot post financial records',async()=>{
 const f=await fixture(),{payment}=await registration(f),valid=adapter.envelope(payment,randomUUID());
 await assert.rejects(()=>service.ingest({...valid,headers:{}}));await assert.rejects(()=>service.ingest({...valid,body:Buffer.from(valid.body.toString()+' ')}));
 await assert.rejects(()=>service.ingest({...valid,headers:{...valid.headers,timestamp:'1'}}));
 adapter.lookupFails=true;try{await assert.rejects(()=>service.ingest(valid))}finally{adapter.lookupFails=false}
 assert.equal(await db.settlementEvent.count({where:{paymentId:payment.id}}),0);assert.equal((await summary(f.token)).availableMinor,0);
});
test('authoritative payment, provider/account, amount, currency and customer bindings are validated',async()=>{
 const f=await fixture(),other=await fixture(),{payment}=await registration(f),proof=adapter.remote.get(payment.providerPaymentId)!;
 for(const delta of [{amountMinor:1},{currency:'USD'},{provider:'OTHER'},{account:'OTHER'},{merchantReference:'OTHER'},{authenticated:false},{authoritativeLookup:false},{settledAt:null},{settledAt:'2099-01-01T00:00:00Z'}]){
  adapter.remote.set(payment.providerPaymentId,{...proof,...delta} as any);await assert.rejects(()=>service.ingest(adapter.envelope(payment,randomUUID())));
 }
 adapter.remote.set(payment.providerPaymentId,proof);
 await assert.rejects(()=>service.ingest(adapter.envelope({...payment,id:other.customer.id},randomUUID())));
 assert.equal((await summary(f.token)).availableMinor,0);assert.equal((await summary(other.token)).availableMinor,0);
});
test('settlement and ledger credit commit once under replay, duplicate events and concurrent delivery',async()=>{
 const f=await fixture(),{payment}=await registration(f),envelope=adapter.envelope(payment,randomUUID());
 const results=await Promise.all([service.ingest(envelope),service.ingest(envelope),service.ingest(adapter.envelope(payment,randomUUID()))]);
 assert.ok(results.every(r=>r.payment.status==='CREDITED'));assert.equal(new Set(results.map(r=>r.entry!.id)).size,1);
 const own=await summary(f.token);assert.equal(own.availableMinor,2500000);assert.equal(own.reservedMinor,0);
 assert.equal(await db.walletEntry.count({where:{settlementPaymentId:payment.id}}),1);
 assert.equal(await db.settlementEvent.count({where:{paymentId:payment.id,outcome:'CREDITED'}}),1);
 const ownPage=(await api('get','/me/wallet/transactions',f.token).expect(200)).body;
 assert.equal(ownPage.items[0].kind,'SETTLEMENT_CREDIT');assert.equal(ownPage.items[0].settlementPaymentId,payment.id);assert.equal(ownPage.items[0].actorId,null);
 for(const role of ['SUPPORT','FINANCE']){const admin=(await api('get',`/admin/customers/${f.customer.id}/wallet`,staff[role].token).expect(200)).body;assert.deepEqual(admin,own);assert.deepEqual((await api('get',`/admin/customers/${f.customer.id}/wallet/transactions`,staff[role].token).expect(200)).body,ownPage)}
 assert.deepEqual(await service.reconcile(f.customer.id),{customerId:f.customer.id,projectionMatchesLedger:true,settlementsMatchLedger:true,paymentCount:1});
});
test('event ID reuse with different content conflicts and out-of-order failures cannot undo settled funds',async()=>{
 const f=await fixture(),{payment}=await registration(f),id=randomUUID();await service.ingest(adapter.envelope(payment,id));
 await assert.rejects(()=>service.ingest(adapter.envelope(payment,id,{changed:true})));
 adapter.remote.get(payment.providerPaymentId)!.status='FAILED';await service.ingest(adapter.envelope(payment,randomUUID()));
 assert.equal((await summary(f.token)).availableMinor,2500000);assert.equal((await db.settlementPayment.findUniqueOrThrow({where:{id:payment.id}})).status,'CREDITED');
});
test('wallet zero/positive and service active/inactive are four independent valid states; no auto-renew',async()=>{
 for(const status of ['ACTIVE','SUSPENDED'] as const)for(const funded of [false,true]){
  const f=await fixture(status),before=await db.subscription.findUnique({where:{id:f.sub.id}});
  if(funded){const{payment}=await registration(f);await service.ingest(adapter.envelope(payment,randomUUID()))}
  assert.equal((await summary(f.token)).availableMinor,funded?2500000:0);
  assert.deepEqual(await db.subscription.findUnique({where:{id:f.sub.id}}),before);
  assert.equal(await db.order.count({where:{customerId:f.customer.id}}),0);assert.equal(await db.walletRenewal.count({where:{customerId:f.customer.id}}),0);
 }
});
test('settled wallet funds renew an expired suspended service only after explicit customer and staff actions',async()=>{
 const f=await fixture(),{payment}=await registration(f);await service.ingest(adapter.envelope(payment,randomUUID()));
 assert.deepEqual(await db.subscription.findUnique({where:{id:f.sub.id}}),f.sub);
 const quote=(await api('get',`/me/subscriptions/${f.sub.id}/renewal-eligibility`,f.token).expect(200)).body;assert.equal(quote.eligible,true);
 const renewal=(await api('post',`/me/subscriptions/${f.sub.id}/wallet-renewals`,f.token,{priceVersion:quote.priceVersion,idempotencyKey:randomUUID()}).expect(200)).body;
 assert.equal((await summary(f.token)).reservedMinor,1950000);assert.deepEqual(await db.subscription.findUnique({where:{id:f.sub.id}}),f.sub);
 await api('post',`/admin/wallet-renewals/${renewal.id}/process`,staff.PROVISIONER.token).expect(200);
 assert.equal((await summary(f.token)).availableMinor,550000);assert.equal((await db.subscription.findUniqueOrThrow({where:{id:f.sub.id}})).status,'ACTIVE');
 assert.equal((await service.reconcile(f.customer.id)).projectionMatchesLedger,true);
});
test('registration is idempotent and rejects legacy consumed payment references without changing history',async()=>{
 const f=await fixture(),{payment,input}=await registration(f);assert.equal((await service.register(f.actor,input)).id,payment.id);
 await assert.rejects(()=>service.register(f.actor,{...input,amountMinor:1}));
 const order=await db.order.create({data:{customerId:f.customer.id,planId:f.plan.id,buildingId:f.building.id,amountMinor:1950000n,currency:'NGN',planName:f.plan.name,billingDays:30,status:'PAID'}});
 const old=await db.payment.create({data:{orderId:order.id,customerId:f.customer.id,amountMinor:1950000n,currency:'NGN',method:'BANK_TRANSFER',reference:'SIMULATED-CONSUMED-'+randomUUID(),evidence:'SIMULATED historical consumed payment',verificationEvidence:'SIMULATED verified',status:'CONFIRMED',verifiedById:staff.FINANCE.id,verifiedAt:new Date()}});
 for(const field of ['merchantReference','providerPaymentId'] as const)await assert.rejects(()=>service.register(f.actor,{...input,idempotencyKey:randomUUID(),providerPaymentId:'SIMULATED-'+randomUUID(),merchantReference:'SIMULATED-'+randomUUID(),[field]:old.reference.toLowerCase()}));
 assert.deepEqual(await db.payment.findUnique({where:{id:old.id}}),old);assert.equal((await summary(f.token)).availableMinor,0);
 await assert.rejects(()=>service.register(f.actor,{...input,orderId:order.id} as any));
});
test('database rejects orphan settlement credits, incomplete settlement and financial-history changes',async()=>{
 const f=await fixture(),{payment}=await registration(f);
 await assert.rejects(()=>db.settlementPayment.update({where:{id:payment.id},data:{status:'CREDITED',settledAt:new Date(),settlementReference:'SIMULATED-orphan'}}));
 await assert.rejects(()=>db.walletEntry.create({data:{walletId:payment.walletId,customerId:f.customer.id,kind:'SETTLEMENT_CREDIT',amountMinor:payment.amountMinor,postedDeltaMinor:payment.amountMinor,reservedDeltaMinor:0n,reference:randomUUID(),operationKey:randomUUID(),requestFingerprint:'test',description:'SIMULATED invalid orphan',settlementPaymentId:payment.id,simulated:true}}));
 assert.equal((await summary(f.token)).availableMinor,0);const result=await service.ingest(adapter.envelope(payment,randomUUID()));
 await assert.rejects(()=>db.settlementEvent.update({where:{id:result.event.id},data:{eventId:'changed'}}));
 await assert.rejects(()=>db.settlementPayment.update({where:{id:payment.id},data:{amountMinor:1n}}));
 await assert.rejects(()=>db.walletEntry.delete({where:{id:result.entry!.id}}));
 await api('post',`/admin/wallet-transactions/${result.entry!.id}/reverse`,staff.FINANCE.token,{reason:'SIMULATED unsupported provider chargeback',idempotencyKey:randomUUID()}).expect(409);
 assert.equal((await service.reconcile(f.customer.id)).settlementsMatchLedger,true);
});
