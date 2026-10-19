import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { json, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Config } from './core/config';
import { Errors } from './core/http';
import { API_VERSION } from '../../contracts';

export async function createApp(quiet = false) {
  const app = await NestFactory.create(AppModule, { bodyParser: false, ...(quiet ? { logger: false as const } : {}) });
  const config = app.get(Config);
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use((req: Request & { requestId?: string }, res: Response, next: NextFunction) => {
    req.requestId = randomUUID(); res.setHeader('X-Request-Id', req.requestId); res.setHeader('Cache-Control', 'no-store'); next();
  });
  app.use(json({ limit: '32kb' }));
  app.enableCors({ origin: config.values.CORS_ORIGINS.split(',').map(value => value.trim()), allowedHeaders: ['Authorization', 'Content-Type'], methods: ['GET', 'POST', 'PATCH', 'OPTIONS'], credentials: false });
  app.useGlobalFilters(new Errors());
  app.enableShutdownHooks();
  return app;
}
export function openApi(app: Awaited<ReturnType<typeof createApp>>) {
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Ikonectt Core API').setDescription('Public Website, My Ikonectt and Admin/CRM. No public registration. Money in NGN minor units. All writes return HTTP 200.').setVersion(API_VERSION).addBearerAuth().build());
  document.servers = [{ url: 'http://localhost:4000', description: 'Development; configure the frontend base URL per environment' }];
  // Nest includes class bearer metadata on anonymous authentication handlers; remove it there.
  const publicPaths = new Set(['/api/v1/auth/login','/api/v1/auth/staff/login','/api/v1/auth/recovery','/api/v1/auth/staff/recovery','/api/v1/auth/reset-password','/api/v1/plans','/api/v1/plans/{id}','/api/v1/coverage/locations','/api/v1/coverage/check','/api/v1/leads','/api/v1/assistant/guidance','/api/v1/capabilities','/api/v1/health']);
  for (const [path, operations] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(operations)) {
      if (!['get','post','patch'].includes(method) || !operation || typeof operation !== 'object') continue;
      const op = operation as any;
      op.security = publicPaths.has(path) ? [] : [{ bearer: [] }];
      for (const status of ['400', '401', '403', '404', '409', '429', '500']) op.responses[status] = { description: { '400':'Invalid request', '401':'Invalid session', '403':'Permission denied', '404':'Record not found', '409':'State conflict', '429':'Rate limit exceeded', '500':'Internal error' }[status] };
      // Every UUID route parameter is a string (Nest cannot infer parameter pipes).
      for (const parameter of op.parameters || []) if (parameter.in === 'path') parameter.schema = { type: 'string', format: 'uuid' };
    }
  }
  return document;
}
