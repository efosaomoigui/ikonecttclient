import 'dotenv/config';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import * as C from '../../contracts';
import {Database,audit} from '../src/core/database';
import {Config} from '../src/core/config';
import {clientPlans} from './import-client-data';
import {areaSearch} from '../src/catalogue/service-areas.controller';
// Dry-run by default. Apply only to a new migrated database after release approval.
async function main(){
 const filename=process.argv[2],expected=process.argv[3];if(!filename||!expected)throw Error('Supply reviewed bundle path and SHA-256');
 const raw=readFileSync(filename,'utf8');if(createHash('sha256').update(raw).digest('hex')!==expected)throw Error('Release checksum mismatch');
 const source=JSON.parse(raw);if(source.version!==1)throw Error('Unsupported release version');
 const plans=z.array(C.Plan).length(7).parse(source.plans.map((p:any)=>({...p,priceMinor:p.priceMinor===null?null:Number(p.priceMinor),renewalPriceMinor:p.renewalPriceMinor===null?null:Number(p.renewalPriceMinor)})));
 if(plans.some(p=>p.simulated)||new Set(plans.map(p=>p.code)).size!==7||clientPlans.some(p=>!plans.some(r=>r.code===p.code)))throw Error('Only the seven approved plan identities may be released');
 const areas=z.array(C.ServiceAreaInput.extend({id:C.Id,sourceKey:z.string().regex(/^client-coverage-2026-11-row-\d{3}$/),sourceName:z.string().min(1),createdAt:z.string().datetime(),updatedAt:z.string().datetime()}).strip()).length(83).parse(source.serviceAreas);
 if(new Set(areas.map(a=>a.sourceKey)).size!==83)throw Error('Coverage source identities must be unique');
 const knowledge=z.array(C.KnowledgeArticle).min(1).parse(source.knowledge);const contacts=source.contacts?C.ContactSettingsInput.parse(source.contacts):null;
 console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'dry-run',plans:plans.length,coverage:areas.length,knowledge:knowledge.length,customerRecords:0,credentials:0}));
 if(!process.argv.includes('--apply'))return;
 const db=new Database(new Config());try{await db.mutate(async tx=>{
  const occupied=await Promise.all([tx.plan.count(),tx.serviceArea.count(),tx.knowledgeArticle.count(),tx.customer.count(),tx.lead.count(),tx.payment.count(),tx.order.count(),tx.user.count(),tx.coverageLocation.count(),tx.ticket.count(),tx.notification.count()]);
  if(occupied.some(Boolean))throw Error('Refusing to overwrite an existing dataset; use normal Admin management instead');
  await tx.plan.createMany({data:plans});await tx.serviceArea.createMany({data:areas.map(a=>({...a,searchText:areaSearch(a.name,a.aliases)}))});await tx.knowledgeArticle.createMany({data:knowledge});
  if(contacts)await tx.assistantSettings.upsert({where:{id:'main'},create:{id:'main',...contacts},update:contacts});
  await audit(tx,null,'client_release.imported','ClientDataset','reviewed-release',{sha256:expected,plans:plans.length,coverage:areas.length,knowledge:knowledge.length});
 });}finally{await db.$disconnect();}
}
main().catch(()=>{console.error('Release import refused or failed; verify checksum, approved data and empty target database. No credentials are printed.');process.exitCode=1});
