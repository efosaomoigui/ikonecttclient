import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createPublicDataClient,loadWebsiteData,websiteData} from '../shared/public-data.js';
import {catalogue,replaceCatalogue,plansFor,priceLabel,pricePeriod,catalogueStatus} from '../shared/catalogue.js';
import {faqs,replacePublishedKnowledge} from '../shared/content.js';
import {catalogueHTML,planCardHTML,detailHTML,planCardName} from '../shared/plan-ui.js';
import {renderPage} from '../shared/pages.js';
import {mountBrandSignature} from '../shared/brand-signature.js';
import {mountSite} from '../shared/public-site.js';
const plan=(id,kind='RESIDENTIAL',price=3250000)=>({id,code:id,name:id,kind,speedMbps:50,uploadMbps:50,priceMinor:price,billingDays:null,currency:'NGN',published:true});
const page=items=>({items,total:items.length,offset:0,limit:100});
const response=value=>({ok:true,json:async()=>value});
test('API client paginates, performs uncached requests and forwards coverage search safely',async()=>{
 const calls=[];const client=createPublicDataClient({base:'/api/v1',fetcher:async(url,options)=>{calls.push([url,options]);return response(url.includes('service-areas')?page([{id:'a',name:'Estate',scope:'ESTATE'}]):url.includes('offset=0')?{items:[plan('one')],total:2}:{items:[plan('two')],total:2});}});
 assert.equal((await client.plans()).length,2);assert.match(calls[1][0],/offset=1/);assert.equal(calls[0][1].cache,'no-store');assert.equal(calls[0][1].credentials,'omit');
 await client.searchCoverage('A & B');assert.match(calls.at(-1)[0],/search=A%20%26%20B/);
 await assert.rejects(()=>client.searchCoverage('a'),/2 to 100 characters/);
});
test('live data replaces old values, unknown business prices and periods stay unclaimed',async()=>{
 await loadWebsiteData({plans:async()=>[plan('Residential'),plan('Business','BUSINESS',null)],knowledge:async()=>[{id:'k',question:'Published question',answer:'Approved answer',category:'billing',published:true}]});
 assert.equal(catalogue.length,2);assert.equal(faqs.length,1);assert.equal(priceLabel(plansFor('business')[0]),'Request a Quote');assert.equal(pricePeriod(catalogue[0]),'');
 const html=catalogueHTML('business');assert.match(html,/Fibre broadband/);assert.doesNotMatch(html,/Download:|Upload:|Billing period/);assert.match(detailHTML(plansFor('business')[0]),/Billing period to be confirmed/);assert.doesNotMatch(html,/\/month|₦0/);
 await loadWebsiteData({plans:async()=>[plan('Updated','RESIDENTIAL',6500000)],knowledge:async()=>[]});assert.equal(catalogue[0].displayName,'Updated');assert.match(priceLabel(catalogue[0]),/65,000/);
 await loadWebsiteData({plans:async()=>{throw Error('offline');},knowledge:async()=>{throw Error('offline');}});assert.equal(catalogue.length,0);assert.equal(faqs.length,0);assert.equal(catalogueStatus.state,'error');assert.equal(websiteData.knowledge,'error');
});
test('area matches preserve scope and feasibility caveat, missing results do not assert unavailable',()=>{
 const html=renderPage('coverage',{state:{coverageQuery:'test',coverageAreas:[{id:'area',name:'<Estate>',scope:'AREA',notice:'Needs survey'}]},query:new URLSearchParams()});
 assert.match(html,/&lt;Estate&gt;/);assert.match(html,/feasibility/i);assert.doesNotMatch(html,/<Estate>/);
 const empty=renderPage('coverage',{state:{coverageQuery:'unknown',coverageAreas:[]},query:new URLSearchParams()});assert.match(empty,/does not confirm|does not mean|not a confirmation/i);
});

