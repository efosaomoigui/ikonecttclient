import {consumeEnquiryHandoff} from '../shared/enquiry-handoff.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import * as phoneLibrary from 'libphonenumber-js/max';
import {mountAssistant} from '../shared/assistant.js';
import {supportContacts} from '../shared/public-data.js';
import {replaceCatalogue} from '../shared/catalogue.js';

const pause=(ms=20)=>new Promise(resolve=>setTimeout(resolve,ms));
async function fixture(api={}){
 const dom=new JSDOM('<div class="ik-site" data-template="e"></div>',{url:'http://localhost/option-e/',pretendToBeVisual:true}),win=dom.window,root=win.document.querySelector('div'),saved={};
 for(const key of ['window','document','FormData','AbortController','libphonenumber']){saved[key]=globalThis[key];globalThis[key]=key==='window'?win:key==='libphonenumber'?phoneLibrary:win[key];}
 const queries=[],writes=[],providerCalls=[];
 const client={contacts:async()=>{supportContacts.whatsappUrl='https://api.whatsapp.com/send/?phone=2349168965000&text&type=phone_number&app_absent=0';return supportContacts;},
  searchCoverage:async query=>{queries.push(query);if(query==='offline')throw Error('offline');if(query==='missing')return [];if(query==='multi')return [{id:'a',name:'Test Gardens A',scope:'ESTATE'},{id:'b',name:'Test Gardens B',scope:'SITE'}];return [{id:'single',name:'Test Single Estate',scope:'ESTATE'}];},
  plans:async()=>[{id:'home',name:'Test Home Plan',kind:'RESIDENTIAL',speedMbps:50,priceMinor:3500000,published:true},{id:'business',name:'Test Business Plan',kind:'BUSINESS',speedMbps:100,priceMinor:null,published:true}],
  knowledge:async()=>[{key:'speed-test',category:'Troubleshooting',question:'Slow connection checks',answer:'Current approved router guidance.',published:true},{key:'hidden',category:'Troubleshooting',question:'Hidden',answer:'Do not publish this.',published:false}],
  createEnquiry:async input=>{writes.push(input);return{id:'genuine-test-reference'};},...api};
 const chat=mountAssistant({root,template:'e',guest:true,publicClient:client,getContext:()=>({path:'home',audience:'residential'}),navigate:()=>{},provider:{respond:async input=>{providerCalls.push(input);throw Error('AI disabled');}}});
 const click=selector=>{const el=root.querySelector(selector);assert.ok(el,selector);el.click();};
 const submit=form=>form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));
 const send=async text=>{const composer=root.querySelector('[data-composer]');composer.elements.message.value=text;submit(composer);await pause();};
 click('[data-launcher]');const intro=root.querySelector('[data-intro-form]');intro.elements.name.value='Efe Tester';intro.elements.phone.value='08031234567';submit(intro);await pause();
 return {root,win,queries,writes,providerCalls,click,submit,send,close(){chat.destroy();dom.window.close();replaceCatalogue([]);for(const [key,value] of Object.entries(saved))globalThis[key]=value;}};
}

test('inline and composer coverage use one service, handle multiple matches and prefill enquiry contacts',async()=>{
 const f=await fixture();try{
  assert.match(f.root.textContent,/Hi Efe! Welcome/);f.click('.ik-assistant-next [data-intent="coverage"]');await pause();assert.ok(f.root.querySelector('[data-chat-coverage]'));
  const form=f.root.querySelector('[data-chat-coverage]');form.elements.location.value='multi';f.submit(form);f.submit(form);await pause();assert.deepEqual(f.queries,['multi']);assert.equal(f.root.querySelectorAll('[data-location-choice]').length,2);
  f.click('[data-location-choice="1"]');assert.match(f.root.querySelector('[data-messages]').textContent,/Test Gardens B/);assert.ok(f.root.querySelector('[data-coverage-state="available"]'));
  assert.ok(f.root.querySelector('[data-assistant-route][href="#/residential/plans"]'));
  f.click('[data-assistant-route][href="#/residential/installation"]');
  assert.equal(f.root.querySelector('[data-chat-enquiry]'),null);assert.equal(f.writes.length,0);
  const handoff=consumeEnquiryHandoff('residential/installation');assert.equal(handoff.name,'Efe Tester');assert.equal(handoff.phone,'+2348031234567');assert.match(handoff.message,/Test Gardens B/);assert.equal(consumeEnquiryHandoff('residential/installation'),null);assert.equal(f.providerCalls.length,0);

 }finally{f.close();}
});

