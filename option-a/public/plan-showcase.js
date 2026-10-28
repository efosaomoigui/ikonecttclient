// Option A presentation only. Loaded as a public asset in development and previews.
(()=>{
 const doc=document;
 function mount(home){
 const showcase=home.querySelector('[data-plan-carousel]');if(!showcase)return false;
 showcase.classList.add('a-plan-showcase');
 const rail=showcase.querySelector('.ik-carousel-rail');
 function decorate(){
  rail.querySelectorAll('.ik-plan-card').forEach(card=>{
   if(card.dataset.aPlanStyled)return;
   card.dataset.aPlanStyled='true';
   card.prepend(card.querySelector('.ik-plan-price'));
   const icon=home.ownerDocument.createElement('div');icon.className='a-plan-connection';icon.setAttribute('aria-hidden','true');
   icon.innerHTML='<svg viewBox="0 0 100 68" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M20 25a46 46 0 0 1 60 0M31 37a29 29 0 0 1 38 0M42 49a12 12 0 0 1 16 0M50 59v8M0 67h100"/><circle cx="50" cy="58" r="2" fill="currentColor" stroke="none"/></svg>';
   card.querySelector('.ik-plan-card-actions').before(icon);
  });
 }
 decorate();const observer=new home.ownerDocument.defaultView.MutationObserver(decorate);observer.observe(rail,{childList:true});

  return true;
 }
 function ready(){
  if(doc.querySelector('.ik-site[data-template]:not([data-template="a"])'))return true;
  const home=doc.querySelector('.ik-site[data-template="a"] .ik-home');
  if(!home||!home.querySelector('[data-plan-carousel]'))return false;
  if(!home.querySelector('.a-plan-showcase'))mount(home);
  return true;
 }
 if(!ready()){
  const startup=new MutationObserver(()=>{if(ready())startup.disconnect();});
  startup.observe(doc.documentElement,{childList:true,subtree:true});
 }
})();
