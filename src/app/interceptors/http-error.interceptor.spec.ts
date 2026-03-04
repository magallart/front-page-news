import { HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_HTTP_ERROR_KIND } from '../interfaces/app-http-error-kind.interface';

import { httpErrorInterceptor } from './http-error.interceptor';

interface AppHttpErrorLike {
  readonly name: string;
  readonly kind: string;
  readonly status: number | null;
  readonly method: string;
  readonly url: string;
  readonly traceId: string | null;
  readonly userMessage: string;
}

describe('http-error.interceptor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps http 503 errors to AppHttpError with trace id from headers', async () => {
    const error = new HttpErrorResponse({
      status: 503,
      statusText: 'Service Unavailable',
      url: '/api/news',
      headers: new HttpHeaders({ 'x-request-id': 'req-123' }),
      error: { reason: 'down' },
    });

    const appError = (await intercept(error, new HttpRequest('POST', '/api/news?page=2', null))) as AppHttpErrorLike;

    expect(appError.name).toBe('AppHttpError');
    expect(appError.kind).toBe(APP_HTTP_ERROR_KIND.SERVER);
    expect(appError.status).toBe(503);
    expect(appError.method).toBe('POST');
    expect(appError.url).toBe('/api/news?page=2');
    expect(appError.traceId).toBe('req-123');
    expect(appError.userMessage).toContain('disponible temporalmente');
  });

  it('maps status 0 errors to offline kind when navigator reports offline', async () => {
    vi.stubGlobal('navigator', { onLine: false });

    const error = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/news',
      error: new Error('socket hang up'),
    });

    const appError = (await intercept(error)) as AppHttpErrorLike;

    expect(appError.kind).toBe(APP_HTTP_ERROR_KIND.OFFLINE);
    expect(appError.userMessage).toContain('internet');
  });

  it('maps status 0 timeout errors to timeout kind', async () => {
    vi.stubGlobal('navigator', { onLine: true });

    const error = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/news',
      error: { name: 'TimeoutError' },
    });

    const appError = (await intercept(error)) as AppHttpErrorLike;

    expect(appError.kind).toBe(APP_HTTP_ERROR_KIND.TIMEOUT);
    expect(appError.userMessage).toContain('demasiado');
  });

  it('maps generic status 0 errors to network kind', async () => {
    vi.stubGlobal('navigator', { onLine: true });

    const error = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/news',
      error: { name: 'TypeError' },
    });

    const appError = (await intercept(error)) as AppHttpErrorLike;

    expect(appError.kind).toBe(APP_HTTP_ERROR_KIND.NETWORK);
    expect(appError.userMessage).toContain('No se pudo contactar');
  });

  it('maps client errors and resolves traceId from response body fallback fields', async () => {
    const withRequestId = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      url: '/api/news',
      error: { requestId: ' req-404 ' },
    });
    const withTraceId = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      url: '/api/news',
      error: { traceId: ' trace-400 ' },
    });

    const notFoundError = (await intercept(withRequestId)) as AppHttpErrorLike;
    const badRequestError = (await intercept(withTraceId)) as AppHttpErrorLike;

    expect(notFoundError.kind).toBe(APP_HTTP_ERROR_KIND.CLIENT);
    expect(notFoundError.traceId).toBe('req-404');
    expect(notFoundError.userMessage).toContain('no existe');

    expect(badRequestError.kind).toBe(APP_HTTP_ERROR_KIND.CLIENT);
    expect(badRequestError.traceId).toBe('trace-400');
    expect(badRequestError.userMessage).toContain('solicitud contiene');
  });

  it('maps non HttpErrorResponse values to unknown kind', async () => {
    const appError = (await intercept(new Error('boom'))) as AppHttpErrorLike;

    expect(appError.kind).toBe(APP_HTTP_ERROR_KIND.UNKNOWN);
    expect(appError.status).toBeNull();
    expect(appError.userMessage).toContain('error inesperado');
  });

  it('passes through AppHttpError values without remapping', async () => {
    const existingAppError = Object.assign(new Error('custom-message'), {
      name: 'AppHttpError',
      kind: APP_HTTP_ERROR_KIND.CLIENT,
      status: 422,
      method: 'GET',
      url: '/api/custom',
      traceId: 'trace-custom',
      timestamp: '2026-03-04T00:00:00.000Z',
      userMessage: 'Custom app error',
    });

    const received = await intercept(existingAppError);

    expect(received).toBe(existingAppError);
  });
});

async function intercept(error: unknown, request = new HttpRequest('GET', '/api/news')): Promise<unknown> {
  const response$ = httpErrorInterceptor(request, () => throwError(() => error));

  try {
    await firstValueFrom(response$);
    throw new Error('Expected request to fail');
  } catch (caught) {
    return caught;
  }
}
