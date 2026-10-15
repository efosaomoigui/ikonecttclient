import {plansFor,planName,planRoute} from './catalogue.js';
import {planCardHTML} from './plan-ui.js';
export function initializeCarousel(element,{onAudienceChange=()=>{},signal}={}){
  const rail=element.querySelector('.ik-carousel-rail'),status=element.querySelector('.ik-carousel-status');
  let audience=element.querySelector('[data-carousel-audience][aria-pressed=true]').dataset.carouselAudience,index=2,frame=0,scrollTimer;
  const opts=signal?{signal}:{};
  const cards=()=>[...rail.querySelectorAll('.ik-plan-card')];
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion:reduce)').matches;
  function mark(next){
    const items=plansFor(audience);index=Math.max(0,Math.min(items.length-1,next));
    cards().forEach((card,n)=>{card.dataset.active=String(n===index);if(n===index)card.setAttribute('aria-current','true');else card.removeAttribute('aria-current');});
    element.querySelector('[data-carousel-step="-1"]').disabled=index===0;
    element.querySelector('[data-carousel-step="1"]').disabled=index===items.length-1;
    status.textContent=`${planName(items[index])} · ${index+1} of ${items.length}`;
  }
  function go(next,smooth=true){
    mark(next);const card=cards()[index];
    const left=card.offsetLeft-(rail.clientWidth-card.offsetWidth)/2;
    if(typeof rail.scrollTo==='function')rail.scrollTo({left,behavior:smooth&&!reduced()?'smooth':'instant'});else rail.scrollLeft=left;
  }
  function links(){
    const destination=audience+'/plans';
    element.querySelector('[data-carousel-links]').innerHTML=`<a class="ik-button ik-button-secondary" href="#/${destination}">View All ${audience==='business'?'Business':'Residential'} Plans</a>${audience==='residential'?'<a class="ik-button ik-button-secondary" href="#/residential/compare">Compare Plans</a>':'<a class="ik-button ik-button-secondary" href="#/business/solutions">Explore Business Solutions</a>'}`;
  }
  function setAudience(next,announce=false){
    if(!['residential','business'].includes(next))return;
    const changed=audience!==next;audience=next;
    element.querySelectorAll('[data-carousel-audience]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.carouselAudience===audience)));
    if(changed)rail.innerHTML=plansFor(audience).map((plan,n,items)=>planCardHTML(plan,{carousel:true,index:n,count:items.length})).join('');
    links();go(changed?Math.min(2,plansFor(audience).length-1):index,false);
    if(announce)onAudienceChange(audience);
  }
  element.addEventListener('click',event=>{
    const toggle=event.target.closest('[data-carousel-audience]'),arrow=event.target.closest('[data-carousel-step]');
    if(toggle)setAudience(toggle.dataset.carouselAudience,true);
    if(arrow)go(index+Number(arrow.dataset.carouselStep));
  },opts);
  rail.addEventListener('keydown',event=>{
    if(event.target.matches('input,select,textarea'))return;
    const next=event.key==='ArrowRight'?index+1:event.key==='ArrowLeft'?index-1:event.key==='Home'?0:event.key==='End'?plansFor(audience).length-1:null;
    if(next!==null){event.preventDefault();go(next);}
  },opts);
  // Native overflow scrolling provides touch swipe and horizontal trackpad input.
  rail.addEventListener('scroll',()=>{
    clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{
      const center=rail.getBoundingClientRect().left+rail.clientWidth/2;
      const positions=cards().map(card=>{const r=card.getBoundingClientRect();return Math.abs(r.left+r.width/2-center);});
      if(rail.clientWidth)mark(positions.indexOf(Math.min(...positions)));
    },100);
  },opts);
  const resize=()=>{window.cancelAnimationFrame(frame);frame=window.requestAnimationFrame(()=>go(index,false));};
  window.addEventListener('resize',resize,opts);
  // Keep a newly focused offscreen card visible without changing focus or tab order.
  rail.addEventListener('focusin',event=>{const card=event.target.closest('.ik-plan-card');if(card)go(cards().indexOf(card));},opts);
  setAudience(audience);frame=window.requestAnimationFrame(()=>go(index,false));
  return {setAudience,destroy(){clearTimeout(scrollTimer);window.cancelAnimationFrame(frame);}};
}
