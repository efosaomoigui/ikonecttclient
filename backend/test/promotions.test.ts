import {test} from 'node:test';
import assert from 'node:assert/strict';
import {config} from 'dotenv';
import {randomUUID,randomBytes} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/bootstrap';
import {Database} from '../src/core/database';
import {Config} from '../src/core/config';
import {digest} from '../src/core/crypto';
import * as C from '../../contracts';
test('promotion publication, scheduling, raster validation and administrator access',async()=>{
 config({path:'.env.test.local',override:true,quiet:true} as any);if(!process.env.TEST_DATABASE_URL||!new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test'))throw Error('Dedicated test database required');Object.assign(process.env,{NODE_ENV:'test',DATABASE_URL:process.env.TEST_DATABASE_URL});
 const db=new Database(new Config()),app=await createApp(true);await app.init();let staffId:string|undefined;const previous=await db.websitePromotion.findUnique({where:{id:'main'}});
 try{await db.websitePromotion.deleteMany();const http=app.getHttpServer();assert.equal((await request(http).get('/api/v1/promotions/active').expect(200)).body.promotion,null);await request(http).get('/api/v1/admin/promotion').expect(401);
 const staff=await db.user.create({data:{kind:'STAFF',name:'SIMULATED promotion QA',email:randomUUID()+'@example.test',roles:['ADMIN']}});staffId=staff.id;const token=randomBytes(32).toString('base64url');await db.session.create({data:{userId:staff.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+3600000)}});
 const imageData='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
 const input=C.PromotionInput.parse({title:'Sample',imageAlt:'Sample image',imageData,published:true,actionLabel:'Plans',actionUrl:'#/residential/plans'}),save=(b:object)=>request(http).patch('/api/v1/admin/promotion').set('Authorization','Bearer '+token).send(b);
 await save(input).expect(200);assert.equal((await request(http).get('/api/v1/promotions/active').expect(200)).body.promotion.title,'Sample');await save({...input,published:false}).expect(200);assert.equal((await request(http).get('/api/v1/promotions/active')).body.promotion,null);
 await save({...input,startsAt:new Date(Date.now()+3600000).toISOString()}).expect(200);assert.equal((await request(http).get('/api/v1/promotions/active')).body.promotion,null);
 await save({...input,imageData:'data:image/png;base64,'+Buffer.from('invalid image payload invalid').toString('base64')}).expect(400);await save({...input,actionUrl:'javascript:alert(1)'}).expect(400);await save({...input,endsAt:'2020-01-01T00:00:00.000Z',startsAt:'2021-01-01T00:00:00.000Z'}).expect(400);
 }finally{await app.close();await db.websitePromotion.deleteMany();if(previous)await db.websitePromotion.create({data:{...previous,payload:C.PromotionInput.parse(previous.payload)}});if(staffId)await db.user.update({where:{id:staffId},data:{enabled:false}});await db.$disconnect();}
});
