import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountSite,navigate} from '../shared/public-site.js';
import {pages,menus,parseRoute} from '../shared/routes.js';
import {coverageStates} from '../shared/content.js';
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
  for(const file of ['shared/public-site.js','shared/pages.js','shared/forms.js','shared/routes.js','shared/content.js','shared/static-adapter.js','shared/public-site.css','assets/logos/ikonectt_transparent.png','assets/logos/ikonectt_white_transparent.png'])assert.ok(fs.existsSync(path.join(output,file)),file);
});

const pause=()=>new Promise(resolve=>setTimeout(resolve,5));
for(const template of ['a','b','c','d','e'])test(`Template ${template.toUpperCase()}: public website`,async t=>{
  const dom=new JSDOM('<!doctype html><title>Original home</title><div id="site"><main id="original"><h1>Original homepage</h1></main></div>',{url:`https://preview.test/option-${template}/`,pretendToBeVisual:true});
  const {window}=dom;
  for(const key of ['window','document','CustomEvent','FormData','AbortController'])globalThis[key]=key==='window'?window:window[key];
  window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
  const root=document.querySelector('#site'),home=document.querySelector('#original');
  const cleanup=mountSite({root,home,template});
  const go=async path=>{window.location.hash='#/'+path;await pause();};
  const click=async route=>{
    const anchor=[...root.querySelectorAll('a')].find(a=>a.getAttribute('href')==='#/'+route&&!a.closest('[hidden]'));
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
        if(path!=='home')assert.equal(document.querySelector('#ik-main h1').textContent,title);
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
      window.matchMedia=()=>({matches:true});trigger.closest('.ik-nav-group').dispatchEvent(new window.Event('pointerenter'));assert.equal(trigger.getAttribute('aria-expanded'),'true');home.click();window.matchMedia=()=>({matches:false});
      document.querySelector('.ik-mobile-button').click();assert.ok(document.querySelector('.ik-desktop-nav').classList.contains('is-open'));
      document.querySelector('[data-menu="business"]').click();assert.equal(document.querySelector('[data-menu="business"]').getAttribute('aria-expanded'),'true');
      trigger.click();assert.equal(document.querySelector('[data-menu="business"]').getAttribute('aria-expanded'),'false');
      document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(document.querySelector('.ik-mobile-button').getAttribute('aria-expanded'),'false');
      assert.deepEqual(menus.map(m=>m.label),['Residential','Business','Coverage','Support','About Us']);
    });
    await t.test('residential journey and honest comparison',async()=>{
      await go('home');document.querySelector('[data-menu="residential"]').click();await click('residential');
      await click('residential/plans');await click('residential/plans/demo-1');await click('coverage');
      await click('residential/installation');assert.equal(document.querySelector('[name="plan"]').value,'Catalogue placeholder 1');
      await go('residential/compare');fill('first','2');assert.equal(document.querySelector('#ik-compare-first').textContent,'Catalogue placeholder 2');
      assert.ok(document.querySelector('#ik-compare-actions a').getAttribute('href').endsWith('demo-2'));
      checkTemplate();
    });
    await t.test('business and company journeys',async()=>{
      await go('business');await click('business/solutions');await click('business/solutions/connectivity');await click('business/quote');
      assert.ok(document.querySelector('[name="company"]'));checkTemplate();
      await go('about');await click('contact');assert.ok(document.querySelector('[name="message"]'));checkTemplate();
    });
    await t.test('coverage hierarchy, five explicit demo results, next actions and escaping',async()=>{
      for(const [scenario,result] of Object.entries(coverageStates)){
        await go('coverage');
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
      navigate('coverage',{address:'Demo street'});await pause();assert.equal(root.dataset.route,'coverage');
      assert.equal(document.querySelector('[name="street"]').value,'Demo street');
      await go('support');window.history.back();await new Promise(resolve=>setTimeout(resolve,20));assert.equal(root.dataset.route,'coverage');
      window.history.forward();await new Promise(resolve=>setTimeout(resolve,20));assert.equal(root.dataset.route,'support');checkTemplate();
    });
  }finally{cleanup();window.close();}
});
