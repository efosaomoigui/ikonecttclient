import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { clientKnowledge } from '../src/assistant/client-knowledge';

export async function importClientKnowledge(db: PrismaClient) {
  for (const article of clientKnowledge) {
    await db.knowledgeArticle.upsert({ where: { key: article.key }, create: article, update: {} });
  }
  return { sourceArticles: clientKnowledge.length, publishedSourceArticles: clientKnowledge.filter(article => article.published).length };
}

if (require.main === module) {
  const db = new PrismaClient();
  importClientKnowledge(db)
    .then(counts => console.log(JSON.stringify(counts)))
    .catch(() => { console.error('Knowledge import failed; verify database and migrations'); process.exitCode = 1; })
    .finally(() => db.$disconnect());
}
