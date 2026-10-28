import {clientImageURL,clientImageSrcSet} from '../shared/client-image-library.js';
const cityURL=new URL('../assets/visual-library/creative/lagos-clean-v1-1725.webp',import.meta.url).href;
export const eHeroScenes=[{id:'city',name:'Connected city',src:cityURL,width:1725,height:912,dwell:20000},{id:'family',name:'Family time',src:clientImageURL('family-tablet-1'),srcSet:clientImageSrcSet('family-tablet-1'),width:1376,height:768,dwell:7000},{id:'business',name:'Connected business',src:clientImageURL('conference-room'),srcSet:clientImageSrcSet('conference-room'),width:1376,height:768,dwell:7000}];
export function mountEHeroSlideshow({hero,root}){
 if(!hero)return {frame(){},destroy(){}};
 const doc=hero.ownerDocument,win=doc.defaultView,reduced=win.matchMedia('(prefers-reduced-motion:reduce)'),abort=new win.AbortController();
 let index=0,last=0,latest=0,busy=false,stopped=false,active,timer,headlineTimer;
 hero.dataset.eSlide='city';hero.setAttribute('aria-roledescription','carousel');hero.setAttribute('aria-label','Ikonectt connected life');
 const controls=doc.createElement('div');controls.className='e-scene-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Hero slides');controls.innerHTML='<button type="button" data-e-scene-step="-1" aria-label="Previous hero slide">←</button><button type="button" data-e-scene-step="1" aria-label="Next hero slide">→</button><span class="ik-scene-announcement" aria-live="polite" aria-atomic="true"></span>';hero.append(controls);
 function picture(scene){const img=doc.createElement('img');img.src=scene.src;if(scene.srcSet)img.srcset=scene.srcSet;img.sizes='100vw';img.alt='';img.width=scene.width;img.height=scene.height;img.decoding='async';return img;}
 async function select(next,{manual=false,instant=false}={}){
  if(busy||stopped)return;busy=true;controls.querySelectorAll('button').forEach(b=>b.disabled=true);
  const scene=eHeroScenes[(next+eHeroScenes.length)%eHeroScenes.length],layer=doc.createElement('div');layer.className='e-scene-layer';layer.dataset.scene=scene.id;layer.setAttribute('aria-hidden','true');
  const field=doc.createElement('div');field.className='e-scene-window';const img=picture(scene);field.append(img);layer.append(field);
  try{await img.decode();}catch{busy=false;controls.querySelectorAll('button').forEach(b=>b.disabled=false);return;}
  if(stopped)return;
  const previous=active;hero.append(layer);index=eHeroScenes.indexOf(scene);last=latest;
  hero.dataset.eSlideChanging='true';headlineTimer=win.setTimeout(()=>{hero.dataset.eSlide=scene.id;delete hero.dataset.eSlideChanging;},160);
  function finish(){if(stopped)return;previous?.remove();field.querySelector('.e-scene-tiles')?.remove();img.style.opacity='1';layer.classList.add('e-scene-settled');active=layer;hero.dataset.photoControlled='true';hero.dataset.eSlide=scene.id;delete hero.dataset.eSlideChanging;busy=false;controls.querySelectorAll('button').forEach(b=>b.disabled=false);if(manual)controls.querySelector('.ik-scene-announcement').textContent=scene.name;}
  if(instant||reduced.matches){finish();return;}
  const tiles=doc.createElement('div');tiles.className='e-scene-tiles';field.append(tiles);img.style.opacity='0';
  const r=field.getBoundingClientRect(),columns=r.width<600?4:6,rows=2,scale=Math.max(r.width/scene.width,r.height/scene.height),w=scene.width*scale,h=scene.height*scale;
  const position=scene.id==='family'?.75:scene.id==='business'?.42:.5,ox=(r.width-w)*position,oy=(r.height-h)*.5;
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
   const tile=doc.createElement('span'),x=col*r.width/columns,y=row*r.height/rows;
   tile.style.cssText=`left:${x}px;top:${y}px;width:${r.width/columns+.6}px;height:${r.height/rows+.6}px;background-image:url("${img.currentSrc||img.src}");background-size:${w}px ${h}px;background-position:${ox-x}px ${oy-y}px;animation-delay:${(col+row)*45}ms`;tiles.append(tile);
  }
  timer=win.setTimeout(finish,1250);
 }
 controls.addEventListener('click',event=>{const b=event.target.closest('[data-e-scene-step]');if(!b)return;hero.dispatchEvent(new win.CustomEvent('e:pause-hero'));void select(index+Number(b.dataset.eSceneStep),{manual:true});},{signal:abort.signal});
 controls.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();hero.dispatchEvent(new win.CustomEvent('e:pause-hero'));void select(index+(event.key==='ArrowLeft'?-1:1),{manual:true});},{signal:abort.signal});
 return {frame(seconds){latest=seconds*1000;if(!busy&&latest-last>=eHeroScenes[index].dwell)void select(index+1);},destroy(){stopped=true;abort.abort();win.clearTimeout(timer);win.clearTimeout(headlineTimer);controls.remove();hero.querySelectorAll('.e-scene-layer').forEach(l=>l.remove());delete hero.dataset.eSlide;delete hero.dataset.photoControlled;}};
}
