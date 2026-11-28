import {prepareEnquiryHandoff,clearEnquiryHandoff} from './enquiry-handoff.js';
import {createAssistantFlows} from './assistant-flows.js';
import {normalizePhone,phoneCountry,formatPhoneInput} from './phone-input.js';
import {supportContacts,initializeSupportContacts} from './public-data.js';
import {escapeHTML as esc} from './forms.js';
import {getPlan,planName,priceLabel,pricePeriod,previewPricingNote} from './catalogue.js';
import {parseRoute} from './routes.js';
import {demoProvider,publicContext,contextActions,initialActions,validateIntroduction} from './assistant-engine.js';
import {shellHTML,introductionHTML,messageHTML,actionHTML,planPickerHTML,welcomeActions,guestActions} from './assistant-view.js';

const redLogo=new URL('../assets/logos/ikonectt_transparent.png',import.meta.url).href;
const whiteLogo=new URL('../assets/logos/ikonectt_white_transparent.png',import.meta.url).href;

export function mountAssistant({root,template,getContext,navigate,provider=demoProvider,guest=false,publicClient=null}) {
  const host=document.createElement('aside');host.className='ik-assistant';host.setAttribute('aria-label','Ikonectt support assistant');
  host.innerHTML=shellHTML(['b','c','e'].includes(template)?whiteLogo:redLogo);root.append(host);
  const find=selector=>host.querySelector(selector);
  const panel=find('dialog'),launcher=find('[data-launcher]'),invitation=find('[data-invitation]');
  const intro=find('[data-introduction]'),conversation=find('[data-conversation]'),messages=find('[data-messages]');
  const guidance=find('[data-guidance]'),composer=find('[data-composer]'),input=composer.elements.namedItem('message');
  const abort=new AbortController(),options={signal:abort.signal};
  let started=false,localPlan='',localKey='',savedOverflow='',open=false,invitationTimer,positionFrame;
  let revision=0,busy=false,contactDetails=null;
  const history=[];let liveFlows;
  function scrollLatest(){const scroll=find('[data-scroll]');scroll.scrollTop=scroll.scrollHeight;}
  function scrollFlow(){
    const scroll=find('[data-scroll]'),anchor=messages.lastElementChild||guidance;
    scroll.scrollTop+=anchor.getBoundingClientRect().top-scroll.getBoundingClientRect().top-12;
  }
  const supportActions=()=>[{label:'Contact Support',route:'support/contact'},...(supportContacts.whatsappUrl?[{label:'Chat on WhatsApp',href:supportContacts.whatsappUrl}]:[]),{label:'My Ikonectt',href:'https://portal.ikonectt.com'}];
  function syncWhatsApp(){if(abort.signal.aborted||!supportContacts.whatsappUrl)return;const link=find('[data-whatsapp]');link.href=supportContacts.whatsappUrl;link.hidden=false;}
  if(guest){initializeSupportContacts();syncWhatsApp();if(publicClient)void publicClient.contacts().then(syncWhatsApp).catch(syncWhatsApp);}

  function context(){
    const current=publicContext(getContext());
    const key=`${current.path}|${current.audience}|${current.plan}`;
    if(localKey!==key){localPlan='';localKey=key;}
    if(localPlan&&getPlan(localPlan)){const plan=getPlan(localPlan);return {...current,plan:plan.id,audience:plan.audience};}
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
    // Option E keeps its support controls anchored; page links must not move them.
    if(template==='e'){host.style.setProperty('--assistant-dock-bottom','20px');return;}
    const width=window.innerWidth,height=window.innerHeight;
    let bottom=20;
    const dockHeight=guest?124:56;
    const right=width-20,left=right-56;
    const controls=[...root.querySelectorAll('a,button,input,select,textarea,summary')].filter(el=>!host.contains(el)&&el.getClientRects().length);
    // Lift the small dock above nearby page controls, including footer links.
    for(let count=0;count<5;count++){
      const top=height-bottom-dockHeight;
      const hit=controls.map(el=>el.getBoundingClientRect()).find(r=>r.left<right+8&&r.right>left-8&&r.top<top+dockHeight+8&&r.bottom>top-8);
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
    if(started){if(!liveFlows?.isActive())updateContext();input.focus({preventScroll:true});}else intro.querySelector('input')?.focus();
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
    latest.innerHTML=actionsHTML(response.actions||[])+(response.plans?planPickerHTML(response.plans):'')+(response.contextual?'<details class="ik-assistant-context"><summary>On this page</summary>'+actionsHTML(response.contextual)+'</details>':'');
    guidance.append(latest);
    if(!guest){const menu=document.createElement('details');menu.className='ik-assistant-all-topics';menu.innerHTML='<summary>All support topics</summary>'+actionsHTML(initialActions);guidance.append(menu);}

    const scroll=find('[data-scroll]');scroll.scrollTop=scroll.scrollHeight;
  }
  function beginEnquiry(purpose='Enquiry'){
    liveFlows?.pause();
    const route=/installation/i.test(purpose)?'residential/installation':/quote|business/i.test(purpose)?'business/quote':/coverage|address/i.test(purpose)?'coverage/verification':/fault/i.test(purpose)?'support/fault':/service request/i.test(purpose)?'support/service-request':/support/i.test(purpose)?'support/contact':'contact';
    append('assistant','Please use our '+(/quote/i.test(purpose)?'business quotation':/installation/i.test(purpose)?'installation request':'enquiry')+' page. Your name and phone number will be filled in for this session.');
    guide({actions:[{label:/fault/i.test(purpose)?'Report a fault':/coverage|address/i.test(purpose)?'Make a coverage enquiry':/installation/i.test(purpose)?'Request installation':/quote|business/i.test(purpose)?'Request a business quote':/support/i.test(purpose)?'Contact Support':'Make an enquiry',route}]});
  }
  async function respond(text,intent){
    if(busy)return;
    if(guest&&['enquiry-details','enquiry'].includes(intent)){beginEnquiry();return;}
    if(guest&&liveFlows&&await liveFlows.handle(text,intent))return;
    const currentRevision=revision;busy=true;composer.querySelector('button').disabled=true;
    const typing=document.createElement('p');typing.className='ik-assistant-typing';typing.setAttribute('role','status');typing.textContent='Finding helpful information…';messages.append(typing);scrollLatest();
    try{
      const response=await provider.respond({text,intent,context:context(),...(guest?{history:history.slice(-8)}:{})});
      if(currentRevision!==revision)return;
      if(guest&&liveFlows){
        if(response.intent==='coverage'||/which (?:area|street|estate).*check/i.test(response.text)){await liveFlows.handle('','coverage');return;}
        if(response.intent==='plans'||/are you looking for residential or business/i.test(response.text)){await liveFlows.handle('','plans');return;}
        if(response.intent==='enquiry'||/what would you like to enquire about/i.test(response.text)){append('assistant',response.text);guide({actions:[{label:'New connection enquiry',intent:'enquiry-details'},{label:'Check coverage',intent:'coverage'},{label:'Plans and pricing',intent:'plans'},{label:'Existing service enquiry',intent:'support-enquiry'}]});return;}
      }
      if(guest){history.push({role:'user',content:String(text||intent||'Help').slice(0,1000)},{role:'assistant',content:response.text.slice(0,1000)});history.splice(0,Math.max(0,history.length-8));}
      if(guest&&(response.mode==='fallback'||/support|human|escalat|contact/.test(response.intent||intent||text))){response.actions=[...(response.actions||[]),...supportActions()].filter((action,index,list)=>list.findIndex(other=>(other.href||other.route||other.intent)===(action.href||action.route||action.intent))===index);}
      append('assistant',response.text);guide(response);
    }catch{
      if(currentRevision!==revision)return;
      append('assistant','Automated help is temporarily unavailable. You can still explore plans, search coverage, make an enquiry or contact customer support.');
      guide({actions:[{label:'View Plans',route:context().audience+'/plans'},{label:'Check Coverage',route:'coverage'},{label:'Make an enquiry',intent:'enquiry'},...supportActions()]});
    }finally{typing.remove();if(currentRevision===revision){busy=false;composer.querySelector('button').disabled=!input.value.trim();scrollLatest();}}
  }
  function start(){
    const form=intro.querySelector('form'),name=form.elements.namedItem('name'),phone=form.elements.namedItem('phone');
    const errors=validateIntroduction({name:name.value,phone:phone.value,skipPhone:guest});
    let normalizedPhone=phone.value;
    if(guest)try{normalizedPhone=normalizePhone(phone.value,form.elements.country.value);}catch(error){errors.phone=error.message;}
    for(const [key,control] of [['name',name],['phone',phone]]){
      control.setAttribute('aria-invalid',String(Boolean(errors[key])));
      find('#ik-assistant-'+key+'-error').textContent=errors[key]||'';
    }
    const summary=find('[data-errors]');summary.hidden=!Object.keys(errors).length;
    if(!summary.hidden){summary.textContent='Please check your name and phone number below.';(errors.name?name:phone).focus();return;}
    const firstName=name.value.trim().split(/\s+/)[0],enquiry=form.elements.namedItem('enquiry').value.trim();
    if(guest)contactDetails={name:name.value.trim(),phone:normalizedPhone,country:form.elements.country.value,message:enquiry};
    // Retain contacts only in this chat's memory; never send them to the model.
    form.reset();intro.replaceChildren();intro.hidden=true;conversation.hidden=false;started=true;panel.dataset.stage='conversation';
    append('assistant',`Hi ${firstName}! Welcome to Ikonectt.\n\nHow can ${guest?'we':'I'} help you today?`);
    updateContext();find('[data-scroll]').scrollTop=0;input.focus({preventScroll:true});
    if(enquiry){append('visitor',enquiry);void respond(enquiry);}
  }
  function reset(){
    clearEnquiryHandoff();revision++;busy=false;liveFlows?.reset();history.splice(0);contactDetails=null;started=false;localPlan='';messages.replaceChildren();guidance.replaceChildren();composer.reset();composer.querySelector('button').disabled=true;
    conversation.hidden=true;panel.dataset.stage='welcome';intro.hidden=false;intro.innerHTML=introductionHTML(template,guest);
    if(open)intro.querySelector('input')?.focus();
  }
  function updateContext(){
    if(!started)return;
    const current=context(),plan=getPlan(current.plan);
    if(liveFlows?.isActive())return;
    guide({actions:guest?guestActions(current):welcomeActions(current),contextual:current.path!=='home'?contextActions(current):null});
    if(plan){
      const label=document.createElement('p');label.className='ik-assistant-selected';
      label.textContent=`Selected: ${planName(plan)} · ${plan.speedMbps} Mbps · ${priceLabel(plan)}${pricePeriod(plan)}. ${previewPricingNote}`;
      guidance.prepend(label);
    }
  }
  host.addEventListener('click',event=>{
    const target=event.target.closest('button,a');if(!target)return;
    if(target.matches('[data-launcher],[data-open]'))show();
    else if(target.matches('[data-dismiss]'))dismiss();
    else if(target.matches('[data-close]'))close();
    else if(target.matches('[data-restart]')){reset();}
    else if(target.matches('[data-help],[data-assistant-route]')){
      event.preventDefault();const route=target.getAttribute('href').replace(/^#\//,'');
      if(guest)prepareEnquiryHandoff(route,{...contactDetails,message:[contactDetails?.message,liveFlows?.enquiryDefaults().message].filter(Boolean).join('\n')});
      close(false);navigate(route);
    }    else if(target.dataset.intent){if(busy)return;append('visitor',target.textContent.trim());void respond('',target.dataset.intent);input.focus();}
    else if(target.dataset.selectPlan){
      const plan=getPlan(target.dataset.selectPlan),current=publicContext(getContext());
      localKey=`${current.path}|${current.audience}|${current.plan}`;localPlan=plan.id;
      append('visitor',`Explore ${planName(plan)} · ${plan.speedMbps} Mbps`);
      append('assistant',`${planName(plan)} · ${plan.speedMbps} Mbps · ${priceLabel(plan)}${pricePeriod(plan)}. ${guest?'':previewPricingNote}`);
      guide({actions:guest?[{label:'Check coverage',intent:'coverage'},{label:'Enquire about this plan',intent:'enquiry-details'},{label:'Compare other plans',intent:plan.audience}]:contextActions({...context(),path:plan.audience+'/plans'})});input.focus();
    }
  },options);
  host.addEventListener('submit',event=>{
    event.preventDefault();
    if(event.target.matches('[data-intro-form]'))start();
    if(event.target===composer){const text=input.value.trim();if(!text||busy)return;input.value='';composer.querySelector('button').disabled=true;append('visitor',text);void respond(text);input.focus();}
  },options);
  host.addEventListener('change',event=>{if(event.target.matches('[name=country]'))phoneCountry(event.target.form);},options);
  host.addEventListener('focusout',event=>{if(guest&&event.target.matches('#ik-assistant-phone'))formatPhoneInput(event.target.form);},options);
  input.addEventListener('input',()=>composer.querySelector('button').disabled=busy||!input.value.trim(),options);
  panel.addEventListener('cancel',event=>{event.preventDefault();close();},options);
  panel.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key==='Tab'){
      const controls=[...panel.querySelectorAll('a,button,input,select,textarea,summary')].filter(el=>!el.disabled&&!el.closest('[hidden]')&&(!el.closest('details:not([open])')||el.matches('summary')));
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
  if(guest&&publicClient)liveFlows=createAssistantFlows({client:publicClient,guidance,context,append,beginEnquiry,signal:abort.signal,scroll:scrollFlow,
    setBusy(value){busy=value;composer.querySelector('button').disabled=value||!input.value.trim();},
    render(html,actions){guide({actions});guidance.insertAdjacentHTML('afterbegin',html);scrollFlow();}});
  reset();viewport();placeLauncher();
  invitationTimer=setTimeout(dismiss,12000);
  return {updateContext,destroy(){clearEnquiryHandoff();revision++;liveFlows?.destroy();close(false);abort.abort();clearTimeout(invitationTimer);if(positionFrame)window.cancelAnimationFrame(positionFrame);host.remove();}};
}
