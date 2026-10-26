import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {homepageBenefits,approvedHomepageTestimonials} from '../shared/homepage-content.js';
import {benefitsHTML,testimonialsHTML,publishableTestimonials,isLocalReview,mountHomepageSections} from '../shared/homepage-sections.js';

const samples=JSON.parse(fs.readFileSync(new URL('../assets/review/homepage-sections/demo-testimonials.json',import.meta.url)));
const fixture=(template='a',origin='https://ikonectt.test')=>{
 const dom=new JSDOM(`<div id="root" data-template="${template}"><main class="ik-home"><section id="hero"><h1>Approved hero</h1></section><section id="plans"><button>View plan</button></section><section id="company">Company</section><section ${template==='a'?'id="home-portal"':'class="portal"'}><button id="portal-cta">My Ikonectt</button></section></main></div>`,{url:origin});
 return {dom,root:dom.window.document.querySelector('#root'),home:dom.window.document.querySelector('main')};
};

test('six themes use concise copy without unsupported absolute guarantees or decorative photos',()=>{
 assert.equal(homepageBenefits.length,6);
 const dom=new JSDOM(benefitsHTML()),doc=dom.window.document;
 assert.equal(doc.querySelectorAll('.ik-benefit-card').length,6);
 assert.equal(doc.querySelectorAll('svg[aria-hidden=true][focusable=false]').length,6);
 assert.equal(doc.querySelectorAll('h2').length,1);assert.equal(doc.querySelectorAll('h3').length,6);
 assert.doesNotMatch(doc.body.textContent,/24\/7|unlimited|unrestricted|unthrottled|guarantee|no throttling/i);
 assert.equal(doc.querySelectorAll('img,button,[tabindex]').length,0);
 assert.ok(homepageBenefits.every(item=>item.description.split(' ').length<20));dom.window.close();
});

test('unverified testimonial references, portraits and ratings cannot become published endorsements',()=>{
 assert.equal(approvedHomepageTestimonials.length,0);
 const unverified={name:'Unverified reference',quote:'Unverified quote',rating:5,portrait:{src:'/unapproved.png'}};
 assert.deepEqual(publishableTestimonials([unverified]),[]);assert.equal(testimonialsHTML([unverified]),'');
 const approved={...unverified,approval:{quote:true,attribution:true,publication:true}};
 let doc=new JSDOM(testimonialsHTML([approved])).window.document;
 assert.equal(doc.querySelectorAll('.ik-testimonial-card').length,1);assert.equal(doc.querySelectorAll('img,.ik-customer-rating').length,0);
 doc=new JSDOM(testimonialsHTML([{...approved,approval:{...approved.approval,portrait:true,rating:true}}])).window.document;
 assert.equal(doc.querySelectorAll('img').length,1);assert.equal(doc.querySelector('.ik-customer-rating').textContent,'5/5');
});

test('testimonial text and attribution are escaped; demonstration cards are clearly labelled without portraits or ratings',()=>{
 const markup=testimonialsHTML([{name:'<img src=x onerror=alert(1)>',quote:'<script>alert(1)</script>',descriptor:'<b>Role</b>',rating:5,portrait:{src:'/portrait.png'}}],{demo:true});
 const doc=new JSDOM(markup).window.document;
 assert.equal(doc.querySelectorAll('script,img').length,0);assert.equal(doc.querySelectorAll('.ik-customer-rating').length,0);
 assert.match(doc.body.textContent,/Demonstration content/);assert.match(doc.body.textContent,/Not a customer endorsement/);assert.match(doc.body.textContent,/<script>alert\(1\)<\/script>/);
 assert.doesNotMatch(JSON.stringify(samples),/Daniel Chukwuma|Zainab Lawal|portrait|rating/);
});

