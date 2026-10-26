import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {creativeAssets,creativePictureHTML} from '../shared/creative-assets.js';
import {mountBrandSignature} from '../shared/brand-signature.js';
import {mountVisuals} from '../shared/visuals.js';
import {imageHTML} from '../option-e/visual-map.js';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');

test('creative image exports match native dimensions, encoded sizes and recorded sources',()=>{
 const records=JSON.parse(read('assets/review/final-creative/exports.json'));
 for(const record of records){
  assert.equal(hash(read(record.source)),record.sourceSHA256);
  if(record.id==='official-i-mask'){
   const png=read(record.path);assert.equal(hash(png),record.sha256);
   assert.equal(png.readUInt32BE(16),59);assert.equal(png.readUInt32BE(20),221);
   assert.deepEqual(record.crop,{left:91,top:240,width:59,height:221});continue;
  }
  const asset=creativeAssets[record.id];assert.equal(asset.width,record.width);assert.equal(asset.height,record.height);
  for(const file of record.exports){assert.ok(file.width<=record.width);assert.equal(read(file.path).length,file.bytes);}
  assert.equal(record.exports.length,asset.widths.length);
 }
});

test('identified tower and branded city source are replaced at E image creation time',()=>{
 for(const [key,asset] of [['tower','architecture'],['lagos','city']]){
  const html=imageHTML(key,{decorative:true,priority:true});
  assert.match(html,new RegExp(`data-creative-asset="${asset}"`));
  assert.doesNotMatch(html,/civic-tower-lagos|lagos-skyline-/);
  const dom=new JSDOM(html),img=dom.window.document.querySelector('img');
  assert.equal(img.alt,'');assert.equal(img.getAttribute('fetchpriority'),'high');
  assert.equal(img.getAttribute('srcset').split(',').length,creativeAssets[asset].widths.length);dom.window.close();
 }
 assert.match(creativePictureHTML('architecture'),/Illustrative contemporary commercial/);
});

test('city replacement is scoped to active templates while archived D keeps its image source',()=>{
 for(const template of ['a','d','e']){
  const dom=new JSDOM(`<div data-template="${template}" data-route="business/solutions/enterprise"><main id="home"><section class="hero"></section><section class="phero"></section></main><main id="ik-main"><div class="ik-image-slot" data-slot="enterprise"></div></main></div>`,{url:`https://preview.test/option-${template}/`});
  globalThis.document=dom.window.document;
  const root=document.querySelector('[data-template]'),home=root.querySelector('#home'),destroy=mountVisuals({root,home,template});
  if(template==='d')assert.match(home.querySelector('.phero img').src,/lagos-skyline-/);
  else {
   const images=[...root.querySelectorAll('[data-visual-asset=lagos] img')];
   assert.ok(images.length>0);assert.ok(images.every(img=>img.src.includes('lagos-clean-v1-')));
  }
  destroy();dom.window.close();
 }
});

test('official i is decorative, sparse, removable and scoped away from archived designs',()=>{
 for(const template of ['a','e','d']){
  const dom=new JSDOM(`<div data-template="${template}"><main><section id="home-company"><h2>Connecting people.</h2><a href="#/about">About</a></section><section class="about"><h2>Connecting possibilities.</h2><a href="#/about">About</a></section></main></div>`);
  const root=dom.window.document.querySelector('[data-template]'),home=root.querySelector('main'),text=home.textContent,links=[...home.querySelectorAll('a')].map(a=>a.outerHTML);
  const destroy=mountBrandSignature({root,home}),duplicate=mountBrandSignature({root,home});
  const marks=home.querySelectorAll('[data-brand-signature]');assert.equal(marks.length,template==='d'?0:1);
  if(marks.length){assert.equal(marks[0].getAttribute('aria-hidden'),'true');assert.equal(marks[0].querySelector('a,button'),null);}
  assert.equal(home.textContent,text);assert.deepEqual([...home.querySelectorAll('a')].map(a=>a.outerHTML),links);
  duplicate();destroy();assert.equal(home.querySelectorAll('[data-brand-signature]').length,0);dom.window.close();
 }
});
