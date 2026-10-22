import assert from 'node:assert/strict';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { createDemoPreview } from './demo-preview.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const result = { checkedAt: new Date().toISOString(), results: [] };
async function files(directory, prefix = '') {
  const output = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + item.name;
    if (item.isDirectory()) output.push(...await files(path.join(directory, item.name), relative + '/'));
    else output.push(relative);
  }
  return output;
}
for (const app of ['admin', 'my-ikonectt']) {
  const directory = path.join(root, app, 'dist-demo');
  const listing = await files(directory);
  assert(listing.length > 0);
  const config = JSON.parse(await readFile(path.join(root, app, 'vercel.json'), 'utf8'));
  assert.equal(config.outputDirectory, 'dist-demo');
  assert.match(config.buildCommand, /build:demo/);
  assert(!config.functions && !config.builds, 'Demo configuration must not define API functions.');
  for (const file of listing) {
    assert(!/(?:^|\/)(?:\.env[^/]*|node_modules|vendor|tests|\.platform|backend)(?:\/|$)|\.(?:map|pem|key|sql)$/i.test(file), `Unexpected deployment file: ${app}/${file}`);
    if (!/\.(?:html|js|css|json|txt)$/i.test(file)) continue;
    const source = await readFile(path.join(directory, file), 'utf8');
    assert(!/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(source), `Localhost dependency in ${app}/${file}`);
    assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|postgres(?:ql)?:\/\/|SEED_ADMIN_PASSWORD\s*=/i.test(source), `Secret-like material in ${app}/${file}`);
  }
  const entry = app === 'admin' ? '/admin/' : '/';
  const server = await createDemoPreview(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base + entry);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(page.headers.get('content-security-policy') || '', /connect-src 'none'/);
    assert.match(page.headers.get('content-security-policy') || '', /form-action 'none'/);
    assert.match(page.headers.get('x-robots-tag') || '', /noindex/);
    const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]).filter(url => !url.startsWith('#'));
    for (const asset of assets) {
      const url = new URL(asset, base + entry);
      assert.equal(url.origin, base, `External asset: ${asset}`);
      assert.equal((await fetch(url)).status, 200, `Missing entry asset: ${asset}`);
    }
    for (const probe of ['/api/v1/health', '/api/docs', '/.env', '/.platform/runtime.json', '/backend/.env', '/package.json']) assert.equal((await fetch(base + probe)).status, 404, `Source/API exposed: ${probe}`);
    assert.equal((await fetch(base + entry, { method: 'POST', body: 'demo' })).status, 405);
    assert.equal((await fetch(base + entry + '#/wallet')).status, 200, 'Hash route refresh failed.');
    // Every emitted asset must be served without directory/source fallback.
    for (const file of listing) assert.equal((await fetch(base + '/' + file)).status, 200, `Missing artifact: ${file}`);
    result.results.push({ app, status: 'PASS', artifactFiles: listing.length, entryAssets: assets.length, staticOnly: true, apiUnavailable: true, noLocalhostOrigin: true, noSecretPatterns: true, hashRefresh: true, noindex: true, connectSrc: 'none', formAction: 'none' });
  } finally { await new Promise(resolve => server.close(resolve)); }
}
await mkdir(path.join(root, 'docs/standalone-demo/evidence'), { recursive: true });
await writeFile(path.join(root, 'docs/standalone-demo/evidence/artifact-checks.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
