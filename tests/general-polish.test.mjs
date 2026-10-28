import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {decoratePlanCards,mountVisualPolish,mountPresentationCopy} from '../shared/polish.js';
import {carouselHTML,planCardHTML} from '../shared/plan-ui.js';
import {plansFor} from '../shared/catalogue.js';
import {mountEHeroSlideshow,eHeroScenes} from '../option-e/hero-slideshow.js';
const flush=async()=>{for(let n=0;n<6;n++)await Promise.resolve();};

test('A/E remove repeated review notes while preserving field labels, live validation and archived designs',async()=>{
 for(const template of ['a','e','d']){
  const dom=new JSDOM(`<div data-template="${template}"><p class="ik-pricing-note">Preview pricing is subject to client confirmation. Availability and final terms require address verification.</p><section class="coverage"><p class="sub">Check service availability at your address.</p><label for="addr">Street or estate</label><input id="addr"><p class="helper">Availability is subject to address verification.</p></section><div class="ik-form-status" data-status>Nothing was sent.</div></div>`),root=dom.window.document.querySelector('[data-template]'),helper=root.querySelector('.helper'),destroy=mountPresentationCopy(root);
  assert.equal(helper.classList.contains('ik-review-copy-hidden'),template!=='d');assert.equal(root.querySelector('label').textContent,'Street or estate');assert.equal(root.querySelector('[data-status]').classList.contains('ik-review-copy-hidden'),false);
  helper.textContent='Please complete this field.';await flush();assert.equal(helper.classList.contains('ik-review-copy-hidden'),false);
  const note=dom.window.document.createElement('p');note.className='ik-pricing-note';note.textContent='Preview pricing is subject to client confirmation. Availability and final terms require address verification.';root.append(note);await flush();assert.equal(note.classList.contains('ik-review-copy-hidden'),template!=='d');destroy();assert.equal(root.querySelectorAll('.ik-review-copy-hidden').length,0);dom.window.close();
 }
});

test('supplied rooftop background installs once when E homepage sections arrive after the polish adapter',async()=>{
 const dom=new JSDOM('<div data-template="e"><main id="ik-main"></main><div id="home"></div></div>'),root=dom.window.document.querySelector('[data-template]'),home=root.querySelector('#home');
 const destroy=mountVisualPolish({root,home});
 home.innerHTML='<section id="home-benefits"><ul><li>Existing benefit copy</li></ul></section>';
 await flush();assert.equal(home.querySelectorAll('.ik-polish-benefit-photo [data-client-image=rooftop-network]').length,1);
 home.querySelector('ul').append(dom.window.document.createElement('li'));await flush();assert.equal(home.querySelectorAll('.ik-polish-benefit-photo').length,1);
 assert.equal(home.querySelector('li').textContent,'Existing benefit copy');destroy();assert.equal(home.querySelectorAll('.ik-polish-benefit-photo').length,0);dom.window.close();
});
test('inner price cards retain catalogue values and every CTA while matching the approved price-first layout',()=>{
 const dom=new JSDOM('<main>'+plansFor('residential').map(p=>planCardHTML(p)).join('')+'</main>'),scope=dom.window.document.querySelector('main');
 const links=[...scope.querySelectorAll('a')].map(a=>a.outerHTML),prices=[...scope.querySelectorAll('.ik-plan-price')].map(e=>e.textContent);
 decoratePlanCards(scope);decoratePlanCards(scope);
 assert.deepEqual([...scope.querySelectorAll('a')].map(a=>a.outerHTML),links);assert.deepEqual([...scope.querySelectorAll('.ik-plan-price')].map(e=>e.textContent),prices);
 for(const card of scope.querySelectorAll('article')){assert.ok(card.firstElementChild.matches('.ik-plan-price'));assert.equal(card.querySelectorAll('.ik-polish-card-network').length,1);}dom.window.close();
});
test('E city has the longest dwell and the photographic block reveal uses the existing elapsed-time feed',async()=>{
 const dom=new JSDOM('<div data-route="home"><section class="hero"><h1>Connectivity</h1></section></div>',{pretendToBeVisual:true}),win=dom.window,hero=win.document.querySelector('.hero');
 win.matchMedia=()=>({matches:false});win.HTMLImageElement.prototype.decode=()=>Promise.resolve();let t=0,id=0;const timers=new Map();win.setTimeout=(fn,ms)=>{timers.set(++id,{fn,at:t+ms});return id;};win.clearTimeout=n=>timers.delete(n);const advance=ms=>{t+=ms;for(const [n,item] of [...timers])if(item.at<=t){timers.delete(n);item.fn();}};
 const slides=mountEHeroSlideshow({hero,root:hero.parentElement});assert.ok(eHeroScenes[0].dwell>eHeroScenes[1].dwell*2);
 slides.frame(19.9);await flush();assert.equal(hero.querySelectorAll('.e-scene-layer').length,0);
 slides.frame(20.1);await flush();assert.equal(hero.querySelectorAll('.e-scene-tiles span').length,8);advance(1500);assert.equal(hero.dataset.eSlide,'family');assert.equal(hero.dataset.photoControlled,'true');
 slides.frame(27.2);await flush();advance(1500);assert.equal(hero.dataset.eSlide,'business');assert.equal(hero.querySelectorAll('.e-scene-layer').length,1);
 let pauses=0;hero.addEventListener('e:pause-hero',()=>pauses++);hero.querySelector('[data-e-scene-step="1"]').click();await flush();advance(1500);assert.equal(pauses,1);assert.equal(hero.dataset.eSlide,'city');slides.destroy();assert.equal(hero.querySelectorAll('.e-scene-layer,.e-scene-controls').length,0);dom.window.close();
});
