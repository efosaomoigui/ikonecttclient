import {BadRequestException,ConflictException,ForbiddenException,Injectable} from '@nestjs/common';
import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {audit,Database} from '../core/database';
import {Config} from '../core/config';
import {Actor} from '../identity/access';
import {activeCustomer} from '../commerce/commerce.service';
import {SettlementAdapter,SettlementEnvelope,SettlementIdentity,VerifiedSettlement} from './settlement.adapter';

const Registration=z.object({providerPaymentId:z.string().trim().min(3).max(150),merchantReference:z.string().trim().min(3).max(150),amountMinor:z.number().int().positive().max(1_000_000_000_000),currency:z.literal('NGN'),idempotencyKey:z.string().uuid()}).strict();
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
@Injectable()
export class SettlementService{
 constructor(private readonly db:Database,private readonly config:Config,private readonly adapter:SettlementAdapter){}
 private identity(){
  const identity=SettlementIdentity.parse(this.adapter.identity());
  if(identity.simulated&&!['test','development'].includes(this.config.values.NODE_ENV))throw new ForbiddenException('Simulated settlement is restricted to development/test');
  return identity;
 }
 // Internal trusted-checkout boundary, deliberately NOT an HTTP endpoint. Only bind IDs
 // created by the approved provider for this authenticated customer. No order allocation.
 async register(actor:Actor,raw:z.input<typeof Registration>){
  const input=Registration.parse(raw),identity=this.identity();
  if(actor.kind!=='CUSTOMER'||!actor.customerId)throw new ForbiddenException('Authenticated customer intent required');
  const customerId=actor.customerId,requestFingerprint=hash({identity,input});
  return this.db.mutate(async tx=>{
   await tx.$queryRaw`SELECT id FROM "Wallet" WHERE "customerId"=${customerId}::uuid FOR UPDATE`;
   const old=await tx.settlementPayment.findUnique({where:{customerId_idempotencyKey:{customerId,idempotencyKey:input.idempotencyKey}}});
   if(old){if(old.requestFingerprint!==requestFingerprint)throw new ConflictException('Settlement registration key reused with different terms');return old}
   await activeCustomer(tx,customerId);
   const wallet=await tx.wallet.findUniqueOrThrow({where:{customerId}});
   const payment=await tx.settlementPayment.create({data:{...input,amountMinor:BigInt(input.amountMinor),provider:identity.provider,providerAccount:identity.account,simulated:identity.simulated,customerId,walletId:wallet.id,requestFingerprint}});
   await audit(tx,actor.id,'settlement.payment_registered','SettlementPayment',payment.id,{allocation:'WALLET',provider:identity.provider});
   return payment;
  });
 }
 // Worker/webhook transport must call THIS boundary, never a bypass taking a pre-verified
 // POJO. Invalid authentication or failed remote lookup throws before any financial write.
 async ingest(envelope:SettlementEnvelope){
  const identity=this.identity();
  if(!Buffer.isBuffer(envelope.body)||envelope.body.length>262144)throw new BadRequestException('Invalid settlement envelope');
  const event=VerifiedSettlement.parse(await this.adapter.verifyAndFetch(envelope));
  if(event.provider!==identity.provider||event.account!==identity.account||event.simulated!==identity.simulated)throw new ForbiddenException('Unapproved provider/account');
  if(event.settledAt&&new Date(event.settledAt).getTime()>Date.now()+300000)throw new BadRequestException('Settlement date is in the future');
  const payloadDigest=createHash('sha256').update(envelope.body).digest('hex');
  return this.db.mutate(async tx=>{
   await tx.$queryRaw`SELECT id FROM "SettlementPayment" WHERE id=${event.paymentId}::uuid FOR UPDATE`;
   const payment=await tx.settlementPayment.findUniqueOrThrow({where:{id:event.paymentId}});
   if(payment.provider!==event.provider||payment.providerAccount!==event.account||payment.providerPaymentId!==event.providerPaymentId||payment.merchantReference!==event.merchantReference||payment.amountMinor!==BigInt(event.amountMinor)||payment.currency!==event.currency||payment.simulated!==event.simulated)throw new ConflictException('Settlement does not match the registered customer payment');
   const key={provider:event.provider,providerAccount:event.account,eventId:event.eventId};
   const old=await tx.settlementEvent.findUnique({where:{provider_providerAccount_eventId:key}});
   if(old){if(old.payloadDigest!==payloadDigest||old.paymentId!==payment.id)throw new ConflictException('Provider event ID reused with different content');return{event:old,payment,entry:await tx.walletEntry.findUnique({where:{settlementPaymentId:payment.id}})}}
   await tx.$queryRaw`SELECT id FROM "Wallet" WHERE id=${payment.walletId}::uuid FOR UPDATE`;
   const wallet=await tx.wallet.findUniqueOrThrow({where:{id:payment.walletId}});
   let outcome='IGNORED',entry=await tx.walletEntry.findUnique({where:{settlementPaymentId:payment.id}}),updated=payment;
   if(event.status==='SETTLED'){
    if(payment.status==='CREDITED'){
     if(payment.settledAt?.getTime()!==new Date(event.settledAt!).getTime()||payment.settlementReference!==event.settlementReference)throw new ConflictException('Previously credited settlement terms differ; reconcile with provider');
     outcome='DUPLICATE';
    }else{
     if(wallet.postedMinor+payment.amountMinor>1_000_000_000_000n)throw new ConflictException('Wallet limit exceeded; settlement requires reconciliation');
     updated=await tx.settlementPayment.update({where:{id:payment.id},data:{status:'CREDITED',settledAt:new Date(event.settledAt!),settlementReference:event.settlementReference}});
     entry=await tx.walletEntry.create({data:{walletId:wallet.id,customerId:wallet.customerId,kind:'SETTLEMENT_CREDIT',amountMinor:payment.amountMinor,postedDeltaMinor:payment.amountMinor,reservedDeltaMinor:0n,reference:'WTX-'+randomUUID(),operationKey:'settlement:'+payment.id,requestFingerprint:hash({paymentId:payment.id,settlementReference:event.settlementReference}),description:'Settled wallet funding '+payment.merchantReference,settlementPaymentId:payment.id,actorId:null,simulated:payment.simulated}});
     outcome='CREDITED';
    }
   }
   const receipt=await tx.settlementEvent.create({data:{...key,paymentId:payment.id,payloadDigest,providerStatus:event.status,outcome}});
   await audit(tx,null,'settlement.event_'+outcome.toLowerCase(),'SettlementEvent',receipt.id,{paymentId:payment.id,allocation:'WALLET',provider:event.provider});
   // Deliberately no order, subscription, provisioning, renewal or notification job writes.
   return{event:receipt,payment:updated,entry};
  });
 }
 // Read-only ledger/projection and settlement-allocation check for reconciliation jobs.
 reconcile(customerId:string){return this.db.$transaction(async tx=>{
  const wallet=await tx.wallet.findUniqueOrThrow({where:{customerId}});
  const totals=await tx.walletEntry.aggregate({where:{walletId:wallet.id},_sum:{postedDeltaMinor:true,reservedDeltaMinor:true}});
  const payments=await tx.settlementPayment.findMany({where:{customerId},include:{entry:true}});
  return{customerId,projectionMatchesLedger:wallet.postedMinor===(totals._sum.postedDeltaMinor||0n)&&wallet.reservedMinor===(totals._sum.reservedDeltaMinor||0n),settlementsMatchLedger:payments.every(p=>p.status==='CREDITED'?p.entry?.kind==='SETTLEMENT_CREDIT'&&p.entry.amountMinor===p.amountMinor&&!p.entry.reservedDeltaMinor:!p.entry),paymentCount:payments.length};
 },{isolationLevel:'RepeatableRead'})}
}
