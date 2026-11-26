import {spawn} from 'node:child_process';import {once} from 'node:events';import assert from 'node:assert/strict';import fs from 'node:fs';import {JSDOM} from 'jsdom';import * as phoneLibrary from 'libphonenumber-js/max';import {mountSite} from '../shared/public-site.js';
const nativeFetch=globalThis.fetch,NativeAbortController=globalThis.AbortController;
const child=spawn(process.execPath,['--require','ts-node/register/transpile-only','test/support/public-http.ts'],{cwd:'backend',stdio:['ignore','ignore','pipe','ipc'],windowsHide:true});let error='';child.stderr.on('data',b=>error+=b);
const ready=async()=>{const result=await Promise.race([once(child,'message'),once(child,'exit').then(()=>{throw Error('Test server exited: '+error.slice(-400))}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Test server startup timed out')),25000).unref())]);return result[0];};
fs.mkdirSync('.local/client-review',{recursive:true});
const first=await ready(),token=first.token;const evidence=[];
const wait=async fn=>{for(let i=0;i<250;i++){if(fn())return;await new Promise(r=>setTimeout(r,30))}throw Error('Form flow timed out')};
try{for(const [route,category] of [['residential/installation','INSTALLATION'],['business/quote','QUOTATION'],['coverage/verification','ADDRESS_VERIFICATION'],['support/fault','FAULT'],['support/service-request','SERVICE'],['support/contact','SUPPORT'],['contact','GENERAL']]){
 const dom=new JSDOM('<!doctype html><title>Home</title><body data-public-release><main><h1>Home</h1></main></body>',{url:'http://127.0.0.1:3000/option-e/#/'+route,pretendToBeVisual:true}),win=dom.window;
 for(const key of ['window','document','CustomEvent','FormData','AbortController'])globalThis[key]=key==='window'?win:win[key];globalThis.libphonenumber=phoneLibrary;
 globalThis.fetch=(url,options={})=>{const c=new NativeAbortController();if(options.signal?.aborted)c.abort();else options.signal?.addEventListener('abort',()=>c.abort(),{once:true});return nativeFetch(new URL(url,'http://127.0.0.1:4012'),{...options,signal:c.signal})};win.matchMedia=()=>({matches:false});win.scrollTo=()=>{};
 const stop=mountSite({root:win.document.body,home:win.document.querySelector('main'),template:'e'});
 try{
 if(route==='residential/installation'){
   await wait(()=>win.document.querySelector('select[name=plan]')?.options.length>1);
   win.document.querySelector('[data-launcher]').click();const intro=win.document.querySelector('[data-intro-form]');intro.elements.name.value='Prefilled customer';intro.elements.phone.value='08031234567';intro.elements.enquiry.value='Request installation';intro.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));
   await wait(()=>win.document.querySelector('[data-assistant-route][href="#/residential/installation"]'));win.document.querySelector('[data-assistant-route][href="#/residential/installation"]').click();
 }
 await wait(()=>win.document.querySelector('form[data-form] [name=contactConsent]'));const form=win.document.querySelector('form[data-form]');if(route==='residential/installation'){assert.equal(form.elements.name.value,'Prefilled customer');assert.equal(form.elements.phone.value,'+2348031234567');assert.match(form.elements.comments.value,/Request installation/i);assert.equal(win.location.search,'');}
 for(const field of form.querySelectorAll('input,select,textarea')){if(field.name==='website')continue;if(field.type==='checkbox'){field.checked=true;continue;}if(field.type==='hidden')continue;if(field.tagName==='SELECT'){const choices=[...field.options].filter(o=>o.value);field.value=(choices.find(o=>!/choose|select/i.test(o.textContent))||choices[0])?.value||'';}else field.value=field.name==='email'?'qa@example.test':field.name==='phone'?'08031234567':field.name==='name'?'QA ISOLATED PUBLIC DOM '+category:field.name==='country'?'Nigeria':'QA ONLY verification details';field.dispatchEvent(new win.Event('input',{bubbles:true}));}
 const submit=()=>form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));submit();submit();await wait(()=>form.dataset.recorded==='true');const id=form.querySelector('[data-status]').textContent.match(/Reference: ([a-f0-9-]{36})/)[1];
 const response=await nativeFetch('http://127.0.0.1:4012/api/v1/admin/leads/'+id,{headers:{Authorization:'Bearer '+token}});assert.equal(response.status,200);const record=await response.json();assert.equal(record.category,category);assert.equal(record.sourcePage,route);assert.equal(record.sourceChannel,route==='residential/installation'?'ASSISTANT':'WEBSITE');assert.ok(!('requestHash'in record));
 const edit=await nativeFetch('http://127.0.0.1:4012/api/v1/admin/leads/'+id,{method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({status:'IN_PROGRESS',internalNote:'Isolated end-to-end follow-up'})});assert.equal(edit.status,200);
 child.send('restart');await ready();const persisted=await(await nativeFetch('http://127.0.0.1:4012/api/v1/admin/leads/'+id,{headers:{Authorization:'Bearer '+token}})).json();assert.equal(persisted.status,'IN_PROGRESS');assert.equal(persisted.activity.at(-1).note,'Isolated end-to-end follow-up');
 evidence.push({route,category,persistent:true,staffManaged:true,duplicateClickGuard:true});
 }finally{stop();dom.window.close();}
 }
 fs.writeFileSync('.local/client-review/public-forms-isolated-evidence.json',JSON.stringify({result:'passed',environment:'isolated _test database',browserVisualReview:false,checks:evidence},null,2));console.log(JSON.stringify({result:'passed',workflows:evidence.length}));
}finally{globalThis.fetch=nativeFetch;child.send('stop');await once(child,'exit');}
