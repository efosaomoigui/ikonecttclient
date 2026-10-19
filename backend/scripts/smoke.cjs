const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
require('dotenv').config({ path: '.env.test.local', quiet: true });
if (!process.env.TEST_DATABASE_URL || !new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test')) throw new Error('Standalone smoke requires a dedicated TEST_DATABASE_URL ending in _test');
const child = spawn(process.execPath, ['dist/backend/src/main.js'], {
  env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: process.env.TEST_DATABASE_URL, HOST: '127.0.0.1', PORT: '0' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
});
async function main() {
  const address = await new Promise((resolve, reject) => {
    let buffer = '';
    const timeout = setTimeout(() => reject(new Error('Standalone API startup timed out')), 30000);
    child.stdout.on('data', chunk => {
      buffer += chunk.toString();
      for (const line of buffer.split('\n')) {
        if (line.startsWith('{"event":"listening"')) { clearTimeout(timeout); resolve(JSON.parse(line).address); return; }
      }
    });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Standalone API exited early (${code})`)); });
    child.once('error', error => { clearTimeout(timeout); reject(error); });
  });
  const health = await fetch(`${address}/api/v1/health`);
  assert.equal(health.status, 200); assert.deepEqual(await health.json(), { status: 'ok', database: 'connected' });
  const spec = await fetch(`${address}/api/docs-json`);
  assert.equal(spec.status, 200); assert.ok((await spec.json()).paths['/api/v1/auth/login']);
  console.log('Compiled standalone API startup, database health and OpenAPI HTTP smoke: PASS');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => child.kill('SIGTERM'));
