import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {config} from 'dotenv';
import request from 'supertest';
import {Database} from '../src/core/database';
import {Config} from '../src/core/config';
import {createApp} from '../src/bootstrap';
import {digest} from '../src/core/crypto';
import {importClientData,clientPlans} from '../scripts/import-client-data';
config({path:'.env.test.local',override:!process.env.TEST_DATABASE_URL});
if(!process.env.TEST_DATABASE_URL||!new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test'))throw Error('Dedicated _test database required');
Object.assign(process.env,{NODE_ENV:'test',DATABASE_URL:process.env.TEST_DATABASE_URL});
const db=new Database(new Config());let app:Awaited<ReturnType<typeof createApp>>,admin:string;
const names=JSON.parse(readFileSync('data/client-service-areas.json','utf8'));
before(async()=>{await importClientData(db,names);app=await createApp(true);await app.init();admin=randomUUID().replace(/-/g,'')+'abcdefghijk';const user=await db.user.create({data:{kind:'STAFF',name:'SIMULATED data test',email:randomUUID()+'@example.test',roles:['ADMIN']}});await db.session.create({data:{userId:user.id,tokenHash:digest(admin),expiresAt:new Date(Date.now()+3600000)}})});
after(async()=>{if(app)await app.close();await db.$disconnect()});
test('client plan import keeps seven stable plans, unknown terms and Admin edits on rerun',async()=>{
 const first=await importClientData(db,names);assert.deepEqual(first,{plans:7,coverageSourceRows:83,publicPrimaryAreas:81});
 const plans=await db.plan.findMany({where:{code:{in:clientPlans.map(p=>p.code)}}});assert.equal(plans.filter(p=>p.kind==='RESIDENTIAL').length,3);assert.equal(plans.filter(p=>p.kind==='BUSINESS'&&p.priceMinor===null).length,4);assert.ok(plans.every(p=>p.billingDays===null));
 const plan=plans.find(p=>p.code==='i-basic-50mbps')!;const update=await request(app.getHttpServer()).patch('/api/v1/admin/plans/'+plan.id).set('Authorization','Bearer '+admin).send({name:'Client-edited plan'});assert.equal(update.status,200);
 await importClientData(db,names);assert.equal((await db.plan.findUniqueOrThrow({where:{id:plan.id}})).name,'Client-edited plan');
 await db.plan.update({where:{id:plan.id},data:{name:clientPlans[0].name}});
});
test('public coverage searches aliases without claiming address availability; Admin can deactivate',async()=>{
 const get=(query:string)=>request(app.getHttpServer()).get('/api/v1/coverage/service-areas?limit=100&search='+encodeURIComponent(query));
 const all=await get('');assert.equal(all.status,200);assert.equal(all.body.total,81);assert.ok(all.body.items.every((r:any)=>!('sourceName'in r)&&!('reviewNote'in r)));
 for(const term of ['dIdEoLu','goldmark','Victoria Island','ilupeju']){const r=await get(term);assert.equal(r.status,200);assert.equal(r.body.items.length,1);assert.match(r.body.items[0].notice,/feasibility/);assert.equal(r.body.items[0].eligibility,undefined)}
 assert.equal((await get('Not a supplied area xyz')).body.total,0);
 const area=await db.serviceArea.findFirstOrThrow({where:{name:'Ikeja'}});
 await request(app.getHttpServer()).patch('/api/v1/admin/service-areas/'+area.id).send({active:false}).expect(401);
 await request(app.getHttpServer()).patch('/api/v1/admin/service-areas/'+area.id).set('Authorization','Bearer '+admin).send({active:false}).expect(200);
 assert.equal((await get('Ikeja')).body.total,0);await importClientData(db,names);assert.equal((await get('Ikeja')).body.total,0);
 await request(app.getHttpServer()).patch('/api/v1/admin/service-areas/'+area.id).set('Authorization','Bearer '+admin).send({active:true}).expect(200);
});

test('unknown billing terms and unpublished business prices cannot create a payable order',async()=>{
 for(const code of ['i-basic-50mbps','i-business-100mbps']){
  const plan=await db.plan.findUniqueOrThrow({where:{code}});
  const customer=await db.customer.create({data:{accountNumber:'IMPORT-'+randomUUID(),name:'SIMULATED unknown commercial terms',email:randomUUID()+'@example.test',phone:'+2348000000000',kind:plan.kind}});
  const user=await db.user.create({data:{kind:'CUSTOMER',name:customer.name,customerId:customer.id}});
  const bearer=randomUUID().replace(/-/g,'')+'abcdefghijk';await db.session.create({data:{userId:user.id,tokenHash:digest(bearer),expiresAt:new Date(Date.now()+3600000)}});
  const building=await db.coverageLocation.create({data:{name:'SIMULATED verified address',level:'BUILDING_ADDRESS',eligibility:'AVAILABLE',plans:{create:{planId:plan.id}}}});
  await request(app.getHttpServer()).post('/api/v1/me/orders').set('Authorization','Bearer '+bearer).send({planId:plan.id,buildingId:building.id}).expect(409);
  assert.equal(await db.order.count({where:{customerId:customer.id}}),0);
 }
});
