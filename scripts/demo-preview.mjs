import http from 'node:http';
import path from 'node:path';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };
const within = (root, file) => { const relative = path.relative(root, file); return !relative.startsWith('..') && !path.isAbsolute(relative); };

// A static-only preview of the deployment output. No API proxy, environment
// configuration endpoint, source serving, or database connection exists here.
export async function createDemoPreview(app) {
  if (!['admin', 'my-ikonectt'].includes(app)) throw new Error('Choose admin or my-ikonectt.');
  const root = await realpath(path.join(repository, app, 'dist-demo'));
  const config = JSON.parse(await readFile(path.join(repository, app, 'vercel.json'), 'utf8'));
  return http.createServer(async (req, res) => {
    const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
    for (const entry of config.headers || []) {
      if (entry.source === '/(.*)') for (const h of entry.headers) headers[h.key] = h.value;
    }
    const end = (status, body = 'Not found') => { res.writeHead(status, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end(body); };
    try {
      if (!['GET', 'HEAD'].includes(req.method)) return end(405, 'Static demonstration: no API is available.');
      const url = new URL(req.url, 'http://demo.invalid');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.split('/').some(segment => segment.startsWith('.') || segment.includes('\\')) || /(?:^|\/)api(?:\/|$)/i.test(pathname)) return end(404);
      // Match the deployment's explicit root redirect, when present.
      const redirect = (config.redirects || []).find(rule => rule.source === pathname);
      if (redirect) { res.writeHead(redirect.permanent ? 308 : 307, { ...headers, Location: redirect.destination }); res.end(); return; }
      let file = path.resolve(root, '.' + pathname);
      if (!within(root, file)) return end(404);
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      file = await realpath(file);
      if (!within(root, file)) return end(404);
      const bytes = await readFile(file);
      res.writeHead(200, { ...headers, 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { end(404); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = process.argv[2];
  const port = Number(process.argv[3] || (app === 'admin' ? 4186 : 4187));
  const server = await createDemoPreview(app);
  server.listen(port, '127.0.0.1', () => console.log(`${app} static demo: http://127.0.0.1:${port}/ — no backend/proxy`));
}
