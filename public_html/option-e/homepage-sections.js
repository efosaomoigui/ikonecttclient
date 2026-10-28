// E-only card treatment; catalogue data, browsing and destinations stay shared.
export function mountEPlanShowcase(home){
 const showcase=home.querySelector('[data-plan-carousel]');if(!showcase)return ()=>{};
 showcase.classList.add('e-plan-showcase');
 const rail=showcase.querySelector('.ik-carousel-rail');
 function decorate(){
  rail.querySelectorAll('.ik-plan-card').forEach(card=>{
   if(card.dataset.ePlanStyled)return;
   card.dataset.ePlanStyled='true';
   card.prepend(card.querySelector('.ik-plan-price'));
   const icon=home.ownerDocument.createElement('div');icon.className='e-plan-connection';icon.setAttribute('aria-hidden','true');
   icon.innerHTML='<svg viewBox="0 0 100 68" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M20 25a46 46 0 0 1 60 0M31 37a29 29 0 0 1 38 0M42 49a12 12 0 0 1 16 0M50 59v8M0 67h100"/><circle cx="50" cy="58" r="2" fill="currentColor" stroke="none"/></svg>';
   card.querySelector('.ik-plan-card-actions').before(icon);
  });
 }
 decorate();const observer=new home.ownerDocument.defaultView.MutationObserver(decorate);observer.observe(rail,{childList:true});
 return ()=>{observer.disconnect();showcase.classList.remove('e-plan-showcase');rail.querySelectorAll('.ik-plan-card').forEach(card=>{card.querySelector('.e-plan-connection')?.remove();card.querySelector('.ik-plan-speed').after(card.querySelector('.ik-plan-price'));delete card.dataset.ePlanStyled;});};
}
