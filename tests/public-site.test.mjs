import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountSite,navigate} from '../shared/public-site.js';
import {pages,menus,parseRoute} from '../shared/routes.js';
import {coverageStates} from '../shared/content.js';
import {catalogue,plansFor,getPlan,planName,priceLabel,detailRoute,planRoute} from '../shared/catalogue.js';
import {filterFAQs} from '../shared/pages.js';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

test('packaged option entrypoints and local assets exist',()=>{
  const output=fileURLToPath(new URL('../public_html/',import.meta.url));
  for(const option of ['a','b','c','d','e']){
    const html=fs.readFileSync(path.join(output,`option-${option}`,'index.html'),'utf8');
    for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
      if(/^(https?:|data:|#|mailto:|tel:)/.test(ref))continue;
      const url=new URL(ref,`https://preview.test/option-${option}/`);
      const target=path.join(output,...decodeURIComponent(url.pathname).split('/').filter(Boolean));
      assert.ok(fs.existsSync(target),`Missing packaged asset: ${option} -> ${ref}`);
    }
  }
  for(const file of ['shared/public-site.js','shared/pages.js','shared/forms.js','shared/routes.js','shared/content.js','shared/static-adapter.js','shared/public-site.css','shared/catalogue.js','shared/plan-ui.js','shared/carousel.js','shared/plans.css','assets/logos/ikonectt_transparent.png','assets/logos/ikonectt_white_transparent.png'])assert.ok(fs.existsSync(path.join(output,file)),file);
});


test('selected reference catalogue has exact values and no invented business names or offers',()=>{
  assert.deepEqual(plansFor('residential').map(p=>[p.displayName,p.speedMbps,p.monthlyPriceNGN]),[['iBasic',30,15000],['iSilver',40,20000],['iGold',50,25000],['iPlatinum',100,50000],['iDiamond',300,75000]]);
  assert.deepEqual(plansFor('business').map(p=>[p.displayName,p.speedMbps,p.monthlyPriceNGN]),[[null,100,105000],[null,300,253000],[null,500,359000],[null,1000,437000]]);
  assert.equal(new Set(catalogue.map(p=>p.id)).size,9);
  for(const plan of catalogue){assert.equal(plan.billingPeriod,'month');assert.equal(plan.currency,'NGN');assert.match(plan.verificationStatus,/awaiting-client-confirmation/);assert.equal(plan.availabilityStatus,'address-verification-required');assert.deepEqual(plan.verifiedAttributes.map(x=>x.value),['Fibre broadband']);assert.ok(plan.sourceUrl.startsWith('https://provisions.ikonectt.com/'));}
});

const pause=()=>new Promise(resolve=>setTimeout(resolve,5));
for(const template of ['a','b','c','d','e'])test(`Template ${template.toUpperCase()}: public website`,async t=>{
  const dom=new JSDOM('<!doctype html><title>Original home</title><div id="site"><main id="original"><h1>Original homepage</h1><div data-home-plan-carousel></div></main></div>',{url:`https://preview.test/option-${template}/`,pretendToBeVisual:true});
  const {window}=dom;
  for(const key of ['window','document','CustomEvent','FormData','AbortController'])globalThis[key]=key==='window'?window:window[key];
  window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
  const root=document.querySelector('#site'),home=document.querySelector('#original');
  const cleanup=mountSite({root,home,template});
  const change=action=>new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Navigation event timed out')),1000);
    window.addEventListener('hashchange',()=>{clearTimeout(timeout);resolve();},{once:true});action();
  });
  const go=async path=>{if(window.location.hash!=='#/'+path)await change(()=>{window.location.hash='#/'+path;});};
  const click=async route=>{
    const anchor=[...root.querySelectorAll('a')].find(a=>(a.getAttribute('href')==='#/'+route||(!route.includes('?')&&parseRoute(a.getAttribute('href')).path===parseRoute('#/'+route).path))&&!a.closest('[hidden]'));
    assert.ok(anchor,`Missing visible path to ${route}`);
    if(window.location.hash==='#/'+route){anchor.click();await pause();return;}
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error(`Navigation did not complete: ${route}; current ${window.location.hash}`)),1000);
      window.addEventListener('hashchange',()=>{clearTimeout(timeout);resolve();},{once:true});
      anchor.click();
    });
    assert.equal(root.dataset.route,parseRoute('#/'+route).path);
  };
  const fill=(name,value)=>{const element=document.querySelector(`#ik-main [name="${name}"]`);assert.ok(element,`Missing field ${name}`);assert.equal(element.disabled,false,`${name} should be enabled`);element.value=value;element.dispatchEvent(new window.Event('input',{bubbles:true}));element.dispatchEvent(new window.Event('change',{bubbles:true}));};
  const submit=async()=>{document.querySelector('#ik-main form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await pause();};
  const checkTemplate=()=>{assert.equal(root.dataset.template,template);assert.equal(window.location.pathname,`/option-${template}/`);};
  try{
    await t.test('all routes, links and refreshable aliases resolve',async()=>{
      for(const [path,[title]] of Object.entries(pages)){
        await go(path);checkTemplate();
        assert.equal(home.hidden,path!=='home');
        if(path!=='home')assert.equal(document.querySelector('#ik-main h1').textContent,path.endsWith('/demo-1')?'iBasic':path.endsWith('/demo-2')?'iSilver':title);
        for(const anchor of root.querySelectorAll('a[href^="#/"]')){
          const target=parseRoute(anchor.getAttribute('href')).path;
          assert.ok(pages[target],`Broken internal link: ${target} on ${path}`);
        }
      }
      for(const [alias,target] of [['residential/enquire','residential/installation'],['coverage/verify','coverage/verification'],['my-ikonectt/login','my-ikonectt/sign-in']]){await go(alias);assert.equal(root.dataset.route,target);}
      await go('not-a-page');assert.equal(document.querySelector('#ik-main h1').textContent,'Page not found');
      await go('home');assert.equal(home.hidden,false);assert.equal(document.title,'Original home');
    });
    await t.test('accessible menus, mobile accordion, escape and outside dismissal',async()=>{
      const trigger=document.querySelector('[data-menu="residential"]');trigger.click();assert.equal(trigger.getAttribute('aria-expanded'),'true');
      document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(trigger.getAttribute('aria-expanded'),'false');assert.equal(document.activeElement,trigger);
      trigger.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));assert.equal(trigger.getAttribute('aria-expanded'),'true');assert.ok(document.activeElement.matches('#ik-menu-residential a'));
      home.click();assert.equal(trigger.getAttribute('aria-expanded'),'false');
      window.matchMedia=()=>({matches:true});trigger.closest('.ik-nav-group').dispatchEvent(new window.Event('pointerenter'));assert.equal(trigger.getAttribute('aria-expanded'),'true');trigger.click();assert.equal(trigger.getAttribute('aria-expanded'),'true','click retains the hover-open menu');trigger.click();assert.equal(trigger.getAttribute('aria-expanded'),'false','second click closes the pinned menu');home.click();window.matchMedia=()=>({matches:false});
      document.querySelector('.ik-mobile-button').click();assert.ok(document.querySelector('.ik-desktop-nav').classList.contains('is-open'));
      document.querySelector('[data-menu="business"]').click();assert.equal(document.querySelector('[data-menu="business"]').getAttribute('aria-expanded'),'true');
      trigger.click();assert.equal(document.querySelector('[data-menu="business"]').getAttribute('aria-expanded'),'false');
      document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(document.querySelector('.ik-mobile-button').getAttribute('aria-expanded'),'false');
      assert.deepEqual(menus.map(m=>m.label),['Residential','Business','Coverage','Support','About Us']);
    });
    await t.test('audience selection follows routes and persists through shared journeys',async()=>{
      await go('residential');
      const audience=document.querySelector('.ik-audience');
      assert.equal(Boolean(audience),['a','b','c'].includes(template));
      if(audience){
        assert.equal(audience.querySelector('[aria-current="true"]').dataset.audience,'residential');
        await new Promise(resolve=>{window.addEventListener('hashchange',resolve,{once:true});audience.querySelector('[data-audience="business"]').click();});
        assert.equal(root.dataset.route,'business');
        assert.equal(audience.querySelector('[aria-current="true"]').dataset.audience,'business');
        assert.equal(document.querySelector('[data-menu="business"]').dataset.active,'true');
      }
      await go('business/quote');await go('coverage');assert.equal(root.dataset.audience,'business');
      await go('residential/plans');assert.equal(root.dataset.audience,'residential');
      if(audience)assert.equal(audience.querySelectorAll('[aria-current="true"]').length,1);
      checkTemplate();
    });
    await t.test('footer groups share one layout and chevrons retain accessible menu states',async()=>{
      assert.deepEqual([...document.querySelectorAll('.ik-footer-links>nav')].map(n=>n.getAttribute('aria-label')),['Residential','Business','Coverage','Support','Company']);
      assert.equal(document.querySelectorAll('.ik-footer-grid').length,1);
      for(const trigger of document.querySelectorAll('.ik-nav-trigger')){
        const svg=trigger.querySelector('svg.ik-chevron');
        assert.ok(svg);assert.equal(svg.getAttribute('aria-hidden'),'true');assert.equal(svg.getAttribute('width'),'14');
      }
      assert.equal(document.querySelectorAll('.ik-header .ik-logo-inverse').length,template==='d'?1:0);
    });
    await t.test('residential catalogue, five detail pages, comparison and selected enquiry journey',async()=>{
      await go('home');document.querySelector('[data-menu="residential"]').click();await click('residential');await click('residential/plans');
      assert.equal(document.querySelectorAll('#ik-main .ik-plan-card').length,5);
      for(const plan of plansFor('residential')){
        await go('residential/plans');const card=document.querySelector(`#ik-main [data-plan-id="${plan.id}"]`);
        assert.match(card.textContent,new RegExp(plan.speedMbps+''));assert.ok(card.textContent.includes(priceLabel(plan)));
        await click(detailRoute(plan));assert.equal(document.querySelector('#ik-main h1').textContent,planName(plan));
        assert.ok(document.querySelector('.ik-plan-detail').textContent.includes(priceLabel(plan)));
        await click('residential/compare?first='+plan.id);assert.equal(document.querySelector('#compare-first').value,plan.id);
        assert.ok(document.querySelector('#ik-comparison').textContent.includes(priceLabel(plan)));
        await click(planRoute('coverage',plan));assert.equal(document.querySelector('[name="plan"]').value,plan.id);
        await click('residential/installation');assert.equal(document.querySelector('[name="plan"]').value,plan.id);
        await go(planRoute('residential/installation',plan));assert.equal(document.querySelector('[name="plan"]').value,plan.id);
      }
      await go('residential/compare');fill('first','res-idiamond');fill('second','res-isilver');
      assert.ok(document.querySelector('#ik-comparison thead').textContent.includes('iDiamond'));
      assert.ok(document.querySelector('#ik-comparison').textContent.includes(priceLabel(getPlan('res-idiamond'))));
      assert.ok(!document.querySelector('#ik-comparison').textContent.includes('105,000'));
      await go('residential/plans/details?plan=biz-100');assert.match(document.querySelector('#ik-main').textContent,/Plan not found/);
      await go('residential/plans/details?plan=__proto__');assert.match(document.querySelector('#ik-main').textContent,/Plan not found/);
      checkTemplate();
    });
    await t.test('business catalogue and tier selection are separate and refreshable',async()=>{
      await go('business');await click('business/solutions');await click('business/plans');
      assert.equal(document.querySelectorAll('#ik-main .ik-plan-card').length,4);
      for(const plan of plansFor('business')){
        await go('business/plans');const card=document.querySelector(`#ik-main [data-plan-id="${plan.id}"]`);assert.ok(card.textContent.includes(priceLabel(plan)));
        await click(planRoute('business/quote',plan));assert.equal(document.querySelector('[name="plan"]').value,plan.id);
        assert.equal(document.querySelectorAll('[name="plan"] option').length,5);
      }
      await go('business/quote?plan=res-igold');assert.ok(!document.querySelector('[name="plan"]').value.startsWith('res-'));
      checkTemplate();
    });
    await t.test('homepage carousel arrows, keyboard, audiences and plan links share catalogue',async()=>{
      await go('home');const carousel=document.querySelector('[data-plan-carousel]'),rail=carousel.querySelector('.ik-carousel-rail');
      carousel.querySelector('[data-carousel-audience="residential"]').click();
      assert.equal(rail.querySelectorAll('.ik-plan-card').length,5);
      rail.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
      assert.equal(rail.querySelector('[aria-current="true"]').dataset.planId,'res-ibasic');assert.equal(carousel.querySelector('[data-carousel-step="-1"]').disabled,true);
      carousel.querySelector('[data-carousel-step="1"]').click();assert.equal(rail.querySelector('[aria-current="true"]').dataset.planId,'res-isilver');
      rail.dispatchEvent(new window.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));assert.equal(rail.querySelector('[aria-current="true"]').dataset.planId,'res-idiamond');
      assert.equal(carousel.querySelector('[data-carousel-step="1"]').disabled,true);
      carousel.querySelector('[data-carousel-audience="business"]').click();assert.equal(root.dataset.audience,'business');assert.equal(rail.querySelectorAll('.ik-plan-card').length,4);
      assert.ok([...rail.querySelectorAll('.ik-plan-card')].every(card=>getPlan(card.dataset.planId).audience==='business'));
      assert.ok(carousel.querySelector('[data-carousel-links]').textContent.includes('Business'));
      const movement=[];rail.scrollTo=options=>movement.push(options.behavior);window.matchMedia=()=>({matches:true});carousel.querySelector('[data-carousel-step="-1"]').click();assert.equal(movement.at(-1),'instant');window.matchMedia=()=>({matches:false});
      await click(planRoute('business/quote',getPlan('biz-300')));assert.equal(document.querySelector('[name="plan"]').value,'biz-300');checkTemplate();
    });
    await t.test('business coverage results and verification retain audience and tier',async()=>{
      for(const scenario of Object.keys(coverageStates)){
        await go('coverage?audience=business&plan=biz-500');
        assert.equal(document.querySelector('[name="audience"]').value,'business');
        for(const name of ['state','city','district','street','building'])fill(name,'Demo '+name);
        fill('scenario',scenario);await submit();assert.equal(root.dataset.audience,'business');
        assert.ok([...document.querySelectorAll('.ik-result a')].some(a=>a.getAttribute('href').includes('business/plans')));
        const next=scenario==='available'?'business/quote':'coverage/verification';await click(next);
        assert.equal(document.querySelector('[name="plan"]').value,'biz-500');
        assert.ok([...document.querySelectorAll('[name="plan"] option')].every(o=>!o.value||o.value.startsWith('biz-')));
      }
      await go('coverage?audience=residential&plan=res-igold');fill('audience','business');
      assert.ok([...document.querySelectorAll('[name="plan"] option')].every(o=>!o.value||o.value.startsWith('biz-')));
      checkTemplate();
    });
    await t.test('business and company journeys',async()=>{
      await go('business');await click('business/solutions');await click('business/solutions/connectivity');await click('business/quote');
      assert.ok(document.querySelector('[name="company"]'));checkTemplate();
      await go('about');await click('contact');assert.ok(document.querySelector('[name="message"]'));checkTemplate();
    });
    await t.test('coverage hierarchy, five explicit demo results, next actions and escaping',async()=>{
      for(const [scenario,result] of Object.entries(coverageStates)){
        await go('coverage?audience=residential');
        // Changing a parent clears and disables descendants.
        fill('state','Demo state');fill('city','Demo city');fill('district','Demo district');fill('street','Demo street');fill('building','<img src=x onerror=alert(1)>');
        fill('state','Demo state changed');assert.equal(document.querySelector('[name="city"]').value,'');assert.equal(document.querySelector('[name="district"]').disabled,true);
        fill('city','Demo city');fill('district','Demo district');fill('street','Demo street');fill('building','<img src=x onerror=alert(1)>');fill('scenario',scenario);await submit();
        assert.equal(root.dataset.route,'coverage/results');assert.equal(document.querySelector('.ik-result h2').textContent,result.title);
        assert.equal(document.querySelector('.ik-result img'),null);assert.match(document.querySelector('.ik-result').textContent,/Demonstration result/);
        await click(result.route);assert.ok(document.querySelector('form'));checkTemplate();
      }
      assert.equal(window.localStorage.length,0);assert.equal(window.sessionStorage.length,0);
      const fresh=new JSDOM('<div></div>',{url:window.location.href});assert.ok(!fresh.window.location.hash.includes('Demo'));fresh.window.close();
    });
    await t.test('all request forms validate and never claim delivery',async()=>{
      for(const route of ['residential/installation','business/quote','coverage/verification','support/fault','support/service-request','support/contact','contact']){
        await go(route);await submit();assert.equal(document.querySelector('.ik-error-summary').hidden,false,route);
        for(const control of document.querySelectorAll('#ik-main form input,#ik-main form select,#ik-main form textarea')){
          const value=control.tagName==='SELECT'?[...control.options].find(o=>o.value)?.value:control.type==='email'?'demo@example.test':control.type==='tel'?'+234 800 000 0000':'Demo information';
          if(control.disabled)continue;fill(control.name,value);
        }
        const email=document.querySelector('[type="email"]');email.value='invalid';await submit();assert.equal(email.getAttribute('aria-invalid'),'true');email.value='demo@example.test';
        const phone=document.querySelector('[type="tel"]');phone.value='letters';await submit();assert.equal(phone.getAttribute('aria-invalid'),'true');phone.value='+234 800 000 0000';
        await submit();assert.match(document.querySelector('[data-status]').textContent,/Nothing was sent or stored/);checkTemplate();
      }
    });
    await t.test('support search, FAQ grouping and troubleshooting escalation',async()=>{
      await go('support');fill('search','zzzz-not-a-topic');assert.match(document.querySelector('#ik-search-count').textContent,/0 answers/);assert.match(document.querySelector('#ik-search-results').textContent,/No matching answers/);
      fill('search','');fill('category','coverage');assert.equal(document.querySelectorAll('#ik-search-results details').length,2);
      await click('support/troubleshooting');await click('support/troubleshooting?topic=no-internet&step=0');await click('support/troubleshooting?topic=no-internet&step=1');await click('support/troubleshooting?topic=no-internet&step=2');await click('support/fault');checkTemplate();
      await go('support/troubleshooting?topic=__proto__');assert.match(document.querySelector('#ik-main').textContent,/Choose a topic/);
      assert.ok(filterFAQs('coverage','coverage').length);assert.equal(filterFAQs('no-such-question').length,0);
    });
    await t.test('account journey never authenticates or exposes registration',async()=>{
      await go('my-ikonectt/sign-in');await submit();assert.equal(document.querySelector('.ik-error-summary').hidden,false);
      fill('account','DEMO-ACCOUNT-123');fill('password','sample-only');document.querySelector('[data-show-password]').click();assert.equal(document.querySelector('[name="password"]').type,'text');
      document.querySelector('[data-show-password]').click();assert.equal(document.querySelector('[name="password"]').type,'password');await submit();
      assert.match(document.querySelector('[data-status]').textContent,/not authenticated/);assert.equal(document.querySelector('[name="password"]').value,'');
      await click('my-ikonectt/forgot-password');fill('account','DEMO-ACCOUNT-123');await submit();assert.match(document.querySelector('[data-status]').textContent,/No recovery link was sent/);
      await click('support/contact');await go('my-ikonectt/preview');assert.match(document.querySelector('#ik-main').textContent,/You are not signed in/);
      assert.equal(root.querySelector('a[href*="register"],a[href*="signup"],a[href*="admin"]'),null);checkTemplate();
    });
    await t.test('navigation event, back and forward preserve template',async()=>{
      await change(()=>navigate('coverage',{address:'Demo street'}));assert.equal(root.dataset.route,'coverage');
      assert.equal(document.querySelector('[name="street"]').value,'Demo street');
      await go('support');await change(()=>window.history.back());assert.equal(root.dataset.route,'coverage');
      await change(()=>window.history.forward());assert.equal(root.dataset.route,'support');checkTemplate();
    });
  }finally{cleanup();window.close();}
});
