const http=require('node:http');
const path=require('node:path');
const fs=require('node:fs/promises');
const {existsSync}=require('node:fs');
const root=path.resolve(__dirname,'../dist-public');
if(!existsSync(path.join(root,'option-e','index.html')))throw new Error('Run npm run build before starting the public site.');
const port=Number(process.env.PORT??3000);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff'};
const rules=require('../vercel.json').redirects;
http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
  try {
    const url=new URL(req.url,'http://localhost');
    const pathname=decodeURIComponent(url.pathname);
    const rule=rules.find(rule=>new RegExp('^'+rule.source+'$').test(pathname));
    if(rule){
      const target=new URL(rule.destination,url.origin);
      target.search=url.search;
      res.writeHead(rule.permanent?308:307,{Location:target.pathname+target.search+target.hash});
      return res.end();
    }
    if(pathname.split('/').some(part=>part.startsWith('.')||part.includes('\\')))throw new Error('Invalid path');
    let file=path.resolve(root,'.'+pathname);
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Invalid path');
    if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
    const body=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page not found.');}
}).listen(port,'127.0.0.1',function(){console.log('Ikonectt public preview: http://127.0.0.1:'+this.address().port+'/');});
