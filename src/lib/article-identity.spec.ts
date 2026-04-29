import { describe, expect, it } from 'vitest';

import {
  toArticleDeduplicationKey,
  toArticleFingerprint,
  toNewsResponseFingerprint,
} from '../../shared/lib/article-identity';

import type { Article } from '../../shared/interfaces/article.interface';
import type { NewsResponse } from '../../shared/interfaces/news-response.interface';

describe('shared/lib/article-identity', () => {
  it('builds article deduplication key from canonical url when available', () => {
    expect(
      toArticleDeduplicationKey({
        canonicalUrl: 'https://example.com/news/a',
        title: 'Titulo A',
        publishedAt: '2026-04-29T10:00:00.000Z',
      }),
    ).toBe('https://example.com/news/a');
  });

  it('falls back to normalized title and publication date when canonical url is missing', () => {
    expect(
      toArticleDeduplicationKey({
        canonicalUrl: null,
        title: '  Titulo A  ',
        publishedAt: '2026-04-29T10:00:00.000Z',
      }),
    ).toBe('titulo a|2026-04-29T10:00:00.000Z');
  });

  it('changes response fingerprint when article content changes', () => {
    const base = createResponse();
    const changed = createResponse({
      articles: [
        {
          ...createArticle(),
          summary: 'Resumen distinto',
        },
      ],
    });

    expect(toNewsResponseFingerprint(base)).not.toBe(toNewsResponseFingerprint(changed));
    expect(toArticleFingerprint(base.articles[0]!)).not.toBe(toArticleFingerprint(changed.articles[0]!));
  });
});

function createResponse(overrides: Partial<NewsResponse> = {}): NewsResponse {
  return {
    articles: [createArticle()],
    total: 1,
    page: 1,
    limit: 20,
    warnings: [],
    ...overrides,
  };
}

function createArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 'article-1',
    externalId: null,
    title: 'Titulo de prueba',
    summary: 'Resumen de prueba',
    url: 'https://example.com/article-1',
    canonicalUrl: 'https://example.com/article-1',
    imageUrl: null,
    thumbnailUrl: null,
    sourceId: 'source-1',
    sourceName: 'Source 1',
    sectionSlug: 'actualidad',
    author: null,
    publishedAt: '2026-04-29T10:00:00.000Z',
    ...overrides,
  };
}
