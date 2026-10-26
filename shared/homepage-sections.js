import {homepageBenefits,approvedHomepageTestimonials} from './homepage-content.js';
import {escapeHTML as esc} from './forms.js';

const lines={
 infinity:'<path d="M6 7c-5 0-5 10 0 10 4 0 8-10 12-10 5 0 5 10 0 10-4 0-8-10-12-10Z"/>',
 headset:'<path d="M3 14v-3a9 9 0 0 1 18 0v6a4 4 0 0 1-4 4h-3"/><rect x="3" y="11" width="4" height="7" rx="2"/><rect x="17" y="11" width="4" height="7" rx="2"/><path d="M11 21h3"/>',
 gauge:'<path d="M4 18a9 9 0 1 1 16 0M12 13l5-5M5 18h14"/><circle cx="12" cy="13" r="1"/>',
 laptop:'<rect x="4" y="3" width="16" height="13" rx="2"/><path d="m4 16-2 5h20l-2-5M9 21h6"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>',
 play:'<rect x="2" y="4" width="20" height="15" rx="3"/><path d="m10 8 6 3.5-6 3.5ZM8 22h8"/>',
};
const icon=name=>`<svg class="ik-benefit-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${lines[name]}</svg>`;

export function benefitsHTML(){
 return `<section id="home-benefits" class="ik-home-extras ik-benefits" data-home-extra="benefits" aria-labelledby="home-benefits-title"><div class="ik-extras-wrap"><header class="ik-extras-heading"><p class="ik-extras-eyebrow">Around your everyday</p><h2 id="home-benefits-title">Why Choose Ikonectt</h2></header><ul class="ik-benefits-grid">${homepageBenefits.map(item=>`<li class="ik-benefit-card" data-benefit="${item.id}">${icon(item.icon)}<h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><span class="ik-benefit-corner" aria-hidden="true"></span></li>`).join('')}</ul></div></section>`;
}

export function publishableTestimonials(items){
 return items.filter(item=>item.approval?.quote===true&&item.approval?.attribution===true&&item.approval?.publication===true&&typeof item.name==='string'&&item.name.trim()&&typeof item.quote==='string'&&item.quote.trim());
}

export function testimonialsHTML(items,{demo=false}={}){
 const records=demo?items:publishableTestimonials(items);
 if(!records.length)return '';
 return `<section id="home-testimonials" class="ik-home-extras ik-testimonials" data-home-extra="testimonials"${demo?' data-testimonial-mode="demo"':' data-testimonial-mode="approved"'} aria-labelledby="home-testimonials-title"><div class="ik-extras-wrap"><header class="ik-extras-heading"><p class="ik-extras-eyebrow">${demo?'Demonstration content':'Customer stories'}</p><h2 id="home-testimonials-title">What Our Customers Say</h2>${demo?'<p class="ik-testimonial-notice">Sample copy for layout review. Customer stories and permissions are awaiting approval.</p>':''}</header><div class="ik-testimonials-grid">${records.map((item,index)=>{
 const portrait=!demo&&item.approval?.portrait===true&&item.portrait?.src?`<img class="ik-customer-portrait" src="${esc(item.portrait.src)}" width="48" height="48" alt="${esc(item.portrait.alt||item.name)}" loading="lazy" decoding="async">`:'';
 const rating=!demo&&item.approval?.rating===true&&Number.isFinite(item.rating)&&item.rating>=0&&item.rating<=5?`<span class="ik-customer-rating" aria-label="Rating: ${item.rating} out of 5">${item.rating}/5</span>`:'';
 return `<figure class="ik-testimonial-card"><span class="ik-quote-mark" aria-hidden="true">“</span><blockquote><p>${esc(item.quote)}</p></blockquote><figcaption>${portrait}<span><strong>${esc(item.name)}</strong><span class="ik-customer-role">${esc(item.descriptor||'')}</span></span>${rating}</figcaption>${demo?`<span class="ik-testimonial-demo-label">Demonstration ${String(index+1).padStart(2,'0')} · Not a customer endorsement</span>`:''}</figure>`;
 }).join('')}</div></div></section>`;
}

export const isLocalReview=location=>['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname);

export function mountHomepageSections({root,home,testimonials=approvedHomepageTestimonials,loadReview}){
 if(!['a','e'].includes(root.dataset.template)||home.querySelector('[data-home-extra]'))return {ready:Promise.resolve(),destroy(){}};
 const doc=root.ownerDocument,win=doc.defaultView,inserted=[];
 let stopped=false;
 const controller=new win.AbortController();
 const create=html=>{const container=doc.createElement('template');container.innerHTML=html;return container.content.firstElementChild;};
 const plans=home.querySelector('#plans');
 if(plans){const section=create(benefitsHTML());plans.after(section);inserted.push(section);}
 const portal=home.querySelector(root.dataset.template==='a'?'#home-portal':'.portal');
 const install=(items,demo)=>{if(stopped||!portal)return;const html=testimonialsHTML(items,{demo});if(html){const section=create(html);portal.before(section);inserted.push(section);}};
 const approved=publishableTestimonials(testimonials);
 let ready=Promise.resolve();
 if(approved.length)install(approved,false);
 else if(isLocalReview(win.location)&&!new URL(win.location.href).searchParams.has('production-preview')){
  // Review samples live outside public_html and are excluded by the existing
  // assets/review packaging rule. Never fetch them on a published host.
  const loader=loadReview||(()=>win.fetch(new URL('/assets/review/homepage-sections/demo-testimonials.json',win.location.origin),{signal:controller.signal,credentials:'omit',cache:'no-store'}).then(response=>response.ok?response.json():[]));
  ready=Promise.resolve().then(loader).then(items=>{if(Array.isArray(items))install(items,true);}).catch(()=>{});
 }
 return {ready,destroy(){stopped=true;controller.abort();inserted.forEach(section=>section.remove());}};
}