test('coverage search updates beside its existing form without scrolling or duplicate requests',async()=>{
 const dom=new JSDOM('<!doctype html><title>Home</title><body data-public-release><main><h1>Home</h1></main></body>',{url:'https://preview.test/option-e/#/coverage',pretendToBeVisual:true});
 const win=dom.window,keys=['window','document','CustomEvent','FormData','AbortController','fetch'],saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 for(const k of keys.filter(k=>k!=='fetch'))globalThis[k]=k==='window'?win:win[k];
 let scrolls=0,requests=0,finish;win.scrollTo=()=>scrolls++;win.matchMedia=()=>({matches:false});
 globalThis.fetch=async url=>{if(String(url).includes('/coverage/service-areas')){requests++;return new Promise(resolve=>finish=resolve);}return response(page([]));};
 const stop=mountSite({root:win.document.body,home:win.document.querySelector('main'),template:'e'}),pause=()=>new Promise(resolve=>setTimeout(resolve,20));
 try{
  await pause();const form=win.document.querySelector('[data-form="coverage-search"]'),input=form.elements.namedItem('location'),result=win.document.querySelector('[data-coverage-results]'),heading=win.document.querySelector('h1');
  assert.ok(result.closest('.e-coverage-layout'));input.value='Victoria Island';input.focus();scrolls=0;
  const submit=()=>form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));submit();submit();
  assert.equal(requests,1);assert.equal(result.getAttribute('aria-busy'),'true');assert.equal(form.querySelector('button[type=submit]').disabled,true);assert.match(result.textContent,/Searching/);assert.equal(scrolls,0);
  finish(response(page([{id:'area',name:'Victoria Island',scope:'AREA',notice:'Address review required.'}])));await pause();
  assert.equal(win.document.querySelector('[data-form="coverage-search"]'),form);assert.equal(win.document.querySelector('h1'),heading);assert.equal(win.document.activeElement,input);assert.equal(input.value,'Victoria Island');assert.equal(scrolls,0);assert.equal(win.location.hash,'#/coverage');assert.match(result.textContent,/Victoria Island/);assert.equal(result.getAttribute('aria-busy'),'false');assert.equal(form.querySelector('button[type=submit]').disabled,false);
  assert.equal(result.querySelector('.ik-panel'),null);const selected=result.querySelector('.e-coverage-match').getAttribute('href');assert.equal(selected,'#/residential/installation?area=Victoria%20Island');assert.match(result.textContent,/Address review required/);
  submit();finish({ok:false});await pause();assert.equal(scrolls,0);assert.ok(result.querySelector('[role=alert]'));assert.equal(form.querySelector('button[type=submit]').disabled,false);
  win.location.hash=selected;await pause();assert.equal(win.document.querySelector('[data-form="installation"] [name="district"]').value,'Victoria Island');
 }finally{stop();win.close();for(const key of keys)globalThis[key]=saved[key];}
});
test('enquiry and assistant use existing API boundary with safe approved links',async()=>{
 const calls=[];const client=createPublicDataClient({fetcher:async(url,options)=>{calls.push([url,options]);return response(url.endsWith('/leads')?{id:'recorded'}:{answer:'Approved help',links:[{label:'Portal',path:'https://portal.ikonectt.com'},{label:'Email',path:'mailto:customercare@ikonectt.com'},{label:'Unsafe',path:'javascript:alert(1)'}]});}});
 const input={name:'Test',email:'test@example.test',phone:'08031234567',kind:'RESIDENTIAL',message:'Test enquiry',consent:true};assert.equal((await client.createEnquiry(input)).id,'recorded');assert.deepEqual(JSON.parse(calls[0][1].body),input);
 const guidance=await client.guidance({intent:'account'});assert.equal(guidance.actions.length,2);assert.equal(guidance.actions[0].href,'https://portal.ikonectt.com');assert.deepEqual(JSON.parse(calls[1][1].body),{message:'My Ikonectt portal'});
});
test('public DOM shows API plans and official portal, retains form consent and real request result',async()=>{
 const dom=new JSDOM('<!doctype html><title>Home</title><body data-public-release><main><h1>Home</h1><div data-home-plan-carousel></div></main></body>',{url:'https://preview.test/option-e/',pretendToBeVisual:true});
 const keys=['window','document','CustomEvent','FormData','AbortController','fetch'];const saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));const win=dom.window;
 for(const k of keys.filter(k=>k!=='fetch'))globalThis[k]=k==='window'?win:win[k];win.scrollTo=()=>{};win.matchMedia=()=>({matches:false});
 let sent,leadCalls=0;globalThis.fetch=async(url,options)=>{if(String(url).endsWith('/leads')){leadCalls++;sent=JSON.parse(options.body);return response({id:'real-lead-ref'});}return response(String(url).includes('/knowledge')?page([]):page([plan('one')]));};
 const stop=mountSite({root:win.document.body,home:win.document.querySelector('main'),template:'e'});
 const pause=()=>new Promise(resolve=>setTimeout(resolve,20));
 try{
  await pause();assert.equal(win.document.querySelectorAll('[data-plan-id]').length,1);assert.equal(win.document.querySelector('.ik-nav-actions a').href,'https://portal.ikonectt.com/');
  win.location.hash='#/contact';await pause();const form=win.document.querySelector('#ik-main form');assert.ok(form.querySelector('[name=contactConsent][required]'));
  for(const [key,value] of Object.entries({name:'Test Person',email:'test@example.test',phone:'08031234567',message:'Please contact me'})){const field=form.elements.namedItem(key);if(field)field.value=value;}
  for(const field of form.querySelectorAll('select[required]'))field.selectedIndex=1;
  form.querySelector('.ik-enquiry-consent').click();assert.equal(form.elements.namedItem('contactConsent').checked,true);
  form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));await pause();assert.equal(leadCalls,1);form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));await pause();assert.equal(leadCalls,1);
  assert.equal(sent.consent,true);assert.match(form.querySelector('[data-status]').textContent,/real-lead-ref/);assert.match(form.querySelector('[data-status]').textContent,/Enquiry recorded/);assert.doesNotMatch(form.querySelector('[data-status]').textContent,/ECRM|email.delivery|ticket created/i);
 }finally{stop();win.close();for(const key of keys)globalThis[key]=saved[key];}
});

