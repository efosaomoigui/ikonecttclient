import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {carouselHTML,planCardHTML} from '../shared/plan-ui.js';
import {plansFor} from '../shared/catalogue.js';
import {mountEPlanShowcase} from '../option-e/homepage-sections.js';

test('E reference-inspired price cards retain catalogue content and destinations across audience changes',async()=>{
 const dom=new JSDOM('<main>'+carouselHTML('residential')+'</main>'),home=dom.window.document.querySelector('main'),rail=home.querySelector('.ik-carousel-rail');
 const original=rail.innerHTML;
 const snapshot=()=>[...rail.querySelectorAll('.ik-plan-card')].map(card=>({id:card.dataset.planId,name:card.querySelector('h3').textContent,speed:card.querySelector('.ik-plan-speed').textContent,price:card.querySelector('.ik-plan-price').textContent,attributes:card.querySelector('ul').textContent,links:[...card.querySelectorAll('a')].map(a=>a.outerHTML)}));
 const before=snapshot(),destroy=mountEPlanShowcase(home);
 assert.ok(home.querySelector('.e-plan-showcase'));assert.deepEqual(snapshot(),before);
 const assertCards=()=>rail.querySelectorAll('.ik-plan-card').forEach(card=>{assert.ok(card.firstElementChild.matches('.ik-plan-price'));assert.equal(card.querySelectorAll('.e-plan-connection[aria-hidden=true]').length,1);});
 assertCards();rail.innerHTML=plansFor('business').map(plan=>planCardHTML(plan)).join('');
 await new Promise(resolve=>setTimeout(resolve,0));assertCards();
 assert.equal(rail.querySelectorAll('.ik-plan-card').length,plansFor('business').length);
 assert.ok([...rail.querySelectorAll('a')].some(a=>a.getAttribute('href').startsWith('#/business/quote')));
 destroy();assert.equal(home.querySelectorAll('.e-plan-connection,.e-plan-showcase').length,0);
 rail.innerHTML=original;const second=mountEPlanShowcase(home);second();assert.deepEqual(snapshot(),before);dom.window.close();
});
