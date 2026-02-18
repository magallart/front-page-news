import { describe, expect, it } from 'vitest';

import { applyNewsFilters, parseNewsQuery } from './news-query';

import type { Article } from '../interfaces/article.interface';

describe('news-query', () => {
  it('parses filters and pagination from URL', () => {
    const query = parseNewsQuery('/api/news?id=url-123&section=economia&source=source-a,source-b&q=inflacion&page=2&limit=10');

    expect(query.id).toBe('url-123');
    expect(query.section).toBe('economia');
    expect(query.sourceIds).toEqual(['source-a', 'source-b']);
    expect(query.searchQuery).toBe('inflacion');
    expect(query.page).toBe(2);
    expect(query.limit).toBe(10);
  });

  it('applies defaults when query params are invalid', () => {
    const query = parseNewsQuery('/api/news?page=0&limit=1000');

    expect(query.id).toBeNull();
    expect(query.page).toBe(1);
    expect(query.limit).toBe(100);
  });

  it('filters and paginates articles', () => {
    const articles: readonly Article[] = [
      makeArticle({ id: '1', sourceId: 'source-a', sectionSlug: 'economia', title: 'Inflacion en Europa' }),
      makeArticle({ id: '2', sourceId: 'source-a', sectionSlug: 'economia', title: 'Mercados al alza' }),
      makeArticle({ id: '3', sourceId: 'source-b', sectionSlug: 'economia', title: 'Inflacion en Espana' }),
      makeArticle({ id: '4', sourceId: 'source-c', sectionSlug: 'deportes', title: 'Liga en directo' }),
    ];

    const query = parseNewsQuery('/api/news?section=economia&source=source-a,source-b&q=inflacion&page=1&limit=2');
    const result = applyNewsFilters(articles, query);

    expect(result.total).toBe(2);
    expect(result.articles).toHaveLength(2);
    expect(result.articles.map((item) => item.id)).toEqual(['1', '3']);
  });

  it('filters by exact id when provided', () => {
    const articles: readonly Article[] = [
      makeArticle({ id: 'url-aaa', title: 'A' }),
      makeArticle({ id: 'url-bbb', title: 'B' }),
    ];

    const query = parseNewsQuery('/api/news?id=url-bbb&page=1&limit=10');
    const result = applyNewsFilters(articles, query);

    expect(result.total).toBe(1);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0]?.id).toBe('url-bbb');
  });
});

function makeArticle(overrides: Partial<Article>): Article {
  return {
    id: overrides.id ?? 'base-id',
    externalId: overrides.externalId ?? null,
    title: overrides.title ?? 'Titular',
    summary: overrides.summary ?? 'Resumen',
    url: overrides.url ?? 'https://example.com/article',
    canonicalUrl: overrides.canonicalUrl ?? 'https://example.com/article',
    imageUrl: overrides.imageUrl ?? null,
    sourceId: overrides.sourceId ?? 'source-a',
    sourceName: overrides.sourceName ?? 'Source A',
    sectionSlug: overrides.sectionSlug ?? 'actualidad',
    author: overrides.author ?? null,
    publishedAt: overrides.publishedAt ?? '2026-02-17T00:00:00.000Z',
  };
}
