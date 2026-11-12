import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {arrangeHomepage} from '../option-e/homepage-order.js';

const fixture = (template, testimonial='') => new JSDOM(`<body class="ik-site" data-template="${template}"><main class="ik-home"><section id="home-benefits">Benefits</section><section id="about"><a href="#/about">About</a></section>${testimonial}<section id="portal">Portal</section></main></body>`);
const order = home => [...home.children].map(section => section.id);

test('E reorders existing sections without altering testimonial content or other templates',()=>{
 for (const template of ['a','e']) {
  const dom=fixture(template,'<section id="home-testimonials" data-testimonial-mode="demo"><p>Sample only</p></section>');
  const home=dom.window.document.querySelector('main');
  const story=home.querySelector('#home-testimonials').outerHTML;
  const stop=arrangeHomepage(home);
  assert.deepEqual(order(home),template==='e'?['home-benefits','home-testimonials','about','portal']:['home-benefits','about','home-testimonials','portal']);
  assert.equal(home.querySelector('#home-testimonials').outerHTML,story);
  assert.equal(home.querySelector('#about a').getAttribute('href'),'#/about');
  stop();dom.window.close();
 }
});

test('E waits for asynchronously loaded testimonials and does not invent absent records',async()=>{
 const dom=fixture('e'),home=dom.window.document.querySelector('main');
 const stop=arrangeHomepage(home);
 assert.equal(home.querySelector('#home-testimonials'),null);
 const section=dom.window.document.createElement('section');
 section.id='home-testimonials';section.dataset.testimonialMode='approved';section.textContent='Existing story';
 home.append(section);
 await new Promise(resolve=>dom.window.setTimeout(resolve,0));
 assert.deepEqual(order(home),['home-benefits','home-testimonials','about','portal']);
 assert.equal(home.querySelectorAll('#home-testimonials').length,1);
 assert.equal(section.textContent,'Existing story');
 assert.equal(section.dataset.testimonialMode,'approved');
 stop();dom.window.close();
});
