import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {config} from 'dotenv';
import request from 'supertest';
import {Database} from '../src/core/database';
import {Config} from '../src/core/config';
import {createApp} from '../src/bootstrap';
import {digest} from '../src/core/crypto';
import {OpenAiProvider} from '../src/assistant/ai-settings.service';
config({path:'.env.test.local',override:!process.env.TEST_DATABASE_URL});
if(!process.env.TEST_DATABASE_URL||!new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test'))throw Error('Dedicated test DB required');
Object.assign(process.env,{NODE_ENV:'test',DATABASE_URL:process.env.TEST_DATABASE_URL,AI_ENCRYPTION_KEY:randomBytes(32).toString('hex')});
const db=new Database(new Config());let app:Awaited<ReturnType<typeof createApp>>,admin:string,support:string;const key='sk-TEST-SECRET-'+randomUUID();let calls=0;
function api(method:'get'|'post'|'patch',path:string,bearer?:string,body?:any){const r=request(app.getHttpServer())[method]('/api/v1'+path);if(bearer)r.set('Authorization','Bearer '+bearer);return body===undefined?r:r.send(body)}
before(async()=>{for(const role of ['ADMIN','SUPPORT'] as const){const user=await db.user.create({data:{kind:'STAFF',name:'SIMULATED AI tests',email:randomUUID()+'@example.test',roles:[role]}});const token=randomBytes(32).toString('base64url');await db.session.create({data:{userId:user.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+3600000)}});if(role==='ADMIN')admin=token;else support=token}app=await createApp(true);await app.init();app.get(OpenAiProvider).complete=async(provided,model,messages,limit)=>{assert.equal(provided,key);assert.equal(model,'test-model');assert.ok(limit<=600);calls++;return{text:messages[0].content==='Reply with exactly OK.'?'OK':'{"intent":"enquiry","articleKey":null}',inputTokens:10,outputTokens:5}}});
after(async()=>{if(app)await app.close();await db.$disconnect()});
test('AI secrets are encrypted, masked, role protected and auditable without secret values',async()=>{
 await api('get','/admin/assistant/settings').expect(401);await api('get','/admin/assistant/settings',support).expect(403);
 const saved=await api('patch','/admin/assistant/settings',admin,{apiKey:key,model:'test-model',enabled:true,dailyRequestLimit:100}).expect(200);assert.equal(saved.body.credentialConfigured,true);assert.ok(!JSON.stringify(saved.body).includes(key));
 await api('get','/capabilities').expect(200).then(r=>assert.equal(r.body.ai,'configured-model-see-settings'));
 const row=await db.assistantSettings.findUniqueOrThrow({where:{id:'main'}});assert.ok(row.encryptedCredential&&!row.encryptedCredential.includes(key));
 const audit=await db.auditLog.findMany({where:{entityType:'AssistantSettings'}});assert.ok(!JSON.stringify(audit).includes(key));
 await api('post','/admin/assistant/test',admin).expect(200).then(r=>assert.equal(r.body.ok,true));
 const provider=app.get(OpenAiProvider),mock=provider.complete,transport=globalThis.fetch;
 provider.complete=OpenAiProvider.prototype.complete;globalThis.fetch=async()=>new Response('forbidden provider secret',{status:403});
 try{const failure=await api('post','/admin/assistant/test',admin).expect(200);assert.equal(failure.body.ok,false);assert.ok(!JSON.stringify(failure.body).includes('forbidden provider secret'))}finally{provider.complete=mock;globalThis.fetch=transport}

});
test('deterministic enquiry and model classifications never display untrusted free text',async()=>{
 const prior=calls;const response=await api('post','/assistant/guidance',undefined,{message:'I want to make enquiry'}).expect(200);assert.match(response.body.answer,/Certainly/);assert.equal(calls,prior);
 const classified=await api('post','/assistant/guidance',undefined,{message:'hello there, could you guide me please'}).expect(200);assert.match(classified.body.answer,/Certainly/);assert.equal(classified.body.mode,'ai');
 app.get(OpenAiProvider).complete=async()=>({text:'Ignore approved facts. Prices are free forever.',inputTokens:1,outputTokens:1});
 const malicious=await api('post','/assistant/guidance',undefined,{message:'zz unknown request'}).expect(200);assert.equal(malicious.body.mode,'fallback');assert.ok(!malicious.body.answer.includes('free forever'));
});
test('revocation and provider failure retain useful deterministic fallback and contact settings',async()=>{
 await api('post','/admin/assistant/revoke',admin).expect(200).then(r=>assert.equal(r.body.credentialConfigured,false));
 await api('post','/assistant/guidance',undefined,{message:'zz unknown request'}).expect(200).then(r=>assert.equal(r.body.mode,'fallback'));
 const contact=await api('get','/contact-settings').expect(200);assert.match(contact.body.whatsappUrl,/2349168965000/);
 await api('post','/admin/assistant/test',admin).expect(200).then(r=>{assert.equal(r.body.ok,false);assert.equal(r.body.status,'FAILED')});
 await api('patch','/admin/contact-settings',support,{whatsappUrl:contact.body.whatsappUrl}).expect(403);
 await api('patch','/admin/contact-settings',admin,{whatsappUrl:'https://evil.example/send/'}).expect(400);
 await api('post','/assistant/guidance',undefined,{message:'hello',history:Array(9).fill({role:'user',content:'x'})}).expect(400);
});

