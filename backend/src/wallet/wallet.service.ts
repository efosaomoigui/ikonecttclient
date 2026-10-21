import {BadRequestException,ConflictException,Injectable,NotFoundException} from '@nestjs/common';
import {createHash,randomUUID} from 'node:crypto';
import * as C from '../../../contracts';
import {audit,Database,Tx} from '../core/database';
import {Actor} from '../identity/access';
import {Config} from '../core/config';
import {activeCustomer} from '../commerce/commerce.service';
import {RenewalProvider} from './renewal.provider';

const MAX=1_000_000_000_000n;
const fingerprint=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const pending=['RESERVED','PROCESSING','REQUIRES_REVIEW'];
@Injectable()
export class WalletService{
 constructor(private readonly db:Database,private readonly config:Config,private readonly provider:RenewalProvider){}
 private async lock(tx:Tx,customerId:string){
  await tx.$queryRaw`SELECT "id" FROM "Wallet" WHERE "customerId"=${customerId}::uuid FOR UPDATE`;
  return tx.wallet.findUniqueOrThrow({where:{customerId},include:{customer:true}});
 }
 private async summaryIn(tx:Tx,customerId:string){
  const wallet=await tx.wallet.findUniqueOrThrow({where:{customerId},include:{customer:true}});
  const topUps=await tx.walletTopUp.aggregate({where:{customerId,status:'REPORTED'},_sum:{amountMinor:true},_count:true});
  const simulated=wallet.customer.accountNumberSimulated||!!await tx.walletEntry.findFirst({where:{walletId:wallet.id,simulated:true},select:{id:true}});
  return{customerId,currency:'NGN' as const,postedMinor:wallet.postedMinor,reservedMinor:wallet.reservedMinor,availableMinor:wallet.postedMinor-wallet.reservedMinor,pendingTopUpsMinor:topUps._sum.amountMinor||0n,pendingTopUpsCount:topUps._count,simulated,topUpInstructions:{mode:'MANUAL_REPORT' as const,bankDetails:null,notice:'Report a transfer only using payment details supplied by Ikonectt through an approved channel. No bank details or live gateway are configured here. A report is not spendable until Finance verifies it.'}};
 }
 summary(customerId:string){return this.db.mutate(tx=>this.summaryIn(tx,customerId))}
 private entry(tx:Tx,wallet:{id:string;customerId:string},input:{kind:string;amountMinor:bigint;postedDeltaMinor:bigint;reservedDeltaMinor:bigint;operationKey:string;description:string;actorId:string;simulated:boolean;requestFingerprint?:string;topUpId?:string;renewalId?:string;reversalOfId?:string}){
  return tx.walletEntry.create({data:{...input,requestFingerprint:input.requestFingerprint||fingerprint({operationKey:input.operationKey}),walletId:wallet.id,customerId:wallet.customerId,reference:'WTX-'+randomUUID()}});
 }
 report(actor:Actor,input:C.Input<typeof C.ReportWalletTopUpRequest>){
  return this.db.mutate(async tx=>{
   const customerId=actor.customerId!;
   const wallet=await this.lock(tx,customerId);
   const hash=fingerprint(input);
   const old=await tx.walletTopUp.findUnique({where:{customerId_idempotencyKey:{customerId,idempotencyKey:input.idempotencyKey}}});
   if(old){if(old.requestFingerprint!==hash)throw new ConflictException('Idempotency key was used for a different top-up');return old}
   await activeCustomer(tx,customerId);
   const pendingAmount=await tx.walletTopUp.aggregate({where:{customerId,status:'REPORTED'},_sum:{amountMinor:true}});
   if(wallet.postedMinor+(pendingAmount._sum.amountMinor||0n)+BigInt(input.amountMinor)>MAX)throw new ConflictException('Wallet and pending top-ups exceed the supported limit');
   const record=await tx.walletTopUp.create({data:{...input,amountMinor:BigInt(input.amountMinor),walletId:wallet.id,customerId,requestFingerprint:hash,simulated:wallet.customer.accountNumberSimulated}});
   await audit(tx,actor.id,'wallet.topup_reported','WalletTopUp',record.id,{allocation:'WALLET'});
   return record;
  });
 }
 verify(actor:Actor,id:string,input:C.Input<typeof C.VerifyPaymentRequest>){
  return this.db.mutate(async tx=>{
   const lookup=await tx.walletTopUp.findUniqueOrThrow({where:{id}});
   const wallet=await this.lock(tx,lookup.customerId);
   const topUp=await tx.walletTopUp.findUniqueOrThrow({where:{id}});
   if(topUp.status===input.decision)return topUp;
   if(topUp.status!=='REPORTED')throw new ConflictException('Top-up has already been reviewed');
   if(input.decision==='CONFIRMED'){
    await activeCustomer(tx,topUp.customerId);
    if(wallet.postedMinor+topUp.amountMinor>MAX)throw new ConflictException('Wallet limit exceeded');
    await this.entry(tx,wallet,{kind:'TOPUP_CREDIT',amountMinor:topUp.amountMinor,postedDeltaMinor:topUp.amountMinor,reservedDeltaMinor:0n,operationKey:'topup:'+id,description:'Verified wallet top-up '+topUp.reference,actorId:actor.id,simulated:topUp.simulated,topUpId:id});
   }
   const record=await tx.walletTopUp.update({where:{id},data:{status:input.decision,verificationEvidence:input.evidence,verifiedById:actor.id,verifiedAt:new Date()}});
   await audit(tx,actor.id,'wallet.topup_'+input.decision.toLowerCase(),'WalletTopUp',id,{allocation:'WALLET'});
   return record;
  });
 }
 adjust(actor:Actor,customerId:string,input:C.Input<typeof C.WalletAdjustmentRequest>){
  return this.db.mutate(async tx=>{
   const wallet=await this.lock(tx,customerId),operationKey=`adjust:${wallet.id}:${input.idempotencyKey}`,hash=fingerprint(input);
   const old=await tx.walletEntry.findUnique({where:{operationKey}});
   if(old){if(old.requestFingerprint!==hash)throw new ConflictException('Idempotency key was used for a different correction');return old}
   await activeCustomer(tx,customerId);
   const amount=BigInt(input.amountMinor);
   if(wallet.postedMinor+amount>MAX)throw new ConflictException('Wallet limit exceeded');
   const entry=await this.entry(tx,wallet,{kind:'ADJUSTMENT_CREDIT',amountMinor:amount,postedDeltaMinor:amount,reservedDeltaMinor:0n,operationKey,requestFingerprint:hash,description:input.reason,actorId:actor.id,simulated:wallet.customer.accountNumberSimulated});
   await audit(tx,actor.id,'wallet.adjustment_credit','WalletEntry',entry.id,{reason:input.reason});return entry;
  });
 }
 reverse(actor:Actor,id:string,input:C.Input<typeof C.WalletReversalRequest>){
  return this.db.mutate(async tx=>{
   const lookup=await tx.walletEntry.findUniqueOrThrow({where:{id}}),wallet=await this.lock(tx,lookup.customerId);
   const original=await tx.walletEntry.findUniqueOrThrow({where:{id}});
   if(!['TOPUP_CREDIT','ADJUSTMENT_CREDIT'].includes(original.kind))throw new ConflictException('Only credit corrections can be reversed; service refunds require an approved separate policy');
   const operationKey=`reverse:${wallet.id}:${input.idempotencyKey}`,hash=fingerprint({id,...input});
   const byKey=await tx.walletEntry.findUnique({where:{operationKey}});
   if(byKey){if(byKey.requestFingerprint!==hash)throw new ConflictException('Idempotency key was used for a different reversal');return byKey}
   if(await tx.walletEntry.findUnique({where:{reversalOfId:id}}))throw new ConflictException('Entry already has a compensating reversal');
   await activeCustomer(tx,original.customerId);
   if(wallet.postedMinor-wallet.reservedMinor<original.amountMinor)throw new ConflictException('Credit is spent or held; insufficient available funds for reversal');
   const result=await this.entry(tx,wallet,{kind:'REVERSAL',amountMinor:original.amountMinor,postedDeltaMinor:-original.amountMinor,reservedDeltaMinor:0n,operationKey,requestFingerprint:hash,description:input.reason,actorId:actor.id,simulated:original.simulated,reversalOfId:id});
   await audit(tx,actor.id,'wallet.credit_reversed','WalletEntry',result.id,{originalEntryId:id,reason:input.reason});return result;
  });
 }
 private async quote(tx:Tx,customerId:string,id:string){
  const subscription=await tx.subscription.findFirst({where:{id,customerId},include:{plan:true,building:{include:{plans:true}},customer:true}});
  if(!subscription)throw new NotFoundException('Owned subscription not found');
  const {plan,building,customer}=subscription,reasons:C.Input<typeof C.RenewalReason>[]=[];
  if(customer.status!=='ACTIVE')reasons.push('ACCOUNT_INACTIVE');
  if(!subscription.renewalEnabled)reasons.push('SERVICE_NOT_ENABLED');
  if(!['ACTIVE','SUSPENDED'].includes(subscription.status))reasons.push('SERVICE_STATE');
  if(!subscription.startsAt||!subscription.endsAt||!subscription.externalServiceId)reasons.push('MISSING_SERVICE_DATES');
  if(!plan.published||plan.kind!==customer.kind)reasons.push('PLAN_UNAVAILABLE');
  if(!plan.renewalPriceMinor||plan.renewalPriceMinor<=0n)reasons.push('PRICE_UNAVAILABLE');
  if(building.level!=='BUILDING_ADDRESS'||building.eligibility!=='AVAILABLE'||!building.plans.some(p=>p.planId===plan.id))reasons.push('COVERAGE_REVIEW');
  const mode=this.config.values.PROVISIONING_ADAPTER;
  if(mode==='disabled'||(mode!=='simulated'&&(plan.simulated||building.simulated||subscription.simulated)))reasons.push('PROVIDER_UNAVAILABLE');
  if(await tx.order.count({where:{subscriptionId:id,status:{in:['PENDING_PAYMENT','PAID','FULFILLING']}}})||await tx.walletRenewal.count({where:{subscriptionId:id,status:{in:pending}}}))reasons.push('RENEWAL_IN_PROGRESS');
  const wallet=await this.summaryIn(tx,customerId);
  if(plan.renewalPriceMinor&&wallet.availableMinor<plan.renewalPriceMinor)reasons.push('INSUFFICIENT_FUNDS');
  const expectedEndsAt=subscription.endsAt?new Date(Math.max(Date.now(),subscription.endsAt.getTime())+plan.billingDays*86_400_000):null;
  return{subscription,plan,wallet,reasons,expectedEndsAt};
 }
 eligibility(customerId:string,id:string){return this.db.mutate(async tx=>{
  const q=await this.quote(tx,customerId,id);
  return{subscriptionId:id,eligible:!q.reasons.length,reasonCodes:q.reasons,amountMinor:q.plan.renewalPriceMinor,priceVersion:q.plan.updatedAt,billingDays:q.plan.billingDays,currentEndsAt:q.subscription.endsAt,expectedEndsAt:q.expectedEndsAt,planName:q.plan.name,speedMbps:q.plan.speedMbps,wallet:q.wallet,simulated:q.subscription.simulated||q.plan.simulated||this.config.values.PROVISIONING_ADAPTER==='simulated'};
 })}
 reserve(actor:Actor,id:string,input:C.Input<typeof C.WalletRenewalRequest>){
  return this.db.mutate(async tx=>{
   const customerId=actor.customerId!,wallet=await this.lock(tx,customerId),hash=fingerprint({subscriptionId:id,...input});
   const old=await tx.walletRenewal.findUnique({where:{customerId_idempotencyKey:{customerId,idempotencyKey:input.idempotencyKey}}});
   if(old){if(old.requestFingerprint!==hash)throw new ConflictException('Idempotency key was used for a different renewal');return old}
   await tx.$queryRaw`SELECT "id" FROM "Subscription" WHERE "id"=${id}::uuid FOR UPDATE`;
   const q=await this.quote(tx,customerId,id);
   if(q.plan.updatedAt.toISOString()!==input.priceVersion)throw new ConflictException('Renewal price changed; review a fresh eligibility quote');
   if(q.reasons.length)throw new ConflictException({message:'Renewal is not eligible',details:{reasonCodes:q.reasons}});
   const amount=q.plan.renewalPriceMinor!;
   const order=await tx.order.create({data:{customerId,planId:q.plan.id,buildingId:q.subscription.buildingId,type:'RENEWAL',subscriptionId:id,fundingSource:'WALLET',status:'FULFILLING',amountMinor:amount,currency:'NGN',planName:q.plan.name,billingDays:q.plan.billingDays}});
   const renewal=await tx.walletRenewal.create({data:{walletId:wallet.id,customerId,subscriptionId:id,orderId:order.id,planId:q.plan.id,planName:q.plan.name,amountMinor:amount,billingDays:q.plan.billingDays,priceVersion:q.plan.updatedAt,previousEndsAt:q.subscription.endsAt!,expectedEndsAt:q.expectedEndsAt!,providerMode:this.config.values.PROVISIONING_ADAPTER,simulated:this.config.values.PROVISIONING_ADAPTER==='simulated',idempotencyKey:input.idempotencyKey,requestFingerprint:hash}});
   await this.entry(tx,wallet,{kind:'RESERVE',amountMinor:amount,postedDeltaMinor:0n,reservedDeltaMinor:amount,operationKey:'reserve:'+renewal.id,description:'Funds held for renewal '+q.plan.name,actorId:actor.id,simulated:renewal.simulated,renewalId:renewal.id});
   await audit(tx,actor.id,'wallet.renewal_reserved','WalletRenewal',renewal.id,{orderId:order.id});return renewal;
  });
 }
 policy(actor:Actor,id:string,input:C.Input<typeof C.RenewalPolicyRequest>){return this.db.mutate(async tx=>{
  await tx.$queryRaw`SELECT "id" FROM "Subscription" WHERE "id"=${id}::uuid FOR UPDATE`;
  const result=await tx.subscription.update({where:{id},data:{renewalEnabled:input.enabled}});
  await audit(tx,actor.id,'subscription.renewal_policy','Subscription',id,{enabled:input.enabled,reason:input.reason});return result;
 })}
 async process(actor:Actor,id:string){
  const prepared=await this.db.mutate(async tx=>{
   const lookup=await tx.walletRenewal.findUniqueOrThrow({where:{id}});await this.lock(tx,lookup.customerId);
   const renewal=await tx.walletRenewal.findUniqueOrThrow({where:{id},include:{subscription:true}});
   if(renewal.status!=='RESERVED')return{renewal,claimed:false};
   await activeCustomer(tx,renewal.customerId);
   if(renewal.providerMode!==this.config.values.PROVISIONING_ADAPTER)throw new ConflictException('Provider configuration changed; reconcile this reservation before proceeding');
   await tx.walletRenewal.update({where:{id},data:{status:'PROCESSING'}});
   await audit(tx,actor.id,'wallet.renewal_processing','WalletRenewal',id);
   return{renewal,claimed:true};
  });
  if(!prepared.claimed)return prepared.renewal;
  const r=prepared.renewal;
  try{
   const result=await this.provider.renew({requestId:id,subscriptionId:r.subscriptionId,externalServiceId:r.subscription.externalServiceId!,previousEndsAt:r.previousEndsAt.toISOString(),expectedEndsAt:r.expectedEndsAt.toISOString(),billingDays:r.billingDays});
   if(result.status==='CONFIRMED')return await this.finish(actor,id,'SUCCEEDED',result.reference,'Confirmed '+(result.simulated?'SIMULATED ':'')+'renewal outcome',result.confirmedEndsAt||undefined);
   if(result.status==='FAILED')return await this.finish(actor,id,'FAILED',result.reference,'Definite '+(result.simulated?'SIMULATED ':'')+'renewal failure');
   return await this.review(actor,id,result.reference,'Provider acknowledgement or uncertain outcome; funds remain held',result.status==='PENDING'?'PROCESSING':'REQUIRES_REVIEW');
  }catch{return this.review(actor,id,'REVIEW-'+id,'Provider timeout or settlement uncertainty; do not retry the external request blindly','REQUIRES_REVIEW')}
 }
 private review(actor:Actor,id:string,reference:string,evidence:string,status:string){return this.db.mutate(async tx=>{
  const lookup=await tx.walletRenewal.findUniqueOrThrow({where:{id}});await this.lock(tx,lookup.customerId);
  const current=await tx.walletRenewal.findUniqueOrThrow({where:{id}});if(!pending.includes(current.status))return current;
  const result=await tx.walletRenewal.update({where:{id},data:{status,providerReference:reference,resolutionEvidence:evidence}});
  await audit(tx,actor.id,'wallet.renewal_review','WalletRenewal',id,{status});return result;
 })}
 async resolve(actor:Actor,id:string,input:C.Input<typeof C.RenewalResolutionRequest>){
  if(input.decision==='SUCCEEDED'&&!input.confirmedEndsAt)throw new BadRequestException('Authoritative confirmed expiry is required');
  return this.finish(actor,id,input.decision,input.reference,input.evidence,input.confirmedEndsAt);
 }
 private finish(actor:Actor,id:string,decision:'SUCCEEDED'|'FAILED',reference:string,evidence:string,confirmedEndsAt?:string){
  return this.db.mutate(async tx=>{
   const lookup=await tx.walletRenewal.findUniqueOrThrow({where:{id}}),wallet=await this.lock(tx,lookup.customerId);
   const renewal=await tx.walletRenewal.findUniqueOrThrow({where:{id}});
   if(!pending.includes(renewal.status)){if(renewal.status===decision&&renewal.providerReference===reference)return renewal;throw new ConflictException('Renewal already has a final outcome')}
   if(decision==='SUCCEEDED'&&renewal.status==='RESERVED')throw new ConflictException('Renewal has not been initiated');
   await tx.$queryRaw`SELECT "id" FROM "Subscription" WHERE "id"=${renewal.subscriptionId}::uuid FOR UPDATE`;
   const subscription=await tx.subscription.findUniqueOrThrow({where:{id:renewal.subscriptionId}});
   if(decision==='SUCCEEDED'){
    await activeCustomer(tx,renewal.customerId);
    if(!confirmedEndsAt||new Date(confirmedEndsAt).getTime()!==renewal.expectedEndsAt.getTime()||subscription.endsAt?.getTime()!==renewal.previousEndsAt.getTime()){
     const result=await tx.walletRenewal.update({where:{id},data:{status:'REQUIRES_REVIEW',providerReference:reference,resolutionEvidence:'Authoritative expiry does not match reserved period or service changed; reconcile before debit'}});
     await audit(tx,actor.id,'wallet.renewal_expiry_review','WalletRenewal',id);return result;
    }
    await this.entry(tx,wallet,{kind:'CAPTURE',amountMinor:renewal.amountMinor,postedDeltaMinor:-renewal.amountMinor,reservedDeltaMinor:-renewal.amountMinor,operationKey:'capture:'+id,description:'Confirmed renewal '+renewal.planName,actorId:actor.id,simulated:renewal.simulated,renewalId:id});
    await tx.subscription.update({where:{id:renewal.subscriptionId},data:{status:'ACTIVE',endsAt:renewal.expectedEndsAt,simulated:renewal.simulated}});
    await tx.order.update({where:{id:renewal.orderId},data:{status:'COMPLETED'}});
   }else{
    await this.entry(tx,wallet,{kind:'RELEASE',amountMinor:renewal.amountMinor,postedDeltaMinor:0n,reservedDeltaMinor:-renewal.amountMinor,operationKey:'release:'+id,description:'Released after definite renewal failure',actorId:actor.id,simulated:renewal.simulated,renewalId:id});
    await tx.order.update({where:{id:renewal.orderId},data:{status:'CANCELLED'}});
   }
   const result=await tx.walletRenewal.update({where:{id},data:{status:decision,providerReference:reference,resolutionEvidence:evidence,resolvedById:actor.id,confirmedEndsAt:decision==='SUCCEEDED'?renewal.expectedEndsAt:null}});
   await audit(tx,actor.id,'wallet.renewal_'+decision.toLowerCase(),'WalletRenewal',id,{orderId:renewal.orderId,simulated:renewal.simulated});return result;
  });
 }
}
