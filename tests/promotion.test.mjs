import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountPromotion} from '../option-e/promotion.js';
const campaign={version:'test-version',published:true,title:'Sample promotion',message:'Sample only',imageAlt:'Sample banner',imageData:'data:image/png;base64,iVBORw0KGgo=',actionLabel:'Check coverage',actionUrl:'#/coverage',startsAt:null,endsAt:null};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(p=campaign,storage=new Map()){
 const dom=new JSDOM('<body class="ik-site" data-template="e" data-route="home"><dialog class="ik-assistant-panel"></dialog></body>',{url:'http://localhost:3000/option-e/#/home',pretendToBeVisual:true}),root=dom.window.document.body,timers=new Map();let id=0;
 const options={fetcher:async()=>new Response(JSON.stringify({promotion:p})),storage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},random:()=>0,now:()=>100000,setTimer:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clearTimer:key=>timers.delete(key)};
 return {dom,root,timers,storage,stop:mountPromotion(root,options),show:()=>[...timers.values()].find(t=>t.ms===5000)?.fn()};
}
test('flyout uses backend artwork, keeps text safe, links correctly, closes and remembers the impression',async()=>{
 const t=setup({...campaign,title:'<script>sample</script>'});await tick();assert.equal(t.root.querySelector('.e-promotion'),null);t.show();assert.equal(t.root.querySelector('.e-promotion').getAttribute('aria-label'),'<script>sample</script>');assert.equal(t.root.querySelector('h2,p'),null);assert.equal(t.root.querySelector('script'),null);assert.equal(t.root.querySelector('img').alt,'Sample banner');assert.match(t.root.querySelector('a').href,/#\/coverage$/);t.root.querySelector('button').click();assert.equal(t.root.querySelector('.e-promotion'),null);t.stop();t.dom.window.close();
 const second=setup(campaign,t.storage);await tick();second.show();assert.equal(second.root.querySelector('.e-promotion'),null);second.stop();second.dom.window.close();
});
test('forms, open dialogs, expired campaigns and empty backend results do not interrupt visitors',async()=>{
 for(const p of [null,{...campaign,endsAt:new Date(99999).toISOString()}]){const t=setup(p);await tick();t.show();assert.equal(t.root.querySelector('.e-promotion'),null);t.stop();t.dom.window.close();}
 const t=setup();t.root.dataset.route='residential/installation';await tick();t.show();assert.equal(t.root.querySelector('.e-promotion'),null);t.stop();t.dom.window.close();
});
test('Escape closes the promotion and javascript destinations are omitted',async()=>{const t=setup({...campaign,actionUrl:'javascript:alert(1)'});await tick();t.show();assert.equal(t.root.querySelector('a'),null);t.dom.window.document.dispatchEvent(new t.dom.window.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(t.root.querySelector('.e-promotion'),null);t.stop();t.dom.window.close();});