test('typed follow-up, unknown area and API failure remain distinct with functional continuations',async()=>{
 const f=await fixture();try{
  await f.send('Do you cover Test Single Estate?');assert.equal(f.queries[0],'Test Single Estate');assert.ok(f.root.querySelector('[data-coverage-state="available"]'));
  f.click('[data-intent="coverage"]');await pause();await f.send('missing');assert.match(f.root.textContent,/couldn't confirm coverage/);assert.equal(f.root.querySelector('[data-coverage-state="error"]'),null);assert.ok(f.root.querySelector('[data-assistant-route][href="#/coverage/verification"]'));
  f.click('[data-intent="coverage"]');await pause();await f.send('offline');assert.ok(f.root.querySelector('[data-coverage-state="error"]'));assert.ok(f.root.querySelector('[data-intent="coverage-retry"]'));assert.equal(f.root.querySelector('[data-composer] input').disabled,false);
  assert.equal(f.providerCalls.length,0);
 }finally{f.close();}
});

test('debounced backend suggestions select a result without leaving the conversation',async()=>{
 const f=await fixture();try{
  f.click('.ik-assistant-next [data-intent="coverage"]');await pause();const input=f.root.querySelector('[data-chat-location]');input.value='multi';input.dispatchEvent(new f.win.Event('input',{bubbles:true}));await pause(400);
  assert.deepEqual(f.queries,['multi']);assert.equal(f.root.querySelectorAll('[data-location-choice]').length,2);f.click('[data-location-choice="0"]');assert.match(f.root.textContent,/Test Gardens A/);assert.equal(f.win.location.hash,'');
  f.click('[data-close]');f.click('[data-launcher]');assert.ok(f.root.querySelector('[data-coverage-state="available"]'));
 }finally{f.close();}
});

test('plans and approved troubleshooting work without AI; official portal and restart remain functional',async()=>{
 const f=await fixture();try{
  f.click('.ik-assistant-next [data-intent="residential"]');await pause();assert.match(f.root.textContent,/Test Home Plan/);assert.ok(f.root.querySelector('[data-select-plan="home"]'));
  f.click('[data-select-plan="home"]');assert.ok(f.root.querySelector('[data-intent="coverage"]'));await f.send('business plans');assert.match(f.root.textContent,/Test Business Plan/);
  await f.send('My connection is slow');assert.match(f.root.textContent,/Current approved router guidance/);assert.doesNotMatch(f.root.textContent,/Do not publish this/);assert.ok(f.root.querySelector('.ik-assistant-guides details[open]'));
  await f.send('manage my subscription');const portal=f.root.querySelector('.ik-assistant-next a[href="https://portal.ikonectt.com"]');assert.ok(portal);assert.equal(portal.rel,'noopener noreferrer');assert.equal(portal.target,'_blank');assert.equal(f.providerCalls.length,0);
  f.click('[data-restart]');assert.ok(f.root.querySelector('[data-intro-form]'));assert.equal(f.root.querySelector('[data-intro-form]').elements.phone.value,'');
 }finally{f.close();}
});


test('restart invalidates an in-flight coverage response without reviving the old conversation',async()=>{
 let finish;const f=await fixture({searchCoverage:()=>new Promise(resolve=>finish=resolve)});
 try{f.click('.ik-assistant-next [data-intent="coverage"]');await pause();const form=f.root.querySelector('[data-chat-coverage]');form.elements.location.value='pending';f.submit(form);f.click('[data-restart]');finish([{id:'late',name:'Old response must stay hidden',scope:'ESTATE'}]);await pause();assert.ok(f.root.querySelector('[data-intro-form]'));assert.doesNotMatch(f.root.textContent,/Old response must stay hidden/);assert.equal(f.root.querySelector('[data-intro-form]').elements.name.value,'');}finally{f.close();}
});

test('operational requests use existing website pages without writing records from chat',async()=>{
 const f=await fixture();try{
  for(const [text,route] of [['request installation','residential/installation'],['request a business quote','business/quote'],['report a fault','support/fault'],['service request','support/service-request'],['make an enquiry','contact'],['contact customer support','support/contact']]){
   await f.send(text);assert.ok(f.root.querySelector('[data-assistant-route][href="#/'+route+'"]'),text);assert.equal(f.root.querySelector('[data-chat-enquiry]'),null);
  }
  assert.equal(f.writes.length,0);assert.ok(f.root.querySelector('[data-composer]'));assert.equal(f.root.querySelector('.ik-assistant-all-topics'),null);
 }finally{f.close();}
});

test('published WhatsApp stays visible when the operational backend is unavailable',async()=>{
 const settings=globalThis.__IKONECTT_PUBLIC_CONFIG__,oldUrl=supportContacts.whatsappUrl;
 supportContacts.whatsappUrl=null;globalThis.__IKONECTT_PUBLIC_CONFIG__={contacts:{whatsappUrl:'https://api.whatsapp.com/send/?phone=2349168965000'}};
 const f=await fixture({contacts:async()=>{throw Error('Backend is not configured');}});
 try{await pause();const link=f.root.querySelector('[data-whatsapp]');assert.equal(link.hidden,false);assert.equal(link.href,'https://api.whatsapp.com/send/?phone=2349168965000');assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');assert.equal(f.writes.length,0);}
 finally{f.close();supportContacts.whatsappUrl=oldUrl;globalThis.__IKONECTT_PUBLIC_CONFIG__=settings;}
});