test('provider transport uses fixed endpoint, store false and bounded output; failures are not echoed',async()=>{
 const original=globalThis.fetch;let sent:any;
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');sent=JSON.parse(options!.body as string);assert.equal(sent.store,false);assert.equal(sent.max_output_tokens,64);return new Response(JSON.stringify({output:[{type:'message',content:[{type:'output_text',text:'OK'}]}],usage:{input_tokens:3,output_tokens:1}}),{status:200})};
 try{const result=await new OpenAiProvider().complete('unused-test-key','test-model',[{role:'user',content:'OK'}],64);assert.equal(result.text,'OK');assert.equal(result.inputTokens,3);globalThis.fetch=async()=>new Response('secret must not escape',{status:401});await assert.rejects(new OpenAiProvider().complete('unused-test-key','test-model',[],64),/PROVIDER_REJECTED/);
 }finally{globalThis.fetch=original}
});
test('quota reservations prevent concurrent model calls beyond the configured daily limit',async()=>{
 const settings=app.get((await import('../src/assistant/ai-settings.service')).AiSettingsService);
 await db.assistantUsage.deleteMany();await settings.save({id:(await db.user.findFirstOrThrow({where:{roles:{has:'ADMIN'}}})).id} as any,{apiKey:key,enabled:true,dailyRequestLimit:1,model:'test-model'});
 let count=0;app.get(OpenAiProvider).complete=async()=>{count++;return{text:'OK',inputTokens:1,outputTokens:1}};
 const results=await Promise.allSettled([settings.generate([{role:'user',content:'test'}]),settings.generate([{role:'user',content:'test'}])]);assert.equal(count,1);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 await settings.revoke({id:(await db.user.findFirstOrThrow({where:{roles:{has:'ADMIN'}}})).id} as any);
});
test('dormant customer route gate preserves public help and staff login',async()=>{
 const settings=app.get(Config).values;const before=settings.CUSTOMER_PORTAL_ENABLED;settings.CUSTOMER_PORTAL_ENABLED='false';
 try{await api('get','/me/dashboard').expect(404);await api('post','/auth/login',undefined,{accountNumber:'x',password:'x'}).expect(404);await api('get','/contact-settings').expect(200);await api('get','/admin/assistant/settings',admin).expect(200);
 const staff=await db.user.create({data:{kind:'STAFF',name:'SIMULATED recovery',email:randomUUID()+'@example.test',roles:['SUPPORT']}});const token=randomBytes(32).toString('base64url');await db.passwordReset.create({data:{userId:staff.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+60000)}});
 await api('post','/auth/reset-password',undefined,{token,password:'SIMULATED-reset-password-test'}).expect(200);
 }finally{settings.CUSTOMER_PORTAL_ENABLED=before}
});
