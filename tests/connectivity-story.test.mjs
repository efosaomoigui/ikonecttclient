import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountConnectivityStory} from '../shared/connectivity-story.js';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
test('supplied connectivity sources stay unchanged and exports never exceed their native dimensions',()=>{
 const records=JSON.parse(read('docs/evidence/connectivity-storytelling/assets.json'));assert.equal(records.length,6);
 for(const record of records){assert.equal(crypto.createHash('sha256').update(read(record.source)).digest('hex'),record.sha256);assert.equal(record.width,832);
  for(const item of record.exports){assert.ok(item.width<=record.width);assert.ok(item.height<=record.height);assert.equal(read(item.path).length,item.bytes);assert.equal(read(item.path).toString('ascii',8,12),'WEBP');}
 }
 assert.equal(records[5].exports.length,0,'keep the homes concept in reserve; do not replace approved people');
});
test('atmosphere is restrained, decorative and scoped to A/E without touching plans or portal',async()=>{
 for(const template of ['a','e','d']){
  const dom=new JSDOM(`<div data-template="${template}"><main id="home"><section id="home-coverage"><form><input></form></section><section id="home-benefits"><h2>Benefits</h2></section><section id="home-company"><h2>Company</h2></section><section class="about"><h2>Company</h2></section><section id="plans">Plans</section><section id="home-portal">Customer</section></main><main id="ik-main"><section><div class="ik-image-slot"></div></section></main></div>`);
  const root=dom.window.document.querySelector('[data-template]'),home=root.querySelector('#home'),text=root.textContent,plans=home.querySelector('#plans').outerHTML,portal=home.querySelector('#home-portal').outerHTML;
  const destroy=mountConnectivityStory({root,home});
  assert.equal(home.querySelectorAll('[data-story-atmosphere]').length,template==='a'?3:template==='e'?1:0);
  assert.equal(home.querySelector('#plans').outerHTML,plans);assert.equal(home.querySelector('#home-portal').outerHTML,portal);assert.equal(root.textContent,text);
  for(const image of home.querySelectorAll('[data-story-atmosphere] img')){assert.equal(image.alt,'');assert.equal(image.getAttribute('loading'),'lazy');assert.equal(image.parentElement.getAttribute('aria-hidden'),'true');}
  const slot=root.querySelector('.ik-image-slot');slot.classList.add('ik-campaign-family');slot.innerHTML='<picture><img alt="Family"></picture>';await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(slot.closest('section').classList.contains('ik-flush-family'),template!=='d');
  destroy();assert.equal(home.querySelectorAll('[data-story-atmosphere]').length,0);dom.window.close();
 }
});
