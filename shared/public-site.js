import {getPlan,planName,planOptions,planRoute} from './catalogue.js';
import {carouselHTML,comparisonHTML} from './plan-ui.js';
import {initializeCarousel} from './carousel.js';
import {pages,menus,parseRoute} from './routes.js';
import {company} from './content.js';
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
  const assistant=mountAssistant({root,template,navigate,getContext:()=>({path:parseRoute(window.location.hash).path,audience:state.audience,plan:state.plan})});
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
    if(target.hasAttribute('data-skip')){event.preventDefault();const content=home.hidden?main:home;content.tabIndex=-1;content.focus();content.scrollIntoView();return;}
    if(target.dataset.errorFocus){event.preventDefault();document.getElementById(target.dataset.errorFocus)?.focus();return;}
    if(target.dataset.showPassword){
      const input=document.getElementById(target.dataset.showPassword),visible=input.type==='password';input.type=visible?'text':'password';target.textContent=visible?'Hide':'Show';target.setAttribute('aria-label',visible?'Hide password':'Show password');target.setAttribute('aria-pressed',String(visible));return;
    }
    if(target.matches('a[href^="#/"]')){closeMenus();closeMobile();}
  },opts);
  function render(){
    const {path,query}=parseRoute(window.location.hash),isHome=path==='home';
    root.dataset.route=path;home.hidden=!isHome;main.hidden=isHome;
    closeMenus();closeMobile();
    const requestedPlan=getPlan(query.get('plan'));
    const routeAudience=path==='business'||path.startsWith('business/')?'business':path==='residential'||path.startsWith('residential/')?'residential':null;
    if(routeAudience)state.audience=routeAudience;
    else if(['residential','business'].includes(query.get('audience')))state.audience=query.get('audience');
    else if(requestedPlan&&!routeAudience)state.audience=requestedPlan.audience;
    if(requestedPlan?.audience===state.audience)state.selectedPlans[state.audience]=requestedPlan.id;
    if(path.startsWith('residential/plans/demo-')&&!query.has('plan'))state.selectedPlans.residential=path.endsWith('2')?'res-isilver':'res-ibasic';
    state.plan=state.selectedPlans[state.audience];
    if(isHome){document.title=originalTitle;main.replaceChildren();carousels.forEach(carousel=>carousel.setAudience(state.audience));}
    else{
      const detail=path.startsWith('residential/plans/demo-')?getPlan(query.get('plan')||(path.endsWith('2')?'res-isilver':'res-ibasic')):null;
      const title=detail?.audience==='residential'?planName(detail):pages[path]?.[0]||'Page not found',description=pages[path]?.[1]||'Choose a page from the navigation.';
      const section=path.split('/')[0];const sectionName=menus.find(item=>item.id===section)?.label||'Ikonectt';
      main.innerHTML=`<section class="ik-page-hero"><div class="ik-wrap"><nav class="ik-breadcrumbs" aria-label="Breadcrumb"><a href="#/home">Home</a><span aria-hidden="true">/</span>${path.includes('/')&&pages[section]?`<a href="#/${section}">${sectionName}</a><span aria-hidden="true">/</span>`:''}<span aria-current="page">${esc(title)}</span></nav><h1 tabindex="-1">${esc(title)}</h1><p>${esc(description)}</p></div></section>${renderPage(path,{state,query})}`;
      document.title=title+' | Ikonectt';
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
      const update=()=>{const matches=filterFAQs(search.value,category.value);main.querySelector('#ik-search-results').innerHTML=renderFAQResults(matches);main.querySelector('#ik-search-count').textContent=`${matches.length} answer${matches.length===1?'':'s'} found`;};
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
      if(select){select.innerHTML='<option value="">Select an option</option>'+planOptions(state.audience).map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('');select.value=state.plan;}
    }
    if(input.name==='plan'&&input.form){const plan=getPlan(input.value);if(plan?.audience===state.audience){state.plan=plan.id;state.selectedPlans[state.audience]=plan.id;}else if(!input.value){state.plan='';state.selectedPlans[state.audience]='';}}
  },opts);
  main.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('form[data-form]'))return;event.preventDefault();
    if(validateForm(form).length)return;
    const data=Object.fromEntries(new FormData(form)),kind=form.dataset.form,status=form.querySelector('[data-status]');
    if(kind==='coverage'){
      state.audience=data.audience==='business'?'business':'residential';
      const plan=getPlan(data.plan);state.plan=plan?.audience===state.audience?plan.id:'';state.selectedPlans[state.audience]=state.plan;
      state.address=Object.fromEntries(addressFields.map(field=>[field.name,String(data[field.name]||'').trim()]));state.coverage=data.scenario||'unknown';navigate(planRoute('coverage/results',getPlan(state.plan),state.audience),{plan:state.plan});return;
    }
    if(['installation','verification'].includes(kind))state.address={...state.address,...Object.fromEntries(addressFields.filter(field=>data[field.name]).map(field=>[field.name,String(data[field.name]).trim()]))};
    if(kind==='sign-in'){
      form.elements.namedItem('password').value='';status.innerHTML='Preview only. Sign-in is not connected; you are not authenticated. '+link('my-ikonectt/preview','View Portal Preview');
    }else if(kind==='recovery')status.textContent='Demonstration only. No recovery link was sent and no account was looked up. Live account recovery is not connected.';
    else status.innerHTML='Demonstration complete. Nothing was sent or stored. A live request endpoint is required before this form can deliver a message.'+`<div class="ik-actions">${link(state.audience+'/plans',state.audience==='business'?'Explore Business Plans':'Explore Residential Plans',true)}${link('support','Help Centre',true)}${link('home','Home',true)}</div>`;
    status.focus();
  },opts);
  window.addEventListener('hashchange',render,opts);
  window.addEventListener('ik:navigate',event=>{
    const {route,context={}}=event.detail;
    if(context.address)state.address.street=String(context.address);
    if(context.plan){const plan=getPlan(context.plan);if(plan){state.audience=plan.audience;state.selectedPlans[plan.audience]=plan.id;state.plan=plan.id;}}
    const hash='#/'+route;
    if(window.location.hash===hash)render();else window.location.hash=hash;
  },opts);
  render();
  return ()=>{assistant.destroy();abort.abort();carousels.forEach(carousel=>carousel.destroy());clearTimeout(menuTimer);header.remove();footer.remove();main.remove();skip.remove();home.hidden=false;root.classList.remove('ik-site');delete root.dataset.template;delete root.dataset.route;delete root.dataset.audience;};
}
function headerHTML(template){
  const dark=['c','e'].includes(template),utility=['a','b','c'].includes(template);
  return `${utility?'<div class="ik-utility"><nav class="ik-wrap ik-audience" aria-label="Audience"><a data-audience="residential" href="#/residential">RESIDENTIAL</a><a data-audience="business" href="#/business">BUSINESS</a></nav></div>':''}<div class="ik-wrap ik-header-row"><a class="ik-logo" href="#/home" aria-label="Ikonectt home"><img class="ik-logo-primary" src="${dark?whiteLogo:redLogo}" alt="Ikonectt" width="132" height="44">${template==='d'?`<img class="ik-logo-inverse" src="${whiteLogo}" alt="" width="132" height="44">`:''}</a><nav class="ik-desktop-nav" id="ik-primary-nav" aria-label="Primary">${menus.map(menu=>`<div class="ik-nav-group"><button type="button" class="ik-nav-trigger" data-menu="${menu.id}" aria-expanded="false" aria-controls="ik-menu-${menu.id}"><span>${menu.label}</span><svg class="ik-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button><div class="ik-mega" id="ik-menu-${menu.id}" hidden><div class="ik-wrap ik-mega-inner" data-groups="${menu.groups.length}" data-promo="${Boolean(menu.promo)}">${menu.groups.map(([title,links])=>`<div class="ik-menu-group"><h2>${title}</h2>${links.map(([label,route])=>`<a href="#/${route}">${label}</a>`).join('')}</div>`).join('')}${menu.promo?`<aside class="ik-promo"><h3>${menu.promo[0]}</h3><p>${menu.promo[1]}</p>${link(menu.promo[3],menu.promo[2])}</aside>`:''}</div></div></div>`).join('')}<a class="ik-button ik-mobile-portal" href="#/my-ikonectt/sign-in">My Ikonectt</a></nav><div class="ik-nav-actions"><a class="ik-button" href="#/my-ikonectt/sign-in">My Ikonectt</a><button class="ik-mobile-button" type="button" aria-controls="ik-primary-nav" aria-expanded="false">Menu</button></div></div>`;
}
function footerHTML(){
  const group=(label,items)=>`<nav aria-label="${label}"><h2>${label}</h2>${items.map(([text,route])=>`<a href="#/${route}">${text}</a>`).join('')}</nav>`;
  return `<div class="ik-wrap"><div class="ik-footer-grid"><div class="ik-footer-brand"><a class="ik-logo" href="#/home" aria-label="Ikonectt home"><img src="${whiteLogo}" width="132" height="44" alt="Ikonectt"></a><p>${company.description}</p><p>Verified contact details awaiting confirmation.</p></div><div class="ik-footer-links">${group('Residential',[['Overview','residential'],['Residential Plans','residential/plans'],['Compare Plans','residential/compare'],['Installation Enquiry','residential/installation']])}${group('Business',[['Overview','business'],['Business Solutions','business/solutions'],['Business Plans','business/plans'],['Request a Quote','business/quote']])}${group('Coverage',[['Check Coverage','coverage'],['Address Verification','coverage/verification'],['Coverage FAQs','support/faqs?category=coverage']])}${group('Support',[['Help Centre','support'],['FAQs','support/faqs'],['Troubleshooting','support/troubleshooting'],['Report a Fault','support/fault'],['Service Requests','support/service-request'],['Contact Support','support/contact']])}${group('Company',[['About Us','about'],['Contact','contact'],['My Ikonectt','my-ikonectt/sign-in']])}</div></div><div class="ik-footer-bottom"><span>© 2026 ${company.legalName}.</span><div><a href="#/privacy">Privacy Policy</a><a href="#/terms">Terms and Conditions</a></div></div></div>`;
}
