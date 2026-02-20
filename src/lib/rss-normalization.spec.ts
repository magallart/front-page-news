import { describe, expect, it } from 'vitest';

import {
  buildStableArticleId,
  dedupeAndSortArticles,
  extractSafeSummary,
  normalizeDateToIso,
  normalizeFeedItem,
} from './rss-normalization';

import type { Article } from '../interfaces/article.interface';

describe('rss-normalization', () => {
  it('normalizes valid dates to ISO', () => {
    expect(normalizeDateToIso('Tue, 17 Feb 2026 10:30:00 GMT')).toBe('2026-02-17T10:30:00.000Z');
    expect(normalizeDateToIso('2026-02-17T10:30:00+01:00')).toBe('2026-02-17T09:30:00.000Z');
  });

  it('returns null for invalid dates', () => {
    expect(normalizeDateToIso('not-a-date')).toBeNull();
    expect(normalizeDateToIso(null)).toBeNull();
  });

  it('extracts safe summary text from html', () => {
    const raw =
      '<p>Ultima <strong>hora</strong> &amp; analisis</p><script>alert("x")</script><style>.x{}</style>';

    expect(extractSafeSummary(raw)).toBe('Ultima hora & analisis');
  });

  it('repairs common mojibake in extracted summary text', () => {
    const raw = '<p>SegÃºn fuentes, se abren nuevas lÃ­neas para los prÃ³ximos dÃ­as.</p>';

    expect(extractSafeSummary(raw)).toBe('Según fuentes, se abren nuevas líneas para los próximos días.');
  });

  it('keeps invalid numeric entities without throwing', () => {
    const raw = '<p>Texto &#9999999999; y &#xD800; y &#x110000;</p>';

    expect(extractSafeSummary(raw)).toBe('Texto &#9999999999; y &#xD800; y &#x110000;');
  });

  it('builds deterministic id from canonical url and fallback key', () => {
    const idFromUrlA = buildStableArticleId(
      'https://example.com/news/a?utm=tracker#anchor',
      'A title',
      '2026-02-17T10:30:00.000Z'
    );
    const idFromUrlB = buildStableArticleId(
      'https://example.com/news/a',
      'Another title',
      '2026-02-17T08:00:00.000Z'
    );

    const fallbackA = buildStableArticleId(null, 'Titular X', '2026-02-17T10:30:00.000Z');
    const fallbackB = buildStableArticleId(null, 'Titular X', '2026-02-17T10:30:00.000Z');

    expect(idFromUrlA).toBe(idFromUrlB);
    expect(fallbackA).toBe(fallbackB);
  });

  it('dedupes by canonical url and fallback title + publishedAt, then sorts by date desc', () => {
    const items: readonly Article[] = [
      makeArticle({
        id: '1',
        title: 'A',
        canonicalUrl: 'https://example.com/news/a',
        publishedAt: '2026-02-17T10:00:00.000Z',
      }),
      makeArticle({
        id: '2',
        title: 'A newer',
        canonicalUrl: 'https://example.com/news/a',
        publishedAt: '2026-02-17T11:00:00.000Z',
      }),
      makeArticle({
        id: '3',
        title: 'Sin URL',
        canonicalUrl: null,
        publishedAt: '2026-02-17T09:00:00.000Z',
      }),
      makeArticle({
        id: '4',
        title: 'Sin URL',
        canonicalUrl: null,
        publishedAt: '2026-02-17T09:00:00.000Z',
      }),
      makeArticle({
        id: '5',
        title: 'B',
        canonicalUrl: 'https://example.com/news/b',
        publishedAt: '2026-02-17T12:00:00.000Z',
      }),
    ];

    const deduped = dedupeAndSortArticles(items);

    expect(deduped).toHaveLength(3);
    expect(deduped[0]?.id).toBe('5');
    expect(deduped[1]?.id).toBe('2');
    expect(deduped[2]?.id).toBe('3');
  });

  it('prefers specific section over ultima-hora for duplicates with same timestamp', () => {
    const sameUrl = 'https://example.com/news/shared';
    const sameTimestamp = '2026-02-17T11:00:00.000Z';
    const items: readonly Article[] = [
      makeArticle({
        id: 'u-1',
        canonicalUrl: sameUrl,
        sectionSlug: 'ultima-hora',
        publishedAt: sameTimestamp,
      }),
      makeArticle({
        id: 'e-1',
        canonicalUrl: sameUrl,
        sectionSlug: 'economia',
        publishedAt: sameTimestamp,
      }),
    ];

    const deduped = dedupeAndSortArticles(items);

    expect(deduped).toHaveLength(1);
    expect(deduped[0]?.id).toBe('e-1');
    expect(deduped[0]?.sectionSlug).toBe('economia');
  });

  it('keeps image from duplicate variant when preferred item has no image', () => {
    const sameUrl = 'https://example.com/news/shared-image';
    const items: readonly Article[] = [
      makeArticle({
        id: 'base',
        canonicalUrl: sameUrl,
        sectionSlug: 'economia',
        publishedAt: '2026-02-20T11:00:00.000Z',
        imageUrl: 'https://cdn.example.com/image.jpg',
      }),
      makeArticle({
        id: 'newer-without-image',
        canonicalUrl: sameUrl,
        sectionSlug: 'ultima-hora',
        publishedAt: '2026-02-20T11:05:00.000Z',
        imageUrl: null,
      }),
    ];

    const deduped = dedupeAndSortArticles(items);

    expect(deduped).toHaveLength(1);
    expect(deduped[0]?.id).toBe('newer-without-image');
    expect(deduped[0]?.sectionSlug).toBe('economia');
    expect(deduped[0]?.imageUrl).toBe('https://cdn.example.com/image.jpg');
  });

  it('repairs mojibake in feed item title and author during normalization', () => {
    const normalized = normalizeFeedItem({
      externalId: 'id-1',
      title: 'AnÃ¡lisis del dÃ­a',
      summary: '<p>Texto</p>',
      url: 'https://example.com/news/a',
      sourceId: 'source-a',
      sourceName: 'PeriÃ³dico Demo',
      sectionSlug: 'opinion',
      author: 'RedacciÃ³n Demo',
      publishedAt: 'Fri, 20 Feb 2026 10:00:00 GMT',
      imageUrl: null,
      thumbnailUrl: null,
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.title).toBe('Análisis del día');
    expect(normalized?.sourceName).toBe('Periódico Demo');
    expect(normalized?.author).toBe('Redacción Demo');
  });
});

function makeArticle(overrides: Partial<Article>): Article {
  return {
    id: overrides.id ?? 'base-id',
    externalId: overrides.externalId ?? null,
    title: overrides.title ?? 'base-title',
    summary: overrides.summary ?? '',
    url: overrides.url ?? 'https://example.com/base',
    canonicalUrl: overrides.canonicalUrl ?? 'https://example.com/base',
    imageUrl: overrides.imageUrl ?? null,
    sourceId: overrides.sourceId ?? 'source-a',
    sourceName: overrides.sourceName ?? 'Source A',
    sectionSlug: overrides.sectionSlug ?? 'actualidad',
    author: overrides.author ?? null,
    publishedAt: overrides.publishedAt ?? '2026-02-17T00:00:00.000Z',
  };
}
