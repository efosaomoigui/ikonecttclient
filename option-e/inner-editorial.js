import {imageHTML} from './visual-map.js';
import {renderPage} from '../shared/pages.js';

// Presentation only: retain router links, approved copy and live-data/form owners.
export function mountInnerEditorial(root){
 if(root.dataset.template!=='e')return ()=>{};
 const doc=root.ownerDocument,main=root.querySelector('#ik-main');
 const menuImages={residential:'home-plans-photo',business:'client-conference-room',coverage:'coverage-drone-menu',support:'support-photo',about:'client-conference-room'};
 for(const [id,key] of Object.entries(menuImages)){
  const inner=root.querySelector(`#ik-menu-${id} .ik-mega-inner`);
  if(!inner||inner.querySelector('.e-mega-content'))continue;
  const content=doc.createElement('div');content.className='e-mega-content';
  while(inner.firstChild)content.append(inner.firstChild);
  if(id==='residential'||id==='business')content.querySelector('.ik-promo')?.remove();
  const photo=doc.createElement('div');photo.className='e-mega-photo';photo.setAttribute('aria-hidden','true');
  photo.innerHTML=imageHTML(key,{decorative:true,sizes:'(min-width:1024px) 360px,1px'});
  inner.classList.add('e-mega-illustrated');inner.append(photo,content);
 }
 function decorate(){
  const path=root.dataset.route;
  // Remove repeated editorial caveats, not validation or live coverage results.
  root.querySelectorAll('.ik-pricing-note').forEach(note=>note.remove());
  const repeatedNote='Availability, equipment, installation costs and service terms must be confirmed for your location.';
  main.querySelectorAll('.ik-section > .ik-wrap > p').forEach(note=>{if(note.textContent.trim()===repeatedNote)note.remove();});
  const introductions={about:'WHO WE ARE',residential:'LIFE CONNECTED',business:'BUILT FOR WORK','residential/plans':'CHOOSE YOUR CONNECTION','business/plans':'CHOOSE YOUR CONNECTION',coverage:'OUR NETWORK'};
  const kicker=main.querySelector('.ik-page-hero .e-section-kicker');
  if(kicker&&introductions[path]&&kicker.textContent!==introductions[path])kicker.textContent=introductions[path];
  for(const [selector,label] of [['#business','FOR YOUR TEAM'],['#plans','CHOOSE YOUR CONNECTION']]){
   const intro=root.querySelector('.ik-home '+selector+' .e-section-kicker');
   if(intro&&intro.textContent!==label)intro.textContent=label;
  }
  if(path==='residential/plans'||path==='business/plans'){
   const section=main.querySelector('.ik-plan-grid,.e-internal-plans')?.closest('.ik-section');
   if(section){
    if(!section.querySelector('.e-plan-coverage')){
     const note=doc.createElement('p');note.className='e-plan-coverage';
     const link=doc.createElement('a');link.href='#/coverage?audience='+path.split('/')[0];link.textContent='Check if Ikonectt is available in your area.';
     note.append(link);section.querySelector('.ik-wrap > h2')?.after(note);
    }
    section.querySelectorAll('a[href^="#/coverage"]').forEach(link=>{if(!link.closest('.e-plan-coverage'))link.remove();});
    section.querySelectorAll('.ik-pricing-note').forEach(note=>note.remove());
    const footer=section.querySelector('[data-carousel-links]');
    if(footer){
     const seen=new Set();
     for(const group of section.querySelectorAll('.ik-actions')){
      for(const link of [...group.querySelectorAll(':scope > a')]){
       const href=link.getAttribute('href');
       if(href==='#/'+path||seen.has(href))link.remove();
       else{seen.add(href);if(group!==footer)footer.append(link);}
      }
      if(group!==footer&&!group.children.length)group.remove();
     }
     footer.classList.add('e-plan-footer-links');
    }
   }
  }
  if(path==='support')main.querySelector('.ik-page-hero .e-section-kicker')?.remove();
  // One photographic statement is enough above the SME introduction.
  if(path==='business/solutions/sme'){
   const slot=main.querySelector('.ik-image-slot');
   if(slot){slot.hidden=true;slot.closest('section')?.classList.add('e-plain-introduction');}
  }
  if(path?.startsWith('business/solutions/'))main.querySelector('.ik-table')?.closest('.ik-section')?.classList.add('e-enquiry-section');
  if(path!=='residential'&&!path?.startsWith('support'))return;
  let first=true;
  for(const section of main.querySelectorAll(':scope > .ik-section')){
   // The approved search and form areas are never restyled or reparented.
   if(section.querySelector('form,.ik-help-search'))continue;
   const grid=section.querySelector('.ik-grid');
   if(!grid||!grid.querySelector(':scope > article.ik-panel'))continue;
   const wrap=section.querySelector(':scope > .ik-wrap');
   section.classList.add('e-information-section');grid.classList.replace('ik-grid','e-information-list');
   for(const item of grid.querySelectorAll(':scope > article.ik-panel')){
    item.classList.replace('ik-panel','e-information-item');
    item.querySelector('p:empty')?.remove();
    const action=item.querySelector(':scope > a.ik-button');
    if(path==='support'&&action?.textContent.trim()==='View Answers'){
     const heading=item.querySelector('h3');
     action.textContent=heading.textContent;action.className='e-topic-link';heading.replaceChildren(action);
     item.classList.add('e-topic-item');
    }else action?.classList.replace('ik-button','e-information-link');
   }
   if(first&&(path==='residential'||path==='support')){
    const body=doc.createElement('div');body.className='e-information-body';
    const photo=doc.createElement('figure');photo.className='e-information-photo';
    if(path==='residential'){
     const src=new URL('./images/internal-sections/residential-family-gaming.jpg',import.meta.url).href;
     photo.innerHTML=`<img src="${src}" width="2048" height="1536" alt="A family enjoying a game together at home." loading="lazy" decoding="async">`;
    }else photo.innerHTML=imageHTML('account-photo',{sizes:'(max-width:767px) 100vw,42vw'});
    grid.before(body);body.append(photo,grid);wrap.classList.add('e-information-layout');
   }
   first=false;
  }
  if(path==='support/troubleshooting'){
   for(const item of main.querySelectorAll('.e-information-item')){
    const action=item.querySelector(':scope > a.e-information-link');
    if(!action)continue;
    const query=new URL(action.href,doc.baseURI).hash.split('?')[1];
    if(!query)continue;
    const guide=doc.createElement('div');guide.innerHTML=renderPage(path,{state:{audience:'residential'},query:new URLSearchParams(query),template:'e'});
    const details=doc.createElement('details');details.className='e-troubleshooting-guide';
    const summary=doc.createElement('summary'),heading=item.querySelector('h3'),icon=item.querySelector('.ik-card-icon');
    if(icon)summary.append(icon);summary.append(heading);
    const body=doc.createElement('div');body.className='e-guide-content';
    const content=guide.querySelector('.ik-wrap');
    content?.querySelector('h2')?.remove();content?.querySelector('a[href="#/support/troubleshooting"]')?.remove();
    if(content)while(content.firstChild)body.append(content.firstChild);
    details.append(summary,body);item.replaceWith(details);
   }
  }
 }
 decorate();
 const observer=new doc.defaultView.MutationObserver(decorate);
 if(main)observer.observe(main,{childList:true,subtree:true});
 return ()=>observer.disconnect();
}
