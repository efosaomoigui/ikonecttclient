import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {modules} from '../../src/modules';
import {uuid} from '../../src/fixtures';
import {standaloneFixtures} from '../../src/demo-fixtures';
import {ROLE_PERMISSIONS,type StaffRole} from '../../vendor/permissions';

const output=new URL('../../dist-demo/admin/',import.meta.url);
const html=readFileSync(new URL('index.html',output),'utf8');
const assets=new URL('assets/',output);
const bundle=readFileSync(new URL(readdirSync(assets).find(name=>name.endsWith('.js'))!,assets),'utf8');
const theme=readFileSync(new URL('theme-init.js',output),'utf8');
const roleNames=Object.keys(ROLE_PERMISSIONS) as StaffRole[];
async function waitFor(fn:()=>boolean){for(let i=0;i<250;i++){if(fn())return;await new Promise(resolve=>setTimeout(resolve,10));}assert.fail('Demo DOM state did not arrive');}
function boot(hash=''){
    const dom=new JSDOM(html,{url:`https://admin-demo.example.test/admin/${hash}`,runScripts:'outside-only',pretendToBeVisual:true});
    const attempts:string[]=[];
    Object.assign(dom.window,{
        structuredClone:globalThis.structuredClone,
        fetch:async(url:unknown)=>{attempts.push(String(url));throw new Error('No network available in standalone acceptance');},
        XMLHttpRequest:class{constructor(){attempts.push('XMLHttpRequest');throw new Error('No XHR');}},
        WebSocket:class{constructor(){attempts.push('WebSocket');throw new Error('No WebSocket');}},
        EventSource:class{constructor(){attempts.push('EventSource');throw new Error('No EventSource');}},
    });
    dom.window.eval(theme);dom.window.eval(bundle);
    return {dom,doc:dom.window.document,attempts};
}
function click(dom:JSDOM,selector:string){const el=dom.window.document.querySelector<HTMLElement>(selector);assert.ok(el,selector);el.click();}
async function enter(dom:JSDOM,role:StaffRole='ADMIN'){
    click(dom,'.preview-box summary');
    dom.window.document.querySelector<HTMLSelectElement>('#preview-role')!.value=role;
    click(dom,'[data-action=preview]');
    await waitFor(()=>!!dom.window.document.querySelector('#content h1'));
}
async function go(dom:JSDOM,key:string){
    dom.window.location.hash=`#/${key}`;
    await waitFor(()=>!!dom.window.document.querySelector(`.nav-link.active[href="#/${key}"]`));
    await waitFor(()=>!!dom.window.document.querySelector('#content h1')&&!dom.window.document.querySelector('.loading'));
}

test('standalone artifact contains only local static assets, noindex and restrictive network/form policies',()=>{
    const parsed=new JSDOM(html).window.document;
    const csp=parsed.querySelector('meta[http-equiv="Content-Security-Policy"]')!.getAttribute('content')!;
    assert.match(csp,/connect-src 'none'/);assert.match(csp,/form-action 'none'/);
    assert.match(parsed.querySelector('meta[name=robots]')!.getAttribute('content')!,/noindex/);
    assert.doesNotMatch(bundle,/https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])/);
    for(const attr of ['script[src]','link[href]'])for(const el of parsed.querySelectorAll(attr)){
        const src=el.getAttribute(el.tagName==='SCRIPT'?'src':'href')!;
        assert.match(src,/^\/admin\//);
        assert.ok(readFileSync(new URL(src.slice('/admin/'.length),output)).length);
    }
    for(const file of ['logo-red.png','logo-white.png','inter.woff2']){
        const expected=readFileSync(new URL(`../../public/${file}`,import.meta.url));
        assert.equal(createHash('sha256').update(readFileSync(new URL(file,output))).digest('hex'),createHash('sha256').update(expected).digest('hex'));
    }
    const config=JSON.parse(readFileSync(new URL('../../vercel.json',import.meta.url),'utf8'));
    assert.equal(config.outputDirectory,'dist-demo');assert.equal(config.buildCommand,'npm run build:demo');
    assert.equal(config.installCommand,'npm ci --include=dev');
    assert.deepEqual(config.redirects,[{source:'/',destination:'/admin/',permanent:false}]);
    const headers=config.headers.find((entry:any)=>entry.source==='/(.*)').headers;
    assert.match(headers.find((entry:any)=>entry.key==='Content-Security-Policy').value,/connect-src 'none'; form-action 'none'/);
    assert.match(readFileSync(new URL('../robots.txt',output),'utf8'),/Disallow: \//);
});

