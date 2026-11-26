import {consumeEnquiryHandoff} from '../shared/enquiry-handoff.js';
import * as phoneLibrary from 'libphonenumber-js/max';
import {normalizePhone} from '../shared/phone-input.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountAssistant} from '../shared/assistant.js';
import {supportContacts,createPublicDataClient} from '../shared/public-data.js';
const pause=()=>new Promise(r=>setTimeout(r,10));
test('welcome and bounded context are preserved; enquiries navigate with private one-use prefill',async()=>{
 const dom=new JSDOM('<div class="ik-site" data-template="e"></div>',{url:'https://ikonectt.test/',pretendToBeVisual:true});const win=dom.window;const saved={};
 for(const key of ['window','document','FormData','AbortController','libphonenumber']){saved[key]=globalThis[key];globalThis[key]=key==='window'?win:key==='libphonenumber'?phoneLibrary:win[key];}
 const root=win.document.querySelector('div');const calls=[];let leads=0,resolveLead;
 const whatsapp='https://api.whatsapp.com/send/?phone=2349168965000&text&type=phone_number&app_absent=0';
 const api={contacts:async()=>{supportContacts.whatsappUrl=whatsapp;return supportContacts;},createEnquiry:async data=>{leads++;assert.equal(data.consent,true);assert.equal(data.phone,'+2348031234567');return new Promise(resolve=>{resolveLead=resolve;});}};
 const chat=mountAssistant({root,template:'e',guest:true,publicClient:api,getContext:()=>({path:'business/plans',audience:'business'}),navigate:()=>{},provider:{respond:async input=>{calls.push(input);return {text:'Approved help',actions:[]};}}});
 try{
 await pause();const click=selector=>{const el=root.querySelector(selector);assert.ok(el,selector);el.click();};click('[data-launcher]');
 const welcome=root.querySelector('[data-intro-form]');assert.ok(welcome);assert.equal(welcome.elements.country.value,'NG');assert.equal(welcome.elements.country.options.length,1);assert.match(welcome.textContent,/Start Chat/);welcome.elements.name.value='Test Person';welcome.elements.phone.value='08031234567';welcome.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));assert.match(root.textContent,/Hi Test! Welcome/);assert.equal(root.querySelector('[data-whatsapp]').href,whatsapp);assert.equal(root.querySelector('[data-whatsapp]').rel,'noopener noreferrer');
 assert.equal(root.querySelectorAll('.ik-assistant-next>.ik-assistant-actions>button,.ik-assistant-next>.ik-assistant-actions>a').length,6);
 const composer=root.querySelector('[data-composer]');const send=async value=>{composer.elements.message.value=value;composer.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));await pause();};
 for(let n=0;n<6;n++)await send('General question '+n);assert.equal(calls.at(-1).history.length,8);assert.equal(calls.at(-1).context.audience,'business');
 await send('I want to make enquiry');assert.equal(root.querySelector('[data-chat-enquiry]'),null);
 click('[data-assistant-route][href="#/contact"]');assert.equal(leads,0);
 const prefill=consumeEnquiryHandoff('contact');assert.equal(prefill.name,'Test Person');assert.equal(prefill.phone,'+2348031234567');
 assert.equal(calls.some(c=>JSON.stringify(c).includes('Test Person')),false);assert.equal(win.location.search,'');

 }finally{chat.destroy();dom.window.close();for(const [key,value] of Object.entries(saved))globalThis[key]=value;}
});
test('public conversation request carries only bounded validated context and support links',async()=>{
 let sent;const client=createPublicDataClient({fetcher:async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({answer:'Grounded response',mode:'fallback',links:[]})};}});
 await client.guidance({text:'Help',history:Array.from({length:12},()=>({role:'user',content:'Question'})),context:{path:'coverage',audience:'business',phone:'private'}});
 assert.equal(sent.history.length,8);assert.deepEqual(sent.context,{path:'coverage',audience:'BUSINESS'});assert.equal(JSON.stringify(sent).includes('private'),false);
});


test('phone validation normalizes Nigerian local and international forms and validates selected countries',()=>{
 const prior=globalThis.libphonenumber;globalThis.libphonenumber=phoneLibrary;
 try{for(const value of ['08031234567','8031234567','+2348031234567','2348031234567','002348031234567'])assert.equal(normalizePhone(value),'+2348031234567');assert.equal(normalizePhone('020 7946 0018','GB'),'+442079460018');for(const bad of ['12345','0803123abc','+2341234567','+442079460018'])assert.throws(()=>normalizePhone(bad));}finally{globalThis.libphonenumber=prior;}
});
