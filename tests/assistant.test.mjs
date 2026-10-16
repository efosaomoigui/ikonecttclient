import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {mountSite} from '../shared/public-site.js';
import {mountAssistant} from '../shared/assistant.js';
import {matchIntent,validateIntroduction,demoProvider,publicContext,contextActions} from '../shared/assistant-engine.js';
import {getPlan,priceLabel} from '../shared/catalogue.js';
import {pages,parseRoute} from '../shared/routes.js';

const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
test('introduction accepts Nigerian and international formats, rejects malformed input',()=>{
  for(const phone of ['0803 123 4567','0901-234-5678','+234 803 123 4567','2348031234567','00234 803 123 4567','+44 20 7946 0123','+1 (202) 555-0123'])assert.deepEqual(validateIntroduction({name:'D’Ádé Okafor',phone}),{},phone);
  for(const phone of ['', '1234567','0803123456','+234 0803 123 4567','+234803123','+000000000','+1234567890123456','letters','+23480<script>'])assert.ok(validateIntroduction({name:'Efe Demo',phone}).phone,phone);
  for(const name of ['', '1','<img src=x>','A'.repeat(81)])assert.ok(validateIntroduction({name,phone:'08031234567'}).name,name);
  for(const name of ['李明','Anne-Marie O’Neill','Efe Omoigui'])assert.deepEqual(validateIntroduction({name,phone:'08031234567'}),{});
});
test('all scripted intents are deterministic, safe and route only to existing journeys',()=>{
  const cases=[['I need internet for my home','residential'],['I need internet for my office','business'],['Is Ikonectt available in my area?','coverage'],['How do I get connected?','installation'],['My internet is not working','troubleshooting'],['Report a fault','fault'],['I want to check my bill','billing'],['I want to speak to someone','support'],['My Ikonectt login','account'],['I forgot my password','recovery'],['Contact sales','sales'],['Write a poem about Mars','fallback']];
  for(const [text,intent] of cases){
    assert.equal(matchIntent(text),intent,text);
    const response=demoProvider.respond({text,context:{path:'home',audience:'residential'}});
    assert.deepEqual(response,demoProvider.respond({text,context:{path:'home',audience:'residential'}}));
    assert.ok(response.text.length>50);
    for(const action of response.actions)if(action.route)assert.ok(pages[parseRoute('#/'+action.route).path],action.route);
  }
  assert.match(demoProvider.respond({intent:'coverage'}).text,/cannot confirm coverage/);
  assert.match(demoProvider.respond({intent:'billing'}).text,/cannot access balances/);
  assert.match(demoProvider.respond({intent:'fault'}).text,/no ticket is created/);
  assert.match(demoProvider.respond({intent:'support'}).text,/no live agent/);
});
test('public context excludes private fields and invalid catalogue selections',()=>{
  assert.deepEqual(publicContext({path:'coverage',audience:'business',plan:'biz-500',phone:'private',address:'private',token:'private'}),{path:'coverage',audience:'business',plan:'biz-500'});
  assert.equal(publicContext({audience:'business',plan:'res-igold'}).plan,'');
  assert.equal(publicContext({plan:'__proto__'}).plan,'');
  const response=demoProvider.respond({intent:'residential',context:{audience:'residential',plan:'res-igold'}});
  assert.ok(response.text.includes(priceLabel(getPlan('res-igold'))));assert.match(response.text,/50 Mbps/);
  assert.ok(response.actions.some(action=>action.route?.includes('plan=res-igold')));
  assert.ok(contextActions({path:'business',audience:'business',plan:'biz-500'}).some(action=>action.route?.includes('plan=biz-500')));
  const business=demoProvider.respond({text:'What does this plan cost?',context:{path:'business/plans',audience:'business',plan:'biz-500'}});
  assert.ok(business.text.includes(priceLabel(getPlan('biz-500'))));assert.ok(business.actions.some(action=>action.route?.includes('business/quote')));
});
test('assistant source has no storage, network, analytics or AI-provider implementation',()=>{
  for(const file of ['assistant.js','assistant-engine.js','assistant-view.js']){
    const source=readFileSync(new URL('../shared/'+file,import.meta.url),'utf8');
    assert.doesNotMatch(source,/\b(localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|sendBeacon|GoogleGenAI|OpenAI)\b/);
    assert.doesNotMatch(source,/document\.cookie|console\./);
  }
});

