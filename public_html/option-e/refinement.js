import {mountPolish} from '../shared/polish.js';
import {mountEHeroSlideshow} from './hero-slideshow.js?v=1';
import {heroAsset,isHeroPhoto,editorialAssets,imageHTML} from './visual-map.js?v=5';
import {mountCityExperience} from './city-experience.js?v=19';
import {mountCorporateLight} from './corporate-light.js?v=2';
import {mountEPlanShowcase} from './homepage-sections.js?v=3';

export function mountTemplateE({root,home}){
  if(root.dataset.template!=='e')return ()=>{};
  const main=root.querySelector('#ik-main');
  function decorate(){
    const path=root.dataset.route,hero=main?.querySelector('.ik-page-hero');
    if(hero&&!hero.dataset.eRefined){
      const key=heroAsset(path),photo=isHeroPhoto(key);
      hero.dataset.eRefined=key;hero.classList.add('e-internal-hero',photo?'e-hero-photo':'e-hero-quiet');
      const visual=root.ownerDocument.createElement('div');visual.className='e-hero-visual';visual.setAttribute('aria-hidden','true');
      visual.innerHTML=imageHTML(key,{decorative:true,priority:photo,sizes:'(max-width:767px) 100vw,60vw'});hero.append(visual);
    }
    const host=main?.querySelector('.ik-image-slot');
    if(host&&!host.dataset.eRefined){
      host.dataset.eRefined='true';const key=editorialAssets[path];
      if(key){host.innerHTML=imageHTML(key,{sizes:'(max-width:767px) 100vw,65vw'});host.dataset.visualInstalled=key;host.closest('section')?.classList.add('e-editorial');}
    }
  }
  const corporate=mountCorporateLight(root,home);
  const plans=mountEPlanShowcase(home);
  const portal=home.querySelector('.portal-box');
  if(portal){portal.classList.add('e-portal');portal.insertAdjacentHTML('afterbegin',`<div class="e-portal-portrait">${imageHTML('portrait')}</div>`);}
  decorate();
  const observer=new root.ownerDocument.defaultView.MutationObserver(decorate);
  if(main)observer.observe(main,{childList:true});
  const hero=home.querySelector('.hero');
  const slideshow=mountEHeroSlideshow({hero,root});
  const city=mountCityExperience({hero,root,onFrame:slideshow.frame});
  const polish=mountPolish({root,home});
  return ()=>{observer.disconnect();polish();slideshow.destroy();city.destroy();corporate();plans();};
}
if(typeof document!=='undefined'&&document.body.dataset.template==='e')mountTemplateE({root:document.body,home:document.querySelector('.ik-home')});
