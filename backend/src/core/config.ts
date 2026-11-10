import 'dotenv/config';
import { Global, Injectable, Module } from '@nestjs/common';
import { z } from 'zod';

const Environment = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().min(0).max(65535).default(4000),
  HOST: z.string().default('127.0.0.1'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001,http://127.0.0.1:4175'),
  SESSION_HOURS: z.coerce.number().int().min(1).max(24).default(8),
  NOTIFICATION_ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i),
  WALLET_AUTHORITY: z.enum(['local', 'client']).default('local'),
  PAYMENT_ADAPTER: z.enum(['manual', 'disabled', 'simulated']).default('manual'),
  COVERAGE_ADAPTER: z.enum(['native', 'disabled', 'simulated']).default('native'),
  PROVISIONING_ADAPTER: z.enum(['manual', 'disabled', 'simulated']).default('manual'),
  LEGACY_ADAPTER: z.enum(['disabled', 'simulated']).default('disabled'),
  EMAIL_ADAPTER: z.enum(['disabled', 'simulated']).default('disabled'),
  SMS_ADAPTER: z.enum(['disabled', 'simulated']).default('disabled'),
  SIMULATOR_SCENARIO: z.enum(['success', 'failure', 'timeout']).default('success'),
});
@Injectable()
export class Config {
  readonly values = Environment.parse(process.env);
  constructor() {
    if (['staging', 'production'].includes(this.values.NODE_ENV) && Object.entries(this.values).some(([key, value]) => key.endsWith('_ADAPTER') && value === 'simulated')) {
      throw new Error('Simulated adapters are restricted to development and test');
    }
    if (this.values.CORS_ORIGINS.split(',').some(origin => origin.trim() === '*')) throw new Error('Explicit CORS origins are required');
    if (this.values.NODE_ENV === 'production' && this.values.CORS_ORIGINS.split(',').some(origin => !origin.trim().startsWith('https://'))) throw new Error('Production CORS origins must use HTTPS');
  }
}
@Global()
@Module({ providers: [Config], exports: [Config] })
export class ConfigModule {}
