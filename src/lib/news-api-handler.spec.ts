import { describe, expect, it } from 'vitest';

import { createNewsHandler } from '../../api/news';
import { WARNING_CODE } from '../../server/constants/warning-code.constants';

import type { SourceFeedTarget } from '../interfaces/source-feed-target.interface';
import type { Warning } from '../interfaces/warning.interface';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface HandlerSuccessPayload {
  readonly total: number;
  readonly articles: readonly { sectionSlug: string; title: string }[];
  readonly warnings: readonly Warning[];
}

interface HandlerErrorPayload {
  readonly error: string;
}

describe('api/news handler contract', () => {
  it('fetches only matching section feed for sources with multiple feed URLs', async () => {
    const catalog = makeCatalogTargets();
    const fetchedFeedUrls: string[] = [];
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources) => {
        fetchedFeedUrls.push(...sources.map((source) => source.feedUrl));
        return {
          successes: sources.map((source) => ({
            sourceId: source.id,
            feedUrl: source.feedUrl,
            body: buildRssXml({
              title: source.feedUrl.includes('/cultura') ? 'Cultura El Pais' : 'Portada El Pais',
              url: source.feedUrl.includes('/cultura')
                ? 'https://elpais.com/cultura/noticia-1'
                : 'https://elpais.com/portada/noticia-1',
            }),
          })),
          warnings: [],
        };
      },
    });

    const response = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=cultura') as IncomingMessage,
      response as unknown as ServerResponse
    );

    const payload = readJson<HandlerSuccessPayload>(response);
    expect(response.statusCode).toBe(200);
    expect(response.headers.get('cache-control')).toContain('s-maxage=120');
    expect(fetchedFeedUrls).toEqual(['https://feeds.elpais.com/cultura']);
    expect(payload.total).toBe(1);
    expect(payload.articles[0]?.sectionSlug).toBe('cultura');
    expect(payload.articles[0]?.title).toBe('Cultura El Pais');
  });

  it('returns merged warnings from fetch and parse stages', async () => {
    const catalog = makeCatalogTargets().filter((target) => target.sectionSlug === 'actualidad');
    const fetchWarnings: readonly Warning[] = [
      {
        code: WARNING_CODE.SOURCE_TIMEOUT,
        message: 'timeout',
        sourceId: 'source-abc',
        feedUrl: 'https://abc.es/rss/actualidad',
      },
    ];

    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources) => ({
        successes: [
          {
            sourceId: sources[0]?.id ?? 'source-el-pais',
            feedUrl: sources[0]?.feedUrl ?? 'https://feeds.elpais.com/portada',
            body: '<html>invalid</html>',
          },
        ],
        warnings: fetchWarnings,
      }),
    });

    const response = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=actualidad') as IncomingMessage,
      response as unknown as ServerResponse
    );

    const payload = readJson<HandlerSuccessPayload>(response);
    const warningCodes = payload.warnings.map((warning: Warning) => warning.code);

    expect(response.statusCode).toBe(200);
    expect(warningCodes).toContain(WARNING_CODE.SOURCE_TIMEOUT);
    expect(warningCodes).toContain(WARNING_CODE.SOURCE_PARSE_FAILED);
  });

  it('does not overwrite section mapping when multiple sections share the same source/feed key', async () => {
    const sharedUrl = 'https://feeds.elpais.com/shared-feed';
    const catalog: readonly SourceFeedTarget[] = [
      {
        sourceId: 'source-el-pais',
        sourceName: 'El Pais',
        sourceBaseUrl: 'https://feeds.elpais.com',
        feedUrl: sharedUrl,
        sectionSlug: 'actualidad',
      },
      {
        sourceId: 'source-el-pais',
        sourceName: 'El Pais',
        sourceBaseUrl: 'https://feeds.elpais.com',
        feedUrl: sharedUrl,
        sectionSlug: 'cultura',
      },
    ];

    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources) => {
        expect(sources).toHaveLength(1);
        return {
          successes: [
            {
              sourceId: 'source-el-pais',
              feedUrl: sharedUrl,
              body: buildRssXml({
                title: 'Shared Feed Article',
                url: 'https://elpais.com/shared/article-1',
              }),
            },
          ],
          warnings: [],
        };
      },
    });

    const response = createMockResponse();
    await handler(createRequest('GET', '/api/news') as IncomingMessage, response as unknown as ServerResponse);

    const payload = readJson<HandlerSuccessPayload>(response);
    expect(payload.total).toBe(1);
    expect(payload.articles[0]?.sectionSlug).toBe('actualidad');
  });

  it('returns 500 and no-store when catalog loading fails', async () => {
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => {
        throw new Error('cannot-read-catalog');
      },
      fetchFeeds: async () => ({
        successes: [],
        warnings: [],
      }),
    });

    const response = createMockResponse();
    await handler(createRequest('GET', '/api/news') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(500);
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');
    expect(readJson<HandlerErrorPayload>(response).error).toBe('Unable to load RSS sources catalog');
  });

  it('returns 405 and no-store for non-GET methods', async () => {
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => makeCatalogTargets(),
      fetchFeeds: async () => ({
        successes: [],
        warnings: [],
      }),
    });

    const response = createMockResponse();
    await handler(createRequest('POST', '/api/news') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(405);
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');
    expect(readJson<HandlerErrorPayload>(response).error).toBe('Method Not Allowed');
  });

  it('dedupes in-flight requests for the same query', async () => {
    const catalog = makeCatalogTargets();
    let fetchFeedsCallCount = 0;
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources) => {
        fetchFeedsCallCount += 1;
        await delay(20);

        return {
          successes: sources.map((source) => ({
            sourceId: source.id,
            feedUrl: source.feedUrl,
            body: buildRssXml({
              title: 'In Flight Deduped',
              url: 'https://elpais.com/deduped',
            }),
          })),
          warnings: [],
        };
      },
    });

    const firstResponse = createMockResponse();
    const secondResponse = createMockResponse();

    await Promise.all([
      handler(createRequest('GET', '/api/news?section=actualidad') as IncomingMessage, firstResponse as unknown as ServerResponse),
      handler(createRequest('GET', '/api/news?section=actualidad') as IncomingMessage, secondResponse as unknown as ServerResponse),
    ]);

    expect(firstResponse.statusCode).toBe(200);
    expect(secondResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(1);
  });

  it('uses cached payload within ttl and refetches after ttl expiry', async () => {
    const catalog = makeCatalogTargets();
    let fetchFeedsCallCount = 0;
    let nowTimestamp = 1000;
    const handler = createNewsHandler(
      {
        loadSourcesCatalog: async () => catalog,
        fetchFeeds: async (sources) => {
          fetchFeedsCallCount += 1;

          return {
            successes: sources.map((source) => ({
              sourceId: source.id,
              feedUrl: source.feedUrl,
              body: buildRssXml({
                title: `Cache Call ${fetchFeedsCallCount}`,
                url: `https://elpais.com/cache-${fetchFeedsCallCount}`,
              }),
            })),
            warnings: [],
          };
        },
      },
      {
        cacheTtlMs: 60_000,
        now: () => nowTimestamp,
      },
    );

    const firstResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=actualidad&page=1&limit=20') as IncomingMessage,
      firstResponse as unknown as ServerResponse,
    );
    expect(firstResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(1);

    nowTimestamp += 59_000;
    const secondResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=actualidad&page=1&limit=20') as IncomingMessage,
      secondResponse as unknown as ServerResponse,
    );
    expect(secondResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(1);

    nowTimestamp += 2_000;
    const thirdResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=actualidad&page=1&limit=20') as IncomingMessage,
      thirdResponse as unknown as ServerResponse,
    );
    expect(thirdResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(2);
  });

  it('evicts least recently used query when cache max entries is exceeded', async () => {
    const catalog = makeCatalogTargets();
    let fetchFeedsCallCount = 0;
    const nowTimestamp = 1000;
    const handler = createNewsHandler(
      {
        loadSourcesCatalog: async () => catalog,
        fetchFeeds: async (sources) => {
          fetchFeedsCallCount += 1;

          return {
            successes: sources.map((source) => ({
              sourceId: source.id,
              feedUrl: source.feedUrl,
              body: buildRssXml({
                title: `Cache Limit Call ${fetchFeedsCallCount}`,
                url: `https://elpais.com/cache-limit-${fetchFeedsCallCount}`,
              }),
            })),
            warnings: [],
          };
        },
      },
      {
        cacheTtlMs: 60_000,
        cacheMaxEntries: 2,
        now: () => nowTimestamp,
      },
    );

    const firstResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=actualidad&page=1&limit=20') as IncomingMessage,
      firstResponse as unknown as ServerResponse,
    );
    expect(firstResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(1);

    const secondResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=cultura&page=1&limit=20') as IncomingMessage,
      secondResponse as unknown as ServerResponse,
    );
    expect(secondResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(2);

    const promotedFirstResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=actualidad&page=1&limit=20') as IncomingMessage,
      promotedFirstResponse as unknown as ServerResponse,
    );
    expect(promotedFirstResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(2);

    const thirdResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?page=1&limit=20') as IncomingMessage,
      thirdResponse as unknown as ServerResponse,
    );
    expect(thirdResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(3);

    const evictedSecondResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=cultura&page=1&limit=20') as IncomingMessage,
      evictedSecondResponse as unknown as ServerResponse,
    );
    expect(evictedSecondResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(4);

    const stillCachedThirdResponse = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?page=1&limit=20') as IncomingMessage,
      stillCachedThirdResponse as unknown as ServerResponse,
    );
    expect(stillCachedThirdResponse.statusCode).toBe(200);
    expect(fetchFeedsCallCount).toBe(4);
  });

  it('limits homepage feed fan-out and uses shorter timeout for cold home requests', async () => {
    const catalog = makeLargeCatalogTargets(40);
    let fetchedSourceCount = 0;
    let timeoutMsUsed = 0;
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources, timeoutMs) => {
        fetchedSourceCount = sources.length;
        timeoutMsUsed = timeoutMs;

        return {
          successes: [],
          warnings: [],
        };
      },
    });

    const response = createMockResponse();
    await handler(createRequest('GET', '/api/news?page=1&limit=250') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(200);
    expect(fetchedSourceCount).toBe(24);
    expect(timeoutMsUsed).toBe(3500);
  });

  it('fills homepage feed subset with round-robin distribution across sources', async () => {
    const catalog = makeGroupedCatalogTargets(3, 10);
    const fetchedBySource = new Map<string, number>();
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources) => {
        for (const source of sources) {
          fetchedBySource.set(source.id, (fetchedBySource.get(source.id) ?? 0) + 1);
        }

        return {
          successes: [],
          warnings: [],
        };
      },
    });

    const response = createMockResponse();
    await handler(createRequest('GET', '/api/news?page=1&limit=250') as IncomingMessage, response as unknown as ServerResponse);

    const counts = Array.from(fetchedBySource.values());
    const min = Math.min(...counts);
    const max = Math.max(...counts);

    expect(response.statusCode).toBe(200);
    expect(counts.reduce((total, current) => total + current, 0)).toBe(24);
    expect(min).toBeGreaterThanOrEqual(7);
    expect(max).toBeLessThanOrEqual(9);
  });

  it('prioritizes section coverage for homepage optimized selection', async () => {
    const catalog = makeSkewedSectionCatalogTargets();
    const fetchedSections = new Set<string>();
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources) => {
        for (const source of sources) {
          const section = source.sectionSlugs[0] ?? '';
          if (section.length > 0) {
            fetchedSections.add(section);
          }
        }

        return {
          successes: [],
          warnings: [],
        };
      },
    });

    const response = createMockResponse();
    await handler(createRequest('GET', '/api/news?page=1&limit=250') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(200);
    expect(fetchedSections.has('actualidad')).toBe(true);
    expect(fetchedSections.has('economia')).toBe(true);
    expect(fetchedSections.has('espana')).toBe(true);
    expect(fetchedSections.has('internacional')).toBe(true);
  });

  it('keeps full fan-out and default timeout for non-home queries', async () => {
    const catalog = makeLargeCatalogTargets(30);
    let fetchedSourceCount = 0;
    let timeoutMsUsed = 0;
    const handler = createNewsHandler({
      loadSourcesCatalog: async () => catalog,
      fetchFeeds: async (sources, timeoutMs) => {
        fetchedSourceCount = sources.length;
        timeoutMsUsed = timeoutMs;

        return {
          successes: [],
          warnings: [],
        };
      },
    });

    const response = createMockResponse();
    await handler(
      createRequest('GET', '/api/news?section=actualidad&page=1&limit=300') as IncomingMessage,
      response as unknown as ServerResponse,
    );

    expect(response.statusCode).toBe(200);
    expect(fetchedSourceCount).toBe(30);
    expect(timeoutMsUsed).toBe(8000);
  });
});

