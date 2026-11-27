import {escapeHTML as esc} from './forms.js';
import {matchIntent} from './assistant-engine.js';
import {replaceCatalogue,plansFor} from './catalogue.js';
import {planPickerHTML} from './assistant-view.js';
import {supportContacts,officialPortal} from './public-data.js';

// The chat uses the same public client as the website; no local coverage catalogue.
export function createAssistantFlows({client,guidance,context,append,render,setBusy,beginEnquiry,signal,scroll}){
 let mode='',location='',audience=context().audience,epoch=0,searchVersion=0,timer,choices=[],lastQuery='';
 const requests=new Map();
 const whatsapp=()=>supportContacts.whatsappUrl?[{label:'Chat on WhatsApp',href:supportContacts.whatsappUrl}]:[];
 const enquiry=()=>({label:'Make an enquiry',intent:'enquiry-details'});
 const coverageEnquiry=()=>({label:'Make a coverage enquiry',route:'coverage/verification'});
 const checkAgain=()=>({label:'Check another address',intent:'coverage'});
 const current=stamp=>stamp===epoch&&!signal.aborted;
 const startMode=next=>{epoch++;searchVersion++;clearTimeout(timer);mode=next;};
 function lookup(term){
  const key=term.trim().toLowerCase();
  if(!requests.has(key))requests.set(key,client.searchCoverage(term).finally(()=>requests.delete(key)));
  return requests.get(key);
 }
 function coverageForm(value='',message=''){
  render(`<form data-chat-coverage class="ik-assistant-coverage" novalidate><label for="chat-coverage-location">Street, estate or area</label><input id="chat-coverage-location" name="location" data-chat-location type="text" minlength="2" maxlength="100" autocomplete="off" value="${esc(value)}" aria-describedby="chat-coverage-status"><button type="submit" class="ik-assistant-primary">Check availability</button><p id="chat-coverage-status" role="status">${esc(message||'Type an area name for matching locations, or send it in the message below.')}</p><div data-chat-locations></div></form>`,[]);
 }
 function options(rows,term){
  choices=rows;const host=guidance.querySelector('[data-chat-locations]');if(!host)return;
  host.innerHTML=rows.slice(0,20).map((row,index)=>`<button type="button" class="ik-assistant-location" data-location-choice="${index}"><strong>${esc(row.name)}</strong><span>${esc(row.scope==='ESTATE'?'Estate':row.scope==='SITE'?'Site':'Area')}</span></button>`).join('');
  const status=guidance.querySelector('#chat-coverage-status');
  status.textContent=rows.length?`${rows.length} matching locations. Choose the right one, or refine your search.`:`No matching location suggestions for ${term}. Choose Check availability to review the next steps.`;
 }
 function available(row){
  location=row.name;mode='coverage';clearTimeout(timer);searchVersion++;
  append('assistant',`Great news! Ikonectt is listed in ${row.name}, subject to final address and installation feasibility checks.`);
  render(`<section class="ik-assistant-coverage-result" data-coverage-state="available"><strong>${esc(row.name)}</strong><p>Area presence is confirmed in our service registry. ${row.scope==='AREA'?'Individual streets and properties still need verification.':'Final address feasibility must be checked before installation.'}</p></section>`,[{label:'Explore Broadband Plans',route:audience+'/plans'},{label:'Request Installation',route:'residential/installation'},checkAgain()]);
 }
 async function search(term){
  const query=String(term||'').trim();if(query.length<2){coverageForm(query,'Enter at least two characters of your estate or area name.');return;}
  location=query;lastQuery=query;clearTimeout(timer);const stamp=++epoch;searchVersion++;mode='coverage';setBusy(true);coverageForm(query,'Searching our service areas...');
  const button=guidance.querySelector('[data-chat-coverage] button[type=submit]');button.disabled=true;guidance.querySelector('[data-chat-location]').disabled=true;
  try{
   const rows=await lookup(query);if(!current(stamp))return;
   if(rows.length===1){available(rows[0]);return;}
   if(rows.length){coverageForm(query);options(rows,query);scroll();return;}
   append('assistant',"We couldn't confirm coverage at your location. Our team can help investigate whether service is available.");
   render('<p class="ik-assistant-flow-note">No matching published record was found. This does not mean your location is unserviceable.</p>',[coverageEnquiry(),checkAgain(),...whatsapp()]);
  }catch{
   if(!current(stamp))return;
   append('assistant','Coverage cannot currently be checked because the service is unavailable. Please retry or contact support.');
   render('<p class="ik-assistant-flow-note" data-coverage-state="error">Availability has not been checked.</p>',[{label:'Retry coverage search',intent:'coverage-retry'},checkAgain(),...whatsapp(),coverageEnquiry()]);
  }finally{if(current(stamp)){setBusy(false);scroll();}}
 }
 async function showPlans(kind){
  startMode('plans');audience=kind;const stamp=epoch;setBusy(true);
  render('<p role="status">Retrieving current plans...</p>',[]);
  try{
   const records=await client.plans();if(!current(stamp))return;replaceCatalogue(records);const plans=plansFor(kind);
   append('assistant',plans.length?`Here are the current ${kind==='business'?'business':'home'} broadband options. Select a plan to continue.`:'No published plans are currently available. Customer care can help with your requirements.');
   render(plans.length?planPickerHTML(plans.map(p=>p.id)).replace('<details ','<details open '):'', [{label:'Explore Broadband Plans',route:kind+'/plans'},{label:kind==='business'?'Request a business quote':'Request installation',route:kind==='business'?'business/quote':'residential/installation'},{label:'Check coverage',intent:'coverage'}]);
  }catch{if(current(stamp)){append('assistant','Current plan information could not be retrieved. Please retry or make an enquiry.');render('',[{label:'Retry plans',intent:kind},enquiry(),...whatsapp()]);}}
  finally{if(current(stamp)){setBusy(false);scroll();}}
 }
 async function troubleshoot(text=''){
  startMode('troubleshooting');const stamp=epoch;setBusy(true);render('<p role="status">Loading approved troubleshooting guidance...</p>',[]);
  try{
   const articles=await client.knowledge();if(!current(stamp))return;
   const guides=articles.filter(a=>a.published!==false&&/technical|troubleshoot|internet|wi-?fi|router|optical|disconnection|equipment|speed/i.test(a.category+' '+a.key));
   append('assistant','Choose the issue below to read the approved checks. These guides do not run tests on your connection.');
   render(guides.length?`<div class="ik-assistant-guides">${guides.map(a=>`<details${/slow/i.test(text)&&/speed/.test(a.key)?' open':''}><summary>${esc(a.question)}</summary><p>${esc(a.answer)}</p></details>`).join('')}</div>`:'<p>Approved guidance is unavailable right now. Our support team can help.</p>',[{label:'Report an unresolved issue',intent:'support-enquiry'},...whatsapp(),{label:'Contact customer support',intent:'support'}]);
  }catch{if(current(stamp)){append('assistant','Troubleshooting guidance could not be loaded. You can retry or contact customer support.');render('',[{label:'Retry troubleshooting',intent:'troubleshooting'},...whatsapp(),{label:'Report an issue',intent:'support-enquiry'}]);}}
  finally{if(current(stamp)){setBusy(false);scroll();}}
 }
 function coverageQuery(text){
  let query=text.trim().replace(/[?!.]+$/,'');
  if(/cover|availab|internet|broadband/i.test(query)){
   const where=query.match(/\b(?:in|at|around|for)\s+(.+)$/i);
   if(where)query=where[1];else query=query.replace(/^(?:please\s+)?(?:check\s+)?(?:do you\s+)?(?:cover(?:age)?|availability)\s*(?:in|at|for)?\s*/i,'');
   query=query.replace(/\s+(?:available|covered)$/i,'').trim();
   if(/^(?:check\s+)?(?:coverage|availability)|internet availability|how.*coverage|^is (?:internet|service)/i.test(query))return '';
  }
  return query;
 }
 async function handle(text='',intent=''){
  const inferred=intent||(/cover|availab|internet.*(?:in|at|around)\s/i.test(text)?'coverage':matchIntent(text)),value=text.toLowerCase();
  if(intent==='coverage-retry'){await search(lastQuery);return true;}
  if(intent==='installation-enquiry'||intent==='support-enquiry'||inferred==='fault'){
   startMode('enquiry');beginEnquiry(intent==='installation-enquiry'?'Installation request':inferred==='fault'?'Fault report':intent==='support-enquiry'?'Support request':'Enquiry');return true;
  }
  if(inferred==='coverage'){
   startMode('coverage');const query=intent?'':coverageQuery(text);
   if(query.length>=2)await search(query);
   else{append('assistant','Which street, estate or area would you like us to check? You can use the search below or type your location in the message composer.');coverageForm();}
   return true;
  }
  if(/(?:quote|quotation)/i.test(text)){startMode('enquiry');beginEnquiry('Business quote');return true;}
  if(inferred==='business'||inferred==='residential'||intent==='plans'){
   await showPlans(inferred==='business'?'business':intent==='plans'?audience:'residential');return true;
  }
  if(inferred==='troubleshooting'){await troubleshoot(text);return true;}
  if(['account','billing','recovery'].includes(inferred)||/manage.*subscription/.test(value)){
   startMode('portal');append('assistant','Manage subscriptions, renewals and account access through the official My Ikonectt portal.');render('',[{label:'Open My Ikonectt',href:officialPortal},{label:'Contact support',intent:'support'}]);return true;
  }
  if(inferred==='support'){
   startMode('support');append('assistant','Our customer-care team can help with your connection and service enquiries.');
   render('',[...whatsapp(),{label:'Email customer care',href:'mailto:'+supportContacts.customerCareEmail},{label:'Contact Support',route:'support/contact'}]);return true;
  }
  if(/(?:request|need|want|make|get|business).*(?:quote|quotation)|quotation/i.test(text)){startMode('enquiry');beginEnquiry('Business quote');return true;}
  if(/service request/i.test(text)){beginEnquiry('Service request');return true;}
  if(inferred==='installation'||inferred==='sales'){startMode('enquiry');beginEnquiry('Installation enquiry');return true;}
  if(/\b(?:enquir[ye]|inquir[ye]|enqury)\b/i.test(text)){beginEnquiry();return true;}
  if(/^\s*(?:thanks?|thank you|okay|ok|hi|hello|hey)[!.\s]*$/i.test(text)){append('assistant','How else can we help? You can check coverage, explore plans or make an enquiry.');render('',[{label:'Check coverage',intent:'coverage'},{label:'Find a broadband plan',intent:'plans'},enquiry()]);return true;}
  if(mode==='coverage'&&text&&inferred==='fallback'){await search(text);return true;}
  return false;
 }
 guidance.addEventListener('submit',event=>{if(!event.target.matches('[data-chat-coverage]'))return;event.preventDefault();event.stopPropagation();if(!event.target.querySelector('button[type=submit]').disabled)void search(event.target.elements.location.value);},{signal});
 guidance.addEventListener('input',event=>{
  if(!event.target.matches('[data-chat-location]'))return;clearTimeout(timer);const term=event.target.value.trim(),stamp=++searchVersion;
  if(term.length<2){const host=guidance.querySelector('[data-chat-locations]');if(host)host.replaceChildren();return;}
  timer=setTimeout(async()=>{
   const status=guidance.querySelector('#chat-coverage-status');if(status)status.textContent='Finding matching locations...';
   try{const rows=await lookup(term);if(stamp===searchVersion&&mode==='coverage'&&!signal.aborted)options(rows,term);}
   catch{if(stamp===searchVersion&&status?.isConnected)status.textContent='Suggestions are unavailable. Try Check availability or contact support.';}
  },350);
 },{signal});
 guidance.addEventListener('click',event=>{const choice=event.target.closest('[data-location-choice]');if(choice){const row=choices[Number(choice.dataset.locationChoice)];if(row){searchVersion++;available(row);scroll();}}},{signal});
 return {handle,isActive(){return !!mode;},resume(){startMode('');},reset(){startMode('');location='';lastQuery='';choices=[];audience=context().audience;},pause(){startMode('enquiry');},enquiryDefaults(purpose='Enquiry'){const plan=context().plan;return {kind:audience==='business'?'BUSINESS':'RESIDENTIAL',message:[purpose,location?'Location: '+location:'',plan?'Plan: '+(plansFor(audience).find(p=>p.id===plan)?.displayName||plan):''].filter(Boolean).join('\n')};},destroy(){epoch++;clearTimeout(timer);requests.clear();}};
}
