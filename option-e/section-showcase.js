const home=document.querySelector('.ik-site[data-template=e] .ik-home');
const icons={
 speed:'<path d="M4 18a9 9 0 1 1 16 0M12 13l5-5M5 18h14"/><circle cx="12" cy="13" r="1"/>',
 plans:'<path d="m3 7 9-5 9 5-9 5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 support:'<path d="M3 14v-3a9 9 0 0 1 18 0v6a4 4 0 0 1-4 4h-3"/><rect x="3" y="11" width="4" height="7" rx="2"/><rect x="17" y="11" width="4" height="7" rx="2"/>',
 secure:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
 coverage:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
 growth:'<path d="M3 21v-6h4v6M10 21V10h4v11M17 21V5h4v16M3 10l7-6 5 2 6-5M17 1h4v4"/>',
};
const benefits=[
 ['Fibre Broadband','Browse connection options for your home or office.','speed'],
 ['Service Plans','Compare plan speeds and prices.','plans'],
 ['Customer Support','Find answers and contact the support team.','support'],
 ['Connection Guidance','Get help with Wi-Fi, routers and connection problems.','secure'],
 ['Address Checks','Contact us to confirm coverage at your address.','coverage'],
 ['Business Options','Discuss your organisation’s connectivity requirements.','growth'],
];
function showcase(){
 const section=home?.querySelector('#home-benefits');if(!section||section.dataset.showcase)return Boolean(section);
 section.dataset.showcase='silver';
 section.querySelector('.ik-extras-eyebrow')?.remove();
 section.querySelector('h2').textContent='Plans, coverage and support.';
 section.querySelectorAll('.ik-benefit-card').forEach((card,index)=>{
  const [title,description,key]=benefits[index];
  const icon=card.querySelector('svg');icon.innerHTML=icons[key];
  const badge=document.createElement('span');badge.className='e-benefit-badge';badge.setAttribute('aria-hidden','true');icon.before(badge);badge.append(icon);
  card.querySelector('h3').textContent=title;card.querySelector('p').textContent=description;
 });return true;
}
if(home){
 if(!showcase()){const observer=new MutationObserver(()=>{if(showcase())observer.disconnect();});observer.observe(home,{childList:true});}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for(const [selector,file,delay] of [['.pane.res','home-gaming-second.jpg',6500],['.pane.biz','business-conference-second.jpg',7500]]){
  const pane=home.querySelector(selector);if(!pane)continue;
  const picture=document.createElement('picture');picture.className='ik-visual-picture e-audience-alternate';picture.setAttribute('aria-hidden','true');picture.dataset.visible='false';
  const image=document.createElement('img');image.src=new URL('./images/'+file,import.meta.url).href;image.alt='';image.width=1376;image.height=768;image.loading='lazy';image.decoding='async';picture.append(image);pane.prepend(picture);
  let onscreen=false,busy=false;
  const observer=new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;},{threshold:.15});observer.observe(pane);
  setInterval(async()=>{
   if(busy||!onscreen||document.hidden||reduced.matches||pane.matches(':hover,:focus-within'))return;
   busy=true;try{await image.decode();picture.dataset.visible=String(picture.dataset.visible!=='true');pane.dataset.audienceFrame=picture.dataset.visible==='true'?'alternate':'primary';}catch{}finally{busy=false;}
  },delay);
  reduced.addEventListener('change',()=>{if(reduced.matches){picture.dataset.visible='false';pane.dataset.audienceFrame='primary';}});
 }
}
