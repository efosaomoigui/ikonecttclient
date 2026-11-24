import {getPlan,planName,planOptions,planRoute,priceLabel,pricePeriod,plansFor} from './catalogue.js';
import {createPublicDataClient,loadWebsiteData,officialPortal,websiteData} from './public-data.js';
import {carouselHTML,comparisonHTML} from './plan-ui.js';
import {initializeCarousel} from './carousel.js';
import {pages,menus,parseRoute} from './routes.js';
import {company,publicContacts,faqs} from './content.js';
import {renderPage,filterFAQs,renderFAQResults,link} from './pages.js';
import {addressFields,validateForm,escapeHTML as esc} from './forms.js';
import {mountAssistant} from './assistant.js';

const redLogo=new URL('../assets/logos/ikonectt_transparent.png',import.meta.url).href;
const whiteLogo=new URL('../assets/logos/ikonectt_white_transparent.png',import.meta.url).href;
export function navigate(route,context={}) {
  window.dispatchEvent(new CustomEvent('ik:navigate',{detail:{route,context}}));
}
export function mountSite({root,home,template}) {
  if(!['a','b','c','d','e'].includes(template)) throw new Error('Unknown template');
  const abort=new AbortController(),opts={signal:abort.signal};
  const state={address:{},coverage:null,plan:'',audience:'residential',selectedPlans:{residential:'',business:''}};
  const originalTitle=home.dataset.originalTitle||document.title;
  const descriptionMeta=document.querySelector('meta[name="description"]')||document.head.appendChild(Object.assign(document.createElement('meta'),{name:'description'}));
  const originalDescription=descriptionMeta.content||pages.home[1];
  const publicRelease=template==='e'&&root.hasAttribute('data-public-release');
  const publicClient=publicRelease?createPublicDataClient():null;
  let coverageVersion=0,refreshing=false,lastRefresh=0;
  home.dataset.originalTitle=originalTitle;
  let previous='',menuTimer,hoverOpened=null;
  root.classList.add('ik-site');root.dataset.template=template;
  home.classList.add('ik-home');
  const header=document.createElement('header');header.className='ik-header';
  header.innerHTML=headerHTML(template);
  const skip=document.createElement('a');skip.href='#ik-main';skip.className='ik-skip';skip.dataset.skip='';skip.textContent='Skip to content';
  const main=document.createElement('main');main.id='ik-main';main.tabIndex=-1;main.hidden=true;
  const footer=document.createElement('footer');footer.className='ik-footer';footer.innerHTML=footerHTML();
  root.prepend(skip,header);root.append(main,footer);
  const assistant=mountAssistant({root,template,navigate,...(publicClient?{provider:{respond:publicClient.guidance}}:{}),getContext:()=>({path:parseRoute(window.location.hash).path,audience:state.audience,plan:state.plan})});
  const nav=header.querySelector('.ik-desktop-nav'),mobile=header.querySelector('.ik-mobile-button');
  function syncAudience(){
    root.dataset.audience=state.audience;
    header.querySelectorAll('[data-audience]').forEach(anchor=>{
      const active=anchor.dataset.audience===state.audience;anchor.dataset.active=String(active);
      if(active)anchor.setAttribute('aria-current','true');else anchor.removeAttribute('aria-current');
    });
    assistant.updateContext();
  }
  const carousels=[...home.querySelectorAll('[data-home-plan-carousel]')].map(host=>{
    host.innerHTML=carouselHTML(state.audience);
    return initializeCarousel(host.querySelector('[data-plan-carousel]'),{signal:abort.signal,onAudienceChange:audience=>{state.audience=audience;state.plan=state.selectedPlans[audience];syncAudience();}});
  });

  function closeMenus(returnFocus=false){
    const open=header.querySelector('.ik-nav-trigger[aria-expanded=true]');hoverOpened=null;
    header.querySelectorAll('.ik-nav-trigger').forEach(button=>button.setAttribute('aria-expanded','false'));
    header.querySelectorAll('.ik-mega').forEach(panel=>panel.hidden=true);
    if(returnFocus&&open)open.focus();
  }
  function openMenu(button,fromHover=false){
    closeMenus();hoverOpened=fromHover?button:null;button.setAttribute('aria-expanded','true');
    header.querySelector('#'+button.getAttribute('aria-controls')).hidden=false;
  }
  function closeMobile(){nav.classList.remove('is-open');mobile.setAttribute('aria-expanded','false');}
  for(const group of header.querySelectorAll('.ik-nav-group')){
    const button=group.querySelector('.ik-nav-trigger');
    button.addEventListener('click',()=>button.getAttribute('aria-expanded')==='true'&&hoverOpened!==button?closeMenus():openMenu(button),opts);
    group.addEventListener('pointerenter',()=>{clearTimeout(menuTimer);if(window.matchMedia('(min-width:1024px) and (hover:hover)').matches&&button.getAttribute('aria-expanded')!=='true')openMenu(button,true);},opts);
    button.addEventListener('keydown',event=>{
      if(event.key==='ArrowDown'){event.preventDefault();openMenu(button);group.querySelector('.ik-mega a')?.focus();}
      if(['ArrowLeft','ArrowRight'].includes(event.key)){
        event.preventDefault();const buttons=[...header.querySelectorAll('.ik-nav-trigger')],index=buttons.indexOf(button);
        buttons[(index+(event.key==='ArrowRight'?1:buttons.length-1))%buttons.length].focus();
      }
    },opts);
  }
  header.addEventListener('pointerleave',()=>{if(window.matchMedia('(min-width:1024px) and (hover:hover)').matches)menuTimer=setTimeout(()=>closeMenus(),180);},opts);
  header.addEventListener('pointerenter',()=>clearTimeout(menuTimer),opts);
  mobile.addEventListener('click',()=>{const open=mobile.getAttribute('aria-expanded')!=='true';mobile.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);if(!open)closeMenus();},opts);
  document.addEventListener('click',event=>{if(!header.contains(event.target)){closeMenus();closeMobile();}},opts);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenus(true);if(nav.classList.contains('is-open')){closeMobile();mobile.focus();}}},opts);
  root.addEventListener('click',event=>{
    const target=event.target.closest('a,button');if(!target)return;
    if(publicRelease&&(target.matches('a[href="#portal"]')||target.matches('#home-my-ikonectt'))){event.preventDefault();window.open(officialPortal,'_blank','noopener,noreferrer');return;}
    if(target.hasAttribute('data-skip')){event.preventDefault();const content=home.hidden?main:home;content.tabIndex=-1;content.focus();content.scrollIntoView();return;}
    if(target.dataset.errorFocus){event.preventDefault();document.getElementById(target.dataset.errorFocus)?.focus();return;}
    if(target.dataset.showPassword){
      const input=document.getElementById(target.dataset.showPassword),visible=input.type==='password';input.type=visible?'text':'password';target.textContent=visible?'Hide':'Show';target.setAttribute('aria-label',visible?'Hide password':'Show password');target.setAttribute('aria-pressed',String(visible));return;
    }
    if(target.matches('a[href^="#/"]')){closeMenus();closeMobile();}
  },opts);
  function render(){
    const {path:requestedPath,query}=parseRoute(window.location.hash);
    const path=publicRelease&&['design-options','preview-area','comparison'].includes(requestedPath)?'home':requestedPath;
    const isHome=path==='home';
    root.dataset.route=path;home.hidden=!isHome;main.hidden=isHome;
    closeMenus();closeMobile();
    const requestedPlan=getPlan(query.get('plan'));
    const routeAudience=path==='business'||path.startsWith('business/')?'business':path==='residential'||path.startsWith('residential/')?'residential':null;
    if(routeAudience)state.audience=routeAudience;
    else if(['residential','business'].includes(query.get('audience')))state.audience=query.get('audience');
    else if(requestedPlan&&!routeAudience)state.audience=requestedPlan.audience;
    if(requestedPlan?.audience===state.audience)state.selectedPlans[state.audience]=requestedPlan.id;
    if(path.startsWith('residential/plans/demo-')&&!query.has('plan'))state.selectedPlans.residential=plansFor('residential')[path.endsWith('2')?1:0]?.id||'';
    state.plan=state.selectedPlans[state.audience];
    if(isHome){document.title=originalTitle;descriptionMeta.content=originalDescription;main.replaceChildren();carousels.forEach(carousel=>carousel.setAudience(state.audience));}
    else{
      const detail=path.startsWith('residential/plans/demo-')?(query.get('plan')?getPlan(query.get('plan')):plansFor('residential')[path.endsWith('2')?1:0]):null;
      const accountUnavailable=publicRelease&&path.startsWith('my-ikonectt/');
      const title=accountUnavailable?'My Ikonectt':detail?.audience==='residential'?planName(detail):pages[path]?.[0]||'Page not found';
      const description=accountUnavailable?'Use the official Ikonectt customer portal for account and subscription functions.':detail?.audience==='residential'?`${planName(detail)} fibre broadband: ${detail.speedMbps} Mbps. ${priceLabel(detail)}${pricePeriod(detail)}. Confirm address feasibility and service terms.`:pages[path]?.[1]||'Choose a page from the navigation.';
      descriptionMeta.content=description;
      const section=path.split('/')[0];const sectionName=menus.find(item=>item.id===section)?.label||'Ikonectt';
      const content=accountUnavailable?`<section class="ik-section"><div class="ik-wrap"><p>Manage your account through the client's official portal. Account authentication and payments are handled there.</p>${link('my-ikonectt/sign-in','Open My Ikonectt')}${link('support','View Support Information',true)}</div></section>`:renderPage(path,{state,query,template:root.dataset.template});
      main.innerHTML=`<section class="ik-page-hero"><div class="ik-wrap"><nav class="ik-breadcrumbs" aria-label="Breadcrumb"><a href="#/home">Home</a><span aria-hidden="true">/</span>${path.includes('/')&&pages[section]?`<a href="#/${section}">${sectionName}</a><span aria-hidden="true">/</span>`:''}<span aria-current="page">${esc(title)}</span></nav><h1 tabindex="-1">${esc(title)}</h1><p>${esc(description)}</p></div></section>${content}`;
      document.title=title+(detail?.audience==='residential'?' — '+detail.speedMbps+' Mbps':'')+' | ikonectt';
      initializePage();
    }
    header.querySelectorAll('.ik-nav-trigger').forEach(button=>{
      const id=button.dataset.menu;button.dataset.active=String(path===id||path.startsWith(id+'/')||(id==='about'&&['contact','privacy','terms'].includes(path)));
    });
    root.querySelectorAll('a[href^="#/"]').forEach(anchor=>{const match=anchor.getAttribute('href')==='#/'+path;if(match)anchor.setAttribute('aria-current','page');else if(anchor.getAttribute('aria-current')==='page')anchor.removeAttribute('aria-current');});
    if(previous){window.scrollTo({top:0,behavior:'instant'});const heading=isHome?home.querySelector('h1'):main.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
    syncAudience();
    previous=path;
  }
  function initializePage(){
    for(const form of main.querySelectorAll('form')){
      const kind=form.dataset.form;
      if(publicClient&&!['coverage-search','sign-in','recovery'].includes(kind)){
        const note=form.previousElementSibling;
        if(note?.classList.contains('ik-notice'))note.textContent='Your enquiry will be recorded for Ikonectt staff. Do not include passwords or payment details.';
        const consent=document.createElement('label');consent.className='ik-full ik-enquiry-consent';consent.htmlFor=kind+'-contact-consent';
        consent.innerHTML=`<input type="checkbox" id="${kind}-contact-consent" name="contactConsent" required><span>I consent to Ikonectt recording these details to respond to this enquiry.</span>`;
        form.querySelector('.ik-actions')?.before(consent);
        const phone=form.elements.namedItem('phone');if(phone)phone.required=true;
        form.querySelector('button[type=submit]').textContent='Submit Enquiry';
      }
      if(['coverage','verification'].includes(kind)){
        const fields=addressFields.map(field=>form.elements.namedItem(field.name));
        fields.forEach((input,index)=>{
          if(index)input.disabled=!fields[index-1].value.trim();
          input.addEventListener('input',()=>{for(let n=index+1;n<fields.length;n++){fields[n].value='';fields[n].disabled=!fields[n-1].value.trim();}},opts);
        });
      }
    }
    if(main.querySelector('#help-search')){
      const search=main.querySelector('#help-search'),category=main.querySelector('#help-category');
      const update=()=>{if(!faqs.length){main.querySelector('#ik-search-results').innerHTML=websiteData.knowledge==='error'?'<p>Help articles could not be loaded. Email customercare@ikonectt.com.</p>':'<p>Loading approved help articles…</p>';return;}const prompt=root.dataset.route==='support'&&!search.value.trim()&&!category.value,matches=filterFAQs(search.value,category.value);main.querySelector('#ik-search-results').innerHTML=prompt?'':renderFAQResults(matches);main.querySelector('#ik-search-count').textContent=prompt?'Search for a question or choose a topic.':`${matches.length} answer${matches.length===1?'':'s'} found`;};
      search.addEventListener('input',update,opts);category.addEventListener('change',update,opts);update();
    }
    if(main.querySelector('#compare-first')){
      const first=main.querySelector('#compare-first'),second=main.querySelector('#compare-second');
      const update=()=>{main.querySelector('#ik-comparison').innerHTML=comparisonHTML(first.value,second.value);const query=new URLSearchParams({first:first.value,second:second.value});window.history.replaceState(null,'','#/residential/compare?'+query);};
      first.addEventListener('change',update,opts);second.addEventListener('change',update,opts);
    }
  }
  main.addEventListener('change',event=>{
    const input=event.target;
    if(input.name==='audience'&&['residential','business'].includes(input.value)){
      state.audience=input.value;state.plan=state.selectedPlans[state.audience];syncAudience();
      const select=input.form?.elements.namedItem('plan');
      if(select){select.innerHTML='<option value="">No plan selected</option>'+planOptions(state.audience).map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('');select.value=state.plan;}
    }
    if(input.name==='plan'&&input.form){const plan=getPlan(input.value);if(plan?.audience===state.audience){state.plan=plan.id;state.selectedPlans[state.audience]=plan.id;}else if(!input.value){state.plan='';state.selectedPlans[state.audience]='';}}
  },opts);
  main.addEventListener('submit',async event=>{
    const form=event.target;if(!form.matches('form[data-form]'))return;event.preventDefault();
    if(form.dataset.recorded==='true'||form.dataset.submitting==='true'||validateForm(form).length)return;
    const data=Object.fromEntries(new FormData(form)),kind=form.dataset.form,status=form.querySelector('[data-status]');
    if(kind==='coverage-search'){
      await searchServiceAreas(data.location);return;
    }
    if(publicClient&&!['sign-in','recovery','coverage'].includes(kind)){
      const button=form.querySelector('button[type=submit]');button.disabled=true;form.dataset.submitting='true';status.textContent='Recording your enquiry…';
      try{
        if(!data.contactConsent)throw new Error('Please consent to recording your enquiry.');
        const message=Object.entries(data).filter(([key])=>!['name','email','phone','contactConsent'].includes(key)).map(([key,value])=>`${key}: ${value}`).join('\n');
        const plan=getPlan(data.plan),kindValue=state.audience==='business'||root.dataset.route.startsWith('business')||/business/i.test(String(data.type))?'BUSINESS':'RESIDENTIAL';
        const record=await publicClient.createEnquiry({name:String(data.name||'').trim(),email:String(data.email||'').trim(),phone:String(data.phone||'').trim(),kind:kindValue,message:`Website ${kind} enquiry\n${message}`,consent:true,...(plan?{planId:plan.id}:{})});
        if(typeof record?.id!=='string')throw new Error('The service did not return a request reference.');
        status.textContent=`Enquiry recorded. Reference: ${record.id}. Keep this reference when contacting customer care.`;
        form.dataset.recorded='true';
      }catch(error){status.textContent='We could not confirm that your enquiry was recorded. '+error.message+' You can email customercare@ikonectt.com for assistance.';button.disabled=false;}
      delete form.dataset.submitting;status.focus();return;
    }
    if(kind==='coverage'){
      state.audience=data.audience==='business'?'business':'residential';
      const plan=getPlan(data.plan);state.plan=plan?.audience===state.audience?plan.id:'';state.selectedPlans[state.audience]=state.plan;
      state.address=Object.fromEntries(addressFields.map(field=>[field.name,String(data[field.name]||'').trim()]));state.coverage=data.scenario||'unknown';navigate(planRoute('coverage/results',getPlan(state.plan),state.audience),{plan:state.plan});return;
    }
    if(['installation','verification'].includes(kind))state.address={...state.address,...Object.fromEntries(addressFields.filter(field=>data[field.name]).map(field=>[field.name,String(data[field.name]).trim()]))};
    if(kind==='sign-in'){
      form.elements.namedItem('password').value='';status.innerHTML='Sign-in is not connected here; you are not authenticated. '+link('my-ikonectt/preview','Account Information');
    }else if(kind==='recovery')status.textContent='No recovery link was sent and no account was looked up. Contact customer care for help recovering your real account.';
    else status.innerHTML=`Your ${kind==='fault'?'fault report':kind==='contact'?'message':'request'} has not been sent. Email <a href="mailto:${publicContacts.emails[0].address}">${publicContacts.emails[0].address}</a> or call <a href="tel:${publicContacts.phones[0].number}">${publicContacts.phones[0].label}</a> to contact the team.`;
    status.focus();
  },opts);
  window.addEventListener('hashchange',()=>{render();void refreshPublicData();},opts);
  window.addEventListener('ik:navigate',event=>{
    const {route,context={}}=event.detail;
    if(publicRelease&&route.startsWith('my-ikonectt')){window.open(officialPortal,'_blank','noopener,noreferrer');return;}
    if(context.address){state.address.street=String(context.address);if(publicClient)void searchServiceAreas(context.address);}
    if(context.plan){const plan=getPlan(context.plan);if(plan){state.audience=plan.audience;state.selectedPlans[plan.audience]=plan.id;state.plan=plan.id;}}
    const hash='#/'+route;
    if(window.location.hash===hash)render();else window.location.hash=hash;
  },opts);
  async function searchServiceAreas(term){
    const current=++coverageVersion;state.coverageQuery=String(term||'').trim();state.coverageLoading=true;state.coverageError='';state.coverageAreas=[];
    if(root.dataset.route?.startsWith('coverage'))render();
    try{if(!publicClient)throw new Error('Coverage search is not connected in this preview. Contact customer care.');const rows=await publicClient.searchCoverage(term);if(current!==coverageVersion||abort.signal.aborted)return;state.coverageAreas=rows;}
    catch(error){if(current!==coverageVersion||abort.signal.aborted)return;state.coverageError=error.message;}
    state.coverageLoading=false;if(root.dataset.route?.startsWith('coverage'))render();
  }
  async function refreshPublicData(){
    if(!publicClient||refreshing||Date.now()-lastRefresh<30000)return;refreshing=true;
    await loadWebsiteData(publicClient);if(abort.signal.aborted)return;refreshing=false;lastRefresh=Date.now();
    carousels.forEach(carousel=>carousel.refresh());
    for(const select of main.querySelectorAll('select[name=plan]')){const value=select.value;select.innerHTML='<option value="">No plan selected</option>'+planOptions(state.audience).map(([id,label])=>`<option value="${esc(id)}">${esc(label)}</option>`).join('');select.value=getPlan(value)?value:'';}
    const route=root.dataset.route;
    if(route==='home'||route==='residential/plans'||route==='residential/compare'||route.startsWith('residential/plans/')||route==='business/plans'||route==='support'||route==='support/faqs'||route==='residential'||route==='residential/installation'||route==='support/troubleshooting')render();
  }
  window.addEventListener('focus',()=>{void refreshPublicData();},opts);
  render();
  if(publicClient)void refreshPublicData();
  return ()=>{assistant.destroy();abort.abort();carousels.forEach(carousel=>carousel.destroy());clearTimeout(menuTimer);header.remove();footer.remove();main.remove();skip.remove();home.hidden=false;root.classList.remove('ik-site');delete root.dataset.template;delete root.dataset.route;delete root.dataset.audience;};
}
function headerHTML(template){
  const dark=['c','e'].includes(template),utility=['a','b','c'].includes(template);
  return `${utility?'<div class="ik-utility"><nav class="ik-wrap ik-audience" aria-label="Audience"><a data-audience="residential" href="#/residential">RESIDENTIAL</a><a data-audience="business" href="#/business">BUSINESS</a></nav></div>':''}<div class="ik-wrap ik-header-row"><a class="ik-logo" href="#/home" aria-label="Ikonectt home"><img class="ik-logo-primary" src="${dark?whiteLogo:redLogo}" alt="Ikonectt" width="132" height="44">${template==='d'?`<img class="ik-logo-inverse" src="${whiteLogo}" alt="" width="132" height="44">`:''}</a><nav class="ik-desktop-nav" id="ik-primary-nav" aria-label="Primary">${menus.map(menu=>`<div class="ik-nav-group"><button type="button" class="ik-nav-trigger" data-menu="${menu.id}" aria-expanded="false" aria-controls="ik-menu-${menu.id}"><span>${menu.label}</span><svg class="ik-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button><div class="ik-mega" id="ik-menu-${menu.id}" hidden><div class="ik-wrap ik-mega-inner" data-groups="${menu.groups.length}" data-promo="${Boolean(menu.promo)}">${menu.groups.map(([title,links])=>`<div class="ik-menu-group"><h2>${title}</h2>${links.map(([label,route])=>`<a href="#/${route}">${label}</a>`).join('')}</div>`).join('')}${menu.promo?`<aside class="ik-promo"><h3>${menu.promo[0]}</h3><p>${menu.promo[1]}</p>${link(menu.promo[3],menu.promo[2])}</aside>`:''}</div></div></div>`).join('')}<a class="ik-button ik-mobile-portal" href="https://portal.ikonectt.com" target="_blank" rel="noopener noreferrer">My Ikonectt</a></nav><div class="ik-nav-actions"><a class="ik-button" href="https://portal.ikonectt.com" target="_blank" rel="noopener noreferrer">My Ikonectt</a><button class="ik-mobile-button" type="button" aria-controls="ik-primary-nav" aria-expanded="false">Menu</button></div></div>`;
}
function footerHTML(){
  const group=(label,items)=>`<nav aria-label="${label}"><h2>${label}</h2>${items.map(([text,route])=>`<a href="${route.startsWith("my-ikonectt")?officialPortal:"#/"+route}"${route.startsWith("my-ikonectt")?' target="_blank" rel="noopener noreferrer"':""}>${text}</a>`).join('')}</nav>`;
  return `<div class="ik-wrap"><div class="ik-footer-grid"><div class="ik-footer-brand"><a class="ik-logo" href="#/home" aria-label="Ikonectt home"><img src="${whiteLogo}" width="132" height="44" alt="Ikonectt"></a><p>${company.description}</p></div><div class="ik-footer-links">${group('Residential',[['Overview','residential'],['Residential Plans','residential/plans'],['Compare Plans','residential/compare'],['Installation Enquiry','residential/installation']])}${group('Business',[['Overview','business'],['Business Solutions','business/solutions'],['Business Plans','business/plans'],['Request a Quote','business/quote']])}${group('Coverage',[['Check Coverage','coverage'],['Address Verification','coverage/verification'],['Coverage FAQs','support/faqs?category=coverage']])}${group('Support',[['Help Centre','support'],['FAQs','support/faqs'],['Troubleshooting','support/troubleshooting'],['Report a Fault','support/fault'],['Service Requests','support/service-request'],['Contact Support','support/contact']])}${group('Company',[['About Us','about'],['Contact','contact'],['My Ikonectt','my-ikonectt/sign-in']])}</div></div><div class="ik-footer-bottom"><span>© 2026 ${company.legalName}.</span><div><a href="#/privacy">Privacy Policy</a><a href="#/terms">Terms and Conditions</a></div></div></div>`;
}
