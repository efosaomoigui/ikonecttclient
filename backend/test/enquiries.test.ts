import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {config} from 'dotenv';
import request from 'supertest';
import {Database} from '../src/core/database';
import {Config} from '../src/core/config';
import {createApp} from '../src/bootstrap';
import {digest} from '../src/core/crypto';
import * as C from '../../contracts';
config({path:'.env.test.local',override:!process.env.TEST_DATABASE_URL});
if(!process.env.TEST_DATABASE_URL||!new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test'))throw Error('Dedicated test database required');
Object.assign(process.env,{NODE_ENV:'test',DATABASE_URL:process.env.TEST_DATABASE_URL});
const db=new Database(new Config());let app:Awaited<ReturnType<typeof createApp>>,token:string,staffId:string;const ids:string[]=[];
before(async()=>{const staff=await db.user.create({data:{name:'SIMULATED enquiry QA',email:randomUUID()+'@example.test',kind:'STAFF',roles:['ADMIN']}});staffId=staff.id;token=randomBytes(32).toString('base64url');await db.session.create({data:{userId:staffId,tokenHash:digest(token),expiresAt:new Date(Date.now()+3600000)}})});
after(async()=>{if(app)await app.close();await db.lead.deleteMany({where:{id:{in:ids}}});await db.user.update({where:{id:staffId},data:{enabled:false}});await db.$disconnect()});
test('every public request category persists, deduplicates, is managed and survives application restart',async()=>{
 for(const category of C.RequestCategory.options){
  if(app)await app.close();app=await createApp(true);await app.init();
  const input={name:'SIMULATED workflow',email:'qa@example.test',phone:'+2348031234567',kind:'RESIDENTIAL',message:'Isolated operational workflow verification',consent:true,category,sourceChannel:'WEBSITE',sourcePage:'support/contact',idempotencyKey:randomUUID()};
  const post=()=>request(app.getHttpServer()).post('/api/v1/leads');
  const first=await post().send(input).expect(200);ids.push(first.body.id);
  const repeat=await post().send(input).expect(200);assert.equal(repeat.body.id,first.body.id);
  await post().send({...input,message:'Changed details'}).expect(409);
  assert.equal(await db.lead.count({where:{idempotencyKey:input.idempotencyKey}}),1);
  const assignees=await request(app.getHttpServer()).get('/api/v1/admin/leads/assignees').set('Authorization','Bearer '+token).expect(200);assert.ok(assignees.body.some((u:any)=>u.id===staffId));assert.ok(assignees.body.every((u:any)=>Object.keys(u).sort().join(',')==='id,name'));
  await request(app.getHttpServer()).get('/api/v1/admin/leads/'+first.body.id).expect(401);
  const manage=request(app.getHttpServer()).patch('/api/v1/admin/leads/'+first.body.id).set('Authorization','Bearer '+token);
  await manage.send({status:'ASSIGNED',assignedToId:staffId,internalNote:'Private staff follow-up'}).expect(200);
  await app.close();app=await createApp(true);await app.init();
  const detail=await request(app.getHttpServer()).get('/api/v1/admin/leads/'+first.body.id).set('Authorization','Bearer '+token).expect(200);
  assert.equal(detail.body.category,category);assert.equal(detail.body.assignedToId,staffId);assert.equal(detail.body.activity.length,2);assert.equal(detail.body.activity[1].note,'Private staff follow-up');
  const list=await request(app.getHttpServer()).get('/api/v1/admin/leads?category='+category+'&search=SIMULATED&limit=1&sort=name&direction=asc').set('Authorization','Bearer '+token).expect(200);
  assert.equal(list.body.items.length,1);assert.equal(list.body.items[0].category,category);assert.ok(!('requestHash' in list.body.items[0]));assert.ok(!('activity' in list.body.items[0]));
 }
});
test('validation, assignee checks, RBAC, private output and public spam throttling fail closed',async()=>{
 await app.close();app=await createApp(true);await app.init();
 const input={name:'SIMULATED validation',email:'qa@example.test',phone:'+2348031234567',kind:'RESIDENTIAL',message:'Validation test',consent:true};
 const post=()=>request(app.getHttpServer()).post('/api/v1/leads');
 await post().send({...input,consent:false}).expect(400);await post().send({...input,website:'spam'}).expect(400);
 const result=await post().send(input).expect(200);ids.push(result.body.id);assert.deepEqual(Object.keys(result.body).sort(),['id','status']);
 await request(app.getHttpServer()).patch('/api/v1/admin/leads/'+result.body.id).set('Authorization','Bearer '+token).send({assignedToId:randomUUID()}).expect(400);
 const user=await db.user.create({data:{name:'SIMULATED no request access',kind:'STAFF',email:randomUUID()+'@example.test',roles:['FINANCE']}});const forbidden=randomBytes(32).toString('base64url');await db.session.create({data:{userId:user.id,tokenHash:digest(forbidden),expiresAt:new Date(Date.now()+3600000)}});
 await request(app.getHttpServer()).get('/api/v1/admin/leads').set('Authorization','Bearer '+forbidden).expect(403);await db.user.delete({where:{id:user.id}});
 await post().send({...input,consent:false}).expect(400);await post().send({...input,consent:false}).expect(400);await post().send(input).expect(429);
});

test('concurrent identical submissions produce one persisted reference',async()=>{
 await app.close();app=await createApp(true);await app.init();
 const input={name:'SIMULATED concurrent request',email:'qa@example.test',phone:'+2348031234567',kind:'BUSINESS',message:'Concurrent retry verification',consent:true,idempotencyKey:randomUUID()};
 const results=await Promise.all([1,2].map(()=>request(app.getHttpServer()).post('/api/v1/leads').send(input)));
 const persisted=await db.lead.findMany({where:{idempotencyKey:input.idempotencyKey}});ids.push(...persisted.map(r=>r.id));assert.equal(persisted.length,1);assert.ok(results.every(r=>r.status===200));assert.equal(results[0].body.id,results[1].body.id);
});
