// Local production-asset smoke server. Serves only dist/ and proxies the shared local API.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const app=process.argv[2];
if(!['admin','portal'].includes(app))throw new Error('Choose admin or portal');
const port=app==='admin'?3014:4176, prefix=app==='admin'?'/admin/':'/';
const directory=path.join(root,app==='admin'?'admin':'my-ikonectt','dist');
await fs.access(path.join(directory,'index.html'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer(async(request,response)=>{
  try{
    const url=new URL(request.url,'http://127.0.0.1');
    if(url.pathname.startsWith('/api/')){
      const target=http.request({hostname:'127.0.0.1',port:4000,path:request.url,method:request.method,headers:{...request.headers,host:'127.0.0.1:4000'}},incoming=>{
        response.writeHead(incoming.statusCode,incoming.headers);incoming.pipe(response);
      });
      target.on('error',()=>{response.writeHead(502);response.end('Shared API unavailable')});request.pipe(target);return;
    }
    if(!['GET','HEAD'].includes(request.method)||!url.pathname.startsWith(prefix)){response.writeHead(404);response.end();return;}
    const relative=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';
    const filename=path.resolve(directory,relative);
    if(!filename.startsWith(directory+path.sep)){response.writeHead(403);response.end();return;}
    const data=await fs.readFile(filename);
    response.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    response.end(request.method==='HEAD'?undefined:data);
  }catch{response.writeHead(404);response.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`${app} compiled preview: http://127.0.0.1:${port}${prefix}`));
process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());
