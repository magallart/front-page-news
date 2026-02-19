import { describe, expect, it } from 'vitest';

import { selectFeaturedNews } from './featured-news-selection';

describe('selectFeaturedNews', () => {
  it('prioritizes section diversity before filling remaining slots', () => {
    const now = Date.now();
    const items = [
      createNewsItem('a-1', 'actualidad', 'Fuente A', toIso(now, 1)),
      createNewsItem('a-2', 'actualidad', 'Fuente A', toIso(now, 2)),
      createNewsItem('e-1', 'economia', 'Fuente B', toIso(now, 3)),
      createNewsItem('c-1', 'cultura', 'Fuente C', toIso(now, 4)),
      createNewsItem('d-1', 'deportes', 'Fuente D', toIso(now, 5)),
      createNewsItem('j-1', 'justicia', 'Fuente E', toIso(now, 6)),
    ] as const;

    const selected = selectFeaturedNews(items);
    const sections = new Set(selected.map((item) => item.section));

    expect(selected).toHaveLength(5);
    expect(sections.has('actualidad')).toBe(true);
    expect(sections.has('economia')).toBe(true);
    expect(sections.has('cultura')).toBe(true);
    expect(sections.has('deportes')).toBe(true);
    expect(sections.has('justicia')).toBe(true);
  });

  it('caps highlighted items per source', () => {
    const now = Date.now();
    const items = [
      createNewsItem('a-1', 'actualidad', 'Fuente A', toIso(now, 1)),
      createNewsItem('a-2', 'economia', 'Fuente A', toIso(now, 2)),
      createNewsItem('a-3', 'cultura', 'Fuente A', toIso(now, 3)),
      createNewsItem('a-4', 'deportes', 'Fuente A', toIso(now, 4)),
      createNewsItem('b-1', 'actualidad', 'Fuente B', toIso(now, 5)),
      createNewsItem('c-1', 'economia', 'Fuente C', toIso(now, 6)),
    ] as const;

    const selected = selectFeaturedNews(items);
    const sourceACount = selected.filter((item) => item.source === 'Fuente A').length;

    expect(selected).toHaveLength(4);
    expect(sourceACount).toBe(2);
  });
});

function createNewsItem(id: string, section: string, source: string, publishedAt: string) {
  return {
    id,
    title: id,
    summary: id,
    imageUrl: 'https://example.com/image.jpg',
    source,
    section,
    publishedAt,
    author: 'Autor',
    url: `https://example.com/${id}`,
  } as const;
}

function toIso(now: number, minutesAgo: number): string {
  return new Date(now - minutesAgo * 60 * 1000).toISOString();
}
