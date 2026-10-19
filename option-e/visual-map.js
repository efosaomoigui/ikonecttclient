import {visualPictureHTML} from '../shared/visual-assets.js';
import {internalPhotos} from './hero-photos.js?v=2';

// Option E overrides only. Keep future campaign replacements in this map.
export const heroAssets={
  residential:'home', 'residential/installation':'infrastructure',
  business:'tower','business/solutions':'tower','business/solutions/connectivity':'tower',
  'business/solutions/sme':'tower','business/solutions/enterprise':'tower',about:'infrastructure',
  'business/plans':'workplace','business/quote':'workplace',
  'support/troubleshooting':'infrastructure','support/fault':'infrastructure',
  contact:'support-photo',terms:'terms-photo',
};
export const editorialAssets={residential:'flow',business:'workplace',about:'architecture',
  'business/solutions/connectivity':'infrastructure','business/solutions/sme':'workplace','business/solutions/enterprise':'lagos'};
export function heroAsset(path){
  return heroAssets[path]||(path.startsWith('coverage')?'lagos':path.startsWith('support')?'support-photo':path.startsWith('business')?'workplace':path.startsWith('residential')?'home-plans-photo':'account-photo');
}
export const isHeroPhoto=key=>Boolean(internalPhotos[key])||['home','tower','infrastructure','workplace','lagos'].includes(key);
export function imageHTML(key,{decorative=false,priority=false,sizes='(max-width:767px) 100vw,60vw'}={}){
  if(internalPhotos[key]){
    const asset=internalPhotos[key],base=new URL(`./images/internal/${asset.stem}-`,import.meta.url).href;
    return `<picture class="ik-visual-picture" data-visual-asset="${key}" style="--e-photo-position:${asset.position||'62% 44%'}"><img src="${base}1280.webp" srcset="${asset.widths.map(w=>`${base}${w}.webp ${w}w`).join(',')}" sizes="${sizes}" width="${asset.width}" height="${asset.height}" alt="${decorative?'':asset.alt}" loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}></picture>`;
  }
  if(key==='tower'){
    const path=new URL('./images/civic-tower-lagos-',import.meta.url).href;
    return `<picture class="ik-visual-picture" data-visual-asset="tower"><img src="${path}1200.webp" srcset="${[480,800,1200,1600].map(w=>`${path}${w}.webp ${w}w`).join(',')}" sizes="${sizes}" width="3024" height="4032" alt="${decorative?'':'Civic Center Tower in Lagos, shown as general business architecture.'}" loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}></picture>`;
  }
  if(key==='portrait'){
    const path=new URL('./images/my-ikonectt-woman-',import.meta.url).href;
    return `<picture class="ik-visual-picture" data-visual-asset="portrait"><img src="${path}1024.webp" srcset="${path}1024.webp 1024w,${path}1672.webp 1672w" sizes="(max-width:767px) 100vw,55vw" width="1672" height="941" alt="Smiling Nigerian woman in an approved illustrative lifestyle photograph." loading="lazy" decoding="async"></picture>`;
  }
  return visualPictureHTML(key,{decorative,priority,sizes});
}
