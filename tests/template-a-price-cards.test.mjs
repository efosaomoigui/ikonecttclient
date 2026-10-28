import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {carouselHTML,planCardHTML} from '../shared/plan-ui.js';
import {plansFor} from '../shared/catalogue.js';
const script=fs.readFileSync(new URL('../option-a/public/plan-showcase.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('A price cards initialise after React markup, retain original details and rerender business plans once',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{runScripts:'outside-only'}),doc=dom.window.document;
 dom.window.eval(script);
 doc.querySelector('#root').innerHTML='<div class="ik-site" data-template="a"><main class="ik-home">'+carouselHTML()+'</main></div>';
 const rail=doc.querySelector('.ik-carousel-rail');
 const snapshot=()=>[...rail.querySelectorAll('.ik-plan-card')].map(card=>({name:card.querySelector('h3').textContent,price:card.querySelector('.ik-plan-price').textContent,speed:card.querySelector('.ik-plan-speed').textContent,features:card.querySelector('ul').textContent,links:[...card.querySelectorAll('a')].map(a=>a.outerHTML)}));
 const original=snapshot();await tick();assert.deepEqual(snapshot(),original);assert.ok(doc.querySelector('.a-plan-showcase'));
 const check=()=>rail.querySelectorAll('.ik-plan-card').forEach(card=>{assert.ok(card.firstElementChild.matches('.ik-plan-price'));assert.equal(card.querySelectorAll('.a-plan-connection[aria-hidden=true]').length,1);});
 check();dom.window.eval(script);check();
 rail.innerHTML=plansFor('business').map(plan=>planCardHTML(plan)).join('');const business=snapshot();await tick();check();assert.deepEqual(snapshot(),business);assert.equal(rail.querySelectorAll('.a-plan-connection').length,4);
 assert.ok(rail.querySelector('a').href.includes('business/quote'));dom.window.close();
});
test('A card enhancement is restricted to A and leaves E markup intact',async()=>{
 const dom=new JSDOM('<div class="ik-site" data-template="e"><main class="ik-home">'+carouselHTML()+'</main></div>',{runScripts:'outside-only'}),original=dom.window.document.body.innerHTML;
 dom.window.eval(script);await tick();assert.equal(dom.window.document.body.innerHTML,original);dom.window.close();
});
