import { describe, expect, it } from 'vitest';

import {
  buildStableArticleId,
  dedupeAndSortArticles,
  extractSafeSummary,
  normalizeDateToIso,
  normalizeFeedItem,
} from '../../server/lib/rss-normalization';

import type { Article } from '../interfaces/article.interface';

describe('server/lib/rss-normalization', () => {
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

  it('keeps invalid numeric entities without throwing', () => {
    const raw = '<p>Texto &#9999999999; y &#xD800; y &#x110000;</p>';

    expect(extractSafeSummary(raw)).toBe('Texto &#9999999999; y &#xD800; y &#x110000;');
  });

  it('builds deterministic id from canonical url and fallback key', () => {
    const idFromUrlA = buildStableArticleId(
      'https://example.com/news/a?utm=tracker#anchor',
      'A title',
      '2026-02-17T10:30:00.000Z',
    );
    const idFromUrlB = buildStableArticleId('https://example.com/news/a', 'Another title', '2026-02-17T08:00:00.000Z');

    const fallbackA = buildStableArticleId(null, 'Titular X', '2026-02-17T10:30:00.000Z');
    const fallbackB = buildStableArticleId(null, 'Titular X', '2026-02-17T10:30:00.000Z');

    expect(idFromUrlA).toBe(idFromUrlB);
    expect(fallbackA).toBe(fallbackB);
  });

  it('normalizes feed item and drops entries with blank title', () => {
    const valid = normalizeFeedItem({
      externalId: 'id-2',
      title: 'Mercados &#8211; cierre &#124; analisis',
      summary: '<p>Resumen</p>',
      url: 'https://example.com/news/b',
      sourceId: 'source-b',
      sourceName: 'Diario &#124; Economico',
      sectionSlug: 'economia',
      author: 'Redaccion &#8211; Madrid',
      publishedAt: 'Fri, 20 Feb 2026 12:00:00 GMT',
      imageUrl: null,
      thumbnailUrl: null,
    });
    const invalid = normalizeFeedItem({
      externalId: null,
      title: '   ',
      summary: null,
      url: null,
      sourceId: 'source-b',
      sourceName: 'Diario',
      sectionSlug: 'economia',
      author: null,
      publishedAt: null,
      imageUrl: null,
      thumbnailUrl: null,
    });

    expect(valid).not.toBeNull();
    expect(valid?.title).toContain('Mercados');
    expect(valid?.title).toContain('| analisis');
    expect(valid?.sourceName).toBe('Diario | Economico');
    expect(valid?.author).toContain('Redaccion');
    expect(valid?.author).toContain('Madrid');
    expect(invalid).toBeNull();
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

  it('keeps image and longest summary when deduping duplicate articles', () => {
    const sameUrl = 'https://example.com/news/shared-summary';
    const items: readonly Article[] = [
      makeArticle({
        id: 'short',
        canonicalUrl: sameUrl,
        sectionSlug: 'economia',
        summary: 'Resumen corto.',
        imageUrl: 'https://cdn.example.com/image.jpg',
        publishedAt: '2026-02-20T11:00:00.000Z',
      }),
      makeArticle({
        id: 'long',
        canonicalUrl: sameUrl,
        sectionSlug: 'ultima-hora',
        summary: 'Resumen largo con mas informacion y contexto editorial.',
        imageUrl: null,
        publishedAt: '2026-02-20T11:05:00.000Z',
      }),
    ];

    const deduped = dedupeAndSortArticles(items);
    expect(deduped).toHaveLength(1);
    expect(deduped[0]?.id).toBe('long');
    expect(deduped[0]?.sectionSlug).toBe('economia');
    expect(deduped[0]?.imageUrl).toBe('https://cdn.example.com/image.jpg');
    expect(deduped[0]?.summary).toBe('Resumen largo con mas informacion y contexto editorial.');
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
