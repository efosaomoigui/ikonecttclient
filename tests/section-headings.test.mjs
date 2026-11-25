import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {initializeCarousel} from '../shared/carousel.js';
import {carouselHTML} from '../shared/plan-ui.js';
import {replaceCatalogue,catalogue} from '../shared/catalogue.js';
import {benefitsHTML} from '../shared/homepage-sections.js';

test('Option E keeps carousel controls after async loading and fits the initial three-card selection',()=>{
 const before=[...catalogue];
 replaceCatalogue([]);
 const dom=new JSDOM('<div class="ik-site" data-template="e">'+carouselHTML('residential',{showPricingNote:false})+'</div>',{pretendToBeVisual:true});
 const saved=globalThis.window;globalThis.window=dom.window;
 dom.window.matchMedia=()=>({matches:false});
 const root=dom.window.document.querySelector('.ik-plan-carousel'),rail=root.querySelector('.ik-carousel-rail'),calls=[];
 rail.scrollTo=options=>calls.push(options);
 const instance=initializeCarousel(root);
 try{
  replaceCatalogue([50,100,300].map((speed,index)=>({id:'plan-'+index,name:'i-Test_'+speed+'Mbps',kind:'RESIDENTIAL',speedMbps:speed,priceMinor:100,billingDays:null,published:true})));
  instance.refresh();
  assert.equal(rail.querySelectorAll('.ik-plan-card').length,3);
  assert.equal(rail.querySelector('[data-active=true]').dataset.planId,'plan-1');
  root.querySelector('[data-carousel-step="1"]').click();
  assert.equal(rail.querySelector('[data-active=true]').dataset.planId,'plan-2');
  assert.equal(calls.at(-1).behavior,'smooth');
  rail.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Home',bubbles:true}));
  assert.equal(rail.querySelector('[data-active=true]').dataset.planId,'plan-0');
  assert.equal(root.querySelector('.ik-pricing-note'),null);
 }finally{instance.destroy();dom.window.close();globalThis.window=saved;catalogue.splice(0,catalogue.length,...before);}
});

test('Why Choose Us retains its six cards and exact editorial hierarchy after enhancement',async()=>{
 const dom=new JSDOM('<div class="ik-site" data-template="e"><main class="ik-home">'+benefitsHTML()+'</main></div>',{pretendToBeVisual:true});
 const names=['document','matchMedia','MutationObserver'];
 const saved=Object.fromEntries(names.map(name=>[name,globalThis[name]]));
 globalThis.document=dom.window.document;globalThis.matchMedia=()=>({matches:false});globalThis.MutationObserver=dom.window.MutationObserver;
 try{
  await import('../option-e/section-showcase.js?heading-test');
  const section=dom.window.document.querySelector('#home-benefits');
  assert.equal(section.querySelectorAll('.ik-benefit-card').length,6);
  assert.equal(section.querySelectorAll('.e-benefit-badge').length,6);
  assert.equal(section.querySelector('.ik-extras-eyebrow').textContent,'WHY CHOOSE US');
  assert.equal(section.querySelector('h2').textContent,'A Better Broadband Experience');
  assert.equal(section.querySelector('.e-benefits-intro').textContent,'Fibre connectivity, flexible plans and customer support for homes and businesses.');
 }finally{for(const name of names)globalThis[name]=saved[name];dom.window.close();}
});
