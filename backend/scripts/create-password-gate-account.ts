import { randomInt, randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { Database, audit } from '../src/core/database';
import { hashPassword } from '../src/core/crypto';
import { developmentFixtures as F } from '../../contracts/fixtures';
import { developmentContext, saveAccounts } from './development-context';
// Isolated imported/temporary-credential scenario requested by the portal owner.
// Ordinary onboarding remains reset-token based and clears mustChangePassword as designed.
async function main(){
  const context=developmentContext(),db=new Database(context.config);
  const password=randomUUID()+randomUUID();
  try{
    const customer=await db.mutate(async tx=>{
      const customer=await tx.customer.create({data:{kind:'RESIDENTIAL',name:'SIMULATED Imported Password Change Scenario',email:`simulated-gate-${randomUUID()}@example.test`,phone:'+2348000000000',accountNumber:String(randomInt(10000000,100000000)),accountNumberSimulated:true}});
      await tx.user.create({data:{kind:'CUSTOMER',name:customer.name,customerId:customer.id,passwordHash:await hashPassword(password),mustChangePassword:true}});
      await audit(tx,F.staff.find(staff=>staff.role==='ADMIN')!.id,'development.password_gate_scenario_created','Customer',customer.id,{simulated:true,scenario:'imported-temporary-credential'});
      return customer;
    });
    const filename=join(context.directory,`password-change-account-${customer.id}.json`);
    saveAccounts(filename,{simulated:true,customerId:customer.id,accountNumber:customer.accountNumber,password,mustChangePassword:true});
    console.log('Isolated SIMULATED password-change account created; local credential file: '+filename);
  }finally{await db.$disconnect();}
}
main().catch(()=>{console.error('Could not create the isolated development password-gate scenario');process.exitCode=1;});
