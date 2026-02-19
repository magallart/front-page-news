import { describe, expect, it } from 'vitest';

import { rankMostReadNews } from './most-read-ranking';

describe('rankMostReadNews', () => {
  it('caps results to 3 items per source', () => {
    const now = Date.now();
    const items = [
      createNewsItem('a-1', 'Fuente A', toIso(now, 5)),
      createNewsItem('a-2', 'Fuente A', toIso(now, 10)),
      createNewsItem('a-3', 'Fuente A', toIso(now, 15)),
      createNewsItem('a-4', 'Fuente A', toIso(now, 20)),
      createNewsItem('b-1', 'Fuente B', toIso(now, 2)),
      createNewsItem('c-1', 'Fuente C', toIso(now, 7)),
    ] as const;

    const ranked = rankMostReadNews(items, now);
    const sourceACount = ranked.filter((item) => item.source === 'Fuente A').length;

    expect(sourceACount).toBe(3);
  });

  it('prioritizes repeated source when recency is close', () => {
    const now = Date.now();
    const items = [
      createNewsItem('a-1', 'Fuente A', toIso(now, 5)),
      createNewsItem('a-2', 'Fuente A', toIso(now, 10)),
      createNewsItem('b-1', 'Fuente B', toIso(now, 2)),
      createNewsItem('c-1', 'Fuente C', toIso(now, 7)),
    ] as const;

    const ranked = rankMostReadNews(items, now);

    expect(ranked[0]?.source).toBe('Fuente A');
  });
});

function createNewsItem(id: string, source: string, publishedAt: string) {
  return {
    id,
    title: id,
    summary: id,
    imageUrl: 'https://example.com/image.jpg',
    source,
    section: 'actualidad',
    publishedAt,
    author: 'Autor',
    url: `https://example.com/${id}`,
  } as const;
}

function toIso(now: number, minutesAgo: number): string {
  return new Date(now - minutesAgo * 60 * 1000).toISOString();
}
