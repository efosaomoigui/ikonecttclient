import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Database } from '../src/core/database';
import { verifyPassword } from '../src/core/crypto';
import { developmentFixtures as F } from '../../contracts/fixtures';
import { developmentContext } from './development-context';
async function main(){
  const context=developmentContext(),db=new Database(context.config);
  try{
    const email=process.env.SEED_ADMIN_EMAIL?.toLowerCase();
    assert.ok(email && process.env.SEED_ADMIN_PASSWORD,'Configure explicit local bootstrap credentials');
    const initial=await db.user.findUniqueOrThrow({where:{email}});
    assert.equal(initial.kind,'STAFF');assert.ok(initial.roles.includes('ADMIN'));assert.equal(initial.mustChangePassword,true);
    assert.ok(await verifyPassword(process.env.SEED_ADMIN_PASSWORD!,initial.passwordHash));
    const invoke=(seedEmail:string)=>spawnSync(process.execPath,['node_modules/ts-node/dist/bin.js','--transpile-only','scripts/seed.ts'],{env:{...process.env,SEED_ADMIN_EMAIL:seedEmail,SEED_ADMIN_PASSWORD:randomUUID()+randomUUID()},encoding:'utf8',windowsHide:true});
    assert.equal(invoke(email).status,0);
    const repeated=await db.user.findUniqueOrThrow({where:{id:initial.id}});
    assert.equal(repeated.passwordHash,initial.passwordHash);assert.equal(repeated.mustChangePassword,true);
    assert.notEqual(invoke(F.staff.find(staff=>staff.role==='SUPPORT')!.email).status,0);
    console.log('Bootstrap administrator verified; repeat seed preserves credentials/first-login gate; non-admin email bootstrap refused');
  }finally{await db.$disconnect();}
}
main().catch(()=>{console.error('Bootstrap verification failed; check local credentials and administrator state without printing secrets');process.exitCode=1;});
