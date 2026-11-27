// Server-only adapter shared by the Nest backend and optional same-origin hosting bridge.
const {createHash}=require('node:crypto');
const descriptions=require('../shared/plan-descriptions.json');
const BASE='https://crm.ikonectt.com/api/v1/public';
const cache=new Map(),pending=new Map();
class CatalogueError extends Error{constructor(status,code,message){super(message);this.status=status;this.code=code;}}
const invalid=()=>new CatalogueError(502,'CLIENT_CATALOGUE_INVALID','Client plan or coverage information could not be verified. Please try again later.');
function enabled(env=process.env){const mode=env.IKONECTT_CATALOGUE_PROVIDER||(env.NODE_ENV==='test'?'internal':'client');if(!['internal','client'].includes(mode))throw new CatalogueError(503,'INVALID_CATALOGUE_PROVIDER','The catalogue provider is not configured correctly.');return mode==='client';}
function uuid(value){const hex=createHash('sha256').update('ikonectt-client:'+value).digest('hex');return `${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;}
function text(value,max=250){if(typeof value!=='string'||!value.trim()||value.length>max)throw invalid();return value.trim();}
function number(value,positive=false){if(typeof value!=='number'||!Number.isFinite(value)||value<0||(positive&&value<=0))throw invalid();return value;}
function normal(value){return value.toLowerCase().replace(/[^a-z0-9]+/g,'');}
function description(plan){
 if(typeof plan.description==='string'&&plan.description.trim())return {description:plan.description.trim().slice(0,4000),descriptionSource:'CLIENT'};
 const entry=descriptions.plans.find(p=>p.crmId===String(plan.id)&&p.category===plan.category)||descriptions.plans.find(p=>normal(p.name)===normal(plan.name)&&p.category===plan.category);
 const template=entry?.template||descriptions.generic[plan.category];
 return {description:template.replace(/\{(download_mbps|upload_mbps)\}/g,(_,key)=>String(plan[key])),descriptionSource:'EDITORIAL'};
}
async function request(path,env=process.env,fetcher=fetch){
 const key=env.WEBSITE_API_KEY;if(!key)throw new CatalogueError(503,'CLIENT_CATALOGUE_NOT_CONFIGURED','The client catalogue connection is not configured.');
 const token=createHash('sha256').update(key).digest('hex')+':'+path;
 const existing=cache.get(token);if(existing&&existing.until>Date.now())return structuredClone(existing.body);
 if(pending.has(token))return structuredClone(await pending.get(token));
 const work=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{
  const response=await fetcher(BASE+path,{headers:{Accept:'application/json','X-API-KEY':key},redirect:'error',signal:controller.signal,cache:'no-store'});
  if(!response.ok)throw new CatalogueError(response.status===429?429:503,'CLIENT_CATALOGUE_UNAVAILABLE','Current client plan or coverage information is temporarily unavailable.');
  const body=await response.json();if(!body||body.error!==false||!body.data)throw invalid();
  body.__fetchedAt=new Date().toISOString();cache.set(token,{until:Date.now()+60000,body});if(cache.size>200)cache.delete(cache.keys().next().value);return body;
 }catch(error){if(error instanceof CatalogueError)throw error;throw new CatalogueError(503,'CLIENT_CATALOGUE_UNAVAILABLE','Current client plan or coverage information is temporarily unavailable.');}finally{clearTimeout(timer);}})();
 pending.set(token,work);try{return structuredClone(await work);}finally{pending.delete(token);}
}
async function allPlans(env=process.env,fetcher=fetch){
 const {data,__fetchedAt}=await request('/plans',env,fetcher);if(!Array.isArray(data.plans)||data.count!==data.plans.length)throw invalid();
 const fetchedAt=__fetchedAt;const seen=new Set();
 return data.plans.map(p=>{if(!Number.isSafeInteger(p.id)||p.id<=0||seen.has(p.id)||!['Residential','Business'].includes(p.category)||p.currency!=='NGN')throw invalid();seen.add(p.id);
 const name=text(p.name),price=number(p.price_per_month),priceMinor=Math.round(price*100);if(!Number.isSafeInteger(priceMinor)||Math.abs(price*100-priceMinor)>0.00001)throw invalid();
 const speedMbps=number(p.download_mbps,true),uploadMbps=number(p.upload_mbps,true);if(!Number.isInteger(speedMbps)||!Number.isInteger(uploadMbps))throw invalid();
 return {id:uuid('plan:'+p.id),externalId:String(p.id),code:'crm-plan-'+p.id,name,kind:p.category==='Business'?'BUSINESS':'RESIDENTIAL',priceMinor,currency:'NGN',speedMbps,uploadMbps,billingDays:null,billingPeriod:'MONTH',features:[],published:true,simulated:false,renewalPriceMinor:null,createdAt:null,updatedAt:null,source:'CLIENT',fetchedAt,...description({...p,name})};});
}
function page(rows,query={}){const offset=Number(query.offset??0),limit=Number(query.limit??25);if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>100)throw new CatalogueError(400,'INVALID_QUERY','Use a valid offset and a limit between 1 and 100.');return {items:rows.slice(offset,offset+limit),total:rows.length,offset,limit};}
async function plans(query={},env=process.env,fetcher=fetch){return page(await allPlans(env,fetcher),query);}
async function plan(id,env=process.env,fetcher=fetch){const found=(await allPlans(env,fetcher)).find(p=>p.id===id);if(!found)throw new CatalogueError(404,'PLAN_NOT_FOUND','The selected plan is not currently available.');return found;}
function area(name,zone){name=text(name);zone=text(zone);return {id:uuid('area:'+zone+':'+name),name,zone,scope:'AREA',aliases:[],active:true,displayPrimary:true,notice:'Live area coverage is listed by the client. Your exact address still requires installation feasibility confirmation.',source:'CLIENT',duplicateGroup:null,reviewNote:null,sourceKey:'client-crm:'+uuid(zone+':'+name),sourceName:name,createdAt:null,updatedAt:null};}
async function areas(query={},env=process.env,fetcher=fetch){
 const search=String(query.search??'').trim();let rows=[];
 if(search){if(search.length<2||search.length>100)throw new CatalogueError(400,'INVALID_QUERY','Enter an area, estate or street name using 2 to 100 characters.');const {data}=await request('/coverage/check?q='+encodeURIComponent(search),env,fetcher);if(typeof data.covered!=='boolean'||!Array.isArray(data.matches)||data.count!==data.matches.length||data.covered!==(data.matches.length>0))throw invalid();rows=data.matches.map(m=>area(m.area,m.zone));}
 else {const {data}=await request('/coverage',env,fetcher);if(!Array.isArray(data.zones)||data.zone_count!==data.zones.length)throw invalid();for(const zone of data.zones){text(zone.name);if(!Array.isArray(zone.areas)||!zone.areas.length)throw invalid();rows.push(...zone.areas.map(name=>area(name,zone.name)));}if(data.area_count!==rows.length)throw invalid();}
 const ids=new Set(rows.map(r=>r.id));if(ids.size!==rows.length)throw invalid();rows.sort((a,b)=>a.name.localeCompare(b.name)||a.zone.localeCompare(b.zone));return page(rows,query);
}
function clearCache(){cache.clear();pending.clear();}
module.exports={enabled,plans,plan,areas,allPlans,description,clearCache,CatalogueError};
