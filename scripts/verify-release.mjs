import {createHash} from 'node:crypto';
const origin=new URL(process.argv[2]||'http://127.0.0.1:3000');
if(!['http:','https:'].includes(origin.protocol)||origin.username||origin.password)throw Error('Use an HTTP(S) site origin');
const expected=process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:null;
const get=async path=>{const response=await fetch(new URL(path,origin),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(path+' returned HTTP '+response.status);return response;};
const manifest=await(await get('/release.json')).json();
if(manifest.application!=='ikonectt'||manifest.template!=='option-e'||manifest.admin!=='live'||!manifest.files)throw Error('Not the canonical live release');
if(expected&&manifest.commit!==expected)throw Error('The host is serving a different Git commit');
const entries=Object.entries(manifest.files);
for(let offset=0;offset<entries.length;offset+=6)await Promise.all(entries.slice(offset,offset+6).map(async([path,expectedHash])=>{
 if(!/^(option-e|shared|admin)\/[a-zA-Z0-9._/-]+$/.test(path)||path.includes('..'))throw Error('Invalid release manifest path');
 const text=await(await get('/'+path)).text();const hash=createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
 if(hash!==expectedHash)throw Error('Served asset differs from release: '+path);
}));
const script=await(await get('/shared/public-config.js')).text(),prefix='globalThis.__IKONECTT_PUBLIC_CONFIG__=';
if(!script.startsWith(prefix))throw Error('Unexpected public configuration format');
const config=JSON.parse(script.slice(prefix.length).trim().replace(/;$/,''));
const whatsapp=new URL(config.contacts.whatsappUrl);if(whatsapp.protocol!=='https:'||!['api.whatsapp.com','wa.me'].includes(whatsapp.hostname))throw Error('Published WhatsApp is missing or invalid');
let backend='unavailable';try{const response=await fetch(new URL('/api/v1/health',origin),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(response.ok){const value=await response.json();backend=value.status==='ok'?'connected':'unavailable';}else if(response.status===503)backend=(await response.json()).code==='BACKEND_NOT_CONFIGURED'?'not configured':'unavailable';}catch{}
console.log(JSON.stringify({commit:manifest.commit,template:manifest.template,admin:manifest.admin,verifiedAssets:Object.keys(manifest.files).length,whatsappConfigured:true,backend},null,2));
if(process.argv.includes('--require-backend')&&backend!=='connected')process.exitCode=1;
