import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {publicContacts} from '../shared/content.js';
import {renderPage} from '../shared/pages.js';
import {mountFooter} from '../option-e/footer-refinement.js';

test('company content and enquiry pages use the published company and contact information',()=>{
 const about=new JSDOM(renderPage('about',{state:{},query:new URLSearchParams(),template:'e'}));
 assert.match(about.window.document.body.textContent,/Intelivision Technologies Limited/);
 assert.match(about.window.document.body.textContent,/WIOCC/);
 assert.match(about.window.document.body.textContent,/Google Equiano/);
 assert.ok(about.window.document.querySelector('a[href="#/residential"]'));
 assert.ok(about.window.document.querySelector('a[href="#/business"]'));
 about.window.close();

 for(const route of ['contact','support/contact']){
  const dom=new JSDOM(renderPage(route,{state:{},query:new URLSearchParams()}));
  const doc=dom.window.document;
  assert.match(doc.body.textContent,/22B Fatai Idowu Arobieke/);
  assert.equal(doc.querySelector('[href^="mailto:"]').getAttribute('href'),'mailto:customercare@ikonectt.com');
  assert.equal(doc.querySelector('[href^="tel:"]').getAttribute('href'),'tel:+2342013301220');
  assert.equal(doc.querySelectorAll('.e-contact-profiles a').length,4);
  assert.ok(doc.querySelector('form'),'Existing enquiry form is present.');
  assert.doesNotMatch(doc.body.textContent,/Verified company contact details are awaiting|contact channels will appear/i);
  dom.window.close();
 }
});

test('the public footer uses the same real contacts and verified social profiles',()=>{
 const dom=new JSDOM('<body class="ik-site" data-template="e"><footer class="ik-footer"><div class="ik-footer-bottom"></div></footer></body>',{url:'https://public.example.test/option-e/'});
 const stop=mountFooter(dom.window.document.body);
 const doc=dom.window.document;
 assert.equal(doc.querySelectorAll('.e-footer-contact-group').length,4);
 assert.equal(doc.querySelector('.e-footer-sample-label'),null);
 assert.equal(doc.querySelector('.e-footer-social-pending'),null);
 assert.deepEqual([...doc.querySelectorAll('.e-footer-social-link')].map(link=>link.href),publicContacts.socials.map(item=>item.url));
 assert.equal(doc.querySelector('[href^="mailto:"]').getAttribute('href'),'mailto:customercare@ikonectt.com');
 stop();dom.window.close();
});
