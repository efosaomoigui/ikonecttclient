import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {mountSite} from '../shared/public-site.js';
import {pages,aliases} from '../shared/routes.js';
import {catalogue} from '../shared/catalogue.js';
import {installPresentationLinks} from '../scripts/presentation-links.mjs';

test('content overhaul retains route and catalogue contracts, progressive help and page metadata',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('../docs/content-overhaul-2026-11-17/inventory-before.json',import.meta.url)));
 assert.deepEqual(Object.keys(pages),baseline.routes.map(item=>item.path));
 assert.deepEqual(aliases,baseline.aliases);
 const html=fs.readFileSync(new URL('../option-e/index.html',import.meta.url),'utf8');
 const dom=new JSDOM(html,{url:'https://review.example/option-e/',pretendToBeVisual:true});
 const win=dom.window,doc=win.document;
 const keys=['window','document','CustomEvent','FormData','AbortController'];
 const previous=Object.fromEntries(keys.map(key=>[key,globalThis[key]]));
 for(const key of keys)globalThis[key]=key==='window'?win:win[key];
 win.scrollTo=()=>{};win.matchMedia=()=>({matches:false});
 doc.body.setAttribute('data-public-release','');
 const home=doc.querySelector('main'),originalDescription=doc.querySelector('meta[name=description]').content;
 const stop=mountSite({root:doc.body,home,template:'e'});
 const go=route=>{win.history.replaceState(null,'','#/'+route);win.dispatchEvent(new win.HashChangeEvent('hashchange'));};
 try{
  go('support');assert.equal(doc.querySelectorAll('#ik-search-results details').length,0);
  const search=doc.querySelector('#help-search');search.value='router';search.dispatchEvent(new win.Event('input',{bubbles:true}));
  assert.ok(doc.querySelectorAll('#ik-search-results details').length>0);
  go('support/faqs?category=coverage');assert.equal(doc.querySelectorAll('#ik-search-results details').length,2);
  go('residential/plans/details?plan=res-isilver');
  assert.match(doc.title,/iSilver.*40 Mbps/);
  const planDescription=doc.querySelector('meta[name=description]').content;
  assert.match(planDescription,/40 Mbps.*20,000/);
  go('contact');assert.notEqual(doc.querySelector('meta[name=description]').content,planDescription);
  assert.equal(doc.querySelectorAll('#ik-main h1').length,1);
  go('my-ikonectt/sign-in');assert.equal(doc.querySelector('#ik-main form'),null);
  assert.doesNotMatch(doc.querySelector('#ik-main').textContent,/Use the linked portal/);
  go('home');assert.equal(doc.querySelector('meta[name=description]').content,originalDescription);
  assert.doesNotMatch(doc.querySelector('[data-portal-intro]').textContent,/sample|fictional|wallet funding/);
  const stopLinks=installPresentationLinks(doc);
  assert.match(doc.querySelector('[data-portal-intro]').textContent,/Account access and payments are not connected/);
  assert.equal(doc.querySelector('[data-portal-cta]').getAttribute('href'),'/my-ikonectt/#/');
  stopLinks();
  assert.equal(catalogue.length,9);
 }finally{stop();win.close();for(const key of keys)globalThis[key]=previous[key];}
});
