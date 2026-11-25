import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {AssistantSettingsView} from '../src/assistant-settings';
import {WorkspaceApi} from '../src/api';

const settings = {enabled:false,provider:'openai',model:'client-model',maxOutputTokens:180,dailyRequestLimit:50,credentialConfigured:true,credentialSource:'encrypted',lastTestStatus:'UNTESTED',knowledgePublished:20,usageToday:3};
async function settle(check:()=>boolean){for(let n=0;n<50&&!check();n++)await new Promise(resolve=>setTimeout(resolve,5));assert.ok(check());}

test('AI settings credentials are write-only, cleared before transport, and revocation requires explicit consent',async()=>{
    const dom=new JSDOM('<main></main>'), host=dom.window.document.querySelector('main')!;
    const original=globalThis.FormData;globalThis.FormData=dom.window.FormData as any;
    const calls:{path:string;method?:string;body?:any}[]=[];
    const api={mode:'live',assert(permission:string){assert.equal(permission,'staff.manage');},async request(path:string,method='GET',body?:any){
        calls.push({path,method,body});
        if(method==='PATCH')assert.equal(host.querySelector<HTMLInputElement>('[name=apiKey]')!.value,'');
        if(path.endsWith('/test'))return {ok:true,status:'CONNECTED',message:'Verified'};
        return settings;
    }} as unknown as WorkspaceApi;
    try{
        const view=new AssistantSettingsView(api,host,()=>true);await view.assistant();
        assert.match(host.textContent!,/Configured ••••••••/);
        assert.equal(host.querySelector<HTMLInputElement>('[name=apiKey]')!.value,'');
        host.querySelector<HTMLInputElement>('[name=apiKey]')!.value='test-write-only-credential';
        host.querySelector('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));
        await settle(()=>host.textContent!.includes('Configuration saved'));
        assert.equal(calls.find(call=>call.method==='PATCH')!.body.apiKey,'test-write-only-credential');
        assert.ok(!host.innerHTML.includes('test-write-only-credential'));
        host.querySelector<HTMLButtonElement>('#assistant-test')!.click();
        await settle(()=>host.textContent!.includes('Connection verified'));
        host.querySelector<HTMLButtonElement>('#assistant-revoke')!.click();
        assert.equal(calls.filter(call=>call.path.endsWith('/revoke')).length,0);
        host.querySelector<HTMLInputElement>('#confirm-revoke')!.checked=true;
        host.querySelector<HTMLButtonElement>('#assistant-revoke')!.click();
        await settle(()=>host.textContent!.includes('Credential revoked'));
        assert.equal(calls.filter(call=>call.path.endsWith('/revoke')).length,1);
    }finally{globalThis.FormData=original;dom.window.close();}
});

test('settings guard denies roles before loading configuration and preserves mock isolation',async()=>{
    const dom=new JSDOM('<main></main>'),host=dom.window.document.querySelector('main')!;
    let calls=0;
    const api={mode:'live',assert(){throw Error('Denied');},async request(){calls++;return settings;}} as unknown as WorkspaceApi;
    await assert.rejects(new AssistantSettingsView(api,host,()=>true).assistant(),/Denied/);
    assert.equal(calls,0);
    const preview={mode:'mock',assert(){},async request(){calls++;}} as unknown as WorkspaceApi;
    await assert.rejects(new AssistantSettingsView(preview,host,()=>true).assistant(),/persistent backend/);
    assert.equal(calls,0);dom.window.close();
});

test('contact settings submit the shared configured WhatsApp destination',async()=>{
    const dom=new JSDOM('<main></main>'),host=dom.window.document.querySelector('main')!;
    const original=globalThis.FormData;globalThis.FormData=dom.window.FormData as any;
    const whatsappUrl='https://api.whatsapp.com/send/?phone=2349168965000&text&type=phone_number&app_absent=0';
    let saved:any;
    const api={mode:'live',assert(){},async request(_path:string,method:string,body:any){if(method==='PATCH')saved=body;return{whatsappUrl,customerCareEmail:'customercare@ikonectt.com',portalUrl:'https://portal.ikonectt.com'};}} as unknown as WorkspaceApi;
    try{await new AssistantSettingsView(api,host,()=>true).contact();host.querySelector('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await settle(()=>host.textContent!.includes('Contact settings saved'));assert.deepEqual(saved,{whatsappUrl});}finally{globalThis.FormData=original;dom.window.close();}
});
