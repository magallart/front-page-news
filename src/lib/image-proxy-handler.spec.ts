import { afterEach, describe, expect, it, vi } from 'vitest';

import handler from '../../api/image';

const isPublicHttpUrlMock = vi.fn(async () => true);

vi.mock('../../api/lib/ssrf-guard', () => ({
  isPublicHttpUrl: isPublicHttpUrlMock,
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

interface MockRequest {
  readonly method: string;
  readonly url: string;
  once: (event: string, listener: () => void) => void;
  off: (event: string, listener: () => void) => void;
}

describe('image proxy handler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    isPublicHttpUrlMock.mockResolvedValue(true);
  });

  it('returns 405 for non-GET methods', async () => {
    const response = createMockResponse();
    await handler(createMockRequest('/api/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg', 'POST') as never, response as never);

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body)).toEqual({ error: 'Method Not Allowed' });
  });

  it('returns 400 when query param url is missing', async () => {
    const response = createMockResponse();
    await handler(createMockRequest('/api/image') as never, response as never);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing \"url\" query param' });
  });

  it('returns 400 for invalid image url values', async () => {
    const response = createMockResponse();
    await handler(createMockRequest('/api/image?url=not-a-valid-url') as never, response as never);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid image url' });
  });

  it('returns 400 when ssrf guard rejects target host', async () => {
    isPublicHttpUrlMock.mockResolvedValue(false);

    const response = createMockResponse();
    await handler(createMockRequest('/api/image?url=https%3A%2F%2Fprivate.internal%2Fimage.jpg') as never, response as never);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid image url' });
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
      createMockRequest('/api/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg') as never,
      response as never,
    );

    expect(response.statusCode).toBe(413);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers['cache-control']).toBe('no-store, max-age=0');
    expect(JSON.parse(response.body)).toEqual({ error: 'Remote image too large' });
    expect(response.destroyCalls).toBe(0);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('returns 504 when upstream fetch times out and is aborted', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((callback: () => void) => {
      callback();
      return 1 as never;
    });

    const fetchMock = vi.fn((_: string, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise<Response>((_, reject) => {
        if (!signal) {
          reject(new Error('missing abort signal'));
          return;
        }

        if (signal.aborted) {
          reject(createAbortError());
          return;
        }

        signal.addEventListener(
          'abort',
          () => {
            reject(createAbortError());
          },
          { once: true },
        );
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = createMockResponse();
    const handlerPromise = handler(
      createMockRequest('/api/image?url=https%3A%2F%2Fexample.com%2Fslow.jpg') as never,
      response as never,
    );

    await handlerPromise;

    expect(response.statusCode).toBe(504);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers['cache-control']).toBe('no-store, max-age=0');
    expect(JSON.parse(response.body)).toEqual({ error: 'Upstream image request timed out' });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('returns 502 when upstream responds with non-ok status', async () => {
    const fetchMock = vi.fn(async () =>
      new Response('missing', {
        status: 404,
        headers: {
          'content-type': 'image/jpeg',
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = createMockResponse();
    await handler(createMockRequest('/api/image?url=https%3A%2F%2Fexample.com%2Fmissing.jpg') as never, response as never);

    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual({ error: 'Remote image responded with status 404' });
  });

  it('returns 415 when upstream resource is not an image', async () => {
    const fetchMock = vi.fn(async () =>
      new Response('<html>not image</html>', {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = createMockResponse();
    await handler(createMockRequest('/api/image?url=https%3A%2F%2Fexample.com%2Fpage.html') as never, response as never);

    expect(response.statusCode).toBe(415);
    expect(JSON.parse(response.body)).toEqual({ error: 'Remote resource is not an image' });
  });

  it('returns 502 when upstream fetch fails for non-abort errors', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('network unreachable');
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = createMockResponse();
    await handler(createMockRequest('/api/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg') as never, response as never);

    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual({ error: 'Unable to fetch remote image' });
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

function createMockRequest(url: string, method = 'GET'): MockRequest {
  return {
    method,
    url,
    once() {
      return;
    },
    off() {
      return;
    },
  };
}

function createAbortError(): Error {
  const error = new Error('aborted');
  error.name = 'AbortError';
  return error;
}