test('standalone login/recovery/setup never request a backend or accept real credentials',async()=>{
    const state=boot();try{
        const {doc,dom}=state;
        for(const selector of ['#login-form input[name=email]','#login-form input[name=password]','#login-form button[type=submit]'])
            assert.equal((doc.querySelector(selector) as HTMLInputElement).disabled,true,selector);
        assert.equal(doc.querySelector<HTMLInputElement>('#login-form input[name=password]')!.autocomplete,'off');
        doc.querySelector('#login-form')!.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
        assert.match(doc.querySelector('#login-error')!.textContent!,/unavailable.*Review/i);
        for(const action of ['recovery','reset-password']){
            click(dom,`[data-action=${action}]`);
            assert.match(doc.querySelector('.modal')!.textContent!,/unavailable.*No request is sent/s);
            assert.equal(doc.querySelector('#auth-help-form'),null);
            click(dom,'[data-action=close]');
        }
        assert.deepEqual(state.attempts,[]);
    }finally{state.dom.window.close();}
});

for(const role of roleNames)test(`standalone ${role} loads every permitted screen, retains themes and makes zero connection attempts`,async()=>{
    const state=boot();try{
        await enter(state.dom,role);
        const {doc,dom}=state;
        assert.equal(doc.querySelectorAll('.demo-banner').length,1);
        assert.match(doc.querySelector('.demo-banner')!.textContent!,/independent.*separate portal/i);
        assert.equal(doc.querySelectorAll('.nav-group-toggle[aria-expanded=true]').length,0);
        const routes=[...doc.querySelectorAll<HTMLAnchorElement>('.nav-link')].map(a=>a.getAttribute('href')!.slice(2));
        for(const key of routes){
            await go(dom,key);
            assert.equal(doc.querySelector('.error-state'),null,`${role}/${key}`);
            assert.ok(doc.querySelector('#content h1')!.textContent,key);
            if(key!=='dashboard')assert.equal(doc.querySelector(`.nav-link.active[href="#/${key}"]`)!.closest('[hidden]'),null);
        }
        const select=doc.querySelector<HTMLSelectElement>('[data-theme-select]')!;
        for(const theme of ['dark','light','system']){
            select.value=theme;select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
            assert.equal(doc.documentElement.dataset.themePreference,theme);
        }
        const permissions:readonly string[]=ROLE_PERMISSIONS[role];
        assert.equal(!!doc.querySelector('.nav-link[href="#/staff"]'),permissions.includes('staff.manage'));
        assert.equal(!!doc.querySelector('.nav-link[href="#/walletTopUps"]'),permissions.includes('payments.verify'));
        assert.deepEqual(state.attempts,[]);
    }finally{state.dom.window.close();}
});

test('fictional A/B scenarios and ledger totals reconcile without changing the regular fixtures',()=>{
    const data=standaloneFixtures();
    for(const [key,module] of Object.entries(modules))for(const record of data[key])module.schema.parse(record);
    const a=data.walletSummaries.find(s=>s.customerId===uuid(1))!;
    const b=data.walletSummaries.find(s=>s.customerId===uuid(2))!;
    assert.equal(a.availableMinor,3000000);assert.equal(a.reservedMinor,0);
    assert.equal(b.availableMinor,0);assert.equal(b.reservedMinor,0);assert.equal(b.postedMinor,0);
    assert.equal(data.walletEntries.filter(e=>e.customerId===a.customerId).reduce((sum,e)=>sum+e.postedDeltaMinor,0),a.postedMinor);
    assert.equal(data.walletEntries.filter(e=>e.customerId===a.customerId).reduce((sum,e)=>sum+e.reservedDeltaMinor,0),a.reservedMinor);
    const aSub=data.subscriptions.find(s=>s.id===uuid(260))!,bSub=data.subscriptions.find(s=>s.id===uuid(261))!;
    assert.equal(aSub.status,'SUSPENDED');assert.ok(aSub.endsAt<'2026-10-22');assert.equal(aSub.renewalEnabled,true);
    assert.equal(bSub.status,'ACTIVE');assert.equal(data.plans.find(p=>p.id===bSub.planId)!.kind,'BUSINESS');
    assert.equal(data.plans.find(p=>p.id===aSub.planId)!.renewalPriceMinor,1950000);
    assert.equal(data.plans.find(p=>p.id===aSub.planId)!.priceMinor,1950000);
    const reset=standaloneFixtures();data.customers[0].name='Mutated';a.availableMinor=1;
    assert.equal(reset.customers[0].name,'Ada Okafor');assert.equal(reset.walletSummaries.find(s=>s.customerId===uuid(1))!.availableMinor,3000000);
});

