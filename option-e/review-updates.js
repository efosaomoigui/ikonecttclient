import {carouselHTML} from '../shared/plan-ui.js';
import {initializeCarousel} from '../shared/carousel.js';
import {escapeHTML as esc} from '../shared/forms.js';
import {customerStories} from './customer-stories.js';
import {publishableTestimonials} from '../shared/homepage-sections.js';

const root=document.querySelector('.ik-site[data-template=e]');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(root){
 const main=root.querySelector('#ik-main');
 let internal=[];
 const plans=()=>{
  internal.forEach(c=>c.destroy());internal=[];
  main.querySelectorAll('.ik-plan-grid:not(.ik-polish-compare-cards)').forEach(grid=>{
   const audience=grid.querySelector('[data-plan-id]')?.dataset.planId?.startsWith('biz-')?'business':root.dataset.route.startsWith('business')?'business':'residential';
   const host=document.createElement('div');host.innerHTML=carouselHTML(audience==='business'?'business':'residential');
   const carousel=host.firstElementChild;carousel.classList.add('e-internal-plans');
   carousel.querySelector('.ik-carousel-audiences').hidden=true;
   // Keep only this page's audience; existing carousel routing and keyboard support apply.
   grid.nextElementSibling?.matches('.ik-pricing-note')&&grid.nextElementSibling.remove();
   grid.replaceWith(carousel);const abort=new AbortController();const instance=initializeCarousel(carousel,{signal:abort.signal});internal.push({destroy(){abort.abort();instance.destroy();}});
  });
 };
 if(main){plans();new MutationObserver(plans).observe(main,{childList:true});}

 // Recycle real items after each slide: no duplicate links, IDs or focus targets.
 function loop(viewport,track,{delay=5000,desktopOnly=false,active=false}={}){
  let busy=false,visible=false,paused=false;
  const button=document.createElement('button');button.type='button';button.className='e-motion-toggle';button.textContent='Pause rotation';button.setAttribute('aria-pressed','false');
  viewport.parentElement.append(button);
  button.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'Resume rotation':'Pause rotation';button.setAttribute('aria-pressed',String(paused));});
  new IntersectionObserver(([entry])=>visible=entry.isIntersecting,{threshold:.15}).observe(viewport);
  const mark=()=>{if(active){const items=[...track.children];items.forEach((item,n)=>item.dataset.deviceActive=String(n===Math.floor(items.length/2)));}};
  async function step(direction=1){
   if(busy||track.children.length<2)return;busy=true;
   const first=track.firstElementChild,last=track.lastElementChild;
   const distance=track.children[1].offsetLeft-first.offsetLeft;
   viewport.scrollLeft=0;
   if(direction<0)track.prepend(last);
   const animation=track.animate([{transform:`translateX(${direction<0?-distance:0}px)`},{transform:`translateX(${direction<0?0:-distance}px)`}],{duration:reduced.matches?1:850,easing:'cubic-bezier(.22,.68,.25,1)',fill:'forwards'});
   await animation.finished;
   if(direction>0)track.append(first);
   animation.cancel();mark();busy=false;
  }
  setInterval(()=>{
   if(!visible||paused||busy||document.hidden||reduced.matches||viewport.matches(':hover,:focus-within')||viewport.parentElement.matches(':focus-within')||viewport.scrollLeft>2||(desktopOnly&&innerWidth<768))return;
   step();
  },delay);
  mark();return step;
 }
 const devices=root.querySelector('.e-device-row');
 if(devices){
  const viewport=document.createElement('div');viewport.className='e-device-viewport';devices.before(viewport);viewport.append(devices);
  // Device row uses a separate five-slot FLIP cycle so its links stay unique.
  let rotating=false,visible=false,paused=false;
  const toggle=document.createElement('button');toggle.type='button';toggle.className='e-motion-toggle';toggle.textContent='Pause rotation';toggle.setAttribute('aria-pressed','false');viewport.after(toggle);
  toggle.onclick=()=>{paused=!paused;toggle.textContent=paused?'Resume rotation':'Pause rotation';toggle.setAttribute('aria-pressed',String(paused));};
  new IntersectionObserver(([entry])=>visible=entry.isIntersecting,{threshold:.2}).observe(viewport);
  const center=()=>[...devices.children].forEach((e,i)=>e.dataset.deviceActive=String(i===2));center();
  setInterval(async()=>{
   if(rotating||paused||!visible||document.hidden||reduced.matches||innerWidth<768||devices.matches(':hover,:focus-within'))return;
   rotating=true;
   const items=[...devices.children],positions=items.map(e=>e.getBoundingClientRect().left);
   devices.append(items[0]);center();
   const animations=items.map((e,i)=>e.animate(i===0?[{opacity:0,transform:'translateX(30px)'},{opacity:1,transform:'translateX(0)'}]:[{transform:`translateX(${positions[i]-e.getBoundingClientRect().left}px)`},{transform:'translateX(0)'}],{duration:900,easing:'cubic-bezier(.22,.68,.25,1)'}));
   await Promise.all(animations.map(a=>a.finished));rotating=false;
  },3800);
 }
 const installStories=()=>{
  const section=root.querySelector('#home-testimonials');if(!section||section.dataset.clientStories)return;
  const stories=publishableTestimonials(customerStories);
  section.dataset.clientStories='true';section.dataset.testimonialMode=stories.length?'approved':'pending';
  if(!stories.length){
   section.innerHTML='<div class="ik-extras-wrap"><header class="ik-extras-heading"><p class="ik-extras-eyebrow e-section-kicker e-section-kicker-center">CUSTOMER EXPERIENCES</p><h2 id="home-testimonials-title">What our customers say.</h2></header><p class="ik-testimonial-notice">Customer stories will be shared here after publication approval.</p></div>';
   return;
  }
  section.innerHTML=`<div class="ik-extras-wrap"><header class="ik-extras-heading"><p class="ik-extras-eyebrow e-section-kicker e-section-kicker-center">CUSTOMER EXPERIENCES</p><h2 id="home-testimonials-title">What our customers say.</h2></header><div class="e-stories-controls"><button type="button" data-story-prev aria-label="Previous customer story">←</button><button type="button" data-story-next aria-label="Next customer story">→</button></div><div class="e-stories-viewport" tabindex="0" role="region" aria-label="Customer stories. Use the arrow controls or swipe to browse."><div class="e-stories-track">${stories.map(item=>`<figure class="e-story-card"><span class="e-story-quote" aria-hidden="true">“</span>${item.approval?.rating===true&&Number.isInteger(item.rating)&&item.rating>=0&&item.rating<=5?`<div class="e-story-stars" aria-label="${item.rating} out of 5 stars">${'★'.repeat(item.rating)}<span aria-hidden="true">${'☆'.repeat(5-item.rating)}</span></div>`:''}<h3>${esc(item.title)}</h3><blockquote><p>${esc(item.quote)}</p></blockquote><figcaption>${item.approval?.portrait===true&&item.portrait?.src?`<span class="e-story-portrait"><img src="${esc(item.portrait.src)}" alt="${esc(item.portrait.alt||item.name)}" width="1024" height="389" loading="eager"></span>`:''}<span><strong>${esc(item.name)}</strong><small>${esc(item.descriptor||'')}</small></span></figcaption></figure>`).join('')}</div></div></div>`;
  const viewport=section.querySelector('.e-stories-viewport'),step=loop(viewport,section.querySelector('.e-stories-track'),{delay:5500});
  section.querySelector('[data-story-prev]').onclick=()=>step(-1);section.querySelector('[data-story-next]').onclick=()=>step(1);
  viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
 };
 installStories();new MutationObserver(installStories).observe(root.querySelector('.ik-home'),{childList:true});
}
