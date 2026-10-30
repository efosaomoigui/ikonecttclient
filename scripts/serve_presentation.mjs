import http from 'node:http';
import path from 'node:path';
import {readFile, realpath, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const repository = fileURLToPath(new URL('../', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.woff':'font/woff','.json':'application/json','.txt':'text/plain; charset=utf-8','.mp4':'video/mp4'};
export async function presentationServer() {
  const root = await realpath(path.join(repository,'public_html'));
  const config = JSON.parse(await readFile(path.join(repository,'vercel.json'),'utf8'));
  return http.createServer(async(req,res)=>{
    const headers={'Cache-Control':'no-store'};
    const finish=(code,body='Not found')=>{res.writeHead(code,{...headers,'Content-Type':'text/plain; charset=utf-8'});res.end(body);};
    try {
      const pathname=decodeURIComponent(new URL(req.url,'http://preview.invalid').pathname);
      for(const rule of config.headers||[]) {
        if(rule.source==='/(.*)' || pathname.startsWith(rule.source.replace('/(.*)','/'))) for(const h of rule.headers) headers[h.key]=h.value;
      }
      if(!['GET','HEAD'].includes(req.method))return finish(405,'Static presentation only.');
      if(pathname.split('/').some(part=>part.startsWith('.')||part.includes('\\'))||/(?:^|\/)api(?:\/|$)/i.test(pathname))return finish(404);
      const redirect=(config.redirects||[]).find(rule=>rule.source===pathname);
      if(redirect){res.writeHead(307,{...headers,Location:redirect.destination});res.end();return;}
      let file=path.resolve(root,'.'+pathname);
      if((await stat(file)).isDirectory())file=path.join(file,'index.html');
      file=await realpath(file);
      const relative=path.relative(root,file);
      if(relative.startsWith('..')||path.isAbsolute(relative))return finish(404);
      const bytes=await readFile(file);
      res.writeHead(200,{...headers,'Content-Type':types[path.extname(file)]||'application/octet-stream'});
      res.end(req.method==='HEAD'?undefined:bytes);
    }catch{finish(404);}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.argv[2]||4188),server=await presentationServer();
  server.listen(port,'127.0.0.1',()=>console.log(`Static four-experience presentation: http://127.0.0.1:${port}/`));
}
