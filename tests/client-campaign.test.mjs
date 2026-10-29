import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountSite} from '../shared/public-site.js';
import {mountVisuals} from '../shared/visuals.js';
import {mountTemplateE} from '../option-e/refinement.js';
import {mountCampaign} from '../shared/campaign.js';
import {campaignAssets,campaignURL,campaignPicture} from '../shared/campaign-assets.js';
import {heroPreservationHash} from './helpers/hero-preservation.mjs';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const tick=()=>new Promise(resolve=>setTimeout(resolve,8));

test('campaign update preserves selection, page content, approved heroes, city animation and customer logic',()=>{
 const baseline=JSON.parse(read('docs/evidence/client-campaign/preservation.json'));
 for(const [file,hash] of Object.entries(baseline.files)){
  // 29 October: the client authorised four presentation choices on this landing
  // page. Its links and preserved A/E controls are covered by presentation.test.
  if(file==='index.html')continue;
  assert.equal(digest(read(file).toString().replace(/\r\n/g,'\n')),heroPreservationHash(file,hash,{normalized:true}),file);
 }
});

test('campaign photographs keep supplied subjects, room context and opaque lossless exports',()=>{
 const records=JSON.parse(read('assets/review/client-campaign/scene-exports.json'));
 assert.deepEqual(records.map(record=>record.sourceDimensions),[[619,740],[622,771]]);
 for(const record of records){
  assert.equal(digest(read(`assets/review/client-campaign/${record.source}`)),record.sourceSHA256);
  assert.equal(record.changedOpaquePixels,0);assert.ok(record.opaquePixelsVerified>60000);
  const asset=campaignAssets[record.id];assert.equal(asset.width,record.scene.width);assert.equal(asset.height,record.scene.height);
  assert.ok(record.background.includes('no reconstructed people'));
  for(const file of record.exports){assert.ok(file.width<=asset.width);assert.equal(read(file.path).length,file.bytes);assert.equal(file.hasAlpha,false);}
  const doc=new JSDOM(campaignPicture(record.id)).window.document,img=doc.querySelector('img');
  assert.ok(img.alt);assert.equal(img.getAttribute('loading'),'lazy');assert.ok(img.getAttribute('srcset'));assert.equal(+img.getAttribute('width'),asset.width);
  assert.ok(campaignURL(record.id).endsWith(`${asset.stem}-${asset.width}.webp`));
 }
});

for(const template of ['a','e'])test(`Template ${template}: campaign images reuse existing fields, preserve copy/links and follow residential rerenders`,async()=>{
 const portal=template==='a'?'<section id="home-portal"><div class="ik-container"><div><h2>Manage your services with My Ikonectt.</h2><p>Access your account.</p><button id="portal-cta">My Ikonectt</button></div></div></section>':'<section class="portal"><div class="portal-box"><div><h2>Manage your services with My Ikonectt.</h2><p>Access your account.</p></div><a class="btn" href="#/my-ikonectt/sign-in">My Ikonectt</a></div></section>';
 const dom=new JSDOM(`<div id="root"><main id="home"><h1>Home</h1>${portal}</main></div>`,{url:`http://preview.test/option-${template}/`,pretendToBeVisual:true});
 const win=dom.window;
 for(const key of ['window','document','CustomEvent','FormData','AbortController'])globalThis[key]=key==='window'?win:win[key];
 win.scrollTo=()=>{};win.matchMedia=()=>({matches:false});
 const root=win.document.querySelector('#root'),home=win.document.querySelector('#home');
 const site=mountSite({root,home,template}),visuals=mountVisuals({root,home,template});
 const refinement=template==='e'?mountTemplateE({root,home}):()=>{};
 async function route(path){win.location.hash='#/'+path;await new Promise(resolve=>win.addEventListener('hashchange',resolve,{once:true}));await tick();}
 await route('residential');
 const main=root.querySelector('#ik-main'),beforeText=main.textContent,homeText=home.textContent;
 const links=[...root.querySelectorAll('a')].map(a=>a.getAttribute('href'));
 const header=root.querySelector('.ik-header').outerHTML,footer=root.querySelector('.ik-footer').outerHTML;
 const originalPortrait=home.querySelector('.e-portal-portrait')?.outerHTML;
 let clicked=0;home.querySelector('#portal-cta')?.addEventListener('click',()=>clicked++);
 const campaign=mountCampaign({root,home});await tick();
 assert.equal(main.textContent,beforeText);assert.equal(home.textContent,homeText);
 assert.equal(root.querySelector('.ik-header').outerHTML,header);assert.equal(root.querySelector('.ik-footer').outerHTML,footer);
 assert.deepEqual([...root.querySelectorAll('a')].map(a=>a.getAttribute('href')),links);
 assert.equal(main.querySelectorAll('[data-campaign=family]').length,1);
 assert.equal(home.querySelectorAll('[data-campaign=individual]').length,template==='a'?1:0);
 assert.equal(main.querySelectorAll('.ik-page-hero [data-campaign]').length,0);
 if(template==='a'){home.querySelector('#portal-cta').click();assert.equal(clicked,1);}
 else{
  assert.equal(home.querySelector('.e-portal-portrait').outerHTML,originalPortrait);
  assert.ok(home.querySelector('.e-portal-portrait img').src.includes('my-ikonectt-woman-'));
  assert.ok(!home.querySelector('.portal-box').classList.contains('ik-campaign-portal'));
 }
 for(const path of ['coverage','my-ikonectt/sign-in','business']){await route(path);assert.equal(main.querySelectorAll('[data-campaign]').length,0,path);}
 await route('residential');assert.equal(main.querySelectorAll('[data-campaign=family]').length,1);
 assert.equal(root.querySelectorAll('.ik-assistant [data-campaign],form [data-campaign],.ik-plan-card [data-campaign]').length,0);
 campaign();await route('business');await route('residential');assert.equal(main.querySelectorAll('[data-campaign]').length,0,'observer removed');
 refinement();visuals();site();dom.window.close();
});

test('archived D receives no campaign layer',()=>{
 const dom=new JSDOM('<div id="root" data-template="d"><main id="home"><div class="portal-box"></div></main><main id="ik-main"></main></div>');
 const root=dom.window.document.querySelector('#root'),original=root.outerHTML;
 mountCampaign({root,home:root.querySelector('#home')})();assert.equal(root.outerHTML,original);dom.window.close();
});