for(const template of ['a','e'])test(`Template ${template}: sections use existing order without altering approved nodes or button handlers`,async()=>{
 const f=fixture(template,'http://127.0.0.1:3021/'),original=[...f.home.children],markup=original.map(node=>node.outerHTML);
 let clicks=0;f.home.querySelector('#portal-cta').addEventListener('click',()=>clicks++);
 const mount=mountHomepageSections({...f,loadReview:async()=>samples});await mount.ready;
 assert.deepEqual([...f.home.children].map(node=>node.id||node.className),['hero','plans','home-benefits','company','home-testimonials',template==='a'?'home-portal':'portal']);
 assert.deepEqual(original.map(node=>node.outerHTML),markup);
 f.home.querySelector('#portal-cta').click();assert.equal(clicks,1);
 assert.equal(f.home.querySelectorAll('.ik-benefit-card').length,6);assert.equal(f.home.querySelectorAll('.ik-testimonial-card').length,2);
 assert.equal(f.home.querySelector('#home-testimonials').dataset.testimonialMode,'demo');
 const duplicate=mountHomepageSections({...f,loadReview:async()=>samples});await duplicate.ready;assert.equal(f.home.querySelectorAll('#home-benefits').length,1);
 duplicate.destroy();mount.destroy();assert.deepEqual([...f.home.children],original);f.dom.window.close();
});

test('published hosts never load demonstration content, even when a review query is supplied',async()=>{
 for(const origin of ['https://ikonecttclient-kappa.vercel.app/?review=testimonials','https://ikonectt.com','http://example.test']){
  const f=fixture('a',origin);let calls=0;
  const mount=mountHomepageSections({...f,loadReview:async()=>{calls++;return samples;}});await mount.ready;
  assert.equal(calls,0);assert.equal(f.home.querySelectorAll('#home-testimonials').length,0);assert.equal(f.home.querySelectorAll('#home-benefits').length,1);
  mount.destroy();f.dom.window.close();
 }
 assert.ok(isLocalReview({hostname:'localhost'}));assert.ok(!isLocalReview({hostname:'localhost.evil.test'}));
});

test('production-preview on localhost suppresses samples; approved stories can publish without local demo data',async()=>{
 const f=fixture('e','http://127.0.0.1:3021/?production-preview');let calls=0;
 const mount=mountHomepageSections({...f,loadReview:async()=>{calls++;return samples;}});await mount.ready;assert.equal(calls,0);assert.equal(f.home.querySelectorAll('#home-testimonials').length,0);mount.destroy();f.dom.window.close();
 const p=fixture('a');
 const publish=mountHomepageSections({...p,testimonials:[{name:'Authorised customer fixture',quote:'Approved quotation fixture.',approval:{quote:true,attribution:true,publication:true}}],loadReview:async()=>{throw Error('not needed');}});
 await publish.ready;assert.equal(p.home.querySelector('#home-testimonials').dataset.testimonialMode,'approved');assert.doesNotMatch(p.home.textContent,/Demonstration/);publish.destroy();p.dom.window.close();
});

test('missing review data and early teardown leave the homepage functional without late inserts',async()=>{
 const f=fixture('a','http://localhost:3021');let resolve;
 const mount=mountHomepageSections({...f,loadReview:()=>new Promise(done=>resolve=done)});await Promise.resolve();mount.destroy();resolve(samples);await mount.ready;
 assert.equal(f.home.querySelectorAll('[data-home-extra]').length,0);f.dom.window.close();
 const p=fixture('e','http://localhost:3021');const broken=mountHomepageSections({...p,loadReview:async()=>{throw Error('offline');}});await broken.ready;
 assert.equal(p.home.querySelectorAll('#home-benefits').length,1);assert.equal(p.home.querySelectorAll('#home-testimonials').length,0);broken.destroy();p.dom.window.close();
});

test('archived B, C and D receive neither section',async()=>{
 for(const template of ['b','c','d']){const f=fixture(template,'http://localhost:3021');const mount=mountHomepageSections({...f,loadReview:async()=>samples});await mount.ready;assert.equal(f.home.querySelectorAll('[data-home-extra]').length,0);mount.destroy();f.dom.window.close();}
});