test('plan card and detail names preserve full authoritative names with branded initials',async()=>{
 const records=[['i-Basic_50Mbps','i-Basic'],['I-Silver_100Mbps','i-Silver'],['I-Gold_300Mbps','i-Gold'],['I-Business_100Mbps','i-Business'],['I-Business Plus_300Mbps','i-Business Plus'],['I-Business Pro_500Mbps','i-Business Pro'],['I-Business Max_1000Mbps','i-Business Max']];
 for(const [raw] of records){const clean=raw;
  const record={...plan('label'),name:raw};replaceCatalogue([record]);const item=catalogue[0];assert.equal(item.displayName,raw);assert.equal(planCardName(item),clean);assert.match(detailHTML(item),new RegExp(raw));
  const dom=new JSDOM('<div data-template="e"><main>'+planCardHTML(item)+'</main></div>');const root=dom.window.document.querySelector('[data-template]');const stop=mountBrandSignature({root,home:root.querySelector('main')});const heading=root.querySelector('h3');assert.equal(heading.textContent,clean);assert.equal(heading.querySelectorAll('.ik-plan-brand-prefix').length,1);assert.equal(heading.querySelectorAll('.ik-plan-brand-dash').length,1);assert.doesNotMatch(heading.textContent,/--/);stop();assert.equal(heading.textContent,clean);dom.window.close();
 }
});


test('installation and troubleshooting pages reuse current approved articles without stale draft copy',()=>{
 const articles=[
  {key:'installation-process',category:'Installation',question:'Installation?',answer:'Approved installation process. Usually 3–7 working days, subject to feasibility.',published:true},
  {key:'optical-signal',category:'Troubleshooting',question:'Optical signal?',answer:'Approved optical guidance. Do not repair fibre cables.',published:true},
 ];
 replacePublishedKnowledge(articles);
 const render=(route,query='')=>renderPage(route,{state:{audience:'residential',address:{}},query:new URLSearchParams(query),template:'e'});
 try{
  assert.match(render('residential'),/Approved installation process/);
  assert.match(render('residential/installation'),/3–7 working days, subject to feasibility/);
  assert.match(render('support/troubleshooting','topic=optical'),/Approved optical guidance/);
  articles[1].answer='Updated approved optical guidance.';
  replacePublishedKnowledge(articles);
  assert.match(render('support/troubleshooting','topic=optical'),/Updated approved optical guidance/);
  replacePublishedKnowledge([]);
  assert.doesNotMatch(render('support/troubleshooting','topic=optical'),/Updated approved optical guidance/);
  assert.doesNotMatch(render('about'),/uncapped/i);
 }finally{replacePublishedKnowledge([]);}
});

test('contact refreshes coalesce and live Admin contact overrides published configuration',async()=>{
 let calls=0,complete;const client=createPublicDataClient({fetcher:async()=>{calls++;await new Promise(r=>complete=r);return response({whatsappUrl:'https://api.whatsapp.com/send/?phone=2348000000000'});}});
 const first=client.contacts(),second=client.contacts();assert.equal(calls,1);complete();assert.equal((await first).whatsappUrl,'https://api.whatsapp.com/send/?phone=2348000000000');await second;await client.contacts();assert.equal(calls,1);
});
