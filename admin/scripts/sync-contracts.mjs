import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.argv[2];
if(!root) throw Error('Pass the Agent 1 checkout path, or the merged repository root.');
const revision=process.argv[3];
const sourceCommit=revision?execFileSync('git',['-C',root,'rev-parse',`${revision}^{commit}`],{encoding:'utf8'}).trim():undefined;
const read=path=>sourceCommit?execFileSync('git',['-C',root,'show',`${sourceCommit}:${path}`],{encoding:'utf8',maxBuffer:2000000}):readFileSync(resolve(root,path),'utf8');
const contract=read('contracts/index.ts');
const access=read('backend/src/identity/access.ts');
const match=access.match(/export const ROLE_PERMISSIONS[^=]*= (\{[\s\S]*?\n\});/);
if(!match) throw Error('Shared permission export changed; inspect before synchronizing.');
writeFileSync(new URL('../vendor/contracts.ts',import.meta.url),contract);
writeFileSync(new URL('../vendor/permissions.ts',import.meta.url),`// Generated from Agent 1 backend/src/identity/access.ts. Do not edit.\nexport const ROLE_PERMISSIONS = ${match[1]} as const;\nexport type StaffRole = keyof typeof ROLE_PERMISSIONS;\nexport type Permission = typeof ROLE_PERMISSIONS[StaffRole][number];\n`);
if(sourceCommit){const spec=JSON.parse(read('contracts/openapi.json'));const methods=new Set(['get','post','patch','put','delete','head','options']);const operations=Object.entries(spec.paths).flatMap(([path,items])=>Object.keys(items).filter(method=>methods.has(method)).map(method=>`${method.toUpperCase()} ${path}`));writeFileSync(new URL('../vendor/operations.json',import.meta.url),JSON.stringify({sourceCommit,version:spec.info.version,operations},null,2)+'\n')}
writeFileSync(new URL('../vendor/provenance.json',import.meta.url),JSON.stringify({source:'Agent 1 contracts/index.ts and backend/src/identity/access.ts',sourceCommit,contractVersion:contract.match(/API_VERSION = '([^']+)'/)?.[1],contractSha256:createHash('sha256').update(contract).digest('hex'),accessSha256:createHash('sha256').update(access).digest('hex')},null,2)+'\n');
console.log('Synchronized shared schemas and permissions.');
