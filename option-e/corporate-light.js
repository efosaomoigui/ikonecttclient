// E-only presentation. Retain E's room/architecture photography and red logo.
import {imageHTML} from './visual-map.js?v=5';
const redLogo=new URL('../assets/logos/ikonectt_transparent.png',import.meta.url).href;
export function mountCorporateLight(root,home){
 if(root.dataset.template!=='e')return ()=>{};
 const originals=new Map();
 function logos(){
  for(const image of root.querySelectorAll('.ik-header .ik-logo img,.ik-footer .ik-logo img,.ik-assistant-header img,.ik-assistant-avatar')){
   if(!originals.has(image)){originals.set(image,image.getAttribute('src'));image.src=redLogo;}
  }
 }
 logos();
 for(const [selector,key] of [['.pane.res','client-everyday-couple'],['.pane.biz','tower']]){
  const pane=home.querySelector(selector);if(!pane)continue;
  pane.querySelector(':scope>.ik-visual-picture')?.remove();
  pane.insertAdjacentHTML('afterbegin',imageHTML(key,{decorative:true,sizes:'(max-width:860px) 100vw,50vw'}));
 }
 // Conversation avatars arrive progressively; changing their logo has no session effects.
 const observer=new root.ownerDocument.defaultView.MutationObserver(logos);
 const assistant=root.querySelector('.ik-assistant');if(assistant)observer.observe(assistant,{childList:true,subtree:true});
 return ()=>{observer.disconnect();for(const [image,src] of originals)if(image.isConnected)image.setAttribute('src',src);};
}
