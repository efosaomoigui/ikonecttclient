import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountCorporateLight,approvedPeoplePicture} from '../option-e/corporate-light.js';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');

test('E light transformation preserves every A source, the selector and all shared customer logic',()=>{
 const record=JSON.parse(read('docs/evidence/option-e-corporate-light/preservation.json'));
 for(const [file,expected] of Object.entries(record.files))assert.equal(hash(read(file).toString().replace(/\r\n/g,'\n')),expected,file);
 const approved=JSON.parse(read('docs/evidence/option-e-corporate-light/checkpoint.json'));
 for(const [file,expected] of Object.entries(approved.files))assert.equal(hash(read(file).toString().replace(/\r\n/g,'\n')),expected.sha256LF,file);
});

test('E light adapter changes presentation only, uses approved asset files and updates progressive conversation logos',async()=>{
 const fixture=template=>new JSDOM(`<div data-template="${template}"><header class="ik-header"><a class="ik-logo"><img src="original-white.png"></a></header><main><section class="pane res"><picture class="ik-visual-picture"></picture><h2>Residential</h2><a href="#/residential">Explore</a></section><section class="pane biz"><picture class="ik-visual-picture"></picture><h2>Business</h2><a href="#/business">Explore</a></section></main><aside class="ik-assistant"><header class="ik-assistant-header"><img src="original-white.png"></header><div data-messages></div></aside><footer class="ik-footer"><a class="ik-logo"><img src="original-white.png"></a></footer></div>`);
 for(const template of ['a','d','e']){
  const dom=fixture(template),root=dom.window.document.querySelector('[data-template]'),home=root.querySelector('main'),text=home.textContent,links=[...home.querySelectorAll('a')].map(a=>a.outerHTML);
  const destroy=mountCorporateLight(root,home);
  assert.equal(home.textContent,text);assert.deepEqual([...home.querySelectorAll('a')].map(a=>a.outerHTML),links);
  assert.equal(home.querySelectorAll('[data-e-people]').length,template==='e'?2:0);
  if(template==='e'){
   for(const selector of ['.ik-header img','.ik-footer img','.ik-assistant-header img'])assert.match(root.querySelector(selector).src,/ikonectt_transparent\.png$/);
   const avatar=dom.window.document.createElement('img');avatar.className='ik-assistant-avatar';avatar.src='original-white.png';root.querySelector('[data-messages]').append(avatar);
   await new Promise(resolve=>setTimeout(resolve,0));assert.match(avatar.src,/ikonectt_transparent\.png$/);
   destroy();assert.equal(root.querySelector('.ik-header img').getAttribute('src'),'original-white.png');
  }else{assert.equal(root.querySelector('.ik-header img').getAttribute('src'),'original-white.png');destroy();}
  dom.window.close();
 }
 for(const key of ['family','business']){
  const dom=new JSDOM(approvedPeoplePicture(key));
  const image=dom.window.document.querySelector('img');assert.equal(image.alt,'');
  for(const item of image.getAttribute('srcset').split(',')){
   const [url,width]=item.trim().split(' '),relative=url.split('/option-a/images/')[1];
   assert.ok(read('option-a/public/images/'+relative).length);assert.ok(parseInt(width)<=Number(image.getAttribute('width')));
  }
  dom.window.close();
 }
});
