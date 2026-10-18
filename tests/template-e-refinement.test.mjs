import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountSite} from '../shared/public-site.js';
import {mountVisuals} from '../shared/visuals.js';
import {pages} from '../shared/routes.js';
import {mountTemplateE} from '../option-e/refinement.js';
import {canAnimate,mountCityExperience} from '../option-e/city-experience.js';
import {heroAsset} from '../option-e/visual-map.js';

const tick=()=>new Promise(resolve=>setTimeout(resolve,8));
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url));
test('E refinement leaves A, D, the selector and shared application sources unchanged',()=>{
  const baseline=JSON.parse(read('docs/evidence/template-e-refinement/preservation.json'));
  for(const [path,expected] of Object.entries(baseline.files)){
    const buffer=read(path),value=/\.(js|css|html|tsx|ts|md|json)$/.test(path)?Buffer.from(buffer.toString().replace(/\r\n/g,'\n')):buffer;
    assert.equal(crypto.createHash('sha256').update(value).digest('hex'),expected,path);
  }
});

test('all E internal heroes receive contextual, non-geographic visuals without changing forms or copy',async()=>{
  const dom=new JSDOM('<div id="root"><main id="home"><h1>Home</h1></main></div>',{url:'http://preview.test/option-e/',pretendToBeVisual:true});
  const {window}=dom;
  for(const key of ['window','document','CustomEvent','FormData','AbortController'])globalThis[key]=key==='window'?window:window[key];
  window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
  const root=document.querySelector('#root'),home=document.querySelector('#home');
  const site=mountSite({root,home,template:'e'}),visuals=mountVisuals({root,home,template:'e'}),refinement=mountTemplateE({root,home});
  for(const [path,[heading,description]] of Object.entries(pages)){
    if(path==='home')continue;
    window.location.hash='#/'+path;await new Promise(resolve=>window.addEventListener('hashchange',resolve,{once:true}));await tick();
    const hero=root.querySelector('.ik-page-hero');assert.equal(hero.dataset.eRefined,heroAsset(path),path);
    if(!path.includes('/plans/demo-')){assert.equal(hero.querySelector('h1').textContent,heading);assert.equal(hero.querySelector('p').textContent,description);}
    assert.equal(root.querySelectorAll('form .e-hero-visual,.ik-plan-card .e-hero-visual,.ik-faq .e-hero-visual,.ik-visual-credit').length,0,path);
    assert.equal(root.querySelectorAll('.e-hero-visual').length,1,path);
  }
  refinement();visuals();site();dom.window.close();
});

