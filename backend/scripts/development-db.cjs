// Dedicated persistent integration infrastructure. Never targets the Stage 1 test cluster.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');
const { assertOwnedDevelopment } = require('./development-safety.cjs');
const root = path.resolve(__dirname, '..');
const local = path.join(root, '.local', 'development');
const stateFile = path.join(local, 'database.json');
const envFile = path.join(root, '.env');
const bin = process.env.PG_BIN || (process.platform === 'win32' ? 'C:\\Program Files\\PostgreSQL\\16\\bin' : '/usr/lib/postgresql/16/bin');
const command = process.argv[2] || 'start';
fs.mkdirSync(local, { recursive: true });
function run(name, args, options = {}) {
  const result = spawnSync(path.join(bin, name + (process.platform === 'win32' ? '.exe' : '')), args, { encoding: 'utf8', windowsHide: true, ...options });
  // Never echo command arguments or stderr: provider tools can include a credential-bearing URL.
  if (result.status !== 0) throw new Error(`${name} failed; inspect the local database log or configuration`);
  return result.stdout || '';
}
function readEnvironment() { return fs.existsSync(envFile) ? dotenv.parse(fs.readFileSync(envFile)) : {}; }
function context() {
  if (!fs.existsSync(stateFile)) throw new Error('Run npm run dev:db to initialize this workspace development cluster');
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const env = readEnvironment();
  const url = assertOwnedDevelopment(state,env,local);
  return { state, env, url, clientEnv: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) } };
}
function replaceOwnedUrl(expected, next) {
  const content = fs.readFileSync(envFile, 'utf8');
  if (dotenv.parse(content).DATABASE_URL !== expected) throw new Error('Environment changed during operation; review it manually');
  const pattern = /^\s*(?:export\s+)?DATABASE_URL\s*=.*$/m;
  if (!pattern.test(content)) throw new Error('DATABASE_URL assignment requires manual review');
  const updated = content.replace(pattern, `DATABASE_URL=${next}`);
  if (dotenv.parse(updated).DATABASE_URL !== next) throw new Error('Refusing an ambiguous DATABASE_URL update');
  fs.writeFileSync(envFile, updated, { mode: 0o600 });
}
function initialize() {
  if (fs.existsSync(stateFile)) return;
  if (fs.existsSync(envFile)) throw new Error('An existing .env needs review; this helper will not overwrite it to claim a database');
  const state = { version: 1, clusterId: crypto.randomUUID(), data: path.join(local, 'postgres'), port: Number(process.env.DEV_PG_PORT || 55440), user: 'ikonectt_development', database: 'ikonectt_development', previousDatabases: [] };
  const password = crypto.randomBytes(32).toString('hex');
  const passwordFile = path.join(local, 'initialization-password');
  fs.writeFileSync(passwordFile, password, { mode: 0o600 });
  try { run('initdb', ['-D', state.data, '-U', state.user, '--pwfile', passwordFile, '--auth=scram-sha-256', '--encoding=UTF8', '--locale=C']); }
  finally { fs.unlinkSync(passwordFile); }
  const url = `postgresql://${state.user}:${password}@127.0.0.1:${state.port}/${state.database}`;
  const origins = [3000,3001,4173,4174,4175,4176].flatMap(port => [`http://localhost:${port}`, `http://127.0.0.1:${port}`]).join(',');
  fs.writeFileSync(envFile, `# Workspace-local integration environment. Never commit this file.\nNODE_ENV=development\nHOST=127.0.0.1\nPORT=4000\nDATABASE_URL=${url}\nCORS_ORIGINS=${origins}\nSESSION_HOURS=8\nNOTIFICATION_ENCRYPTION_KEY=${crypto.randomBytes(32).toString('hex')}\nPAYMENT_ADAPTER=disabled\nCOVERAGE_ADAPTER=native\nPROVISIONING_ADAPTER=simulated\nLEGACY_ADAPTER=simulated\nEMAIL_ADAPTER=simulated\nSMS_ADAPTER=simulated\nSIMULATOR_SCENARIO=success\n# Supply your explicit development bootstrap credentials locally.\nSEED_ADMIN_EMAIL=\nSEED_ADMIN_PASSWORD=\n`, { flag: 'wx', mode: 0o600 });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}
