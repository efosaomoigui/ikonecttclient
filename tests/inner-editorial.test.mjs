import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountInnerEditorial} from '../option-e/inner-editorial.js';
import {renderPage} from '../shared/pages.js';
import {menus} from '../shared/routes.js';
import {replacePublishedKnowledge} from '../shared/content.js';

test('editorial presentation preserves support search identity, values, links and approved hero',()=>{
 const dom=new JSDOM('<body data-template="e" data-route="support"><header>'+menus.map(m=>`<div id="ik-menu-${m.id}"><div class="ik-mega-inner">${m.groups.map(([title,links])=>`<div class="ik-menu-group"><h2>${title}</h2>${links.map(([label,route])=>`<a href="#/${route}">${label}</a>`).join('')}</div>`).join('')}</div></div>`).join('')+'</header><main id="ik-main"><section class="ik-page-hero"><p class="e-section-kicker">HERE TO HELP</p><h1>How can we help?</h1><div class="e-hero-visual">Approved hero</div></section>'+renderPage('support',{state:{audience:'residential'},query:new URLSearchParams(),template:'e'})+'</main></body>',{url:'http://localhost/option-e/'});
 const root=dom.window.document.body,hero=root.querySelector('.e-hero-visual'),search=root.querySelector('#help-search'),searchPanel=search.closest('section');
 search.value='router';const panelHTML=searchPanel.outerHTML,links=[...root.querySelectorAll('a')].map(a=>a.getAttribute('href'));
 for(const id of ['residential','business'])root.querySelector(`#ik-menu-${id} .ik-mega-inner`).insertAdjacentHTML('beforeend','<aside class="ik-promo"><h3>Repeated promotion</h3><a href="#/coverage">Check Coverage</a></aside>');
 const stop=mountInnerEditorial(root);
 assert.equal(root.querySelector('#help-search'),search);assert.equal(search.value,'router');assert.equal(searchPanel.outerHTML,panelHTML);
 assert.equal(root.querySelector('.e-hero-visual'),hero);assert.equal(root.querySelector('h1').textContent,'How can we help?');assert.equal(root.querySelector('.ik-page-hero .e-section-kicker'),null);
 assert.deepEqual([...root.querySelectorAll('a')].map(a=>a.getAttribute('href')),links);
 assert.equal(root.querySelector('.ik-promo'),null);assert.equal(root.querySelectorAll('.e-topic-link').length,6);assert.ok(!root.querySelector('.e-information-section').textContent.includes('View Answers'));
 assert.equal(root.querySelectorAll('.e-mega-photo').length,5);assert.equal(root.querySelectorAll('.e-information-item').length,10);
 stop();dom.window.close();
});

test('SME presentation hides only the secondary image and preserves its introduction',()=>{
 const dom=new JSDOM('<body data-template="e" data-route="business/solutions/sme"><main id="ik-main"><section class="ik-page-hero"><img id="hero"></section><section><div class="ik-editorial"><div><h2>Broadband for a small team.</h2><p>Original text</p></div><div class="ik-image-slot"><img></div></div></section><section><form><input value="keep"></form></section></main></body>');
 const root=dom.window.document.body,form=root.querySelector('form'),hero=root.querySelector('#hero'),stop=mountInnerEditorial(root);
 assert.equal(root.querySelector('#hero'),hero);assert.equal(root.querySelector('.ik-image-slot').hidden,true);assert.equal(root.querySelector('h2').textContent,'Broadband for a small team.');assert.equal(root.querySelector('form'),form);
 stop();dom.window.close();
});

test('both plan pages retain one audience-aware coverage link through carousel replacement',async()=>{
 for(const audience of ['residential','business']){
  const dom=new JSDOM(`<body data-template="e" data-route="${audience}/plans"><main id="ik-main">${renderPage(audience+'/plans',{state:{audience},query:new URLSearchParams(),template:'e'})}</main></body>`);
  const root=dom.window.document.body,stop=mountInnerEditorial(root),section=root.querySelector('.ik-section');
  const assertLink=()=>{const links=section.querySelectorAll('a[href^="#/coverage"]');assert.equal(links.length,1);assert.equal(links[0].getAttribute('href'),'#/coverage?audience='+audience);assert.equal(section.querySelector('h2').nextElementSibling.className,'e-plan-coverage');assert.equal(section.querySelector('.ik-plan-card-actions a[href^="#/coverage"]'),null);};
  assertLink();
  const original=section.querySelector('.ik-plan-grid'),replacement=original.cloneNode(true);replacement.className='e-internal-plans';replacement.insertAdjacentHTML('beforeend','<article class="ik-plan-card"><div class="ik-plan-card-actions"><a href="#/coverage?plan=rerendered">Check Coverage</a></div></article>');replacement.insertAdjacentHTML('beforeend',`<div class="ik-actions" data-carousel-links><a href="#/${audience}/plans">View All Plans</a><a href="#/residential/compare">Compare Plans</a></div>`);original.replaceWith(replacement);
  await new Promise(resolve=>dom.window.setTimeout(resolve,0));assertLink();assert.equal(section.querySelector('.e-internal-plans'),replacement);assert.equal(section.querySelectorAll('a[href="#/residential/compare"]').length,1);assert.equal(section.querySelector('[data-carousel-links] a[href="#/'+audience+'/plans"]'),null);assert.equal(section.querySelector('.ik-wrap > .ik-actions'),null);
  stop();dom.window.close();
 }
});


test('troubleshooting expands approved backend knowledge in place without Start Guide navigation',()=>{
 replacePublishedKnowledge([{key:'router-no-internet',question:'Router help',answer:'Verified router guidance from the backend.',category:'technical',published:true}]);
 const dom=new JSDOM('<body data-template="e" data-route="support/troubleshooting"><main id="ik-main">'+renderPage('support/troubleshooting',{state:{audience:'residential'},query:new URLSearchParams(),template:'e'})+'</main></body>',{url:'http://localhost/option-e/'});
 const root=dom.window.document.body,stop=mountInnerEditorial(root),guide=root.querySelector('.e-troubleshooting-guide');
 assert.equal(root.querySelectorAll('.e-troubleshooting-guide').length,9);assert.equal(root.querySelector('a[href*="?topic="]'),null);assert.match(guide.querySelector('.e-guide-content').textContent,/Verified router guidance from the backend/);assert.equal(guide.open,false);guide.querySelector('summary').click();assert.equal(guide.open,true);assert.equal(dom.window.location.hash,'');
 stop();dom.window.close();replacePublishedKnowledge([]);
});
