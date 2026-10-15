import {getPlan,planName,priceLabel,previewPricingNote} from './catalogue.js';
import {parseRoute} from './routes.js';
import {demoProvider,publicContext,contextActions,initialActions,validateIntroduction} from './assistant-engine.js';
import {shellHTML,introductionHTML,messageHTML,actionHTML,planPickerHTML,welcomeActions} from './assistant-view.js';

const redLogo=new URL('../assets/logos/ikonectt_transparent.png',import.meta.url).href;
const whiteLogo=new URL('../assets/logos/ikonectt_white_transparent.png',import.meta.url).href;

export function mountAssistant({root,template,getContext,navigate,provider=demoProvider}) {
  const host=document.createElement('aside');host.className='ik-assistant';host.setAttribute('aria-label','Ikonectt support assistant');
  host.innerHTML=shellHTML(['b','c','e'].includes(template)?whiteLogo:redLogo);root.append(host);
  const find=selector=>host.querySelector(selector);
  const panel=find('dialog'),launcher=find('[data-launcher]'),invitation=find('[data-invitation]');
  const intro=find('[data-introduction]'),conversation=find('[data-conversation]'),messages=find('[data-messages]');
  const guidance=find('[data-guidance]'),composer=find('[data-composer]'),input=composer.elements.namedItem('message');
  const abort=new AbortController(),options={signal:abort.signal};
  let started=false,localPlan='',localKey='',savedOverflow='',open=false,invitationTimer,positionFrame;
  let revision=0;
  function context(){
    const current=publicContext(getContext());
    const key=`${current.path}|${current.audience}|${current.plan}`;
    if(localKey!==key){localPlan='';localKey=key;}
    if(localPlan){const plan=getPlan(localPlan);return {...current,plan:plan.id,audience:plan.audience};}
    return current;
  }
  function dismiss(){invitation.hidden=true;clearTimeout(invitationTimer);}
  function viewport(){
    const visible=window.visualViewport;
    panel.style.setProperty('--assistant-viewport-height',(visible?.height||window.innerHeight)+'px');
    panel.style.setProperty('--assistant-viewport-top',(visible?.offsetTop||0)+'px');
  }
  function placeLauncher(){
    if(open)return;
    const width=window.innerWidth,height=window.innerHeight;
    let bottom=20;
    const right=width-20,left=right-56;
    const controls=[...root.querySelectorAll('a,button,input,select,textarea,summary')].filter(el=>!host.contains(el)&&el.getClientRects().length);
    // Lift the small dock above nearby page controls, including footer links.
    for(let count=0;count<5;count++){
      const top=height-bottom-56;
      const hit=controls.map(el=>el.getBoundingClientRect()).find(r=>r.left<right+8&&r.right>left-8&&r.top<top+64&&r.bottom>top-8);
      if(!hit)break;
      bottom=Math.min(Math.max(20,height-hit.top+12),Math.max(20,height*0.4));
    }
    host.style.setProperty('--assistant-dock-bottom',bottom+'px');
  }
  function show(){
    if(open)return;
    dismiss();viewport();savedOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    open=true;launcher.hidden=true;launcher.setAttribute('aria-expanded','true');
    panel.setAttribute('aria-modal','true');
    if(typeof panel.showModal==='function')panel.showModal();else panel.setAttribute('open','');
    if(started){updateContext();input.focus();}else intro.querySelector('input')?.focus();
  }
  function close(restoreFocus=true){
    if(!open)return;
    open=false;
    if(typeof panel.close==='function')panel.close();else panel.removeAttribute('open');
    launcher.hidden=false;launcher.setAttribute('aria-expanded','false');
    document.documentElement.style.overflow=savedOverflow;
    placeLauncher();if(restoreFocus)launcher.focus({preventScroll:true});
  }
  function append(role,text){
    const item=document.createElement('div');
    const time=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(new Date());
    item.innerHTML=messageHTML({role,text,time},['c','e'].includes(template)?whiteLogo:redLogo);messages.append(item.firstElementChild);
    const scroll=find('[data-scroll]');scroll.scrollTop=scroll.scrollHeight;
  }
  function actionsHTML(actions){return `<div class="ik-assistant-actions">${actions.map(actionHTML).join('')}</div>`;}
  function guide(response){
    guidance.replaceChildren();
    const latest=document.createElement('div');latest.className='ik-assistant-next';
    latest.innerHTML=actionsHTML(response.actions)+(response.plans?planPickerHTML(response.plans):'')+(response.contextual?'<details class="ik-assistant-context"><summary>On this page</summary>'+actionsHTML(response.contextual)+'</details>':'');
    guidance.append(latest);
    const menu=document.createElement('details');menu.className='ik-assistant-all-topics';
    menu.innerHTML='<summary>All support topics</summary>'+actionsHTML(initialActions);
    guidance.append(menu);
    const scroll=find('[data-scroll]');scroll.scrollTop=scroll.scrollHeight;
  }
  async function respond(text,intent){
    const currentRevision=revision;
    const response=await provider.respond({text,intent,context:context()});
    if(currentRevision!==revision)return;
    append('assistant',response.text);guide(response);
  }
  function start(){
    const form=intro.querySelector('form'),name=form.elements.namedItem('name'),phone=form.elements.namedItem('phone');
    const errors=validateIntroduction({name:name.value,phone:phone.value});
    for(const [key,control] of [['name',name],['phone',phone]]){
      control.setAttribute('aria-invalid',String(Boolean(errors[key])));
      find('#ik-assistant-'+key+'-error').textContent=errors[key]||'';
    }
    const summary=find('[data-errors]');summary.hidden=!Object.keys(errors).length;
    if(!summary.hidden){summary.textContent='Please check your name and phone number below.';(errors.name?name:phone).focus();return;}
    const firstName=name.value.trim().split(/\s+/)[0],enquiry=form.elements.namedItem('enquiry').value.trim();
    // Clear the entire form immediately; the phone is never needed by the provider.
    form.reset();intro.replaceChildren();intro.hidden=true;conversation.hidden=false;started=true;panel.dataset.stage='conversation';
    append('assistant',`Hi ${firstName}! Welcome to Ikonectt.\n\nHow can I help you today?`);
    updateContext();find('[data-scroll]').scrollTop=0;input.focus();
    if(enquiry){append('visitor',enquiry);void respond(enquiry);}
  }
  function reset(){
    revision++;started=false;localPlan='';messages.replaceChildren();guidance.replaceChildren();composer.reset();composer.querySelector('button').disabled=true;
    conversation.hidden=true;panel.dataset.stage='welcome';intro.hidden=false;intro.innerHTML=introductionHTML();
    if(open)intro.querySelector('input').focus();
  }
  function updateContext(){
    if(!started)return;
    const current=context(),plan=getPlan(current.plan);
    guide({actions:welcomeActions(current),contextual:current.path!=='home'?contextActions(current):null});
    if(plan){
      const label=document.createElement('p');label.className='ik-assistant-selected';
      label.textContent=`Selected: ${planName(plan)} · ${plan.speedMbps} Mbps · ${priceLabel(plan)}/month. ${previewPricingNote}`;
      guidance.prepend(label);
    }
  }
  host.addEventListener('click',event=>{
    const target=event.target.closest('button,a');if(!target)return;
    if(target.matches('[data-launcher],[data-open]'))show();
    else if(target.matches('[data-dismiss]'))dismiss();
    else if(target.matches('[data-close]'))close();
    else if(target.matches('[data-restart]'))reset();
    else if(target.matches('[data-help],[data-assistant-route]')){
      event.preventDefault();const route=target.getAttribute('href').replace(/^#\//,'');
      close(false);navigate(route);
    }else if(target.dataset.intent){append('visitor',target.textContent.trim());void respond('',target.dataset.intent);input.focus();}
    else if(target.dataset.selectPlan){
      const plan=getPlan(target.dataset.selectPlan),current=publicContext(getContext());
      localKey=`${current.path}|${current.audience}|${current.plan}`;localPlan=plan.id;
      append('visitor',`Explore ${planName(plan)} · ${plan.speedMbps} Mbps`);
      append('assistant',`${planName(plan)} · ${plan.speedMbps} Mbps · ${priceLabel(plan)}/month. ${previewPricingNote}`);
      guide({actions:contextActions({...context(),path:plan.audience+'/plans'})});input.focus();
    }
  },options);
  host.addEventListener('submit',event=>{
    event.preventDefault();
    if(event.target.matches('[data-intro-form]'))start();
    if(event.target===composer){const text=input.value.trim();if(!text)return;input.value='';composer.querySelector('button').disabled=true;append('visitor',text);void respond(text);input.focus();}
  },options);
  input.addEventListener('input',()=>composer.querySelector('button').disabled=!input.value.trim(),options);
  panel.addEventListener('cancel',event=>{event.preventDefault();close();},options);
  panel.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key==='Tab'){
      const controls=[...panel.querySelectorAll('a,button,input,textarea,summary')].filter(el=>!el.disabled&&!el.closest('[hidden]')&&(!el.closest('details:not([open])')||el.matches('summary')));
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  },options);
  window.addEventListener('resize',()=>{viewport();placeLauncher();},options);
  window.visualViewport?.addEventListener('resize',viewport,options);
  window.visualViewport?.addEventListener('scroll',viewport,options);
  window.addEventListener('scroll',()=>{
    dismiss();
    if(positionFrame||!window.requestAnimationFrame)return;
    positionFrame=window.requestAnimationFrame(()=>{positionFrame=0;placeLauncher();});
  },{...options,passive:true});
  reset();viewport();placeLauncher();
  invitationTimer=setTimeout(dismiss,12000);
  return {updateContext,destroy(){revision++;close(false);abort.abort();clearTimeout(invitationTimer);if(positionFrame)window.cancelAnimationFrame(positionFrame);host.remove();}};
}
