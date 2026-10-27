import {connectivityURL,connectivitySrcSet} from './connectivity-assets.js';

export function mountConnectivityStory({root,home}){
 const template=root.dataset.template;if(!['a','e'].includes(template))return ()=>{};
 const doc=root.ownerDocument,installed=[];
 function atmosphere(section,key,name){
  if(!section||section.querySelector('[data-story-atmosphere]'))return;
  const picture=doc.createElement('picture');picture.className='ik-story-atmosphere';picture.dataset.storyAtmosphere=key;picture.setAttribute('aria-hidden','true');
  const image=doc.createElement('img');image.src=connectivityURL(key);image.srcset=connectivitySrcSet(key);image.sizes='(max-width:832px) 100vw,832px';image.alt='';image.width=832;image.height=key==='wave'?310:306;image.setAttribute('loading','lazy');image.setAttribute('decoding','async');picture.append(image);section.prepend(picture);section.classList.add('ik-story-section',name);installed.push({section,picture,name});
 }
 if(template==='a'){
  atmosphere(home.querySelector('#home-coverage'),'map','ik-story-coverage');
  atmosphere(home.querySelector('#home-benefits'),'network','ik-story-benefits');
  atmosphere(home.querySelector('#home-company'),'fibre','ik-story-company');
 }else atmosphere(home.querySelector('.about'),'wave','ik-story-company');
 function flush(){
  const slot=root.querySelector('#ik-main .ik-campaign-family'),section=slot?.closest('section');
  if(section)section.classList.add('ik-flush-family');
 }
 flush();const observer=new doc.defaultView.MutationObserver(flush);
 const main=root.querySelector('#ik-main');if(main)observer.observe(main,{childList:true,subtree:true});
 return ()=>{observer.disconnect();for(const {section,picture,name} of installed){picture.remove();section.classList.remove('ik-story-section',name);}root.querySelectorAll('.ik-flush-family').forEach(el=>el.classList.remove('ik-flush-family'));};
}
