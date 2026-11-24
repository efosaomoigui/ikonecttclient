import 'dotenv/config';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {Database,audit} from '../src/core/database';
import {Config} from '../src/core/config';
import {areaSearch} from '../src/catalogue/service-areas.controller';
export const clientPlans=[
 {code:'i-basic-50mbps',name:'i-Basic_50Mbps',kind:'RESIDENTIAL',priceMinor:3250000n,speedMbps:50},
 {code:'i-silver-100mbps',name:'I-Silver_100Mbps',kind:'RESIDENTIAL',priceMinor:6500000n,speedMbps:100},
 {code:'i-gold-300mbps',name:'I-Gold_300Mbps',kind:'RESIDENTIAL',priceMinor:15050000n,speedMbps:300},
 {code:'i-business-100mbps',name:'I-Business_100Mbps',kind:'BUSINESS',priceMinor:null,speedMbps:100},
 {code:'i-business-plus-300mbps',name:'I-Business Plus_300Mbps',kind:'BUSINESS',priceMinor:null,speedMbps:300},
 {code:'i-business-pro-500mbps',name:'I-Business Pro_500Mbps',kind:'BUSINESS',priceMinor:null,speedMbps:500},
 {code:'i-business-max-1000mbps',name:'I-Business Max_1000Mbps',kind:'BUSINESS',priceMinor:null,speedMbps:1000},
] as const;
export async function importClientData(db:Database,names:string[]){
 if(names.length!==83)throw Error('Expected 83 transcribed source rows');
 return db.mutate(async tx=>{
  // Existing non-simulated production catalogue is preserved. Only labelled placeholders retire.
  await tx.plan.updateMany({where:{published:true,OR:[{simulated:true},{code:{startsWith:'simulated-'},name:{startsWith:'SIMULATED'}}]},data:{published:false}});
  for(const plan of clientPlans)await tx.plan.upsert({where:{code:plan.code},create:{...plan,uploadMbps:plan.speedMbps,billingDays:null,features:[],published:true,simulated:false},update:{}});
  for(const [i,sourceName] of names.entries()){
   const aliases:string[]=[];let duplicateGroup:string|null=null,reviewNote:string|null=null,displayPrimary=true;
   if([43,73].includes(i+1)){duplicateGroup='dideolu-estate';displayPrimary=i+1===43;reviewNote='Same transcribed name occurs twice in source rows 43 and 73; client confirmation required.'}
   if([65,72].includes(i+1)){duplicateGroup='goldmark-residence';displayPrimary=i+1===65;aliases.push('Gold Mark Residence','Goldmark Residence');reviewNote='Possible duplicate source rows 65 and 72; spelling/identity requires client confirmation.'}
   if(sourceName==='Victiria Island'){aliases.push('Victoria Island');reviewNote='Source spelling Victiria Island requires client confirmation; Victoria Island is search alias only.'}
   if(sourceName==='Millenium Estate Gbagada')aliases.push('Millennium Estate Gbagada');
   if(sourceName==='Millenium Estate Lekki')aliases.push('Millennium Estate Lekki');
   if(sourceName==='ilupeju')aliases.push('Ilupeju');
   const area=['Yaba Cluster 2','Yaba','Computer Village','Lekki Phase 1','Victiria Island','Iponri','Ikeja','ilupeju'].includes(sourceName);
   const scope=area?'AREA':/Estate|Gardens|Garden|Homes|Horizon|Peninsula/i.test(sourceName)?'ESTATE':'SITE';
   const name=sourceName==='ilupeju'?'Ilupeju':sourceName;
   await tx.serviceArea.upsert({where:{sourceKey:'client-coverage-2026-11-row-'+String(i+1).padStart(3,'0')},create:{sourceKey:'client-coverage-2026-11-row-'+String(i+1).padStart(3,'0'),sourceName,name,scope,aliases,duplicateGroup,reviewNote,displayPrimary,searchText:areaSearch(name,aliases)},update:{}});
  }
  await audit(tx,null,'client_data.imported','ClientDataset','2026-11-client-supplied',{plans:7,coverageSourceRows:83,source:'User-supplied transcription; original workbook names and suffixes not available'});
  return{plans:await tx.plan.count({where:{code:{in:clientPlans.map(p=>p.code)}}}),coverageSourceRows:await tx.serviceArea.count({where:{sourceKey:{startsWith:'client-coverage-2026-11-row-'}}}),publicPrimaryAreas:await tx.serviceArea.count({where:{sourceKey:{startsWith:'client-coverage-2026-11-row-'},active:true,displayPrimary:true}})};
 });
}
if(require.main===module){const config=new Config();if(config.values.NODE_ENV==='production')throw Error('Review import requires a non-production environment');const db=new Database(config);const names=JSON.parse(readFileSync(resolve(__dirname,'../data/client-service-areas.json'),'utf8'));importClientData(db,names).then(result=>console.log(JSON.stringify(result))).catch(()=>{console.error('Client data import failed; inspect configuration and migrations without printing credentials');process.exitCode=1}).finally(()=>db.$disconnect())}