interface MockResponse {
  statusCode: number;
  body: string;
  headers: Map<string, string>;
  setHeader(name: string, value: string): void;
  end(chunk?: string): void;
}

function createMockResponse(): MockResponse {
  return {
    statusCode: 0,
    body: '',
    headers: new Map<string, string>(),
    setHeader(name: string, value: string): void {
      this.headers.set(name.toLowerCase(), value);
    },
    end(chunk?: string): void {
      if (chunk) {
        this.body = String(chunk);
      }
    },
  };
}

function readJson<T>(response: MockResponse): T {
  return JSON.parse(response.body) as T;
}

function createRequest(method: string, url: string): Partial<IncomingMessage> {
  return {
    method,
    url,
  };
}

function makeCatalogTargets(): readonly SourceFeedTarget[] {
  return [
    {
      sourceId: 'source-el-pais',
      sourceName: 'El Pais',
      sourceBaseUrl: 'https://feeds.elpais.com',
      feedUrl: 'https://feeds.elpais.com/portada',
      sectionSlug: 'actualidad',
    },
    {
      sourceId: 'source-el-pais',
      sourceName: 'El Pais',
      sourceBaseUrl: 'https://feeds.elpais.com',
      feedUrl: 'https://feeds.elpais.com/cultura',
      sectionSlug: 'cultura',
    },
  ];
}

