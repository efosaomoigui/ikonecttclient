import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {activeDesigns,archivedDesigns,activeDesign} from '../shared/design-shortlist.js';
import {mountDesignPreview,supportedHash} from '../shared/design-preview.js';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('shortlist exposes exactly A+C, D and E while legacy entrypoints remain available',()=>{
  assert.deepEqual(activeDesigns.map(x=>[x.id,x.label]),[['a','A+C Hybrid'],['d','Template D'],['e','Template E']]);
  assert.deepEqual(archivedDesigns.map(x=>x.id),['b','c']);
  const doc=new JSDOM(source).window.document;
  assert.deepEqual([...doc.querySelectorAll('[data-option-link]')].map(x=>x.dataset.optionLink),['a','d','e']);
  assert.equal(doc.querySelectorAll('[id^="btn-toggle-"]').length,3);
  assert.equal(doc.querySelectorAll('#comparison thead th').length,4);
  assert.equal(doc.querySelector('#preview-frame').getAttribute('src'),'./option-a/');
  for(const id of ['a','b','c','d','e'])assert.ok(fs.existsSync(new URL(`../public_html/option-${id}/index.html`,import.meta.url)));
});
test('preview switching retains page/query and updates direct links plus refreshable host URL',()=>{
  const dom=new JSDOM(source,{url:'https://preview.test/?design=a&route=%23%2Fresidential%2Fcompare%3Ffirst%3Dres-isilver%26second%3Dres-igold'});
  const {document}=dom.window,ui=mountDesignPreview(document,dom.window),frame=document.querySelector('#preview-frame');
  assert.match(frame.src,/option-a\/#\/residential\/compare\?first=res-isilver&second=res-igold$/);
  ui.switchLivePreview('d');
  assert.match(frame.src,/option-d\/#\/residential\/compare\?first=res-isilver&second=res-igold$/);
  assert.equal(new URL(dom.window.location.href).searchParams.get('design'),'d');
  assert.equal(document.querySelector('#btn-toggle-d').getAttribute('aria-pressed'),'true');
  assert.match(document.querySelector('[data-option-link=e]').href,/option-e\/#\/residential\/compare\?/);
  ui.switchLivePreview('e');assert.match(frame.src,/option-e\/#\/residential\/compare/);
  const refresh=new JSDOM(source,{url:dom.window.location.href});mountDesignPreview(refresh.window.document,refresh.window);
  assert.equal(refresh.window.document.querySelector('#preview-frame').src,frame.src);
  const previous=frame.src;ui.switchLivePreview('c');assert.equal(frame.src,previous);
  dom.window.close();refresh.window.close();
});
test('old selector IDs and unsupported page contexts fall back without redirecting legacy websites',()=>{
  assert.equal(activeDesign('b').id,'a');assert.equal(activeDesign('c').id,'a');
  assert.equal(supportedHash('https://outside.test'),'#/home');assert.equal(supportedHash('#/not-a-page'),'#/home');
  assert.equal(supportedHash('#/business/plans?plan=biz-300'),'#/business/plans?plan=biz-300');
  const dom=new JSDOM(source,{url:'https://preview.test/?option=c'});mountDesignPreview(dom.window.document,dom.window);
  assert.match(dom.window.document.querySelector('#preview-frame').src,/option-a\/#\/home$/);dom.window.close();
});
test('original designs and shared journeys retain the shortlist checkpoint outside authorised Phase 3 visual entrypoints',()=>{
  const baseline=JSON.parse(fs.readFileSync(new URL('../docs/evidence/shortlist/preservation.json',import.meta.url)));
  // Phase 3 explicitly authorises supporting photography and D/E visual entrypoints.
  // Their narrower invariants are covered by visual-integration.test.mjs.
  const allowed=new Set(['option-a/src/App.tsx','option-a/src/components/pages/HomePage.tsx','option-d/index.html','option-e/index.html']);
  for(const [file,hash] of Object.entries(baseline.files)){
    if(allowed.has(file))continue;
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+file,import.meta.url))).digest('hex'),hash,file);
  }
  const css=fs.readFileSync(new URL('../option-a/src/inner-pages-hybrid.css',import.meta.url),'utf8');
  const selectors=css.replace(/\/\*[\s\S]*?\*\//g,'').match(/[^{}]+(?=\{)/g).filter(x=>!x.trim().startsWith('@'));
  for(const selector of selectors)assert.ok(selector.includes('.ik-site[data-template=a] #ik-main'),selector);
});
