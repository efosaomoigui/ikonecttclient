const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // React templates need their Vite builds; their source index.html cannot run
  // in this static server. Keep the shortlist's existing /option-a/ URL working.
  const fileRoot = /^\/option-[abc](?:\/|$)/.test(reqPath)
    ? path.join(ROOT, 'public_html')
    : ROOT;
  const filePath = path.join(fileRoot, reqPath);

  // Security check: ensure path is within ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      if (!reqPath.endsWith('/')) {
        const [pathname, query] = req.url.split('?');
        res.writeHead(301, { Location: pathname + '/' + (query ? '?' + query : '') });
        res.end();
        return;
      }
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        serveFile(indexPath, res);
        return;
      }
      // Check in public_html
      const publicPath = path.join(ROOT, 'public_html', reqPath, 'index.html');
      if (fs.existsSync(publicPath)) {
        serveFile(publicPath, res);
        return;
      }
    }

    if (err || !stats.isFile()) {
      // Check in public_html directly
      const publicFilePath = path.join(ROOT, 'public_html', reqPath);
      if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        serveFile(publicFilePath, res);
        return;
      }

      // Try appending .html
      const htmlPath = filePath + '.html';
      fs.stat(htmlPath, (err2, stats2) => {
        if (!err2 && stats2.isFile()) {
          serveFile(htmlPath, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`404 Not Found: ${reqPath}`);
        }
      });
      return;
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('500 Internal Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

server.listen(PORT, () => {
  const listeningPort = server.address().port;
  console.log(`\n======================================================`);
  console.log(`  🚀 iKonectt Dev Server running!`);
  console.log(`  🔗 Local:   http://localhost:${listeningPort}`);
  console.log(`  📄 Pages:`);
  console.log(`     - http://localhost:${PORT}/ (Home)`);
  console.log(`     - http://localhost:${PORT}/residential.html`);
  console.log(`     - http://localhost:${PORT}/business.html`);
  console.log(`     - http://localhost:${PORT}/coverage.html`);
  console.log(`======================================================\n`);
});
