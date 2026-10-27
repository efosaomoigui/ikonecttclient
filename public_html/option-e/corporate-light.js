// E-only presentation: reuse approved photography and the original red logo.
const redLogo=new URL('../assets/logos/ikonectt_transparent.png',import.meta.url).href;
const approved={family:{stem:'a-h02-connected-family-medium-v1',widths:[960,1448],height:1086},business:{stem:'a-h03-business-collaboration-desktop-v3',widths:[1024,1672],height:941}};
export function approvedPeoplePicture(key){
 const {stem,widths,height}=approved[key],width=widths.at(-1),url=width=>new URL(`../option-a/images/template-a/${stem}-${width}.webp`,import.meta.url).href;
 return `<picture class="ik-visual-picture" data-e-people="${key}"><img src="${url(width)}" srcset="${widths.map(w=>`${url(w)} ${w}w`).join(',')}" sizes="(max-width:860px) 100vw,50vw" width="${width}" height="${height}" alt="" loading="lazy" decoding="async"></picture>`;
}
export function mountCorporateLight(root,home){
 if(root.dataset.template!=='e')return ()=>{};
 const originals=new Map();
 function logos(){
  for(const image of root.querySelectorAll('.ik-header .ik-logo img,.ik-footer .ik-logo img,.ik-assistant-header img,.ik-assistant-avatar')){
   if(!originals.has(image)){originals.set(image,image.getAttribute('src'));image.src=redLogo;}
  }
 }
 logos();
 for(const [selector,key] of [['.pane.res','family'],['.pane.biz','business']]){
  const pane=home.querySelector(selector);if(!pane)continue;
  pane.querySelector(':scope>.ik-visual-picture')?.remove();
  pane.insertAdjacentHTML('afterbegin',approvedPeoplePicture(key));
 }
 // Conversation avatars arrive progressively; changing their logo has no session effects.
 const observer=new root.ownerDocument.defaultView.MutationObserver(logos);
 const assistant=root.querySelector('.ik-assistant');if(assistant)observer.observe(assistant,{childList:true,subtree:true});
 return ()=>{observer.disconnect();for(const [image,src] of originals)if(image.isConnected)image.setAttribute('src',src);};
}