function cityFixture({reject=false,reduced=false,saveData=false}={}){
  const dom=new JSDOM('<div id="root" data-template="e" data-route="home"><section class="hero"><div class="horizon"></div><h1>Connectivity without limits.</h1><a href="#coverage">Check Coverage</a></section></div>',{url:'http://preview.test/option-e/',pretendToBeVisual:true});
  const win=dom.window,root=win.document.querySelector('#root'),hero=root.querySelector('.hero');
  let hidden=false,id=0,time=0,destroyed=0,frames=0,io,change;
  Object.defineProperty(win.document,'hidden',{get:()=>hidden,configurable:true});
  Object.defineProperty(win.navigator,'hardwareConcurrency',{value:8});
  Object.defineProperty(win.navigator,'connection',{value:{saveData}});
  const media={matches:reduced,addEventListener:(_,fn)=>change=fn,removeEventListener(){}};
  win.matchMedia=q=>q.includes('reduced')?media:{matches:false};
  const queue=new Map();win.requestAnimationFrame=fn=>{queue.set(++id,fn);return id;};win.cancelAnimationFrame=n=>queue.delete(n);
  win.IntersectionObserver=class{constructor(callback){io=callback;}observe(){}disconnect(){}};
  const engine={render(){frames++;return {drawCalls:6,triangles:800};},resize(){},simplify(){},destroy(){destroyed++;}};
  let imports=0;
  const controller=mountCityExperience({root,hero,delay:0,loadCity:async()=>{imports++;if(reject)throw Error('WebGL unavailable');return {createCityRenderer:async()=>engine};}});
  return {dom,win,root,hero,queue,get imports(){return imports;},get frames(){return frames;},get destroyed(){return destroyed;},controller,
    step(n=1,interval=1000/60){for(let j=0;j<n;j++){time+=interval;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(time));}},
    hidden(value){hidden=value;win.document.dispatchEvent(new win.Event('visibilitychange'));},offscreen(value){io([{isIntersecting:!value}]);},reduce(value){media.matches=value;change();},
    close(){controller.destroy();dom.window.close();}};
}
test('city render loop targets 30 FPS and pauses for user, visibility, route and reduced motion',async()=>{
  const f=cityFixture();await tick();f.step(120);assert.ok(f.frames>=55&&f.frames<=61,f.frames);assert.equal(f.hero.dataset.cityState,'ready');
  const before=f.frames;f.hero.querySelector('button').click();f.step(60);assert.equal(f.frames,before);assert.equal(f.queue.size,0);
  f.hero.querySelector('button').click();f.step(5);assert.ok(f.frames>before);
  for(const pause of [()=>f.hidden(true),()=>f.offscreen(true),()=>f.reduce(true)]){pause();f.step(30);assert.equal(f.queue.size,0);}
  f.hidden(false);f.offscreen(false);f.reduce(false);f.step(5);assert.ok(f.queue.size);
  f.root.dataset.route='support';await tick();assert.equal(f.queue.size,0);
  f.close();assert.equal(f.destroyed,1);assert.equal(f.hero.querySelector('h1').textContent,'Connectivity without limits.');
});
test('WebGL failure keeps the arc, readable HTML and navigation with a static fallback',async()=>{
  const f=cityFixture({reject:true});await tick();assert.equal(f.hero.dataset.cityState,'fallback');assert.equal(f.hero.dataset.cityReason,'webgl-unavailable');assert.ok(f.hero.querySelector('.horizon'));assert.ok(f.hero.querySelector('a[href="#coverage"]'));assert.equal(f.queue.size,0);f.close();
});
test('normal opening keeps the flat fallback reserved for failure and reduced motion',async()=>{
  const f=cityFixture();assert.equal(f.hero.dataset.cityState,'opening');
  assert.equal(f.hero.querySelector('button').textContent,'Pause city & text');await tick();f.step(10);
  assert.equal(f.hero.dataset.cityState,'ready');f.reduce(true);assert.equal(f.hero.dataset.cityState,'fallback');
  f.reduce(false);f.step(10);assert.equal(f.hero.dataset.cityState,'ready');
  f.hero.querySelector('button').click();assert.equal(f.hero.querySelector('button').textContent,'Resume city & text');f.close();
});
test('headline dwell follows elapsed render time without accumulating scheduler remainder',async()=>{
  const f=cityFixture();await tick();f.step(450);
  assert.equal(f.hero.querySelector('[data-active=true]').textContent,'Connectivity without limits.');
  f.step(60);assert.equal(f.hero.querySelector('[data-active=true]').textContent,'A city powered by connection.');assert.equal(f.imports,1,'headline change must not reload the scene');f.close();
});
test('reduced motion and data-saving devices avoid loading Three.js',async()=>{
  for(const config of [{reduced:true},{saveData:true}]){const f=cityFixture(config);await tick();assert.equal(f.imports,0);assert.equal(f.hero.dataset.cityState,'fallback');assert.equal(f.queue.size,0);f.close();}
});

test('sustained low frame rate simplifies then restores the lightweight fallback',async()=>{
  const f=cityFixture();await tick();f.step(160,100);
  assert.equal(f.hero.dataset.cityState,'fallback');assert.equal(f.hero.dataset.cityReason,'frame-rate-budget');assert.equal(f.destroyed,1);assert.equal(f.queue.size,0);
  f.hero.querySelector('button').click();assert.equal(f.hero.dataset.cityPaused,'true');
  f.hero.querySelector('button').click();assert.equal(f.hero.dataset.cityPaused,'false');f.close();
});
test('rendering eligibility requires every lifecycle condition',()=>{
  const state={visible:true,onscreen:true,reduced:false,paused:false,failed:false};assert.ok(canAnimate(state));
  for(const key of ['visible','onscreen','reduced','paused','failed'])assert.equal(canAnimate({...state,[key]:!state[key]}),false,key);
});
