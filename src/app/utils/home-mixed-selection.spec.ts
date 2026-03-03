import { describe, expect, it } from 'vitest';

import { chunkNewsItems, selectHomeMixedNews } from './home-mixed-selection';

describe('selectHomeMixedNews', () => {
  it('returns up to 15 items with section/source balance', () => {
    const now = Date.now();
    const items = buildDataset(now);

    const selected = selectHomeMixedNews(items, 15);
    const sectionCounts = countBy(selected, (item) => item.section);
    const sourceCounts = countBy(selected, (item) => item.source);

    expect(selected).toHaveLength(15);
    expect(Math.max(...sectionCounts.values())).toBeLessThanOrEqual(2);
    expect(Math.max(...sourceCounts.values())).toBeLessThanOrEqual(2);
    expect(sectionCounts.size).toBeGreaterThanOrEqual(8);
  });

  it('chunks selected cards in rows of 3', () => {
    const now = Date.now();
    const selected = selectHomeMixedNews(buildDataset(now), 15);
    const rows = chunkNewsItems(selected, 3);

    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.length === 3)).toBe(true);
  });

  it('spreads sections and sources across each row when dataset allows it', () => {
    const now = Date.now();
    const selected = selectHomeMixedNews(buildDataset(now), 15);
    const rows = chunkNewsItems(selected, 3);

    for (const row of rows) {
      const sections = new Set(row.map((item) => item.section));
      const sources = new Set(row.map((item) => item.source));
      expect(sections.size).toBe(3);
      expect(sources.size).toBe(3);
    }
  });

  it('enforces source cap with normalized source names', () => {
    const now = Date.now();
    const items = [
      createNewsItem('abc-1', 'actualidad', 'ABC', toIso(now, 1)),
      createNewsItem('abc-2', 'economia', ' abc ', toIso(now, 2)),
      createNewsItem('abc-3', 'cultura', 'Abc', toIso(now, 3)),
      createNewsItem('p-1', 'deportes', 'El Pais', toIso(now, 4)),
      createNewsItem('m-1', 'tecnologia', 'El Mundo', toIso(now, 5)),
      createNewsItem('v-1', 'opinion', 'La Vanguardia', toIso(now, 6)),
      createNewsItem('x-1', 'salud', 'Expansion', toIso(now, 7)),
    ] as const;

    const selected = selectHomeMixedNews(items, 6);
    const abcCount = selected.filter((item) => item.source.toLowerCase().trim() === 'abc').length;

    expect(abcCount).toBeLessThanOrEqual(2);
  });

  it('prioritizes key sections coverage when enough slots are available', () => {
    const now = Date.now();
    const items = [
      createNewsItem('a-1', 'actualidad', 'Fuente A', toIso(now, 1)),
      createNewsItem('s-1', 'sociedad', 'Fuente B', toIso(now, 2)),
      createNewsItem('o-1', 'opinion', 'Fuente C', toIso(now, 3)),
      createNewsItem('d-1', 'deportes', 'Fuente D', toIso(now, 4)),
      createNewsItem('c-1', 'cultura', 'Fuente E', toIso(now, 5)),
      createNewsItem('e-1', 'economia', 'Fuente F', toIso(now, 200)),
      createNewsItem('i-1', 'internacional', 'Fuente G', toIso(now, 220)),
      createNewsItem('es-1', 'espana', 'Fuente H', toIso(now, 240)),
    ] as const;

    const selected = selectHomeMixedNews(items, 8);
    const sections = new Set(selected.map((item) => item.section));

    expect(sections.has('economia')).toBe(true);
    expect(sections.has('internacional')).toBe(true);
    expect(sections.has('espana')).toBe(true);
  });
});

function buildDataset(now: number) {
  return [
    createNewsItem('a-1', 'actualidad', 'Fuente A', toIso(now, 1)),
    createNewsItem('a-2', 'actualidad', 'Fuente B', toIso(now, 2)),
    createNewsItem('e-1', 'economia', 'Fuente C', toIso(now, 3)),
    createNewsItem('e-2', 'economia', 'Fuente D', toIso(now, 4)),
    createNewsItem('c-1', 'cultura', 'Fuente E', toIso(now, 5)),
    createNewsItem('c-2', 'cultura', 'Fuente F', toIso(now, 6)),
    createNewsItem('d-1', 'deportes', 'Fuente G', toIso(now, 7)),
    createNewsItem('d-2', 'deportes', 'Fuente H', toIso(now, 8)),
    createNewsItem('s-1', 'sucesos', 'Fuente A', toIso(now, 9)),
    createNewsItem('s-2', 'sucesos', 'Fuente B', toIso(now, 10)),
    createNewsItem('j-1', 'justicia', 'Fuente C', toIso(now, 11)),
    createNewsItem('j-2', 'justicia', 'Fuente D', toIso(now, 12)),
    createNewsItem('o-1', 'opinion', 'Fuente E', toIso(now, 13)),
    createNewsItem('o-2', 'opinion', 'Fuente F', toIso(now, 14)),
    createNewsItem('t-1', 'tecnologia', 'Fuente G', toIso(now, 15)),
    createNewsItem('t-2', 'tecnologia', 'Fuente H', toIso(now, 16)),
    createNewsItem('v-1', 'viajes', 'Fuente I', toIso(now, 17)),
    createNewsItem('v-2', 'viajes', 'Fuente J', toIso(now, 18)),
  ] as const;
}

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