function connectionArgs(ctx, database = ctx.state.database) { return ['-h','127.0.0.1','-p',String(ctx.state.port),'-U',ctx.state.user,'-d',database]; }
function backup(ctx) {
  const directory = path.join(local, 'backups'); fs.mkdirSync(directory, { recursive: true });
  const filename = path.join(directory, `${ctx.state.database}-${Date.now()}.dump`);
  run('pg_dump', [...connectionArgs(ctx), '--format=custom', '--file', filename], { env: ctx.clientEnv });
  run('pg_restore', ['--list', filename]);
  console.log('Development backup created and archive listing verified: ' + filename);
  return filename;
}
function createReplacement(ctx, archive, select = true) {
  const nextDatabase = `ikonectt_development_${Date.now()}`;
  run('createdb', ['-h','127.0.0.1','-p',String(ctx.state.port),'-U',ctx.state.user,nextDatabase], { env: ctx.clientEnv });
  if (archive) run('pg_restore', [...connectionArgs(ctx, nextDatabase), '--exit-on-error', '--no-owner', archive], { env: ctx.clientEnv });
  if (!select) {
    const marker=run('psql',[...connectionArgs(ctx,nextDatabase),'-tAc',`SELECT COUNT(*) FROM "AuditLog" WHERE action = 'development.fixtures_initialized' AND "entityId" = 'ikonectt-stage2-v1'`],{env:ctx.clientEnv}).trim();
    if(marker !== '1') throw new Error('Restored database is missing the canonical development fixture audit marker');
    console.log('Development backup restored and fixture marker verified in '+nextDatabase+'; active database/environment unchanged.');
    return;
  }
  const oldUrl = ctx.env.DATABASE_URL;
  const nextUrl = new URL(oldUrl); nextUrl.pathname = '/' + nextDatabase;
  replaceOwnedUrl(oldUrl, nextUrl.toString());
  ctx.state.previousDatabases.push(ctx.state.database); ctx.state.database = nextDatabase;
  fs.writeFileSync(stateFile, JSON.stringify(ctx.state, null, 2) + '\n', { mode: 0o600 });
  if (archive) {
    const previous=path.join(local,`accounts-${ctx.state.previousDatabases.at(-1)}.json`);
    if(fs.existsSync(previous)) {
      const accounts=JSON.parse(fs.readFileSync(previous,'utf8')); accounts.database=nextDatabase;
      fs.writeFileSync(path.join(local,`accounts-${nextDatabase}.json`),JSON.stringify(accounts,null,2)+'\n',{mode:0o600,flag:'wx'});
    }
  }
  console.log('New development database selected. Previous database retained. Restart the API; apply migrations and seed fixtures as needed.');
}
try {
  if (command === 'start') {
    initialize(); const ctx = context();
    try { run('pg_ctl', ['-D',ctx.state.data,'status'], { stdio: 'ignore' }); }
    catch { run('pg_ctl', ['-D',ctx.state.data,'-l',path.join(local,'postgres.log'),'-o',`-p ${ctx.state.port} -h 127.0.0.1`,'-w','start'], { stdio: 'ignore' }); }
    const exists = run('psql', [...connectionArgs(ctx,'postgres'),'-tAc',`SELECT 1 FROM pg_database WHERE datname = '${ctx.state.database}'`], { env: ctx.clientEnv }).trim();
    if (!exists) run('createdb', ['-h','127.0.0.1','-p',String(ctx.state.port),'-U',ctx.state.user,ctx.state.database], { env: ctx.clientEnv });
    console.log(`Persistent development PostgreSQL ready on 127.0.0.1:${ctx.state.port}; database ${ctx.state.database}. Keep this terminal open.`);
    setInterval(() => {}, 60_000);
  } else {
    const ctx = context();
    if (command === 'stop') { run('pg_ctl',['-D',ctx.state.data,'-m','fast','-w','stop'],{stdio:'ignore'}); console.log('Dedicated development cluster stopped; persisted data retained'); }
    else if (command === 'backup') backup(ctx);
    else if (command === 'reset') { backup(ctx); createReplacement(ctx); }
    else if (command === 'verify-backup') { const archive=backup(ctx); createReplacement(ctx,archive,false); }
    else if (command === 'restore-new') {
      const archive = path.resolve(process.argv[3] || '');
      const backups = path.join(local, 'backups') + path.sep;
      if (!archive.startsWith(backups) || !archive.endsWith('.dump') || !fs.existsSync(archive)) throw new Error('Select an existing .dump archive inside this workspace development backups directory');
      run('pg_restore',['--list',archive]); createReplacement(ctx,archive);
    } else throw new Error('Supported commands: start, stop, backup, verify-backup, reset, restore-new <owned-backup.dump>');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
