const clientCatalogue=require('../server/client-catalogue');
// Same-origin bridge to the existing backend; this function stores no application data.
module.exports = async function backendProxy(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const fail = (status, code, message) => res.status(status).json({statusCode:status,code,message});
  if (!['GET','POST','PATCH','OPTIONS'].includes(req.method)) { res.setHeader('Allow','GET, POST, PATCH, OPTIONS'); return fail(405,'METHOD_NOT_ALLOWED','Method not allowed'); }
  let origin, incoming;
  try {
    incoming = new URL(req.url,'https://request.invalid');
    if(incoming.pathname==='/api/backend'){const value=req.query?.backendPath;const route=Array.isArray(value)?value.join('/'):value;if(typeof route!=='string')return fail(400,'INVALID_PATH','Invalid API path');incoming=new URL('/api/v1/'+route+incoming.search,'https://request.invalid');}
    incoming.searchParams.delete('backendPath');
    if(!incoming.pathname.startsWith('/api/v1/') || /%2e|%2f|%5c/i.test(incoming.pathname)) return fail(400,'INVALID_PATH','Invalid API path');
  } catch { return fail(400,'INVALID_PATH','Invalid API path'); }
  const publicClientRoute=incoming.pathname==='/api/v1/plans'||/^\/api\/v1\/plans\/[^/]+$/.test(incoming.pathname)||incoming.pathname==='/api/v1/coverage/service-areas';
  if(publicClientRoute&&clientCatalogue.enabled()){
    if(req.method!=='GET')return fail(405,'METHOD_NOT_ALLOWED','Client catalogue access is read-only.');
    try{const query=Object.fromEntries(incoming.searchParams);const result=incoming.pathname==='/api/v1/coverage/service-areas'?await clientCatalogue.areas(query):incoming.pathname==='/api/v1/plans'?await clientCatalogue.plans(query):await clientCatalogue.plan(incoming.pathname.split('/').at(-1));return res.status(200).json(result);}catch(error){return fail(error.status||503,error.code||'CLIENT_CATALOGUE_UNAVAILABLE',error.message||'Client catalogue unavailable');}
  }
  const configured=process.env.IKONECTT_BACKEND_ORIGIN;
  if(!configured)return fail(503,'BACKEND_NOT_CONFIGURED','The backend connection has not been configured. Please contact customer care.');
  try{origin=new URL(configured);
    if(origin.protocol!=='https:' || origin.username || origin.password || origin.search || origin.hash || origin.pathname!=='/' || ['localhost','127.0.0.1','::1','[::1]'].includes(origin.hostname)) throw Error();
  }catch{return fail(503,'BACKEND_NOT_CONFIGURED','The backend connection is unavailable.');}
  const controller = new AbortController(), timer = setTimeout(()=>controller.abort(),12000);
  try {
    const headers = {'Content-Type':'application/json','Accept':'application/json'};
    if(typeof req.headers.authorization==='string') headers.Authorization=req.headers.authorization;
    let body;
    if(['POST','PATCH'].includes(req.method)) {
      if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')) return fail(415,'JSON_REQUIRED','Use application/json');
      body=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
      if(Buffer.byteLength(body)>(incoming.pathname==='/api/v1/admin/promotion'?2097152:32768)) return fail(413,'PAYLOAD_TOO_LARGE','Request body exceeds the allowed size');
    }
    const target=new URL(incoming.pathname+incoming.search,origin);
    const upstream=await fetch(target,{method:req.method,headers,body,redirect:'error',signal:controller.signal,cache:'no-store'});
    if(upstream.headers.get('retry-after'))res.setHeader('Retry-After',upstream.headers.get('retry-after'));
    const text=await upstream.text();
    if(!upstream.headers.get('content-type')?.includes('application/json'))return fail(502,'BACKEND_UNAVAILABLE','The backend returned an invalid response.');
    res.setHeader('Content-Type','application/json; charset=utf-8');res.status(upstream.status).send(text);
  } catch { return fail(503,'BACKEND_UNAVAILABLE','The backend could not be reached. Please try again later.'); }
  finally {clearTimeout(timer);}
};
