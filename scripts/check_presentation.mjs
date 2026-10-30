import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const origin=(process.argv[2]||'http://127.0.0.1:4188').replace(/\/$/,'');
assert(['http:','https:'].includes(new URL(origin).protocol));
const report={checkedAt:new Date().toISOString(),origin,entries:[],demoAssets:[]};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const route of ['/','/option-a/','/option-e/','/admin/','/my-ikonectt/']){
  const response=await fetch(origin+route,{signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200,route+' must load without backend authentication');
  const html=await response.text();
  assert.match(html,/<html/i);
  if(route==='/'){
    for(const target of ['option-a/','option-e/'])assert(html.includes(`href="./${target}"`),'Missing design destination '+target);
    assert(html.includes('Two designs.'),'Preserve the approved two-design landing page.');
    assert(!html.includes('data-application-link'),'Applications open from templates, not new landing cards.');
  }
  const demo=['/admin/','/my-ikonectt/'].includes(route);
  if(demo){assert.match(response.headers.get('content-security-policy')||'',/connect-src 'none'/);assert.match(response.headers.get('content-security-policy')||'',/form-action 'none'/);assert.match(response.headers.get('x-robots-tag')||'',/noindex/);}
  for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
    const value=match[1];if(value.startsWith('#')||!/(?:\.css|\.js|\.mjs|\.png|\.webp|\.svg|\.woff2)(?:\?|$)/i.test(value))continue;
    const url=new URL(value,origin+route);if(url.origin!==origin)continue;
    assert.equal((await fetch(url,{signal:AbortSignal.timeout(30000)})).status,200,'Missing entry asset '+url.pathname);
  }
  report.entries.push({route,status:response.status,demo,networkBlocked:demo});
}
async function walk(folder,prefix=''){
  const out=[];for(const entry of await readdir(folder,{withFileTypes:true})){if(entry.isDirectory())out.push(...await walk(path.join(folder,entry.name),prefix+entry.name+'/'));else out.push(prefix+entry.name);}return out;
}
for(const app of ['admin','my-ikonectt']){
  const folder=path.join(root,'public_html',app);
  for(const file of await walk(folder)){
    assert(!/(?:^|\/)(?:\.env|node_modules|vendor|backend|\.local)(?:\/|$)|\.(?:pem|key|map|sql)$/i.test(file));
    const bytes=await readFile(path.join(folder,file));
    if(/\.(?:js|html|css|json)$/i.test(file))assert(!/https?:\/\/(?:localhost|127\.0\.0\.1)|postgres(?:ql)?:\/\/|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(bytes.toString()),'Unsafe demo output '+file);
    const remote=await fetch(`${origin}/${app}/${file}`,{signal:AbortSignal.timeout(30000)});
    assert.equal(remote.status,200,app+'/'+file);
    assert.equal(digest(new Uint8Array(await remote.arrayBuffer())),digest(bytes),'Artifact differs: '+app+'/'+file);
  }
  report.demoAssets.push({app,allFilesMatch:true});
}
for(const route of ['/api/v1/health','/.env','/admin/.env','/my-ikonectt/.env'])assert.equal((await fetch(origin+route)).status,404,'Private/API route exposed: '+route);
report.status='PASS';
await mkdir(path.join(root,'.local/presentation'),{recursive:true});
await writeFile(path.join(root,'.local/presentation',new URL(origin).hostname==='127.0.0.1'?'local-http.json':'hosted-http.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
