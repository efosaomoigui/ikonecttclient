import {replaceCatalogue,catalogueStatus,catalogue} from './catalogue.js';
import {replacePublishedKnowledge} from './content.js';
export const officialPortal='https://portal.ikonectt.com';
export const supportContacts={whatsappUrl:null,customerCareEmail:'customercare@ikonectt.com',portalUrl:officialPortal};
export const websiteData={knowledge:'loading'};
const settings=()=>globalThis.__IKONECTT_PUBLIC_CONFIG__||{mode:'api',apiBase:'/api/v1'};
function validWhatsApp(value){try{const url=new URL(value);return url.protocol==='https:'&&['api.whatsapp.com','wa.me'].includes(url.hostname)&&!url.username&&!url.password;}catch{return false;}}
// Published company contact metadata remains useful without a live operational API.
// A successful API response overrides it; plans/coverage/requests never use snapshots.
export function initializeSupportContacts(){
 const published=settings().contacts;
 if(!supportContacts.whatsappUrl&&validWhatsApp(published?.whatsappUrl))supportContacts.whatsappUrl=published.whatsappUrl;
 return supportContacts;
}

export function createPublicDataClient({base=settings().apiBase||'/api/v1',fetcher=(...args)=>fetch(...args)}={}){
  const request=async(path,body)=>{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetcher(base.replace(/\/$/,'')+path,{signal:controller.signal,cache:'no-store',credentials:'omit',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
      if(!response.ok)throw new Error('The service is temporarily unavailable. Please contact customercare@ikonectt.com.');
      return await response.json();
    }finally{clearTimeout(timer);}
  };
  const all=async endpoint=>{
    let records=[],offset=0;
    for(let n=0;n<100;n++){
      const page=await request(`${endpoint}${endpoint.includes('?')?'&':'?'}offset=${offset}&limit=100`);
      if(!page||!Array.isArray(page.items)||!Number.isInteger(page.total)||page.total<0)throw new Error('Invalid public service response.');
      records.push(...page.items);offset+=page.items.length;
      if(offset>=page.total)return records;
      if(!page.items.length)throw new Error('Incomplete public service response.');
    }
    throw new Error('Public service response exceeds the supported page limit.');
  };
  let contactRequest=null,contactsFetchedAt=0;
  return {
    plans:()=>all('/plans'),knowledge:()=>all('/knowledge'),
    searchCoverage:async query=>{
      const term=String(query||'').trim();if(term.length<2||term.length>100)throw new Error('Enter an estate or area name using 2 to 100 characters.');
      const rows=await all('/coverage/service-areas?search='+encodeURIComponent(term));
      if(rows.some(row=>typeof row.id!=='string'||typeof row.name!=='string'||!['ESTATE','AREA','SITE'].includes(row.scope)))throw new Error('Invalid coverage response.');
      return rows;
    },
    createEnquiry:input=>request('/leads',input),
    contacts:()=>{
      initializeSupportContacts();
      if(contactsFetchedAt&&Date.now()-contactsFetchedAt<60000)return Promise.resolve(supportContacts);
      if(contactRequest)return contactRequest;
      contactRequest=request('/contact-settings').then(value=>{if(!validWhatsApp(value.whatsappUrl))throw new Error('Invalid support contact.');supportContacts.whatsappUrl=value.whatsappUrl;contactsFetchedAt=Date.now();return supportContacts;}).finally(()=>{contactRequest=null;});
      return contactRequest;
    },
    guidance:async({text,intent,history=[],context={}})=>{
      const prompts={residential:'Residential plans',business:'Business plans',coverage:'How do I check coverage?',installation:'Installation help',troubleshooting:'My internet is not working',fault:'Report a fault',billing:'Payments and renewals',account:'My Ikonectt portal',recovery:'Account recovery',sales:'Contact sales',support:'Contact support',enquiry:'I want to make an enquiry'};
      const result=await request('/assistant/guidance',{message:String(text||prompts[intent]||'Help with Ikonectt services').slice(0,1000),...(history.length?{history:history.slice(-8).map(({role,content})=>({role,content:content.slice(0,1000)}))}:{}),...(context.path?{context:{path:context.path.slice(0,200),audience:context.audience==='business'?'BUSINESS':'RESIDENTIAL',...(context.plan?{plan:context.plan}:{})}}:{})});
      if(typeof result?.answer!=='string'||!Array.isArray(result.links))throw new Error('Invalid help response.');
      const mapLink=item=>{if(item.path===supportContacts.whatsappUrl||item.path===officialPortal||item.path===officialPortal+'/'||item.path==='mailto:customercare@ikonectt.com')return {label:item.label,href:item.path};const route=item.path.replace(/^\/?(?:option-e\/)?#?\//,'');return /^[a-z][a-z0-9/-]*(?:\?[^\s]*)?$/.test(route)?{label:item.label,route}:null;};
      return {text:result.answer,mode:result.mode,intent:result.intent,actions:result.links.filter(item=>typeof item.label==='string'&&typeof item.path==='string').map(mapLink).filter(Boolean)};
    },
  };
}
export async function loadWebsiteData(client=createPublicDataClient()){
  const results=await Promise.allSettled([client.plans(),client.knowledge()]);
  try{
    if(results[0].status!=='fulfilled')throw results[0].reason;
    replaceCatalogue(results[0].value);
  }catch{catalogue.splice(0);Object.assign(catalogueStatus,{state:'error',message:'Plan information could not be loaded. Please contact customer care.'});}
  try{
    if(results[1].status!=='fulfilled')throw results[1].reason;
    replacePublishedKnowledge(results[1].value);websiteData.knowledge='ready';
  }catch{replacePublishedKnowledge([]);websiteData.knowledge='error';}
  return results;
}
