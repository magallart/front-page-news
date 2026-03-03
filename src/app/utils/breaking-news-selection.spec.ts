import { describe, expect, it } from 'vitest';

import { selectBreakingNews } from './breaking-news-selection';

describe('selectBreakingNews', () => {
  it('returns up to 6 items with source balance when dataset allows it', () => {
    const now = Date.now();
    const items = [
      createNewsItem('a-1', 'ABC', toIso(now, 1)),
      createNewsItem('a-2', 'ABC', toIso(now, 2)),
      createNewsItem('a-3', 'ABC', toIso(now, 3)),
      createNewsItem('b-1', 'El Pais', toIso(now, 4)),
      createNewsItem('b-2', 'El Pais', toIso(now, 5)),
      createNewsItem('c-1', 'El Mundo', toIso(now, 6)),
      createNewsItem('d-1', 'La Vanguardia', toIso(now, 7)),
      createNewsItem('e-1', 'Expansion', toIso(now, 8)),
    ] as const;

    const selected = selectBreakingNews(items, 6);
    const sourceCounts = countBy(selected, (item) => item.source.toLowerCase().trim());

    expect(selected).toHaveLength(6);
    expect(Math.max(...sourceCounts.values())).toBeLessThanOrEqual(2);
  });

  it('applies source cap using normalized source keys', () => {
    const now = Date.now();
    const items = [
      createNewsItem('abc-1', 'ABC', toIso(now, 1)),
      createNewsItem('abc-2', ' abc ', toIso(now, 2)),
      createNewsItem('abc-3', 'Abc', toIso(now, 3)),
      createNewsItem('p-1', 'El Pais', toIso(now, 4)),
      createNewsItem('m-1', 'El Mundo', toIso(now, 5)),
      createNewsItem('v-1', 'La Vanguardia', toIso(now, 6)),
      createNewsItem('x-1', 'Expansion', toIso(now, 7)),
    ] as const;

    const selected = selectBreakingNews(items, 6);
    const normalizedAbcCount = selected.filter((item) => item.source.toLowerCase().trim() === 'abc').length;

    expect(normalizedAbcCount).toBeLessThanOrEqual(2);
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

function countBy<T>(items: readonly T[], keySelector: (item: T) => string): Map<string, number> {
  const result = new Map<string, number>();
  for (const item of items) {
    const key = keySelector(item);
    result.set(key, (result.get(key) ?? 0) + 1);
  }
  return result;
}

function toIso(now: number, minutesAgo: number): string {
  return new Date(now - minutesAgo * 60 * 1000).toISOString();
}
