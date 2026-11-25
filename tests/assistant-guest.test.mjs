import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountAssistant} from '../shared/assistant.js';
import {supportContacts,createPublicDataClient} from '../shared/public-data.js';
const pause=()=>new Promise(r=>setTimeout(r,10));
test('guest chat, bounded context, explicit enquiry confirmation and one genuine submission',async()=>{
 const dom=new JSDOM('<div class="ik-site" data-template="e"></div>',{url:'https://ikonectt.test/',pretendToBeVisual:true});const win=dom.window;const saved={};
 for(const key of ['window','document','FormData','AbortController']){saved[key]=globalThis[key];globalThis[key]=key==='window'?win:win[key];}
 const root=win.document.querySelector('div');const calls=[];let leads=0,resolveLead;
 const whatsapp='https://api.whatsapp.com/send/?phone=2349168965000&text&type=phone_number&app_absent=0';
 const api={contacts:async()=>{supportContacts.whatsappUrl=whatsapp;return supportContacts;},createEnquiry:async data=>{leads++;assert.equal(data.consent,true);return new Promise(resolve=>{resolveLead=resolve;});}};
 const chat=mountAssistant({root,template:'e',guest:true,publicClient:api,getContext:()=>({path:'business/plans',audience:'business'}),navigate:()=>{},provider:{respond:async input=>{calls.push(input);return {text:'Approved help',actions:[]};}}});
 try{
 await pause();const click=selector=>{const el=root.querySelector(selector);assert.ok(el,selector);el.click();};click('[data-launcher]');
 assert.equal(root.querySelector('[data-intro-form]'),null);assert.match(root.textContent,/Hi! Welcome/);assert.equal(root.querySelector('[data-whatsapp]').href,whatsapp);assert.equal(root.querySelector('[data-whatsapp]').rel,'noopener noreferrer');
 assert.equal(root.querySelectorAll('.ik-assistant-next>.ik-assistant-actions>button,.ik-assistant-next>.ik-assistant-actions>a').length,6);
 const composer=root.querySelector('[data-composer]');const send=async value=>{composer.elements.message.value=value;composer.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));await pause();};
 for(let n=0;n<6;n++)await send('General question '+n);assert.equal(calls.at(-1).history.length,8);assert.equal(calls.at(-1).context.audience,'business');
 await send('I want to make enquiry');assert.match(root.textContent,/What would you like to enquire about/);assert.equal(root.querySelector('[data-chat-enquiry]'),null);
 click('[data-intent="enquiry-details"]');const form=root.querySelector('[data-chat-enquiry]');for(const [key,value] of Object.entries({name:'Test Person',email:'test@example.test',phone:'08031234567',kind:'BUSINESS',message:'Please discuss office connection'}))form.elements.namedItem(key).value=value;
 form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));assert.equal(leads,0);click('[data-enquiry-confirm]');assert.equal(leads,0);
 root.querySelector('[data-enquiry-consent]').checked=true;click('[data-enquiry-confirm]');click('[data-enquiry-confirm]');assert.equal(leads,1);resolveLead({id:'actual-lead-id'});await pause();assert.match(root.textContent,/actual-lead-id/);assert.equal(calls.some(c=>JSON.stringify(c).includes('test@example.test')),false);
 }finally{chat.destroy();dom.window.close();for(const [key,value] of Object.entries(saved))globalThis[key]=value;}
});
test('public conversation request carries only bounded validated context and support links',async()=>{
 let sent;const client=createPublicDataClient({fetcher:async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({answer:'Grounded response',mode:'fallback',links:[]})};}});
 await client.guidance({text:'Help',history:Array.from({length:12},()=>({role:'user',content:'Question'})),context:{path:'coverage',audience:'business',phone:'private'}});
 assert.equal(sent.history.length,8);assert.deepEqual(sent.context,{path:'coverage',audience:'BUSINESS'});assert.equal(JSON.stringify(sent).includes('private'),false);
});
