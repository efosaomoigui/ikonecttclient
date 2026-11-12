import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountFooter} from '../option-e/footer-refinement.js';

const fixture=(url,template='e')=>new JSDOM(`<body class="ik-site" data-template="${template}"><footer class="ik-footer"><div class="ik-wrap"><div class="ik-footer-grid"><div class="ik-footer-brand"><a class="ik-logo"><img src="official-red.png" alt="Ikonectt"></a><p>Existing company description.</p></div><nav class="ik-footer-links"><a href="#/residential">Residential</a></nav></div><div class="ik-footer-bottom"><span>© 2026 Intelivision Technologies Limited.</span><a href="#/privacy">Privacy</a></div></div></footer></body>`,{url});
const empty={address:null,emails:[],phones:[],socials:[]};

test('E local footer adds only the authorized labelled sample address and preserves existing content',()=>{
 const dom=fixture('http://localhost:3000/option-e/'),root=dom.window.document.body;
 const nav=root.querySelector('.ik-footer-links').outerHTML,bottom=root.querySelector('.ik-footer-bottom').outerHTML;
 const stop=mountFooter(root);
 assert.match(root.querySelector('address').textContent,/12 Example Avenue/);
 assert.match(root.querySelector('.e-footer-sample-label').textContent,/Sample address/);
 assert.equal(root.querySelectorAll('.e-footer-contact-group').length,1);
 assert.equal(root.querySelectorAll('[href^="mailto:"],[href^="tel:"],.e-footer-social-link').length,0);
 assert.equal(root.querySelector('.e-footer-contact-strip').nextElementSibling.className,'ik-footer-bottom');
 assert.equal(root.querySelector('.ik-footer-links').outerHTML,nav);
 assert.equal(root.querySelector('.ik-footer-bottom').outerHTML,bottom);
 assert.equal(root.querySelector('.ik-footer-brand p').textContent,'Existing company description.');
 assert.match(root.querySelector('.ik-logo img').src,/ikonectt_white_transparent\.png$/);
 stop();assert.equal(root.querySelector('.e-footer-contact-strip'),null);
 assert.equal(root.querySelector('.ik-logo img').getAttribute('src'),'official-red.png');
 dom.window.close();
});

test('sample contacts are absent on public hosts and production preview; other templates remain untouched',()=>{
 for(const [url,template] of [['https://preview.example.test/option-e/','e'],['http://localhost:3000/option-e/?production-preview','e'],['http://localhost:3000/option-a/','a']]){
  const dom=fixture(url,template),root=dom.window.document.body,stop=mountFooter(root,empty);
  assert.equal(root.querySelector('.e-footer-contact-strip'),null);
  assert.doesNotMatch(root.textContent,/Example Avenue|Sample address/);
  if(template==='a')assert.equal(root.querySelector('.ik-logo img').getAttribute('src'),'official-red.png');
  stop();dom.window.close();
 }
});

test('verified contact fixtures render correct map, mail, dial and four social links safely',()=>{
 const dom=fixture('https://preview.example.test/option-e/'),root=dom.window.document.body;
 const contacts={address:{lines:['Approved test office','Test location'],mapUrl:'https://www.openstreetmap.org/',verified:true},emails:[{address:'support@example.test',label:'Support',verified:true}],phones:[{number:'+12025550100',label:'+1 202 555 0100',verified:true}],socials:['facebook','x','instagram','linkedin'].map(platform=>({platform,url:`https://${platform==='x'?'x':platform}.com/example`,verified:true}))};
 const stop=mountFooter(root,contacts);
 assert.equal(root.querySelectorAll('.e-footer-contact-group').length,4);
 assert.equal(root.querySelector('[href^="mailto:"]').getAttribute('href'),'mailto:support@example.test');
 assert.equal(root.querySelector('[href^="tel:"]').getAttribute('href'),'tel:+12025550100');
 assert.equal(root.querySelectorAll('.e-footer-social-link').length,4);
 assert.equal(root.querySelector('.e-footer-sample-label'),null);
 for(const link of root.querySelectorAll('[href^="https:"]')){
  assert.equal(link.target,'_blank');assert.ok(link.relList.contains('noopener'));assert.ok(link.relList.contains('noreferrer'));
 }
 stop();dom.window.close();
});

test('unverified and invalid endpoints never produce contact links or social placeholders',()=>{
 const dom=fixture('https://preview.example.test/option-e/'),root=dom.window.document.body;
 const stop=mountFooter(root,{address:{lines:['Unconfirmed']},emails:[{address:'draft@example.test'},{address:'bad',verified:true}],phones:[{number:'+12025550100'},{number:'javascript:bad',verified:true}],socials:[{platform:'x',url:'https://x.com/example'},{platform:'instagram',url:'javascript:alert(1)',verified:true},{platform:'facebook',url:'https://facebook.com.evil.test/example',verified:true}]});
 assert.equal(root.querySelector('.e-footer-contact-strip'),null);
 assert.equal(root.querySelectorAll('[href^="mailto:"],[href^="tel:"],.e-footer-social-link').length,0);
 stop();dom.window.close();
});
