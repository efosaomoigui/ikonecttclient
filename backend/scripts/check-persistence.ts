import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { Database } from '../src/core/database';
import { developmentFixtures as F } from '../../contracts/fixtures';
import { developmentContext } from './development-context';
async function main(){
  const context=developmentContext(),db=new Database(context.config);
  try{
    const records={
      customers:await db.customer.findMany({where:{id:{in:F.customers.map(customer=>customer.id)}},orderBy:{id:'asc'},select:{id:true,accountNumber:true,status:true}}),
      plans:await db.plan.findMany({where:{id:{in:F.plans.map(plan=>plan.id)}},orderBy:{id:'asc'},select:{id:true,code:true,simulated:true}}),
      orders:await db.order.findMany({where:{id:{in:F.scenarios.map(scenario=>scenario.order.id)}},orderBy:{id:'asc'},select:{id:true,status:true}}),
      staff:await db.user.findMany({where:{id:{in:F.staff.map(staff=>staff.id)}},orderBy:{id:'asc'},select:{id:true,roles:true,enabled:true}}),
    };
    assert.equal(records.customers.length,3);assert.equal(records.plans.length,2);assert.equal(records.orders.length,7);assert.equal(records.staff.length,6);
    const fingerprint=createHash('sha256').update(JSON.stringify(records)).digest('hex');
    const filename=join(context.directory,'persistence-snapshot.json');
    if(process.argv[2]==='snapshot')writeFileSync(filename,JSON.stringify({database:context.database,fingerprint})+'\n');
    else{assert.ok(existsSync(filename));assert.equal(JSON.parse(readFileSync(filename,'utf8')).fingerprint,fingerprint,'Canonical data changed or disappeared across restart');}
    console.log('Canonical development data persistence '+(process.argv[2]==='snapshot'?'snapshot saved':'verified after restart')+'; no credentials recorded');
  }finally{await db.$disconnect();}
}
main().catch(()=>{console.error('Development persistence check failed; inspect owned environment and canonical data');process.exitCode=1;});
