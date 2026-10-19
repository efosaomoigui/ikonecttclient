import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { Database } from '../src/core/database';
import { verifyPassword } from '../src/core/crypto';
import { DevelopmentAccounts,developmentContext } from './development-context';
async function main(){
  const context=developmentContext(),db=new Database(context.config);
  try{
    const count=async()=>({users:await db.user.count(),customers:await db.customer.count(),plans:await db.plan.count(),orders:await db.order.count(),payments:await db.payment.count(),subscriptions:await db.subscription.count(),audit:await db.auditLog.count()});
    const before=await count();
    const result=spawnSync(process.execPath,['node_modules/ts-node/dist/bin.js','--transpile-only','scripts/development-fixtures.ts'],{encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0);assert.deepEqual(await count(),before,'Concurrent developer changes or duplicate fixtures changed counts; run during a quiet initialization window');
    const accounts:DevelopmentAccounts=JSON.parse(readFileSync(context.accountsFile,'utf8'));
    for(const account of accounts.staff){const user=await db.user.findUniqueOrThrow({where:{id:account.id}});assert.ok(await verifyPassword(account.password,user.passwordHash));}
    console.log('Repeat canonical initialization: no duplicate records and all working staff passwords preserved');
  }finally{await db.$disconnect();}
}
main().catch(()=>{console.error('Fixture repeat verification failed; inspect initialization or concurrent development activity without printing credentials');process.exitCode=1;});
