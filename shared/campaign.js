import {campaignPicture} from './campaign-assets.js';
import {clientPicture} from './client-image-library.js';

// Presentation-only enhancement of existing image reservations and portal panels.
// Never attach to archived B/C/D, the home hero, forms, plans or the assistant.
export function mountCampaign({root,home}){
 const template=root.dataset.template;
 if(!['a','e'].includes(template))return ()=>{};
 const main=root.querySelector('#ik-main'),doc=root.ownerDocument;
 const installed=[];
 function residential(){
  if(root.dataset.route!=='residential')return;
  const slot=main?.querySelector('.ik-image-slot[data-slot=residential]');
  if(!slot||slot.dataset.campaignInstalled)return;
  slot.dataset.campaignInstalled='family';slot.classList.add('ik-campaign-family');
  slot.innerHTML=clientPicture(template==='a'?'friends-gaming':'family-gaming',{className:'ik-campaign-picture',campaign:true});
 }
 // A uses the campaign man. E keeps its approved woman with a laptop.
 const portal=template==='a'?home.querySelector('#home-portal>.ik-container'):null;
 if(portal){
  portal.insertAdjacentHTML('beforeend',campaignPicture('individual'));
  portal.classList.add('ik-campaign-portal');installed.push(portal);
 }
 residential();
 const observer=new doc.defaultView.MutationObserver(residential);
 if(main)observer.observe(main,{childList:true,subtree:true});
 return ()=>{observer.disconnect();for(const host of installed){host.classList.remove('ik-campaign-portal');host.querySelector('[data-campaign]')?.remove();}};
}
