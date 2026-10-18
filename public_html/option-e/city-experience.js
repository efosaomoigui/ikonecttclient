export const cityMessages=['Connectivity without limits.','A city powered by connection.','Your world. Always connected.'];
export const canAnimate=state=>state.visible&&state.onscreen&&!state.reduced&&!state.paused&&!state.failed;

export function mountCityExperience({hero,root,loadCity=()=>import('./city-three.js?v=4'),delay=700}){
  if(!hero)return {destroy(){}};
  const win=root.ownerDocument.defaultView,doc=root.ownerDocument,abort=new win.AbortController(),opts={signal:abort.signal};
  const reduced=win.matchMedia('(prefers-reduced-motion:reduce)'),mobile=win.matchMedia('(max-width:767px)').matches;
  const constrained=Boolean(win.navigator.connection?.saveData)||(win.navigator.deviceMemory&&win.navigator.deviceMemory<=2)||(win.navigator.hardwareConcurrency&&win.navigator.hardwareConcurrency<=2);
  const forcedOff=new URL(win.location.href).searchParams.get('e-city')==='off';
  const state={visible:!doc.hidden,onscreen:root.dataset.route==='home',reduced:reduced.matches,paused:false,failed:false};
  const field=doc.createElement('div');field.className='e-city-field';field.setAttribute('aria-hidden','true');
  field.innerHTML='<img class="e-city-fallback" src="'+new URL('./city-fallback.svg',import.meta.url).href+'" width="1200" height="650" alt="">';hero.append(field);
  hero.dataset.cityState=reduced.matches||constrained||forcedOff?'fallback':'opening';
  const heading=hero.querySelector('h1'),original=heading?.textContent||cityMessages[0];
  if(heading){heading.classList.add('e-headline');heading.setAttribute('aria-label',original);heading.replaceChildren(...cityMessages.map((text,i)=>{const span=doc.createElement('span');span.textContent=text;span.setAttribute('aria-hidden','true');span.dataset.active=String(i===0);return span;}));}
  const pause=doc.createElement('button');pause.className='e-city-pause';pause.type='button';pause.textContent='Pause city & text';pause.title='Pauses the city animation, red arc and changing headline.';pause.setAttribute('aria-pressed','false');pause.hidden=reduced.matches;hero.append(pause);
  let engine,loading=false,stopped=false,readyToLoad=false,raf=0,last=0,lastRender=0,elapsed=0,lastMessage=0,message=0,frameCount=0,renderTotal=0,sampleStart=0,sampleFrames=0,lastStats=0,simplified=false,lowFPSWindows=0;
  const started=win.performance.now();
  const metrics={frames:0,readyMs:null,drawCalls:0,triangles:0,meanRenderMs:0,sampledFPS:null,slowFrames:0,mode:mobile?'mobile':'desktop'};
  function publish(){hero.dataset.cityMetrics=JSON.stringify(metrics);}
  function fail(reason){state.failed=true;hero.dataset.cityState='fallback';hero.dataset.cityReason=reason;cancel();engine?.destroy();engine=null;publish();}
  function cancel(){if(raf){win.cancelAnimationFrame(raf);raf=0;}last=0;lastRender=0;sampleFrames=0;}
  function current(){state.visible=!doc.hidden;state.onscreen=root.dataset.route==='home'&&intersecting;return canAnimate(state);}
  let intersecting=true;
  async function load(){
    if(loading||engine||state.failed||!readyToLoad||!current()||constrained||forcedOff)return;
    loading=true;hero.dataset.cityState='loading';
    try{
      const module=await loadCity();if(stopped)return;
      if(!current()){loading=false;hero.dataset.cityState=state.reduced?'fallback':'opening';return;}
      engine=await module.createCityRenderer(field,{mobile});if(stopped){engine.destroy();return;}
      metrics.readyMs=Math.round(win.performance.now()-started);loading=false;publish();update();
    }catch(error){loading=false;if(!stopped)fail('webgl-unavailable');}
  }
  function frame(now){
    raf=0;if(!current()||stopped||!engine)return;
    if(!last){last=now;lastRender=now;sampleStart=now;}
    const delta=now-last,interval=1000/30;
    if(delta>=interval-.4){
      last=now-(delta>=interval?delta%interval:0);elapsed+=Math.min(now-lastRender,100)/1000;lastRender=now;
      const before=win.performance.now(),info=engine.render(elapsed),cost=win.performance.now()-before;
      Object.assign(metrics,info);frameCount++;sampleFrames++;renderTotal+=cost;metrics.frames=frameCount;metrics.meanRenderMs=Math.round(renderTotal/frameCount*100)/100;if(cost>16)metrics.slowFrames++;
      if(hero.dataset.cityState!=='ready')hero.dataset.cityState='ready';
      if(elapsed-lastMessage>=8){lastMessage=elapsed;message=(message+1)%cityMessages.length;heading?.querySelectorAll('span').forEach((span,i)=>span.dataset.active=String(i===message));}
      if(now-sampleStart>=3000){
        metrics.sampledFPS=Math.round(sampleFrames*10000/(now-sampleStart))/10;sampleFrames=0;sampleStart=now;
        lowFPSWindows=metrics.sampledFPS<18?lowFPSWindows+1:0;
        if(lowFPSWindows>=2){
          if(!simplified){engine.simplify();simplified=true;metrics.simplified=true;lowFPSWindows=0;}
          else{fail('frame-rate-budget');return;}
        }
      }
      if(frameCount>=60&&metrics.meanRenderMs>12){if(!simplified){engine.simplify();simplified=true;metrics.simplified=true;renderTotal=0;frameCount=0;}else{fail('render-budget');return;}}
      if(now-lastStats>1000){lastStats=now;publish();}
    }
    raf=win.requestAnimationFrame(frame);
  }
  function update(){
    const active=current();hero.dataset.cityPaused=String(!state.visible||!state.onscreen||state.reduced||state.paused);pause.hidden=state.reduced;
    if(active){if(engine&&!raf)raf=win.requestAnimationFrame(frame);else load();}else cancel();
  }
  pause.addEventListener('click',()=>{state.paused=!state.paused;pause.textContent=state.paused?'Resume city & text':'Pause city & text';pause.title=state.paused?'Resumes the city animation, red arc and changing headline.':'Pauses the city animation, red arc and changing headline.';pause.setAttribute('aria-pressed',String(state.paused));update();},opts);
  doc.addEventListener('visibilitychange',update,opts);
  field.addEventListener('e:city-failed',()=>fail('context-lost'),opts);
  win.addEventListener('resize',()=>{engine?.resize();},opts);
  const onReduced=()=>{state.reduced=reduced.matches;if(state.reduced){hero.dataset.cityState='fallback';message=0;heading?.querySelectorAll('span').forEach((span,i)=>span.dataset.active=String(i===0));}else if(!state.failed&&!constrained&&!forcedOff){hero.dataset.cityState='opening';}update();};
  reduced.addEventListener?.('change',onReduced);
  const routeObserver=new win.MutationObserver(update);routeObserver.observe(root,{attributes:true,attributeFilter:['data-route']});
  const intersection=win.IntersectionObserver?new win.IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;update();},{threshold:.05}):null;intersection?.observe(hero);
  const timer=win.setTimeout(()=>{readyToLoad=true;update();},delay);
  if(forcedOff||constrained)hero.dataset.cityReason=forcedOff?'disabled-for-review':'device-budget';publish();update();
  return {destroy(){stopped=true;win.clearTimeout(timer);cancel();abort.abort();routeObserver.disconnect();intersection?.disconnect();reduced.removeEventListener?.('change',onReduced);engine?.destroy();field.remove();pause.remove();if(heading){heading.textContent=original;heading.classList.remove('e-headline');heading.removeAttribute('aria-label');}},state};
}
