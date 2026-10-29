import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountCorporateLight} from '../option-e/corporate-light.js';
import {heroGroundingHash} from './helpers/hero-grounding-preservation.mjs';
import {redAccentAssets,redAccentSrcSet} from '../shared/red-accent-assets.js';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');

test('E theme and later scoped photography feedback preserve approved A, selector and shared customer logic',()=>{
 const record=JSON.parse(read('docs/evidence/option-e-corporate-light/preservation.json'));
 for(const [file,expected] of Object.entries(record.files)){
  // 29 October: only the presentation landing page is authorised to gain the
  // two application choices. presentation.test protects its four destinations.
  if(file==='index.html')continue;
  assert.equal(hash(read(file).toString().replace(/\r\n/g,'\n')),heroGroundingHash(file,expected,{normalized:true}),file);
 }
 const approved=JSON.parse(read('docs/evidence/option-e-corporate-light/checkpoint.json'));
 for(const [file,expected] of Object.entries(approved.files))assert.equal(hash(read(file).toString().replace(/\r\n/g,'\n')),heroGroundingHash(file,expected.sha256LF,{normalized:true}),file);
});

test('E light adapter changes presentation only, uses approved asset files and updates progressive conversation logos',async()=>{
 const fixture=template=>new JSDOM(`<div data-template="${template}"><header class="ik-header"><a class="ik-logo"><img src="original-white.png"></a></header><main><section class="pane res"><picture class="ik-visual-picture"></picture><h2>Residential</h2><a href="#/residential">Explore</a></section><section class="pane biz"><picture class="ik-visual-picture"></picture><h2>Business</h2><a href="#/business">Explore</a></section></main><aside class="ik-assistant"><header class="ik-assistant-header"><img src="original-white.png"></header><div data-messages></div></aside><footer class="ik-footer"><a class="ik-logo"><img src="original-white.png"></a></footer></div>`,{url:`https://preview.test/option-${template}/`});
 for(const template of ['a','d','e']){
  const dom=fixture(template),root=dom.window.document.querySelector('[data-template]'),home=root.querySelector('main'),text=home.textContent,links=[...home.querySelectorAll('a')].map(a=>a.outerHTML);
  globalThis.document=dom.window.document;
  const destroy=mountCorporateLight(root,home);
  assert.equal(home.textContent,text);assert.deepEqual([...home.querySelectorAll('a')].map(a=>a.outerHTML),links);
  assert.equal(home.querySelectorAll('[data-e-people]').length,0);
  if(template==='e'){
   assert.equal(home.querySelectorAll('.res [data-client-image=everyday-couple],.biz [data-visual-asset=tower]').length,2);
   for(const selector of ['.ik-header img','.ik-footer img','.ik-assistant-header img'])assert.match(root.querySelector(selector).src,/ikonectt_transparent\.png$/);
   const avatar=dom.window.document.createElement('img');avatar.className='ik-assistant-avatar';avatar.src='original-white.png';root.querySelector('[data-messages]').append(avatar);
   await new Promise(resolve=>setTimeout(resolve,0));assert.match(avatar.src,/ikonectt_transparent\.png$/);
   destroy();assert.equal(root.querySelector('.ik-header img').getAttribute('src'),'original-white.png');
  }else{assert.equal(root.querySelector('.ik-header img').getAttribute('src'),'original-white.png');destroy();}
  dom.window.close();
 }
 for(const key of Object.keys(redAccentAssets)){
  for(const item of redAccentSrcSet(key).split(',')){
   const [url,width]=item.trim().split(' '),relative=url.split('/assets/')[1];
   assert.ok(read('assets/'+relative).length);assert.ok(parseInt(width)<=redAccentAssets[key].width);
  }
 }
});
