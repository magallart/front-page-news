import { describe, expect, it, vi } from 'vitest';

import { createCronRegenerateSnapshotsHandler } from '../../api/cron/regenerate-snapshots';

import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { Source } from '../../shared/interfaces/source.interface';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface MockResponse {
  statusCode: number;
  body: string;
  headers: Map<string, string>;
  setHeader(name: string, value: string): void;
  end(chunk?: string): void;
}

describe('api/cron/regenerate-snapshots handler contract', () => {
  it('returns 405 for non-get methods', async () => {
    const handler = createCronRegenerateSnapshotsHandler({
      cronSecret: 'secret',
      blobReadWriteToken: 'blob-token',
    });

    const response = createMockResponse();
    await handler(createRequest('POST', '/api/cron/regenerate-snapshots') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(405);
    expect(readJson<{ error: string }>(response).error).toBe('Method Not Allowed');
  });

  it('returns 401 when authorization does not match the cron secret', async () => {
    const handler = createCronRegenerateSnapshotsHandler({
      cronSecret: 'secret',
      blobReadWriteToken: 'blob-token',
    });

    const response = createMockResponse();
    await handler(
      createRequest('GET', '/api/cron/regenerate-snapshots', {
        authorization: 'Bearer nope',
      }) as IncomingMessage,
      response as unknown as ServerResponse,
    );

    expect(response.statusCode).toBe(401);
    expect(readJson<{ error: string }>(response).error).toBe('Unauthorized');
  });

  it('regenerates home, navbar sections and sources snapshots', async () => {
    const putNewsSnapshot = vi.fn().mockResolvedValue(undefined);
    const putSourcesSnapshot = vi.fn().mockResolvedValue(undefined);
    const fetchFeeds = vi.fn(async (sources: readonly Source[]) => ({
      successes: sources.map((source, index) => ({
        sourceId: source.id,
        feedUrl: source.feedUrl,
        body: buildRssXml({
          title: `${source.name} ${index + 1}`,
          url: `https://example.com/${source.id}/${index + 1}`,
        }),
        contentType: 'application/rss+xml',
      })),
      warnings: [],
    }));
    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };
    const now = vi.fn(() => Date.parse('2026-04-28T08:00:00.000Z'));
    const handler = createCronRegenerateSnapshotsHandler({
      cronSecret: 'secret',
      blobReadWriteToken: 'blob-token',
      now,
      logger,
      fetchFeeds,
      snapshotWriter: {
        putNewsSnapshot,
        putSourcesSnapshot,
      },
      loadCatalogRecords: async () => makeCatalogRecords(),
    });

    const response = createMockResponse();
    await handler(
      createRequest('GET', '/api/cron/regenerate-snapshots', {
        authorization: 'Bearer secret',
      }) as IncomingMessage,
      response as unknown as ServerResponse,
    );

    const payload = readJson<{
      ok: boolean;
      newsSnapshots: number;
      sourcesSnapshots: number;
      totalSnapshots: number;
      keys: readonly string[];
    }>(response);

    expect(response.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.newsSnapshots).toBe(11);
    expect(payload.sourcesSnapshots).toBe(1);
    expect(payload.totalSnapshots).toBe(12);
    expect(payload.keys).toContain('news:id=-:section=-:source=-:q=-:page=1:limit=250');
    expect(payload.keys).toContain('news:id=-:section=actualidad:source=-:q=-:page=1:limit=300');
    expect(payload.keys).toContain('sources:default');
    expect(putNewsSnapshot).toHaveBeenCalledTimes(11);
    expect(putSourcesSnapshot).toHaveBeenCalledTimes(1);
    expect(fetchFeeds).toHaveBeenCalledTimes(11);
    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('returns 500 when the cron secret is not configured', async () => {
    const handler = createCronRegenerateSnapshotsHandler({
      cronSecret: '   ',
      blobReadWriteToken: 'blob-token',
    });

    const response = createMockResponse();
    await handler(createRequest('GET', '/api/cron/regenerate-snapshots') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(500);
    expect(readJson<{ error: string }>(response).error).toBe('Cron secret is not configured');
  });

  it('returns 500 when the blob write token is not configured', async () => {
    const handler = createCronRegenerateSnapshotsHandler({
      cronSecret: 'secret',
      blobReadWriteToken: '   ',
    });

    const response = createMockResponse();
    await handler(
      createRequest('GET', '/api/cron/regenerate-snapshots', {
        authorization: 'Bearer secret',
      }) as IncomingMessage,
      response as unknown as ServerResponse,
    );

    expect(response.statusCode).toBe(500);
    expect(readJson<{ error: string }>(response).error).toBe('Blob write token is not configured');
  });
});

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

function createRequest(method: string, url: string, headers: Record<string, string> = {}): Partial<IncomingMessage> {
  return {
    method,
    url,
    headers,
  };
}

function readJson<T>(response: MockResponse): T {
  return JSON.parse(response.body) as T;
}

function makeCatalogRecords(): readonly RssSourceRecord[] {
  return [
    { sourceName: 'Fuente Uno', feedUrl: 'https://source-one.test/actualidad.xml', sectionName: 'Actualidad' },
    { sourceName: 'Fuente Uno', feedUrl: 'https://source-one.test/economia.xml', sectionName: 'Economia' },
    { sourceName: 'Fuente Dos', feedUrl: 'https://source-two.test/ciencia.xml', sectionName: 'Ciencia' },
    { sourceName: 'Fuente Dos', feedUrl: 'https://source-two.test/cultura.xml', sectionName: 'Cultura' },
    { sourceName: 'Fuente Tres', feedUrl: 'https://source-three.test/deportes.xml', sectionName: 'Deportes' },
    { sourceName: 'Fuente Tres', feedUrl: 'https://source-three.test/espana.xml', sectionName: 'Espana' },
    { sourceName: 'Fuente Cuatro', feedUrl: 'https://source-four.test/internacional.xml', sectionName: 'Internacional' },
    { sourceName: 'Fuente Cuatro', feedUrl: 'https://source-four.test/opinion.xml', sectionName: 'Opinion' },
    { sourceName: 'Fuente Cinco', feedUrl: 'https://source-five.test/sociedad.xml', sectionName: 'Sociedad' },
    { sourceName: 'Fuente Cinco', feedUrl: 'https://source-five.test/tecnologia.xml', sectionName: 'Tecnologia' },
  ];
}

function buildRssXml(input: { title: string; url: string }): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Feed</title>
        <item>
          <title>${input.title}</title>
          <link>${input.url}</link>
          <description>Resumen</description>
          <pubDate>Tue, 28 Apr 2026 08:00:00 GMT</pubDate>
        </item>
      </channel>
    </rss>`;
}
