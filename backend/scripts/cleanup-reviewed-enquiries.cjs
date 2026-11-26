// Development-only, manifest-bound cleanup. Financial and uncertain records are never deleted.
require('dotenv').config();
const fs=require('node:fs');const {PrismaClient}=require('@prisma/client');const crypto=require('node:crypto');
const db=new PrismaClient();
(async()=>{
 const url=new URL(process.env.DATABASE_URL);if(process.env.NODE_ENV==='production'||!['localhost','127.0.0.1'].includes(url.hostname)||!url.pathname.startsWith('/ikonectt_development'))throw Error('Owned local development database required');
 const manifest=JSON.parse(fs.readFileSync('.local/production-readiness/inventory.json','utf8'));
 const ids=manifest.leadInventory.filter(r=>r.classification==='explicit-test-marker').map(r=>r.id);
 const rows=await db.lead.findMany({where:{id:{in:ids}}});
 if(rows.some(r=>!/QA ONLY|QAONLY|^QA |SIMULATED|@example\.(test|com)$/i.test(r.name+' '+r.message+' '+r.email)))throw Error('Test marker changed; review ownership');
 const report={createdAt:new Date().toISOString(),proposedIds:rows.map(r=>r.id),preservedUncertainIds:manifest.leadInventory.filter(r=>r.classification!=='explicit-test-marker').map(r=>r.id),financialCleanup:'Not performed; immutable history preserved in development database'};
 fs.writeFileSync('.local/production-readiness/cleanup-proposal.json',JSON.stringify(report,null,2));
 if(process.argv[2]!=='--apply'){console.log('Proposal saved: '+rows.length+' explicit test enquiries; no changes made');return;}
 const archive=process.argv[3];if(!archive||!fs.statSync(archive).isFile()||!archive.endsWith('.dump'))throw Error('Verified pre-cleanup database archive required');
 const hash=crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
 const removed=await db.$transaction(async tx=>{const result=await tx.lead.deleteMany({where:{id:{in:report.proposedIds}}});await tx.auditLog.create({data:{action:'development.test_enquiries_removed',entityType:'Lead',entityId:'cleanup',metadata:{removedIds:report.proposedIds,backupSha256:hash}}});return result.count;});
 fs.writeFileSync('.local/production-readiness/cleanup-result.json',JSON.stringify({...report,removed,backupSha256:hash},null,2));console.log('Removed '+removed+' explicitly marked test enquiries; uncertain and financial records preserved.');
})().catch(()=>{console.error('Cleanup refused or failed; inspect the private manifest and database configuration.');process.exitCode=1}).finally(()=>db.$disconnect());
