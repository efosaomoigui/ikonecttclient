import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountHeroSlideshow} from '../option-a/src/components/ui/hero-slideshow.js';

const flush = async () => {for(let n=0;n<6;n++) await Promise.resolve();};
function fixture({reduced=false,fail=[]}={}) {
  const dom=new JSDOM('<main><section><div data-hero-images><picture data-current data-slide="0"><img src="/0.webp"></picture></div><div data-hero-controls><button data-hero-step="-1">Previous</button><span data-hero-position></span><button data-hero-step="1">Next</button><button data-hero-toggle>Play/Pause</button></div><span data-hero-announcement></span></section></main>',{pretendToBeVisual:true});
  const {window}=dom,root=window.document.querySelector('section');
  const media=new window.EventTarget();media.matches=reduced;window.matchMedia=()=>media;
  Object.defineProperties(window.HTMLImageElement.prototype,{complete:{get:()=>true},naturalWidth:{get(){return fail.includes(Number(this.getAttribute('src')?.match(/(\d)\.webp/)?.[1]))?0:1000;}}});
  window.HTMLImageElement.prototype.decode=()=>Promise.resolve();
  let now=0,id=0,hidden=false;const frames=new Map();
  const clock={requestAnimationFrame(fn){frames.set(++id,fn);return id;},cancelAnimationFrame(i){frames.delete(i);}};
  Object.defineProperty(window.document,'hidden',{get:()=>hidden});
  const step=async(ms)=>{for(let remaining=ms;remaining>0;remaining-=50){now+=Math.min(50,remaining);const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));await flush();}};
  const slides=Array.from({length:3},(_,i)=>({name:['Residential','Family','Business'][i],...Object.fromEntries(['desktop','medium','mobile'].map(k=>[k,{src:`/${i}.webp`,srcSet:`/${i}.webp 1000w`,width:1000,height:750}]))}));
  const cleanup=mountHeroSlideshow(root,slides,{clock});
  const selected=()=>root.querySelector('[data-current]')?.dataset.slide;
  const click=selector=>root.querySelector(selector).click();
  return{window,root,media,step,selected,click,frames,cleanup,hide(value){hidden=value;window.document.dispatchEvent(new window.Event('visibilitychange'));}};
}

test('Template A hero cycles on one clock, blends decoded photos and preserves only two layers',async()=>{
  const f=fixture();await flush();
  assert.equal(f.selected(),'0');await f.step(7050);
  assert.equal(f.selected(),'1');assert.equal(f.root.querySelectorAll('picture').length,2);
  assert.equal(f.root.querySelector('[data-slide="0"]').style.opacity,'');
  await f.step(700);assert.equal(f.root.querySelectorAll('picture').length,1);
  await f.step(7700);assert.equal(f.selected(),'2');
  await f.step(7700);assert.equal(f.selected(),'0');
  f.cleanup();assert.equal(f.frames.size,0);f.window.close();
});
test('manual previous/next wraps, pauses persistently and announces only manual selection',async()=>{
  const f=fixture();await flush();f.click('[data-hero-step="-1"]');await flush();
  assert.equal(f.selected(),'2');assert.equal(f.root.dataset.heroPlaying,'false');
  assert.match(f.root.querySelector('[data-hero-announcement]').textContent,/Business, slide 3 of 3/);
  // Repeated input while blending cannot queue another transition.
  f.click('[data-hero-step="1"]');await f.step(20000);assert.equal(f.selected(),'2');
  f.click('[data-hero-toggle]');await f.step(7050);assert.equal(f.selected(),'0');
  f.cleanup();f.window.close();
});
test('pause freezes progress; hidden tab and hidden homepage do not catch up',async()=>{
  const f=fixture();await flush();await f.step(2000);
  f.click('[data-hero-toggle]');const progress=f.root.style.getPropertyValue('--hero-progress');
  await f.step(9000);assert.equal(f.root.style.getPropertyValue('--hero-progress'),progress);
  f.click('[data-hero-toggle]');f.hide(true);await f.step(10000);assert.equal(f.selected(),'0');
  f.hide(false);await f.step(100);assert.equal(f.selected(),'0');
  f.root.closest('main').hidden=true;await flush();await f.step(10000);assert.equal(f.selected(),'0');
  f.root.closest('main').hidden=false;await flush();await f.step(5200);assert.equal(f.selected(),'1');
  f.cleanup();f.window.close();
});
test('reduced motion is static, manual selection instant, preference changes never restart autoplay',async()=>{
  const f=fixture({reduced:true});await flush();await f.step(20000);assert.equal(f.selected(),'0');
  assert.equal(f.root.querySelector('[data-hero-toggle]').disabled,true);
  f.click('[data-hero-step="1"]');await flush();assert.equal(f.selected(),'1');assert.equal(f.root.querySelectorAll('picture').length,1);
  f.media.matches=false;f.media.dispatchEvent(new f.window.Event('change'));await f.step(10000);assert.equal(f.selected(),'1');
  f.click('[data-hero-toggle]');await f.step(7100);assert.equal(f.selected(),'2');
  f.media.matches=true;f.media.dispatchEvent(new f.window.Event('change'));assert.equal(f.root.querySelectorAll('picture').length,1);
  f.cleanup();f.window.close();
});
test('failed images are skipped, and zero usable images retain a static readable shell',async()=>{
  const f=fixture({fail:[1]});await flush();await f.step(7100);assert.equal(f.selected(),'2');f.cleanup();f.window.close();
  const empty=fixture({fail:[0,1,2]});await flush();await flush();assert.equal(empty.root.querySelectorAll('picture').length,0);assert.equal(empty.frames.size,0);assert.equal(empty.root.querySelector('[data-hero-toggle]').disabled,true);empty.cleanup();empty.window.close();
});
test('keyboard focus temporarily pauses without overriding an explicit pause',async()=>{
  const f=fixture();await flush();f.root.querySelector('[data-hero-step="1"]').focus();await f.step(15000);assert.equal(f.selected(),'0');
  f.click('[data-hero-toggle]');f.root.querySelector('[data-hero-step="1"]').blur();await f.step(15000);assert.equal(f.selected(),'0');
  f.cleanup();f.window.close();
});
