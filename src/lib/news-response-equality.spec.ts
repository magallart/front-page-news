import { describe, expect, it } from 'vitest';

import { areNewsResponsesEqual } from '../../shared/lib/news-response-equality';

import type { NewsResponse } from '../../shared/interfaces/news-response.interface';

describe('shared/lib/news-response-equality', () => {
  it('returns true for structurally equal responses', () => {
    const left = createNewsResponse();
    const right = createNewsResponse();

    expect(areNewsResponsesEqual(left, right)).toBe(true);
  });

  it('returns false when article content changes', () => {
    const left = createNewsResponse();
    const right = createNewsResponse({
      articles: [
        {
          ...createNewsResponse().articles[0],
          id: 'news-2',
        },
      ],
    });

    expect(areNewsResponsesEqual(left, right)).toBe(false);
  });

  it('returns false when warning metadata changes', () => {
    const left = createNewsResponse();
    const right = createNewsResponse({
      warnings: [
        {
          code: 'source_timeout',
          message: 'Timeout',
          sourceId: 'source-1',
          feedUrl: 'https://example.com/rss.xml',
        },
      ],
    });

    expect(areNewsResponsesEqual(left, right)).toBe(false);
  });
});

function createNewsResponse(overrides: Partial<NewsResponse> = {}): NewsResponse {
  return {
    articles: [
      {
        id: 'news-1',
        externalId: null,
        title: 'Titulo',
        summary: 'Resumen',
        url: 'https://example.com/news-1',
        canonicalUrl: null,
        imageUrl: null,
        thumbnailUrl: null,
        sourceId: 'source-1',
        sourceName: 'Fuente',
        sectionSlug: 'actualidad',
        author: null,
        publishedAt: '2026-04-28T08:00:00.000Z',
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    warnings: [],
    ...overrides,
  };
}
