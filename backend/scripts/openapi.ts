import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// Contract generation constructs the module graph but never connects to a database.
process.env.DATABASE_URL ||= 'postgresql://contract:unused@localhost:5432/contract';
process.env.NOTIFICATION_ENCRYPTION_KEY ||= '0'.repeat(64);
async function main() {
  const { createApp, openApi } = await import('../src/bootstrap');
  const app = await createApp(true);
  await mkdir(resolve('../contracts'), { recursive: true });
  await writeFile(resolve('../contracts/openapi.json'), JSON.stringify(openApi(app), null, 2) + '\n');
  await app.close();
  console.log('Published contracts/openapi.json');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
