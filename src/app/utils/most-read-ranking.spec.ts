import { describe, expect, it } from 'vitest';

import { rankMostReadNews } from './most-read-ranking';

describe('rankMostReadNews', () => {
  it('returns empty list when input is empty', () => {
    const ranked = rankMostReadNews([]);

    expect(ranked).toEqual([]);
  });

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

  it('applies source cap with normalized source names', () => {
    const now = Date.now();
    const items = [
      createNewsItem('abc-1', 'ABC', toIso(now, 1)),
      createNewsItem('abc-2', ' abc ', toIso(now, 2)),
      createNewsItem('abc-3', 'Abc', toIso(now, 3)),
      createNewsItem('abc-4', 'ABC', toIso(now, 4)),
      createNewsItem('p-1', 'El Pais', toIso(now, 5)),
      createNewsItem('m-1', 'El Mundo', toIso(now, 6)),
      createNewsItem('v-1', 'La Vanguardia', toIso(now, 7)),
    ] as const;

    const ranked = rankMostReadNews(items, now);
    const normalizedAbcCount = ranked.filter((item) => item.source.toLowerCase().trim() === 'abc').length;

    expect(normalizedAbcCount).toBe(3);
  });

  it('uses recency ordering when all sources are unique', () => {
    const now = Date.now();
    const items = [
      createNewsItem('n-1', 'Fuente A', toIso(now, 30)),
      createNewsItem('n-2', 'Fuente B', toIso(now, 10)),
      createNewsItem('n-3', 'Fuente C', toIso(now, 5)),
    ] as const;

    const ranked = rankMostReadNews(items, now);

    expect(ranked.map((item) => item.id)).toEqual(['n-3', 'n-2', 'n-1']);
  });

  it('sends items with invalid publishedAt to the end as least recent', () => {
    const now = Date.now();
    const items = [
      createNewsItem('valid', 'Fuente A', toIso(now, 2)),
      createNewsItem('invalid', 'Fuente B', 'not-a-date'),
    ] as const;

    const ranked = rankMostReadNews(items, now);

    expect(ranked[0]?.id).toBe('valid');
    expect(ranked[1]?.id).toBe('invalid');
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
