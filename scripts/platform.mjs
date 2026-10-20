import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import {randomBytes} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const local=path.join(root,'.platform');
const configFile=path.join(local,'config.json'),stateFile=path.join(local,'runtime.json');
const command=process.argv[2]||'status';
const argument=name=>{const index=process.argv.indexOf(name);return index<0?undefined:process.argv[index+1]};
const urls={api:'http://127.0.0.1:4000/api/v1/health',admin:'http://127.0.0.1:3013/admin/',portal:'http://127.0.0.1:4175/'};
const children=[];
let stopping=false,control,ownedDatabase=false,settings;
fs.mkdirSync(local,{recursive:true});

function readSettings(){
  if(!fs.existsSync(configFile))throw new Error('Run platform:configure -- --backend-root <existing backend directory> first');
  const config=JSON.parse(fs.readFileSync(configFile,'utf8'));
  const owner=path.resolve(config.backendRoot);
  const requireBackend=createRequire(path.join(root,'backend','package.json'));
  const environment=requireBackend('dotenv').parse(fs.readFileSync(path.join(owner,'.env')));
  const state=JSON.parse(fs.readFileSync(path.join(owner,'.local','development','database.json')));
  const directory=path.join(owner,'.local','development');
  requireBackend('./scripts/development-safety.cjs').assertOwnedDevelopment(state,environment,directory);
  if(!fs.existsSync(path.join(state.data,'PG_VERSION')))throw new Error('Existing development cluster is missing; refusing initialization');
  const pgBin=config.pgBin||process.env.PG_BIN||(process.platform==='win32'?'C:\\Program Files\\PostgreSQL\\16\\bin':'/usr/lib/postgresql/16/bin');
  return {owner,environment,state,pgBin,requireBackend};
}
function executable(name){return path.join(settings.pgBin,name+(process.platform==='win32'?'.exe':''));}
async function occupied(port){return new Promise(resolve=>{const server=net.createServer();server.once('error',()=>resolve(true));server.listen(port,'127.0.0.1',()=>server.close(()=>resolve(false)));});}
async function check(url){try{const response=await fetch(url,{signal:AbortSignal.timeout(4000)});if(!response.ok)return false;if(url===urls.api)return (await response.json()).database==='connected';return true;}catch{return false;}}
async function waitFor(name,seconds=40){const end=Date.now()+seconds*1000;while(Date.now()<end){if(stopping)throw new Error('Startup was stopped');if(await check(urls[name]))return;await new Promise(resolve=>setTimeout(resolve,500));}throw new Error(name+' did not become healthy; see .platform logs');}
function child(name,args,cwd,environment={}){
  const log=fs.openSync(path.join(local,name+'.log'),'a');
  const processChild=spawn(args[0],args.slice(1),{cwd,env:{...process.env,...environment},stdio:['ignore',log,log],windowsHide:true});
  fs.closeSync(log);children.push({name,process:processChild});
  processChild.once('error',()=>{console.error(name+' failed to start');shutdown(1);});
  processChild.once('exit',code=>{if(!stopping){console.error(name+' exited ('+code+'); stopping owned application processes');shutdown(1);}});
  return processChild;
}
async function shutdown(code=0){
  if(stopping)return;stopping=true;
  for(const entry of [...children].reverse()){
    if(entry.name==='postgres')continue;
    if(entry.process.exitCode===null && !entry.process.killed){
      if(process.platform==='win32')spawnSync('taskkill.exe',['/PID',String(entry.process.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
      else entry.process.kill('SIGTERM');
    }
  }
  if(ownedDatabase && settings)spawnSync(executable('pg_ctl'),['-D',settings.state.data,'-m','fast','-w','stop'],{windowsHide:true,stdio:'ignore'});
  if(control)control.close();
  if(fs.existsSync(stateFile)){const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));if(state.pid===process.pid)fs.unlinkSync(stateFile);}
  process.exitCode=code;
}
async function run(){
  if(command==='install'){
    const npm=process.env.npm_execpath;
    if(!npm)throw new Error('Run through npm run platform:install so the installed npm CLI is selected');
    const directories=['.', 'contracts','backend','admin','my-ikonectt'];
    if(process.argv.includes('--website'))directories.push('option-a','option-b','option-c');
    for(const directory of directories){
      if(!fs.existsSync(path.join(root,directory,'package-lock.json')))throw new Error('Missing locked package '+directory+'; finish reviewed integration first');
      console.log('Installing locked dependencies: '+directory);
      const result=spawnSync(process.execPath,[npm,'ci'],{cwd:path.join(root,directory),stdio:'inherit',windowsHide:true});
      if(result.status!==0)throw new Error('Dependency installation failed for '+directory);
      if(directory==='backend'){
        const generated=spawnSync(process.execPath,[npm,'run','db:generate'],{cwd:path.join(root,directory),stdio:'inherit',windowsHide:true});
        if(generated.status!==0)throw new Error('Prisma client generation failed');
      }
    }return;
  }
  if(command==='configure'){
    if(fs.existsSync(configFile))throw new Error('Existing local configuration must be reviewed manually; it will not be overwritten');
    const owner=argument('--backend-root');if(!owner)throw new Error('Provide --backend-root pointing to the existing backend directory');
    const config={backendRoot:path.resolve(owner),...(argument('--pg-bin')?{pgBin:path.resolve(argument('--pg-bin'))}:{})};
    // Validate before saving; the config contains references, never secrets or database contents.
    fs.writeFileSync(configFile,JSON.stringify(config,null,2)+'\n',{flag:'wx',mode:0o600});
    try{readSettings();}catch(error){fs.unlinkSync(configFile);throw error;}
    console.log('Local environment reference saved; credentials and database remain in the existing owner directory');return;
  }
  if(command==='status'){
    for(const[name,url]of Object.entries(urls))console.log(name+': '+(await check(url)?'healthy':'unavailable')+' '+url);return;
  }
  if(command==='stop'){
    if(!fs.existsSync(stateFile))throw new Error('No supervisor state found; no unrelated processes will be stopped');
    const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));
    const response=await fetch(`http://127.0.0.1:${state.controlPort}/stop`,{method:'POST',headers:{Authorization:'Bearer '+state.token},signal:AbortSignal.timeout(5000)});
    if(!response.ok)throw new Error('Supervisor refused shutdown');
    console.log('Shutdown requested for processes owned by this platform supervisor');return;
  }
  if(command!=='start')throw new Error('Supported commands: install, configure, start, status, stop');
  settings=readSettings();
  for(const port of[4000,3013,4175])if(await occupied(port))throw new Error(`Port ${port} is occupied. Stop the identified prior application first; this script will not kill/adopt another checkout's app.`);
  const {PrismaClient}=settings.requireBackend('@prisma/client');
  const database=new PrismaClient({datasources:{db:{url:settings.environment.DATABASE_URL}}});
  try{
    if(!await occupied(settings.state.port)){
      ownedDatabase=true;
      child('postgres',[executable('postgres'),'-D',settings.state.data,'-p',String(settings.state.port),'-h','127.0.0.1'],root);
    }
    // A failed probe never creates/reseeds/migrates a database.
    let rows;
    const deadline=Date.now()+30000;
    while(Date.now()<deadline&&!stopping){
      try{rows=await database.$queryRawUnsafe('SELECT current_database() AS name');break;}
      catch{await new Promise(resolve=>setTimeout(resolve,500));}
    }
    if(!rows)throw new Error('Development database did not become available; inspect its local log/configuration');
    if(rows[0]?.name!==settings.state.database)throw new Error('Unexpected development database');
  }finally{await database.$disconnect();}
  const compile=spawnSync(process.execPath,['compile-contracts.mjs'],{cwd:path.join(root,'my-ikonectt'),stdio:'inherit',windowsHide:true});
  if(compile.status!==0)throw new Error('Portal contract bundle did not compile');
  child('api',[process.execPath,'node_modules/ts-node/dist/bin.js','--transpile-only','src/main.ts'],path.join(root,'backend'),{...settings.environment,HOST:'127.0.0.1',PORT:'4000'});
  await waitFor('api');
  child('admin',[process.execPath,'node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','3013','--strictPort'],path.join(root,'admin'),{IKONECTT_API_ORIGIN:'http://127.0.0.1:4000'});
  child('portal',[process.execPath,'dev.mjs'],path.join(root,'my-ikonectt'),{IKONECTT_MODE:'live',IKONECTT_API_BASE:'http://127.0.0.1:4000/api/v1',PORT:'4175'});
  await waitFor('admin');await waitFor('portal');
  const token=randomBytes(32).toString('hex');
  control=http.createServer((request,response)=>{
    if(request.method!=='POST'||request.url!=='/stop'||request.headers.authorization!=='Bearer '+token){response.writeHead(403);response.end();return;}
    response.writeHead(200);response.end('Stopping');setTimeout(()=>shutdown(0),50);
  });
  await new Promise(resolve=>control.listen(0,'127.0.0.1',resolve));
  fs.writeFileSync(stateFile,JSON.stringify({pid:process.pid,controlPort:control.address().port,token,children:children.map(entry=>({name:entry.name,pid:entry.process.pid})),databaseAdopted:!ownedDatabase},null,2)+'\n',{mode:0o600});
  console.log('Integrated platform ready: API :4000, Admin :3013/admin/, My Ikonectt :4175. Keep this terminal open.');
  console.log('Ctrl+C or npm run platform:stop stops owned applications. An existing adopted database is left running.');
  process.once('SIGINT',()=>shutdown(0));process.once('SIGTERM',()=>shutdown(0));
}
run().catch(error=>{console.error(error instanceof Error?error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[redacted]'):'Platform operation failed');if(children.length)shutdown(1);else process.exitCode=1;});