test('standalone navigation, customer creation/filtering, support messages and reset update local state only',async()=>{
    const state=boot();try{
        const {dom,doc}=state;await enter(dom);
        await go(dom,'customers');click(dom,'[data-action=create]');await waitFor(()=>!!doc.querySelector('#record-form'));
        for(const [name,value] of Object.entries({name:'Fictional Demo Client',email:'fictional.demo@example.test',phone:'+2348000000000'}))
            doc.querySelector<HTMLInputElement>(`#record-form [name=${name}]`)!.value=value;
        doc.querySelector('#record-form')!.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
        await waitFor(()=>!doc.querySelector('#record-form')&&!!doc.querySelector('tbody'));
        let search=doc.querySelector<HTMLInputElement>('#search')!;search.value='Fictional Demo Client';search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
        assert.match(doc.querySelector('tbody')!.textContent!,/Fictional Demo Client/);
        click(dom,'[data-detail]');await waitFor(()=>!!doc.querySelector('.wallet-summary'));
        assert.match(doc.querySelector('.wallet-summary')!.textContent!,/Available credit.*0\.00/);
        assert.equal(doc.querySelector('[data-action=credentials]'),null);
        click(dom,'[data-action=close]');
        await go(dom,'tickets');click(dom,'[data-detail]');await waitFor(()=>!!doc.querySelector('#reply-form'));
        doc.querySelector<HTMLTextAreaElement>('#reply-form textarea')!.value='Fictional demo reply, not sent to the portal.';
        doc.querySelector('#reply-form')!.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
        await waitFor(()=>!!doc.querySelector('.modal')?.textContent?.includes('Fictional demo reply'));
        click(dom,'[data-action=close]');click(dom,'[data-action=account]');click(dom,'[data-action=logout]');
        await waitFor(()=>!!doc.querySelector('#login-form'));await enter(dom);
        await go(dom,'customers');search=doc.querySelector<HTMLInputElement>('#search')!;search.value='Fictional Demo Client';search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
        assert.match(doc.querySelector('.empty')!.textContent!,/No matching records/);
        assert.deepEqual(state.attempts,[]);
    }finally{state.dom.window.close();}
});

test('hash refresh re-enters with reset sample state and preserves only permitted deep routes',async()=>{
    for(const [hash,role,expected] of [['#/customers','SUPPORT','#/customers'],['#/staff','SUPPORT','#/dashboard']] as const){
        const state=boot(hash);try{
            assert.ok(state.doc.querySelector('#login-form'));
            await enter(state.dom,role);assert.equal(state.dom.window.location.hash,expected);
            assert.equal(state.doc.querySelector('.error-state'),null);
            assert.deepEqual(state.attempts,[]);
        }finally{state.dom.window.close();}
    }
});

test('compile-time demo request guard rejects transport even if runtime mode is accidentally set to live',async()=>{
    Object.assign(globalThis,{__IKONECTT_STANDALONE_DEMO__:true});
    const {WorkspaceApi,ApiError}=await import('../../src/api');
    let attempts=0;
    const api=new WorkspaceApi('',async()=>{attempts++;throw new Error('Transport must not be reached');});
    for(const mode of ['live','mock'] as const){
        api.mode=mode;
        for(const [path,method] of [['/auth/staff/login','POST'],['/auth/staff/recovery','POST'],['/auth/reset-password','POST'],['/admin/customers','POST'],['/health','GET']])
            await assert.rejects(api.request(path,method,{}),(e:unknown)=>e instanceof ApiError&&e.code==='STANDALONE_DEMO');
    }
    assert.equal(attempts,0);assert.equal(api.session,null);assert.deepEqual(api.permissions,[]);
});
