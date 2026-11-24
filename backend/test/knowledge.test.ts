import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { matchKnowledge, KnowledgeService } from '../src/assistant/knowledge.service';
import { importClientKnowledge } from '../scripts/import-client-knowledge';
import { clientKnowledge } from '../src/assistant/client-knowledge';

test('approved retrieval uses only published database articles and current edits', async () => {
  let articles = [{ key: 'test', question: 'How can I get help?', answer: 'Approved initial answer.', keywords: ['help'] }];
  const db = { knowledgeArticle: { async findMany(query: any) { assert.deepEqual(query.where, { published: true }); return articles; } } } as unknown as any;
  const service = new KnowledgeService(db);
  assert.equal((await service.guidance('help')).answer, 'Approved initial answer.');
  articles[0].answer = 'Admin updated answer.';
  const reply = await service.guidance('help');
  assert.equal(reply.answer, 'Admin updated answer.');
  assert.equal(reply.sensitiveActionsAllowed, false);
  assert.ok(reply.links.some(link => link.path === 'https://portal.ikonectt.com'));
  articles = [];
  assert.notEqual((await service.guidance('help')).answer, 'Admin updated answer.');
  assert.equal(matchKnowledge('unmatched', clientKnowledge), null);
});

test('client knowledge importer is idempotent and preserves subsequent Admin edits', async () => {
  const store = new Map<string, any>();
  const fake = { knowledgeArticle: { async upsert({ where, create }: any) { if (!store.has(where.key)) store.set(where.key, { ...create }); return store.get(where.key); } } } as unknown as PrismaClient;
  await importClientKnowledge(fake);
  store.get(clientKnowledge[0].key).answer = 'Reviewed by Admin';
  const report = await importClientKnowledge(fake);
  assert.equal(store.size, 21);
  assert.equal(report.publishedSourceArticles, 20);
  assert.equal(store.get(clientKnowledge[0].key).answer, 'Reviewed by Admin');
  assert.equal(store.get('referral-campaign').published, false);
});

test('knowledge HTTP routes enforce staff permission and publication before public retrieval', async () => {
  const { config } = await import('dotenv');
  config({ path: '.env.test.local', override: !process.env.TEST_DATABASE_URL, quiet: true } as any);
  if (!process.env.TEST_DATABASE_URL || !new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test')) throw Error('Dedicated _test database required');
  Object.assign(process.env, { NODE_ENV: 'test', DATABASE_URL: process.env.TEST_DATABASE_URL, WALLET_AUTHORITY: 'local' });
  const { createApp } = await import('../src/bootstrap');
  const { randomBytes, randomUUID } = await import('node:crypto');
  const { digest } = await import('../src/core/crypto');
  const request = (await import('supertest')).default;
  const db = new PrismaClient();
  const app = await createApp(true);
  try {
    await app.init();
    const tokens: Record<string, string> = {};
    for (const role of ['ADMIN', 'SUPPORT'] as const) {
      const user = await db.user.create({ data: { name: 'SIMULATED KB regression', kind: 'STAFF', email: randomUUID() + '@example.test', passwordHash: 'not-a-login-hash', roles: [role] } });
      tokens[role] = randomBytes(32).toString('base64url');
      await db.session.create({ data: { userId: user.id, tokenHash: digest(tokens[role]), expiresAt: new Date(Date.now() + 60000) } });
    }
    const input = { key: 'test-' + randomUUID(), category: 'Support', question: 'Regression unique question', answer: 'Approved response.', keywords: ['regressionunique'], published: false };
    const server = app.getHttpServer();
    await request(server).post('/api/v1/admin/knowledge').send(input).expect(401);
    await request(server).post('/api/v1/admin/knowledge').set('Authorization', 'Bearer ' + tokens.SUPPORT).send(input).expect(403);
    const created = await request(server).post('/api/v1/admin/knowledge').set('Authorization', 'Bearer ' + tokens.ADMIN).send(input).expect(200);
    const published = () => request(server).get('/api/v1/knowledge?limit=100');
    assert.ok(!(await published()).body.items.some((article: any) => article.key === input.key));
    await request(server).patch('/api/v1/admin/knowledge/' + created.body.id).set('Authorization', 'Bearer ' + tokens.ADMIN).send({ published: true, answer: 'Approved updated response.' }).expect(200);
    assert.equal((await published()).body.items.find((article: any) => article.key === input.key).answer, 'Approved updated response.');
    const reply = await request(server).post('/api/v1/assistant/guidance').send({ message: 'regressionunique' }).expect(200);
    assert.equal(reply.body.answer, 'Approved updated response.');
    assert.ok(await db.auditLog.findFirst({ where: { entityId: created.body.id, action: 'knowledge.updated' } }));
    await request(server).patch('/api/v1/admin/knowledge/' + created.body.id).set('Authorization', 'Bearer ' + tokens.ADMIN).send({ published: false }).expect(200);
    assert.ok(!(await published()).body.items.some((article: any) => article.key === input.key));
  } finally { await app.close(); await db.$disconnect(); }
});