function makeLargeCatalogTargets(total: number): readonly SourceFeedTarget[] {
  return Array.from({ length: total }, (_, index) => ({
    sourceId: `source-${index}`,
    sourceName: `Source ${index}`,
    sourceBaseUrl: `https://source-${index}.test`,
    feedUrl: `https://source-${index}.test/rss/actualidad.xml`,
    sectionSlug: 'actualidad',
  }));
}

function makeGroupedCatalogTargets(sourceCount: number, feedsPerSource: number): readonly SourceFeedTarget[] {
  const targets: SourceFeedTarget[] = [];

  for (let sourceIndex = 0; sourceIndex < sourceCount; sourceIndex += 1) {
    for (let feedIndex = 0; feedIndex < feedsPerSource; feedIndex += 1) {
      targets.push({
        sourceId: `source-${sourceIndex}`,
        sourceName: `Source ${sourceIndex}`,
        sourceBaseUrl: `https://source-${sourceIndex}.test`,
        feedUrl: `https://source-${sourceIndex}.test/rss/feed-${feedIndex}.xml`,
        sectionSlug: 'actualidad',
      });
    }
  }

  return targets;
}

function makeSkewedSectionCatalogTargets(): readonly SourceFeedTarget[] {
  return [
    ...Array.from({ length: 16 }, (_, index) => ({
      sourceId: `source-a-${index}`,
      sourceName: `Source A ${index}`,
      sourceBaseUrl: `https://source-a-${index}.test`,
      feedUrl: `https://source-a-${index}.test/rss/actualidad.xml`,
      sectionSlug: 'actualidad',
    })),
    ...Array.from({ length: 6 }, (_, index) => ({
      sourceId: `source-e-${index}`,
      sourceName: `Source E ${index}`,
      sourceBaseUrl: `https://source-e-${index}.test`,
      feedUrl: `https://source-e-${index}.test/rss/economia.xml`,
      sectionSlug: 'economia',
    })),
    ...Array.from({ length: 6 }, (_, index) => ({
      sourceId: `source-es-${index}`,
      sourceName: `Source ES ${index}`,
      sourceBaseUrl: `https://source-es-${index}.test`,
      feedUrl: `https://source-es-${index}.test/rss/espana.xml`,
      sectionSlug: 'espana',
    })),
    ...Array.from({ length: 6 }, (_, index) => ({
      sourceId: `source-i-${index}`,
      sourceName: `Source I ${index}`,
      sourceBaseUrl: `https://source-i-${index}.test`,
      feedUrl: `https://source-i-${index}.test/rss/internacional.xml`,
      sectionSlug: 'internacional',
    })),
  ];
}

function buildRssXml(input: { title: string; url: string }): string {
  return `<?xml version="1.0"?>
    <rss version="2.0">
      <channel>
        <item>
          <guid>${input.url}</guid>
          <title>${input.title}</title>
          <link>${input.url}</link>
          <pubDate>Tue, 17 Feb 2026 12:00:00 GMT</pubDate>
          <description>Resumen</description>
        </item>
      </channel>
    </rss>`;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
