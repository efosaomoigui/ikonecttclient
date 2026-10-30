import {clientPicture} from './client-image-library.js';
import {creativePictureHTML} from './creative-assets.js';
import {connectivityURL,connectivitySrcSet} from './connectivity-assets.js';
import {planCardHTML} from './plan-ui.js';
import {getPlan} from './catalogue.js';
import {decorateInformationCards} from './card-icons.js';
import {mountBrandSpelling} from './brand-spelling.js';

const networkIcon='<svg viewBox="0 0 100 68" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M20 25a46 46 0 0 1 60 0M31 37a29 29 0 0 1 38 0M42 49a12 12 0 0 1 16 0M50 59v8M0 67h100"/><circle cx="50" cy="58" r="2" fill="currentColor" stroke="none"/></svg>';

// Active designs only: remove review scaffolding without changing form behaviour.
export function mountPresentationCopy(root){
 if(!['a','e'].includes(root.dataset.template))return ()=>{};
 const redundant=new Set([
  'Check service availability at your address.',
  'Availability is subject to address verification.',
  'Plan availability and installation are subject to location verification and applicable terms.',
  'Preview pricing is subject to client confirmation. Availability and final terms require address verification.',
  'Preview selection. Pricing and service terms require client confirmation.',
  'Verified contact details awaiting confirmation.',
  'Approved policy text is awaiting confirmation.',
  'Approved terms are awaiting confirmation.',
  'A solution-detail preview awaiting verified product definitions.',
  'Sign-in interface preview.',
 ].map(value=>value.toLowerCase()));
 const selector='.ik-pricing-note,.ik-page-hero p,#home-coverage p,.coverage .sub,.coverage .helper,.ik-footer-brand p,.ik-field small[id$="-hint"]';
 const changed=new Set();
 function apply(){
  for(const node of root.querySelectorAll(selector)){
   const text=node.textContent.replace(/\s+/g,' ').trim(),hide=redundant.has(text.toLowerCase())||(node.matches('.coverage .helper')&&!text);
   node.classList.toggle('ik-review-copy-hidden',hide);if(hide)changed.add(node);
  }
  for(const value of root.querySelectorAll('.ik-plan-facts dd,.ik-plan-comparison td')){
   if(!['requires address verification','requires verification','to be confirmed by ikonectt','to be confirmed'].includes(value.textContent.trim().toLowerCase()))continue;
   const row=value.closest('tr')||value.parentElement;row.classList.add('ik-review-copy-hidden');changed.add(row);
  }
 }
 apply();const observer=new root.ownerDocument.defaultView.MutationObserver(apply);observer.observe(root,{childList:true,subtree:true,characterData:true});
 return ()=>{observer.disconnect();changed.forEach(node=>node.classList.remove('ik-review-copy-hidden'));};
}
export function decoratePlanCards(scope){
 for(const card of scope.querySelectorAll('.ik-plan-card,.ik-plan-detail>div:first-child')){
  if(card.classList.contains('ik-polish-price-card'))continue;
  const price=card.querySelector('.ik-plan-price'),actions=card.querySelector('.ik-plan-card-actions,.ik-actions');
  if(!price||!actions)continue;
  card.classList.add('ik-polish-price-card');card.prepend(price);
  const icon=scope.ownerDocument.createElement('div');icon.className='ik-polish-card-network';icon.setAttribute('aria-hidden','true');icon.innerHTML=networkIcon;actions.before(icon);
 }
}
function smallAtmosphere(key){return `<picture class="ik-polish-inner-picture" aria-hidden="true" data-library-scene="${key}"><img src="${connectivityURL(key)}" srcset="${connectivitySrcSet(key)}" sizes="(max-width:767px) 100vw,600px" width="832" height="306" alt="" loading="eager" decoding="async"></picture>`;}
export function mountVisualPolish({root,home}){
 if(!['a','e'].includes(root.dataset.template))return ()=>{};
 const main=root.querySelector('#ik-main'),doc=root.ownerDocument,win=doc.defaultView;
 root.classList.add('ik-polished');
 function apply(){
  if(!main)return;
  const path=root.dataset.route,hero=main.querySelector('.ik-page-hero');
  if(hero&&!hero.dataset.polished){
   hero.dataset.polished='true';hero.classList.add('ik-polish-inner-hero');
   if(root.dataset.template==='a'){
    const visual=doc.createElement('div');visual.className='ik-polish-inner-visual';visual.setAttribute('aria-hidden','true');
    visual.innerHTML=path==='residential'?clientPicture('family-tablet-2',{decorative:true,priority:true}):path==='business'?creativePictureHTML('architecture',{decorative:true,priority:true}):path==='about'?clientPicture('red-emblem',{decorative:true,priority:true}):smallAtmosphere(path.startsWith('coverage')?'map':path.startsWith('business')?'fibre':path.startsWith('my-ikonectt')?'wave':'network');hero.append(visual);
   }
  }
  // Keep one photographic statement before these short text introductions.
  if(path==='residential'||(root.dataset.template==='e'&&path==='business')){
   const slot=main.querySelector(`.ik-image-slot[data-slot=${path}]`);
   if(slot){slot.hidden=true;slot.closest('section')?.classList.add('ik-polish-intro');}
  }
  const comparison=main.querySelector('#ik-comparison');
  if(comparison&&!comparison.querySelector('.ik-polish-compare-cards')){
   const plans=['first','second'].map(name=>getPlan(main.querySelector(`select[name="${name}"]`)?.value)).filter(Boolean);
   if(plans.length===2){const grid=doc.createElement('div');grid.className='ik-plan-grid ik-polish-compare-cards';grid.setAttribute('aria-label','Selected plans');grid.innerHTML=plans.map(p=>planCardHTML(p)).join('');comparison.prepend(grid);}
  }
  decoratePlanCards(main);decorateInformationCards(main);
 }
 let benefitPhoto;
 function installBenefitsPhoto(){
  const benefits=home.querySelector('#home-benefits');
  if(!benefits||benefits.querySelector('.ik-polish-benefit-photo'))return;
  benefits.querySelector('.ik-story-atmosphere')?.remove();benefitPhoto=doc.createElement('div');benefitPhoto.className='ik-polish-benefit-photo';benefitPhoto.setAttribute('aria-hidden','true');benefitPhoto.innerHTML=clientPicture('rooftop-network',{decorative:true,sizes:'100vw'});benefits.prepend(benefitPhoto);
 }
 installBenefitsPhoto();const homeObserver=new win.MutationObserver(installBenefitsPhoto);homeObserver.observe(home,{childList:true,subtree:true});
 apply();const observer=new win.MutationObserver(apply);if(main)observer.observe(main,{childList:true,subtree:true});
 const about=root.dataset.template==='e'?home.querySelector('.about'):null;
 if(about&&!about.querySelector('.ik-polish-brand-photo')){
  const photo=doc.createElement('div');photo.className='ik-polish-brand-photo';photo.setAttribute('aria-hidden','true');photo.innerHTML=clientPicture('red-emblem',{decorative:true});about.append(photo);
 }
 return ()=>{observer.disconnect();homeObserver.disconnect();benefitPhoto?.remove();root.classList.remove('ik-polished');about?.querySelector('.ik-polish-brand-photo')?.remove();};
}
export function finishBrandLoader(doc=document){
 const loader=doc.querySelector('[data-brand-loader]');if(!loader)return ()=>{};
 const win=doc.defaultView,start=win.performance.now();let timer;
 const finish=()=>{timer=win.setTimeout(()=>{loader.dataset.ready='true';win.setTimeout(()=>loader.remove(),220);},Math.max(0,420-(win.performance.now()-start)));};
 const image=doc.querySelector('#home-hero [data-current] img,.hero>.ik-visual-picture img');
 Promise.race([Promise.allSettled([doc.fonts?.ready,image?.decode?.()]),new Promise(r=>win.setTimeout(r,1400))]).then(finish);
 return ()=>{win.clearTimeout(timer);loader.remove();};
}
export async function mountSmoothMotion({root,home}){
 const win=root.ownerDocument.defaultView;if(!win.ResizeObserver)return ()=>{};const reduced=win.matchMedia('(prefers-reduced-motion:reduce)');let lenis,lax,stopped=false;
 const cleanup=()=>{lenis?.destroy();lenis=null;lax?.removeElements('ik-polish-atmosphere');lax?.removeDriver('ikPolishScroll');root.dataset.scrollMotion='native';};
 async function setup(){
  if(reduced.matches||win.navigator.connection?.saveData){cleanup();return;}
  const [{default:Lenis}]=await Promise.all([import('./vendor/lenis-1.3.27.mjs'),import('./vendor/lax-2.0.3.min.js')]);
  if(stopped||reduced.matches)return;
  lax=win.lax;
  lenis=new Lenis({autoRaf:false,lerp:.085,smoothWheel:true,wheelMultiplier:.72,syncTouch:false,anchors:false,prevent:el=>root.ownerDocument.documentElement.style.overflow==='hidden'||Boolean(el.closest?.('.ik-assistant,.ik-carousel-rail,textarea,select,.ik-table-wrap,.ik-mobile-menu'))});
  lax.addDriver('ikPolishScroll',()=>{if(lenis){const locked=root.ownerDocument.documentElement.style.overflow==='hidden';if(locked&&!lenis.isStopped)lenis.stop();else if(!locked&&lenis.isStopped)lenis.start();lenis.raf(win.performance.now());}return win.scrollY;},{inertiaEnabled:true});
  if(!lax.__ikReady){const prior=win.onresize;lax.init();win.onresize=prior;win.addEventListener('resize',lax.onWindowResize);lax.__ikReady=true;}
  const photos=home.querySelectorAll('.ik-story-atmosphere');
  lax.addElements('ik-polish-atmosphere',{ikPolishScroll:{translateY:[['elInY','elOutY'],[10,-10]]}},{elements:[...photos]});
  root.dataset.scrollMotion='lax-lenis';
 }
 const route=()=>{lenis?.scrollTo(0,{immediate:true,force:true});lenis?.resize();};win.addEventListener('hashchange',route);
 const change=()=>{cleanup();void setup();};reduced.addEventListener?.('change',change);
 void setup().catch(error=>{root.dataset.scrollReason=error.message;cleanup();});
 return ()=>{stopped=true;cleanup();win.removeEventListener('hashchange',route);reduced.removeEventListener?.('change',change);};
}
export function mountPolish(options){
 const visual=mountVisualPolish(options),copy=mountPresentationCopy(options.root),spelling=mountBrandSpelling(options.root),loader=finishBrandLoader(options.root.ownerDocument);let motion;
 mountSmoothMotion(options).then(cleanup=>motion=cleanup);
 return ()=>{spelling();copy();visual();loader();motion?.();};
}
