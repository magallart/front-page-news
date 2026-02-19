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

function createMockRequest(url: string): MockRequest {
  return {
    method: 'GET',
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
