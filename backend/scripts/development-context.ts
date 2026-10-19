import 'dotenv/config';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Config } from '../src/core/config';
const { assertOwnedDevelopment } = require('./development-safety.cjs');

export function developmentContext() {
  const config = new Config();
  const directory = resolve('.local/development');
  const stateFile = join(directory, 'database.json');
  if (config.values.NODE_ENV !== 'development' || !existsSync(stateFile)) throw new Error('A helper-owned development environment is required');
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  assertOwnedDevelopment(state,config.values,directory);
  return { config, directory, database: state.database, accountsFile: join(directory,`accounts-${state.database}.json`) };
}
export function saveAccounts(filename: string, data: unknown) {
  writeFileSync(filename, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
}
export interface DevelopmentAccounts {
  dataset: string; database: string;
  staff: Array<{ id: string; role: string; email: string; password: string; mustChangePassword: boolean }>;
  customers: Array<{ id: string; accountNumber: string; password?: string; setupToken?: string; setupExpiresAt?: string }>;
}