for(const template of ['a','b','c','d','e'])test(`Template ${template.toUpperCase()}: assistant interactions and nine customer journeys`,async t=>{
  const dom=new JSDOM('<!doctype html><div id="site"><main id="home"><h1>Home</h1></main></div>',{url:`https://example.test/option-${template}/`,pretendToBeVisual:true});
  const {window}=dom;
  for(const key of ['window','document','CustomEvent','FormData','AbortController'])globalThis[key]=key==='window'?window:window[key];
  window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
  let networkCalls=0;window.fetch=()=>{networkCalls++;throw Error('Unexpected transmission');};
  const root=document.querySelector('#site'),cleanup=mountSite({root,home:document.querySelector('#home'),template});
  const find=selector=>root.querySelector('.ik-assistant '+selector);
  const click=selector=>{assert.ok(find(selector),selector);find(selector).click();};
  const fill=(selector,value)=>{find(selector).value=value;find(selector).dispatchEvent(new window.Event('input',{bubbles:true}));};
  const submit=selector=>find(selector).dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  const go=async route=>{window.location.hash='#/'+route;await new Promise(resolve=>window.setTimeout(resolve,30));};
  const start=()=>{click('[data-launcher]');fill('[name="name"]','Efe Demo');fill('[name="phone"]','+234 803 123 4567');submit('[data-intro-form]');};
  try{
    await t.test('welcome, validation, open/close, Escape focus and trapped modal boundaries',async()=>{
      assert.equal(find('[data-invitation]').hidden,false);click('[data-dismiss]');assert.equal(find('[data-invitation]').hidden,true);
      click('[data-launcher]');assert.ok(find('dialog').hasAttribute('open'));assert.equal(document.activeElement,find('[name="name"]'));
      submit('[data-intro-form]');assert.equal(find('[name="name"]').getAttribute('aria-invalid'),'true');assert.equal(find('[data-errors]').hidden,false);
      fill('[name="name"]','Efe Demo');fill('[name="phone"]','letters');submit('[data-intro-form]');assert.equal(find('[name="phone"]').getAttribute('aria-invalid'),'true');
      find('[data-close]').focus();find('[data-close]').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(document.activeElement,find(template==='a'?'[data-intro-form] [data-help]':'[data-intro-form] [type="submit"]'));
      find(template==='a'?'[data-intro-form] [data-help]':'[data-intro-form] [type="submit"]').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(document.activeElement,find('[data-close]'));
      find('dialog').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.ok(!find('dialog').hasAttribute('open'));assert.equal(document.activeElement,find('[data-launcher]'));
      assert.equal(document.documentElement.style.overflow,'');
    });
    await t.test('valid introduction, contextual actions, typed intents, safe fallback and escaping',async()=>{
      start();assert.equal(find('[data-conversation]').hidden,false);assert.equal(find('[data-introduction]').childElementCount,0);
      assert.match(find('[data-messages]').textContent,/Hi Efe! Welcome to Ikonectt\./);assert.doesNotMatch(find('[data-messages]').textContent,/803 123|Demo/);
      assert.equal(document.activeElement,find('[data-composer] input'));
      for(const [text,expected] of [['I need internet for my home',/residential plans/],['My internet is not working',/cannot diagnose/],['How do I get connected?',/fees and times require confirmation/],['I want to check my bill',/cannot access balances/],['<img src=x onerror=alert(1)>',/no AI model is connected/]]){
        fill('[data-composer] input',text);assert.equal(find('[data-composer] button').disabled,false);submit('[data-composer]');await flush();assert.match(find('[data-messages]').lastElementChild.textContent,expected);
      }
      assert.equal(find('[data-messages] img:not(.ik-assistant-avatar)'),null);assert.ok(find('[data-messages]').textContent.includes('<img src=x'));
      assert.equal(find('[data-messages]').getAttribute('role'),'log');
      click('[data-intent="support"]');await flush();assert.match(find('[data-messages]').lastElementChild.textContent,/no live agent/);
      click('[data-restart]');assert.equal(find('[data-messages]').childElementCount,0);assert.equal(find('[name="name"]').value,'');assert.equal(find('[name="phone"]').value,'');assert.equal(find('[data-composer] input').value,'');
      click('[data-close]');
    });
    await t.test('all nine required routes preserve template and selected public plan',async()=>{
      const cases=[
        ['home','[data-intent="residential"]','residential/plans'],
        ['residential',null,'residential/compare'],
        ['residential/plans/details?audience=residential&plan=res-igold',null,'coverage'],
        ['business',null,'business/quote'],
        ['coverage',null,'coverage/verification'],
        ['support','[data-intent="troubleshooting"]','support/troubleshooting'],
        ['support/troubleshooting',null,'support/fault'],
        ['my-ikonectt/sign-in',null,'my-ikonectt/forgot-password'],
        ['home','[data-intent="support"]','support/contact']
      ];
      for(const [from,intent,target] of cases){
        await go(from);
        if(!find('[data-intro-form]')){click('[data-launcher]');click('[data-restart]');click('[data-close]');}
        start();
        if(intent){click(intent);await flush();}
        const anchor=[...root.querySelectorAll('.ik-assistant [data-assistant-route]')].find(a=>parseRoute(a.getAttribute('href')).path===parseRoute('#/'+target).path);
        assert.ok(anchor,`${from} → ${target}`);
        anchor.click();await new Promise(resolve=>window.setTimeout(resolve,30));
        assert.equal(root.dataset.route,parseRoute('#/'+target).path);assert.equal(window.location.pathname,`/option-${template}/`);assert.equal(root.dataset.template,template);assert.ok(!find('dialog').hasAttribute('open'));
        if(from.includes('plan=res-igold'))assert.equal(document.querySelector('#ik-main [name="plan"]').value,'res-igold');
      }
    });
    await t.test('assistant plan picker preserves verified plan across coverage and quote',async()=>{
      for(const [audience,id,destination] of [['residential','res-igold','coverage'],['business','biz-500','business/quote']]){
        await go(audience+'/plans');click('[data-launcher]');click('[data-restart]');fill('[name="name"]','Efe Demo');fill('[name="phone"]','08031234567');submit('[data-intro-form]');
        click(`[data-intent="${audience}"]`);await flush();click(`[data-select-plan="${id}"]`);
        const anchor=[...root.querySelectorAll('.ik-assistant [data-assistant-route]')].find(a=>parseRoute(a.getAttribute('href')).path===destination);
        assert.ok(anchor.getAttribute('href').includes('plan='+id));anchor.click();await new Promise(resolve=>window.setTimeout(resolve,30));
        assert.equal(document.querySelector('#ik-main [name="plan"]').value,id);
      }
    });
    await t.test('no sensitive persistence, delivery, authentication or network calls',async()=>{
      assert.equal(window.localStorage.length,0);assert.equal(window.sessionStorage.length,0);assert.equal(document.cookie,'');assert.equal(networkCalls,0);
      assert.doesNotMatch(window.location.href,/Efe|Demo|803123|803\+123/);
      click('[data-launcher]');click('[data-restart]');assert.equal(find('[data-messages]').textContent,'');assert.equal(find('[name="phone"]').value,'');click('[data-close]');
      await go('my-ikonectt/preview');assert.match(document.querySelector('#ik-main').textContent,/not signed in/);
    });
  }finally{cleanup();assert.equal(document.querySelector('.ik-assistant'),null);window.close();}
});

test('provider boundary receives only public navigation and reset discards pending replies',async()=>{
  const dom=new JSDOM('<div id="site"></div>',{url:'https://example.test/option-a/'}),{window}=dom;
  for(const key of ['window','document','AbortController'])globalThis[key]=key==='window'?window:window[key];
  const received=[];let complete;
  const assistant=mountAssistant({root:document.querySelector('#site'),template:'a',getContext:()=>({path:'home',audience:'residential',phone:'never-pass',address:'never-pass'}),navigate:()=>{},provider:{respond:request=>{received.push(request);return new Promise(resolve=>complete=resolve);}}});
  try{
    document.querySelector('[data-launcher]').click();document.querySelector('[name="name"]').value='Efe Demo';document.querySelector('[name="phone"]').value='08031234567';document.querySelector('[data-intro-form]').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
    document.querySelector('[data-intent="residential"]').click();assert.deepEqual(received[0].context,{path:'home',audience:'residential',plan:''});
    assert.doesNotMatch(JSON.stringify(received),/Efe|08031234567|never-pass/);
    document.querySelector('[data-restart]').click();complete({text:'Old reply',actions:[]});await flush();assert.equal(document.querySelector('[data-messages]').textContent,'');
  }finally{assistant.destroy();window.close();}
});
