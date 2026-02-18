import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { httpErrorInterceptor } from './http-error.interceptor';

describe('http-error.interceptor', () => {
  it('maps http 503 errors to AppHttpError with trace context', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([httpErrorInterceptor])), provideHttpClientTesting()],
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);
    const received: unknown[] = [];

    http.get('/api/news').subscribe({
      next: () => {
        throw new Error('Expected request to fail');
      },
      error: (error: unknown) => received.push(error),
    });

    const request = httpMock.expectOne('/api/news');
    request.flush(
      { error: 'down' },
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'x-request-id': 'req-123' },
      },
    );

    httpMock.verify();

    expect(received.length).toBe(1);
    const appError = received[0] as {
      name: string;
      status: number | null;
      method: string;
      url: string;
      traceId: string | null;
      userMessage: string;
    };

    expect(appError.name).toBe('AppHttpError');
    expect(appError.status).toBe(503);
    expect(appError.method).toBe('GET');
    expect(appError.url).toBe('/api/news');
    expect(appError.traceId).toBe('req-123');
    expect(appError.userMessage).toContain('no está disponible temporalmente');
  });

  it('maps status 0 errors to network/offline style user message', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([httpErrorInterceptor])), provideHttpClientTesting()],
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);
    const received: unknown[] = [];

    http.get('/api/sources').subscribe({
      next: () => {
        throw new Error('Expected request to fail');
      },
      error: (error: unknown) => received.push(error),
    });

    const request = httpMock.expectOne('/api/sources');
    request.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });

    httpMock.verify();

    expect(received.length).toBe(1);
    const appError = received[0] as { name: string; userMessage: string };
    expect(appError.name).toBe('AppHttpError');
    expect(appError.userMessage.length).toBeGreaterThan(0);
  });
});
