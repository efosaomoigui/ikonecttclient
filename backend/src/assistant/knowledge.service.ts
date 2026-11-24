import { Injectable } from '@nestjs/common';
import { Database, audit } from '../core/database';
import { Actor } from '../identity/access';
import * as C from '../../../contracts';

export const OFFICIAL_PORTAL = 'https://portal.ikonectt.com';
export const CUSTOMER_CARE = 'mailto:customercare@ikonectt.com';

export function matchKnowledge(message: string, articles: Array<{ key: string; question: string; answer: string; keywords: string[] }>) {
  const terms = new Set(message.toLowerCase().match(/[a-z0-9]+/g) || []);
  const ranked = articles.map(article => ({ article, score: article.keywords.reduce((score, phrase) => score + (phrase.toLowerCase().split(/\s+/).every(word => terms.has(word)) ? phrase.split(/\s+/).length : 0), 0) }));
  ranked.sort((a, b) => b.score - a.score || a.article.key.localeCompare(b.article.key));
  return ranked[0]?.score > 0 ? ranked[0].article : null;
}

@Injectable()
export class KnowledgeService {
  constructor(private readonly db: Database) {}

  async guidance(message: string): Promise<C.Input<typeof C.AssistantResponse>> {
    const articles = await this.db.knowledgeArticle.findMany({ where: { published: true }, orderBy: { key: 'asc' }, take: 500 });
    const article = matchKnowledge(message, articles);
    return {
      answer: article?.answer || 'Please contact customercare@ikonectt.com for help. Account and subscription functions are available through the official customer portal.',
      links: [{ label: 'My Ikonectt', path: OFFICIAL_PORTAL }, { label: 'Customer care', path: CUSTOMER_CARE }],
      escalationAvailable: true,
      sensitiveActionsAllowed: false,
      simulated: false,
    };
  }

  create(actor: Actor, input: C.Input<typeof C.KnowledgeInput>) {
    return this.db.mutate(async tx => {
      const record = await tx.knowledgeArticle.create({ data: input });
      await audit(tx, actor.id, 'knowledge.created', 'KnowledgeArticle', record.id, { published: record.published });
      return record;
    });
  }

  update(actor: Actor, id: string, input: C.Input<typeof C.KnowledgeUpdate>) {
    return this.db.mutate(async tx => {
      const record = await tx.knowledgeArticle.update({ where: { id }, data: input });
      await audit(tx, actor.id, 'knowledge.updated', 'KnowledgeArticle', record.id, { fields: Object.keys(input), published: record.published });
      return record;
    });
  }
}
