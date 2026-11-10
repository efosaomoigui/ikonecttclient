import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';
import {pages} from '../shared/routes.js';
import {mountSite} from '../shared/public-site.js';

const output=new URL('../dist-public/',import.meta.url);
const entry=()=>readFileSync(new URL('option-e/index.html',output),'utf8');

test('public build and server expose one design and no sample applications',async t=>{
  const child=spawn(process.execPath,[fileURLToPath(new URL('../scripts/serve_public.cjs',import.meta.url))],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  t.after(()=>child.kill());
  const base=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Public preview did not start')),10000);
    child.once('error',error=>{clearTimeout(timer);reject(error);});
    child.once('exit',code=>{clearTimeout(timer);reject(new Error('Public preview exited: '+code));});
    child.stdout.on('data',chunk=>{const url=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];if(url){clearTimeout(timer);resolve(url);}});
  });
  for(const url of ['/','/option-a/','/option-b','/option-c/assets/old.js','/option-d/','/option-e']){
    const response=await fetch(base+url,{redirect:'manual'});
    assert.equal(response.status,307,url);assert.equal(response.headers.get('location'),'/option-e/',url);
  }
  for(const name of ['residential','business','coverage']){
    const response=await fetch(base+'/'+name+'.html?from=bookmark',{redirect:'manual'});
    assert.equal(response.headers.get('location'),'/option-e/?from=bookmark#/'+name);
  }
  assert.equal((await fetch(base+'/option-e/')).status,200);
  for(const name of ['admin','my-ikonectt','api','backend','public_html','.env'])assert.equal((await fetch(base+'/'+name+'/')).status,404,name);
  assert.equal((await fetch(base+'/option-e/',{method:'POST'})).status,405);
  for(const name of ['admin','my-ikonectt','option-a','option-b','option-c','option-d','shared/presentation-links.mjs'])assert.ok(!existsSync(new URL(name,output)),name);
  const html=entry();
  assert.match(html,/<body data-template="e" data-public-release>/);
  assert.doesNotMatch(html,/data-option-link|presentation-links/);
  const references=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(([,value])=>value);
  for(const ref of references){
    if(/^(?:https?:|data:|#|mailto:|tel:)/.test(ref))continue;
    const url=new URL(ref,base+'/option-e/');
    const response=await fetch(url,{method:'HEAD'});
    assert.equal(response.status,200,ref);
  }
});

test('all public routes render and old account links never collect credentials',()=>{
  const dom=new JSDOM(entry(),{url:'https://public.example.test/option-e/',pretendToBeVisual:true});
  const win=dom.window,doc=win.document;
  const globals=['window','document','CustomEvent','FormData','AbortController'];
  const before=Object.fromEntries(globals.map(name=>[name,globalThis[name]]));
  for(const name of globals)globalThis[name]=name==='window'?win:win[name];
  win.scrollTo=()=>{};win.matchMedia=()=>({matches:false});
  const stop=mountSite({root:doc.body,home:doc.querySelector('main'),template:'e'});
  try{
    for(const route of Object.keys(pages)){
      win.history.replaceState(null,'','#/'+route);
      win.dispatchEvent(new win.HashChangeEvent('hashchange'));
      assert.equal(doc.body.dataset.route,route);
      const main=doc.querySelector('main:not([hidden])');
      assert.ok(main.querySelector('h1')?.textContent.trim(),route);
      assert.doesNotMatch(main.textContent,/Page not found/,route);
      if(route.startsWith('my-ikonectt/')){
        assert.match(main.textContent,/Customer account access is not available/);
        assert.equal(main.querySelector('form,input[type=password]'),null);
      }
    }
    for(const route of ['design-options','preview-area','comparison']){
      win.history.replaceState(null,'','#'+route);
      win.dispatchEvent(new win.HashChangeEvent('hashchange'));
      assert.equal(doc.body.dataset.route,'home');
    }
  }finally{stop();win.close();for(const name of globals)globalThis[name]=before[name];}
});
