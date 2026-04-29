import { describe, expect, it } from 'vitest';

import { createSourcesHandler } from '../../api/sources';

import type { IncomingMessage, ServerResponse } from 'node:http';

describe('api/sources handler contract', () => {
  it('serves a valid sources snapshot payload', async () => {
    const handler = createSourcesHandler({
      async getNewsSnapshot() {
        return null;
      },
      async getSourcesSnapshot() {
        return {
          key: 'sources:default',
          kind: 'sources',
          generatedAt: '2026-04-28T08:00:00.000Z',
          staleAt: '2026-04-28T08:15:00.000Z',
          expiresAt: '2026-05-29T20:00:00.000Z',
          query: null,
          payload: {
            sources: [],
            sections: [],
          },
        };
      },
    });

    const response = createMockResponse();
    await handler(createRequest('GET', '/api/sources') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(200);
    expect(readJson<{ sources: unknown[]; sections: unknown[] }>(response)).toEqual({
      sources: [],
      sections: [],
    });
  });

  it('returns 405 for non-get methods', async () => {
    const handler = createSourcesHandler({
      async getNewsSnapshot() {
        return null;
      },
      async getSourcesSnapshot() {
        return null;
      },
    });

    const response = createMockResponse();
    await handler(createRequest('POST', '/api/sources') as IncomingMessage, response as unknown as ServerResponse);

    expect(response.statusCode).toBe(405);
    expect(readJson<{ error: string }>(response).error).toBe('Method Not Allowed');
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

function createRequest(method: string, url: string): Partial<IncomingMessage> {
  return {
    method,
    url,
  };
}

function readJson<T>(response: MockResponse): T {
  return JSON.parse(response.body) as T;
}
