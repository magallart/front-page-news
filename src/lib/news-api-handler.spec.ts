import { describe, expect, it } from 'vitest';

import { createNewsHandler } from '../../api/news';

import { WARNING_CODE } from './warning-code';

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
