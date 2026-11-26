import 'dotenv/config';
import {writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Database} from '../src/core/database';
import {Config} from '../src/core/config';
import {clientPlans} from './import-client-data';
// Read-only allowlist: never exports customers, staff, enquiries, financials or credentials.
const db=new Database(new Config());
(async()=>{
 const plans=await db.plan.findMany({where:{code:{in:clientPlans.map(p=>p.code)}},orderBy:{code:'asc'}});
 const serviceAreas=await db.serviceArea.findMany({where:{sourceKey:{startsWith:'client-coverage-2026-11-row-'}},orderBy:{sourceKey:'asc'}});
 const knowledge=await db.knowledgeArticle.findMany({orderBy:{key:'asc'}});
 const settings=await db.assistantSettings.findUnique({where:{id:'main'},select:{whatsappUrl:true}});
 if(plans.length!==7||serviceAreas.length!==83)throw Error('Client data inventory differs; review before release');
 const bundle=JSON.stringify({version:1,createdAt:new Date().toISOString(),plans,serviceAreas,knowledge,contacts:settings},(_,v)=>typeof v==='bigint'?v.toString():v,2);
 mkdirSync('.local/production-readiness',{recursive:true});writeFileSync('.local/production-readiness/client-release.json',bundle);
 const sha256=createHash('sha256').update(bundle).digest('hex');writeFileSync('.local/production-readiness/client-release.sha256',sha256+'\n');
 console.log(JSON.stringify({plans:plans.length,coverageSourceRows:serviceAreas.length,knowledge:knowledge.length,containsCustomerData:false,containsCredentials:false,sha256}));
})().catch(()=>{console.error('Release export failed; review approved source inventory');process.exitCode=1}).finally(()=>db.$disconnect());
