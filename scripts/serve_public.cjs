const http=require('node:http');
const path=require('node:path');
const fs=require('node:fs/promises');
const {existsSync}=require('node:fs');
const root=path.resolve(__dirname,'../dist-public');
if(!existsSync(path.join(root,'option-e','index.html')))throw new Error('Run npm run build before starting the public site.');
const port=Number(process.env.PORT??3000);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff'};
const rules=require('../vercel.json').redirects;
const apiOrigin=process.env.IKONECTT_PUBLIC_API_ORIGIN;
if(apiOrigin){const parsed=new URL(apiOrigin);if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.pathname!=='/')throw new Error('Invalid public API origin.');}
const publicPaths=new Map([['/api/v1/promotions/active','GET'],['/api/v1/health','GET'],['/api/v1/plans','GET'],['/api/v1/coverage/service-areas','GET'],['/api/v1/knowledge','GET'],['/api/v1/contact-settings','GET'],['/api/v1/leads','POST'],['/api/v1/assistant/guidance','POST']]);
http.createServer(async(req,res)=>{

  try {
    const url=new URL(req.url,'http://localhost');
    const pathname=decodeURIComponent(url.pathname);
    if(pathname.startsWith('/api/')){
      if(!apiOrigin||publicPaths.get(pathname)!==req.method){res.writeHead(503,{'Content-Type':'application/json'});return res.end(JSON.stringify({message:'Public service unavailable.'}));}
      let body;
      if(req.method==='POST'){
        const chunks=[];let size=0;
        for await(const chunk of req){size+=chunk.length;if(size>32768){res.writeHead(413);return res.end();}chunks.push(chunk);}
        body=Buffer.concat(chunks);
      }
      try{
        const upstream=await fetch(new URL(pathname+url.search,apiOrigin),{method:req.method,headers:body?{'Content-Type':'application/json'}:{},body,signal:AbortSignal.timeout(12000),redirect:'error'});
        res.writeHead(upstream.status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
        return res.end(Buffer.from(await upstream.arrayBuffer()));
      }catch{res.writeHead(503,{'Content-Type':'application/json'});return res.end(JSON.stringify({message:'Public service unavailable.'}));}
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
    const rule=rules.find(rule=>new RegExp('^'+rule.source+'$').test(pathname));
    if(rule){
      const target=new URL(rule.destination,url.origin);
      target.search=url.search;
      res.writeHead(rule.permanent?308:307,{Location:target.origin!==url.origin?target.href:target.pathname+target.search+target.hash});
      return res.end();
    }
    if(pathname.split('/').some(part=>part.startsWith('.')||part.includes('\\')))throw new Error('Invalid path');
    let file=path.resolve(root,'.'+pathname);
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Invalid path');
    if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
    const body=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page not found.');}
}).listen(port,'127.0.0.1',function(){console.log('Ikonectt public preview: http://127.0.0.1:'+this.address().port+'/');});
