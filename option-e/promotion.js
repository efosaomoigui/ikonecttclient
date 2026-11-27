// A non-modal, dismissible campaign flyout. No tracking or customer data is stored.
export function mountPromotion(root,{fetcher=(...args)=>fetch(...args),storage,random=Math.random,now=Date.now,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const doc=root.ownerDocument,win=doc.defaultView;try{storage??=win.localStorage;}catch{}
 let stopped=false,timer,expiry,panel,shown=false,controller=new AbortController();const timeout=setTimer(()=>controller.abort(),8000);
 const allowed=()=>['home','residential','business','about'].includes(root.dataset.route||'home')&&!doc.hidden&&!root.querySelector('dialog[open],[role="dialog"]:not([hidden]):not([aria-hidden="true"])')&&!doc.activeElement?.matches('input,textarea,select');
 const close=()=>{if(panel?.contains(doc.activeElement))doc.activeElement.blur();panel?.remove();panel=null;};
 const keyboard=e=>{if(e.key==='Escape'&&panel&&!root.querySelector('[role="dialog"]:not([hidden])'))close();};
 const reconcile=()=>{if(panel&&!allowed())close();};
 const observer=new win.MutationObserver(reconcile);observer.observe(root,{attributes:true,attributeFilter:['data-route','hidden','open'],subtree:true});
 doc.addEventListener('keydown',keyboard);doc.addEventListener('visibilitychange',reconcile);
 const base=String(globalThis.__IKONECTT_PUBLIC_CONFIG__?.apiBase||'/api/v1').replace(/\/$/,'');
 void fetcher(base+'/promotions/active',{cache:'no-store',credentials:'same-origin',signal:controller.signal}).then(async response=>{
  if(!response.ok)return;const {promotion:p}=await response.json();
  if(stopped||!p?.published||!p.version||typeof p.title!=='string'||typeof p.imageAlt!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(p.imageData||''))return;
  if(p.startsAt&&(!Number.isFinite(Date.parse(p.startsAt))||Date.parse(p.startsAt)>now()))return;
  if(p.endsAt&&(!Number.isFinite(Date.parse(p.endsAt))||Date.parse(p.endsAt)<=now()))return;
  const key='ikonectt:promotion:'+p.version;
  try{const last=Number(storage?.getItem(key));if(last&&now()-last<86400000)return;}catch{}
  const show=(attempt=0)=>{if(stopped||shown)return;if(p.endsAt&&Date.parse(p.endsAt)<=now())return;if(!allowed()){if(attempt<30)timer=setTimer(()=>show(attempt+1),10000);return;}
   const image=doc.createElement('img');image.alt=p.imageAlt;image.src=p.imageData;image.decoding='async';
   image.onerror=close;
   panel=doc.createElement('aside');panel.className='e-promotion';panel.setAttribute('aria-label',p.title);
   const dismiss=doc.createElement('button');dismiss.type='button';dismiss.className='e-promotion-close';dismiss.setAttribute('aria-label','Close promotion');dismiss.textContent='×';dismiss.onclick=close;
   if(p.actionLabel&&p.actionUrl){let href;try{const u=new URL(p.actionUrl,win.location.href);if(p.actionUrl.startsWith('#/')||u.protocol==='https:'&&!u.username&&!u.password)href=u.href;}catch{}if(href){const action=doc.createElement('a');action.href=href;action.textContent=p.actionLabel;action.className='e-promotion-action';if(new URL(href).origin!==win.location.origin){action.target='_blank';action.rel='noopener noreferrer';}action.onclick=close;panel.append(action);}}
   panel.prepend(image);panel.append(dismiss);root.append(panel);shown=true;if(p.endsAt)expiry=setTimer(close,Math.min(2147483647,Date.parse(p.endsAt)-now()));try{storage?.setItem(key,String(now()));}catch{}
  };
  timer=setTimer(()=>show(),5000);
 }).catch(()=>{}).finally(()=>clearTimer(timeout));
 return ()=>{stopped=true;controller.abort();clearTimer(timeout);clearTimer(timer);clearTimer(expiry);observer.disconnect();doc.removeEventListener('keydown',keyboard);doc.removeEventListener('visibilitychange',reconcile);close();};
}
