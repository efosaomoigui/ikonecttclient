// Isolated local verification database, independent of the installed PostgreSQL service.
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const statePath = path.join(root, 'tmp', 'test-db.json');
const bin = process.env.PG_BIN || (process.platform === 'win32' ? 'C:\\Program Files\\PostgreSQL\\16\\bin' : '/usr/lib/postgresql/16/bin');
function run(name, args) {
  const result = spawnSync(path.join(bin, name + (process.platform === 'win32' ? '.exe' : '')), args, { encoding: 'utf8', windowsHide: true, ...(name === 'pg_ctl' ? { stdio: 'ignore' } : {}) });
  if (result.status !== 0) throw new Error(`${name} failed: ${result.stderr || result.error || result.stdout}`);
}
if (process.argv[2] === 'stop') {
  if (fs.existsSync(statePath)) { const state = JSON.parse(fs.readFileSync(statePath, 'utf8')); run('pg_ctl', ['-D', state.data, '-m', 'fast', '-w', 'stop']); console.log('Isolated test PostgreSQL stopped'); }
} else if (fs.existsSync(statePath)) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  try { run('pg_ctl', ['-D', state.data, 'status']); }
  catch { run('pg_ctl', ['-D', state.data, '-l', path.join(root, 'tmp', 'postgres.log'), '-o', `-p ${state.port} -h 127.0.0.1`, '-w', 'start']); }
  console.log(`Isolated test PostgreSQL available on 127.0.0.1:${state.port}; keep this terminal open`);
  setInterval(() => {}, 60_000);
} else {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const data = fs.mkdtempSync(path.join(root, 'tmp', 'postgres-'));
  const passwordFile = path.join(root, 'tmp', 'pg-password');
  const password = randomBytes(24).toString('hex');
  fs.writeFileSync(passwordFile, password);
  try { run('initdb', ['-D', data, '-U', 'ikonectt_test', '--pwfile', passwordFile, '--auth=scram-sha-256', '--encoding=UTF8', '--locale=C']); }
  finally { fs.unlinkSync(passwordFile); }
  const port = process.env.TEST_PG_PORT || '55439';
  run('pg_ctl', ['-D', data, '-l', path.join(root, 'tmp', 'postgres.log'), '-o', `-p ${port} -h 127.0.0.1`, '-w', 'start']);
  const url = `postgresql://ikonectt_test:${password}@127.0.0.1:${port}/postgres`;
  const psql = spawnSync(path.join(bin, 'psql' + (process.platform === 'win32' ? '.exe' : '')), ['-h','127.0.0.1','-p',port,'-U','ikonectt_test','-d','postgres','-c','CREATE DATABASE ikonectt_test'], { env: { ...process.env, PGPASSWORD: password }, encoding: 'utf8', windowsHide: true });
  if (psql.status !== 0) throw new Error('Could not create isolated test database');
  const databaseUrl = url.replace(/\/postgres$/, '/ikonectt_test');
  fs.writeFileSync(statePath, JSON.stringify({ data, port }));
  fs.writeFileSync(path.join(root, '.env.test.local'), `NODE_ENV=test\nDATABASE_URL=${databaseUrl}\nTEST_DATABASE_URL=${databaseUrl}\nNOTIFICATION_ENCRYPTION_KEY=${randomBytes(32).toString('hex')}\n`);
  console.log(`Isolated test PostgreSQL started on 127.0.0.1:${port}; credentials saved in ignored .env.test.local`);
  console.log('Keep this terminal open; use node scripts/test-db.cjs stop from another terminal to stop the database');
  setInterval(() => {}, 60_000);
}
