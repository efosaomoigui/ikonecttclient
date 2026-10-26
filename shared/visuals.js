import {visualSlots,visualPictureHTML,visualCreditHTML} from './visual-assets.js';
import {creativePictureHTML} from './creative-assets.js';

// Presentation-only adapter: observe the router's existing reserved image fields.
// No navigation, state, form, support or catalogue code is changed.
export function mountVisuals({root,home,template}){
  if(!visualSlots[template])return ()=>{};
  const main=root.querySelector('#ik-main');
  const credit=key=>template==='e'?'':visualCreditHTML(key).replace('resized / cropped',key==='lagos'&&template==='a'?'signage retouched / resized / cropped':'resized / cropped');
  const picture=(key,options)=>key==='lagos'&&['a','e'].includes(template)?creativePictureHTML('city',{...options,legacyKey:'lagos'}):visualPictureHTML(key,options);
  let creditsLink;
  if(template==='e'){
    creditsLink=root.ownerDocument.createElement('a');
    creditsLink.href='./photo-credits.html';creditsLink.textContent='Photo credits';
    root.querySelector('.ik-footer-bottom > div')?.append(creditsLink);
  }
  function installSlots(){
    const path=root.dataset.route;
    if(!visualSlots[template][path])return;
    for(const host of main?.querySelectorAll('.ik-image-slot[data-slot]:not([data-visual-installed])')||[]){
      const key=visualSlots[template][path];
      host.dataset.visualInstalled=key;host.classList.add('ik-visual-slot');
      host.removeAttribute('role');host.removeAttribute('aria-label');
      host.innerHTML=picture(key)+credit(key);
    }
  }
  function background(host,key,{priority=false,network=false}={}){
    if(!host)return;
    host.classList.add('ik-visual-backdrop');
    // Cover crops can be much wider than a narrow viewport: account for hero height.
    const sizes=template==='e'?(host.matches('.hero')?'max(100vw, 190vh)':'(min-width:768px) max(50vw,1250px),900px'):'max(65vw,950px)';
    host.insertAdjacentHTML('afterbegin',picture(key,{priority,decorative:true,sizes})+(network?visualPictureHTML(template==='d'?'network':'flow',{decorative:true,sizes:'100vw'}):''));
    host.insertAdjacentHTML('beforeend',credit(key));
  }
  if(template==='d')background(home.querySelector('.phero'),'lagos',{priority:true,network:true});
  if(template==='e'){
    background(home.querySelector('.hero'),'lagos',{priority:true,network:true});
    background(home.querySelector('.pane.res'),'home');
    background(home.querySelector('.pane.biz'),'dusk');
  }
  installSlots();
  const Observer=root.ownerDocument.defaultView.MutationObserver;
  const observer=new Observer(installSlots);
  if(main)observer.observe(main,{childList:true});
  return ()=>{observer.disconnect();creditsLink?.remove();};
}
