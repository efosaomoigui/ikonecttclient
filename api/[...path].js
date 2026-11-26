// Same-origin bridge to the existing backend; this function stores no application data.
module.exports = async function backendProxy(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const fail = (status, code, message) => res.status(status).json({statusCode:status,code,message});
  if (!['GET','POST','PATCH','OPTIONS'].includes(req.method)) { res.setHeader('Allow','GET, POST, PATCH, OPTIONS'); return fail(405,'METHOD_NOT_ALLOWED','Method not allowed'); }
  const configured = process.env.IKONECTT_BACKEND_ORIGIN;
  if (!configured) return fail(503,'BACKEND_NOT_CONFIGURED','The backend connection has not been configured. Please contact customer care.');
  let origin, incoming;
  try {
    origin = new URL(configured); incoming = new URL(req.url,'https://request.invalid');
    if(origin.protocol!=='https:' || origin.username || origin.password || origin.search || origin.hash || origin.pathname!=='/' || ['localhost','127.0.0.1','::1','[::1]'].includes(origin.hostname)) throw Error();
    if(!incoming.pathname.startsWith('/api/v1/') || /%2e|%2f|%5c/i.test(incoming.pathname)) return fail(400,'INVALID_PATH','Invalid API path');
  } catch { return fail(503,'BACKEND_NOT_CONFIGURED','The backend connection is unavailable.'); }
  const controller = new AbortController(), timer = setTimeout(()=>controller.abort(),12000);
  try {
    const headers = {'Content-Type':'application/json','Accept':'application/json'};
    if(typeof req.headers.authorization==='string') headers.Authorization=req.headers.authorization;
    let body;
    if(['POST','PATCH'].includes(req.method)) {
      if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')) return fail(415,'JSON_REQUIRED','Use application/json');
      body=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
      if(Buffer.byteLength(body)>32768) return fail(413,'PAYLOAD_TOO_LARGE','Request body exceeds the allowed size');
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
