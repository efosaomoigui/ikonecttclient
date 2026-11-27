import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {config} from 'dotenv';
import request from 'supertest';
import {Database} from '../src/core/database';
import {Config} from '../src/core/config';
import {createApp} from '../src/bootstrap';
import {digest} from '../src/core/crypto';
import * as provider from '../../server/client-catalogue';

test('client catalogue HTTP reads, read-only Admin, enquiry references and offline retry preserve local data',async()=>{
 config({path:'.env.test.local',override:true,quiet:true} as any);
 if(!process.env.TEST_DATABASE_URL||!new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test'))throw Error('Dedicated test database required');
 Object.assign(process.env,{NODE_ENV:'test',DATABASE_URL:process.env.TEST_DATABASE_URL,IKONECTT_CATALOGUE_PROVIDER:'client',WEBSITE_API_KEY:'private-test-key'});
 const original=globalThis.fetch,db=new Database(new Config());let app:Awaited<ReturnType<typeof createApp>>|undefined,leadId:string|undefined,userId:string|undefined;
 const before=await db.plan.count();
 globalThis.fetch=async input=>{const url=String(input);return new Response(JSON.stringify({error:false,data:url.includes('/plans')?{count:1,plans:[{id:11,name:'i-Basic_50Mbps',category:'Residential',price_per_month:32500,currency:'NGN',download_mbps:50,upload_mbps:50,description:''}]}:{covered:true,count:1,matches:[{area:'DOLPHIN',zone:'Zone 1'}]}}),{headers:{'Content-Type':'application/json'}})};
 provider.clearCache();
 try{
 app=await createApp(true);await app.init();const http=app.getHttpServer();
 const user=await db.user.create({data:{kind:'STAFF',name:'SIMULATED client adapter QA',email:randomUUID()+'@example.test',roles:['ADMIN']}});userId=user.id;
 const token=randomBytes(32).toString('base64url');await db.session.create({data:{userId:user.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+3600000)}});
 const plans=await request(http).get('/api/v1/plans').expect(200),plan=plans.body.items[0];assert.equal(plan.source,'CLIENT');assert.equal(plan.billingPeriod,'MONTH');assert.ok(plan.description);
 await request(http).get('/api/v1/plans/'+plan.id).expect(200);
 const areas=await request(http).get('/api/v1/coverage/service-areas?search=dolphin').expect(200);assert.equal(areas.body.items[0].name,'DOLPHIN');
 await request(http).get('/api/v1/admin/plans').expect(401);
 await request(http).get('/api/v1/admin/plans').set('Authorization','Bearer '+token).expect(200);
 await request(http).patch('/api/v1/admin/plans/'+plan.id).set('Authorization','Bearer '+token).send({name:'Forbidden local edit'}).expect(409);
 await request(http).post('/api/v1/coverage/check').send({buildingId:randomUUID(),planId:plan.id}).expect(409);
 const input={name:'SIMULATED selected client plan',email:'qa@example.test',phone:'+2348031234567',kind:'RESIDENTIAL',message:'Client plan enquiry integration check',consent:true,planId:plan.id,idempotencyKey:randomUUID()};
 const first=await request(http).post('/api/v1/leads').send(input).expect(200);leadId=first.body.id;
 const stored=await db.lead.findUniqueOrThrow({where:{id:leadId}});assert.equal(stored.planId,null);assert.equal(stored.clientPlanReference,'11');assert.equal(stored.clientPlanName,plan.name);
 const detail=await request(http).get('/api/v1/admin/leads/'+leadId).set('Authorization','Bearer '+token).expect(200);assert.equal(detail.body.clientPlanReference,'11');
 provider.clearCache();globalThis.fetch=async()=>{throw Error('Upstream unavailable')};
 const retry=await request(http).post('/api/v1/leads').send(input).expect(200);assert.equal(retry.body.id,leadId);
 await request(http).get('/api/v1/plans').expect(503);assert.equal(await db.plan.count(),before);
 }finally{globalThis.fetch=original;provider.clearCache();process.env.IKONECTT_CATALOGUE_PROVIDER='internal';if(app)await app.close();if(leadId)await db.lead.delete({where:{id:leadId}});if(userId)await db.user.delete({where:{id:userId}});await db.$disconnect();}
});
