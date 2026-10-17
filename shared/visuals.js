import {visualSlots,visualPictureHTML,visualCreditHTML} from './visual-assets.js';

// Presentation-only adapter: observe the router's existing reserved image fields.
// No navigation, state, form, support or catalogue code is changed.
export function mountVisuals({root,home,template}){
  if(!visualSlots[template])return ()=>{};
  const main=root.querySelector('#ik-main');
  function installSlots(){
    const path=root.dataset.route;
    if(!visualSlots[template][path])return;
    for(const host of main?.querySelectorAll('.ik-image-slot[data-slot]:not([data-visual-installed])')||[]){
      const key=visualSlots[template][path];
      host.dataset.visualInstalled=key;host.classList.add('ik-visual-slot');
      host.removeAttribute('role');host.removeAttribute('aria-label');
      host.innerHTML=visualPictureHTML(key)+visualCreditHTML(key);
    }
  }
  function background(host,key,{priority=false,network=false}={}){
    if(!host)return;
    host.classList.add('ik-visual-backdrop');
    host.insertAdjacentHTML('afterbegin',visualPictureHTML(key,{priority,decorative:true,sizes:'100vw'})+(network?visualPictureHTML(template==='d'?'network':'flow',{decorative:true,sizes:'100vw'}):''));
    host.insertAdjacentHTML('beforeend',visualCreditHTML(key));
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
  return ()=>observer.disconnect();
}
