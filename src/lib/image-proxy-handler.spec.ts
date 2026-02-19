import { afterEach, describe, expect, it, vi } from 'vitest';

import handler from '../../api/image';

vi.mock('../../api/lib/ssrf-guard', () => ({
  isPublicHttpUrl: vi.fn(async () => true),
}));

interface MockResponse {
  statusCode: number;
  readonly headersSent: boolean;
  setHeader: (name: string, value: string | number) => void;
  end: (body?: string | Uint8Array | Buffer) => void;
  write: (chunk: Uint8Array | string) => boolean;
  destroy: (error?: Error) => void;
  readonly headers: Record<string, string | number>;
  readonly body: string;
  readonly destroyCalls: number;
}

describe('image proxy handler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns 413 when upstream content-length exceeds max size before sending 200 headers', async () => {
    const oversizedBytes = 6 * 1024 * 1024;
    const fetchMock = vi.fn(async () =>
      new Response('oversized', {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(oversizedBytes),
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = createMockResponse();
    await handler(
      {
        method: 'GET',
        url: '/api/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg',
      } as never,
      response as never,
    );

    expect(response.statusCode).toBe(413);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers['cache-control']).toBe('no-store, max-age=0');
    expect(JSON.parse(response.body)).toEqual({ error: 'Remote image too large' });
    expect(response.destroyCalls).toBe(0);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

function createMockResponse(): MockResponse {
  const headers: Record<string, string | number> = {};
  let body = '';
  let headersSent = false;
  let destroyCalls = 0;

  return {
    statusCode: 200,
    get headersSent() {
      return headersSent;
    },
    setHeader(name: string, value: string | number) {
      headers[name.toLowerCase()] = value;
    },
    end(payload?: string | Uint8Array | Buffer) {
      headersSent = true;
      if (!payload) {
        return;
      }

      if (typeof payload === 'string') {
        body += payload;
        return;
      }

      body += new TextDecoder().decode(payload);
    },
    write() {
      headersSent = true;
      return true;
    },
    destroy() {
      destroyCalls += 1;
      headersSent = true;
    },
    get headers() {
      return headers;
    },
    get body() {
      return body;
    },
    get destroyCalls() {
      return destroyCalls;
    },
  };
}
