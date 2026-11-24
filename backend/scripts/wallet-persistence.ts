// Read-only local development fingerprint. Never includes credentials or evidence text.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
const root=path.resolve(__dirname,'../..');
const url=new URL(process.env.DATABASE_URL!);
assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,'55440');
assert.match(url.pathname,/^\/ikonectt_development(?:_\d+)?$/);
const label=process.argv[2];assert.match(label||'',/^[a-z0-9-]+$/);
if(process.argv[3]){assert.match(process.argv[3],/^ikonectt_development_\d+$/);url.pathname='/'+process.argv[3]}
const db=new PrismaClient({datasources:{db:{url:url.toString()}}});
const serialize=(v:unknown)=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x);
async function main(){
 const customers=['83028c05-b524-4c91-8288-c3c8373c970f','8ed394ec-8fb9-4830-8910-7933e53e74c7'];
 const records=[];
 for(const customerId of customers){
  const wallet=await db.wallet.findUniqueOrThrow({where:{customerId}});
  // These two legacy acceptance fixtures predate provider settlement. Select their original
  // scalar ledger fields explicitly so additive nullable metadata leaves the hash stable,
  // and the pre-migration check works with a newly generated client. Settlement source
  // reconciliation itself is checked by SettlementService.reconcile and its integration tests.
  const entries=await db.walletEntry.findMany({where:{walletId:wallet.id},orderBy:{id:'asc'},select:{id:true,walletId:true,customerId:true,kind:true,amountMinor:true,postedDeltaMinor:true,reservedDeltaMinor:true,postedAfterMinor:true,reservedAfterMinor:true,reference:true,operationKey:true,requestFingerprint:true,description:true,actorId:true,topUpId:true,renewalId:true,reversalOfId:true,simulated:true,createdAt:true}});
  const topUps=await db.walletTopUp.findMany({where:{customerId},orderBy:{id:'asc'}});
  const renewals=await db.walletRenewal.findMany({where:{customerId},orderBy:{id:'asc'}});
  const subscriptions=await db.subscription.findMany({where:{customerId},orderBy:{id:'asc'}});
  const orders=await db.order.findMany({where:{customerId},orderBy:{id:'asc'}});
  records.push({customerId,postedMinor:wallet.postedMinor.toString(),reservedMinor:wallet.reservedMinor.toString(),availableMinor:(wallet.postedMinor-wallet.reservedMinor).toString(),entries:entries.length,renewals:renewals.map(r=>({id:r.id,status:r.status})),fingerprint:createHash('sha256').update(serialize({wallet,entries,topUps,renewals,subscriptions,orders})).digest('hex')});
 }
 const result={label,database:url.pathname.slice(1),verifiedAt:new Date().toISOString(),records};
 fs.mkdirSync(path.join(root,'docs/stage5a'),{recursive:true});
 fs.writeFileSync(path.join(root,'docs/stage5a',`persistence-${label}.json`),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}
main().catch(()=>{console.error('Read-only wallet fingerprint failed');process.exitCode=1}).finally(()=>db.$disconnect());
