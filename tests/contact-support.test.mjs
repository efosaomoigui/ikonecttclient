import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import * as phoneLibrary from 'libphonenumber-js/max';
import {renderPage} from '../shared/pages.js';
import {mountSite} from '../shared/public-site.js';
import {publicContacts} from '../shared/content.js';
import {officialPortal,supportContacts} from '../shared/public-data.js';

const pause=()=>new Promise(resolve=>setTimeout(resolve,25));
const page=items=>({items,total:items.length,offset:0,limit:100});
const response=value=>({ok:true,json:async()=>value});
const route=(path,template)=>renderPage(path,{state:{audience:'residential'},query:new URLSearchParams(),template});

test('Contact Support separates configured channels, original form fields, office and quick help for Option E only',()=>{
 const e=new JSDOM(route('support/contact','e')),a=new JSDOM(route('support/contact','a')),doc=e.window.document;
 assert.equal(doc.querySelectorAll('body > section').length,3);assert.equal(doc.querySelectorAll('.e-support-channel').length,3);
 assert.equal(doc.querySelector('a[href^="tel:"]').getAttribute('href'),'tel:'+publicContacts.phones[0].number);assert.equal(doc.querySelector('a[href^="mailto:"]').getAttribute('href'),'mailto:'+publicContacts.emails[0].address);
 assert.equal(doc.querySelector('.e-support-office a').href,publicContacts.address.mapUrl);assert.equal(doc.querySelector('.e-support-quick-grid a:last-child').href,officialPortal+'/');
 assert.deepEqual([...doc.querySelector('form').elements].filter(el=>el.name).map(el=>el.name),[...a.window.document.querySelector('form').elements].filter(el=>el.name).map(el=>el.name));
 assert.equal(doc.querySelector('.ik-panel'),null);assert.ok(!route('contact','e').includes('e-support-enquiry-grid'));assert.ok(!route('support','e').includes('e-support-enquiry-grid'));assert.equal(a.window.document.querySelector('.e-support-channel'),null);
 e.window.close();a.window.close();
});

const publishedContacts=JSON.parse(readFileSync(new URL('../shared/public-contact-settings.json',import.meta.url),'utf8'));
async function fixture({offline=false,published=false}={}){
 const oldContact=supportContacts.whatsappUrl,oldConfig=globalThis.__IKONECTT_PUBLIC_CONFIG__;supportContacts.whatsappUrl=null;globalThis.__IKONECTT_PUBLIC_CONFIG__=published?{contacts:publishedContacts}:undefined;
 const dom=new JSDOM('<!doctype html><title>Home</title><body data-public-release><main><h1>Home</h1></main></body>',{url:'https://preview.test/option-e/#/support/contact',pretendToBeVisual:true}),win=dom.window,saved={};
 for(const key of ['window','document','CustomEvent','FormData','AbortController','libphonenumber','fetch']){saved[key]=globalThis[key];if(key!=='fetch')globalThis[key]=key==='window'?win:key==='libphonenumber'?phoneLibrary:win[key];}
 win.matchMedia=()=>({matches:false});win.scrollTo=()=>{};const writes=[];let finish;
 const whatsapp='https://api.whatsapp.com/send/?phone=2349168965000&text=contact-settings';
 globalThis.fetch=async(url,options)=>{
  if(String(url).endsWith('/contact-settings')){if(offline)throw Error('offline');return response({whatsappUrl:whatsapp});}
  if(String(url).endsWith('/leads')){writes.push(JSON.parse(options.body));return new Promise(resolve=>finish=()=>resolve(response({id:'real-support-enquiry-reference'})));}
  return response(page([]));
 };
 const stop=mountSite({root:win.document.body,home:win.document.querySelector('main'),template:'e'});await pause();
 return {doc:win.document,win,writes,whatsapp,finish:()=>finish(),close(){stop();dom.window.close();supportContacts.whatsappUrl=oldContact;globalThis.__IKONECTT_PUBLIC_CONFIG__=oldConfig;for(const [key,value] of Object.entries(saved))globalThis[key]=value;}};
}

test('Contact Support preserves validation, consent and exactly-once enquiry submission with the shared Nigeria phone component',async()=>{
 const f=await fixture();try{
  const form=f.doc.querySelector('[data-form="support"]'),submit=()=>form.dispatchEvent(new f.win.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(f.doc.querySelector('#ik-main h1').textContent,"We're here to help.");assert.equal(f.doc.querySelector('.ik-breadcrumbs [aria-current]').textContent,'Contact Support');
  const whatsapp=f.doc.querySelector('[data-support-whatsapp]');assert.equal(whatsapp.href,f.whatsapp);assert.equal(whatsapp.rel,'noopener noreferrer');assert.equal(whatsapp.target,'_blank');
  assert.equal(form.elements.country.options.length,1);assert.equal(form.elements.country.value,'NG');
  for(const [key,value] of Object.entries({name:'Test Support',email:'support-test@example.test',phone:'bad-number',account:'QA-ACCOUNT',message:'Please review my connection.'}))form.elements.namedItem(key).value=value;
  form.elements.category.selectedIndex=1;submit();assert.equal(f.writes.length,0);assert.equal(form.elements.phone.getAttribute('aria-invalid'),'true');
  form.elements.phone.value='08031234567';submit();assert.equal(f.writes.length,0);assert.equal(form.querySelector('[name=contactConsent]').getAttribute('aria-invalid'),'true');
  form.elements.contactConsent.checked=true;submit();submit();assert.equal(f.writes.length,1);assert.equal(f.writes[0].phone,'+2348031234567');assert.equal(f.writes[0].consent,true);assert.match(f.writes[0].message,/QA-ACCOUNT/);
  f.finish();await pause();assert.match(form.querySelector('[data-status]').textContent,/real-support-enquiry-reference/);assert.equal(form.dataset.recorded,'true');
 }finally{f.close();}
});

test('Unavailable dynamic WhatsApp configuration does not invent a destination or remove other contact channels',async()=>{
 const f=await fixture({offline:true});try{const whatsapp=f.doc.querySelector('[data-support-whatsapp]');assert.equal(whatsapp.hasAttribute('href'),false);assert.match(whatsapp.textContent,/call or email/);assert.ok(f.doc.querySelector('.e-support-channel[href^="tel:"]'));assert.ok(f.doc.querySelector('.e-support-channel[href^="mailto:"]'));}finally{f.close();}
});

test('approved published WhatsApp remains functional on Contact Support and the dock during API outage',async()=>{
 const f=await fixture({offline:true,published:true});try{const link=f.doc.querySelector('[data-support-whatsapp]');assert.equal(link.href,publishedContacts.whatsappUrl);assert.equal(link.hasAttribute('aria-disabled'),false);assert.match(link.textContent,/Start a conversation/);const dock=f.doc.querySelector('[data-whatsapp]');assert.equal(dock.hidden,false);assert.equal(dock.href,publishedContacts.whatsappUrl);assert.equal(f.writes.length,0);}finally{f.close();}
});
