import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { APP_HTTP_ERROR_KIND } from '../interfaces/app-http-error-kind.interface';
import { isAppHttpError } from '../utils/app-http-error.utils';
import { mapHttpErrorToUserMessage } from '../utils/http-error-mapper';

import type { AppHttpErrorKind } from '../interfaces/app-http-error-kind.interface';
import type { AppHttpError } from '../interfaces/app-http-error.interface';
import type { HttpInterceptorFn } from '@angular/common/http';
import type { HttpRequest } from '@angular/common/http';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (isAppHttpError(error)) {
        return throwError(() => error);
      }

      return throwError(() => toAppHttpError(request, error));
    }),
  );

function toAppHttpError(request: HttpRequest<unknown>, error: unknown): AppHttpError {
  if (error instanceof HttpErrorResponse) {
    const kind = resolveHttpErrorKind(error);
    const status = Number.isFinite(error.status) ? error.status : null;
    const userMessage = mapHttpErrorToUserMessage({ kind, status });

    return buildAppHttpError({
      kind,
      status,
      method: request.method,
      url: request.urlWithParams || request.url,
      traceId: resolveTraceId(error),
      userMessage,
    });
  }

  return buildAppHttpError({
    kind: APP_HTTP_ERROR_KIND.UNKNOWN,
    status: null,
    method: request.method,
    url: request.urlWithParams || request.url,
    traceId: null,
    userMessage: mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.UNKNOWN, status: null }),
  });
}

function resolveHttpErrorKind(error: HttpErrorResponse): AppHttpErrorKind {
  if (error.status === 0) {
    if (isOffline()) {
      return APP_HTTP_ERROR_KIND.OFFLINE;
    }

    if (isTimeoutError(error)) {
      return APP_HTTP_ERROR_KIND.TIMEOUT;
    }

    return APP_HTTP_ERROR_KIND.NETWORK;
  }

  if (error.status >= 500) {
    return APP_HTTP_ERROR_KIND.SERVER;
  }

  if (error.status >= 400) {
    return APP_HTTP_ERROR_KIND.CLIENT;
  }

  return APP_HTTP_ERROR_KIND.UNKNOWN;
}

function resolveTraceId(error: HttpErrorResponse): string | null {
  const responseTraceId =
    error.headers.get('x-request-id') ??
    error.headers.get('x-correlation-id') ??
    error.headers.get('x-trace-id');

  if (responseTraceId && responseTraceId.trim().length > 0) {
    return responseTraceId.trim();
  }

  const errorTraceId = tryGetErrorField(error.error, 'requestId');
  if (errorTraceId) {
    return errorTraceId;
  }

  return tryGetErrorField(error.error, 'traceId');
}

function tryGetErrorField(value: unknown, field: string): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const fieldValue = record[field];
  return typeof fieldValue === 'string' && fieldValue.trim().length > 0 ? fieldValue.trim() : null;
}

function isOffline(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') {
    return false;
  }

  return navigator.onLine === false;
}

function isTimeoutError(error: HttpErrorResponse): boolean {
  const rawMessage = `${error.message} ${toErrorName(error.error)}`.toLowerCase();
  return rawMessage.includes('timeout');
}

function toErrorName(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return '';
  }

  const record = error as Record<string, unknown>;
  return typeof record['name'] === 'string' ? record['name'] : '';
}

function buildAppHttpError(input: {
  kind: AppHttpErrorKind;
  status: number | null;
  method: string;
  url: string;
  traceId: string | null;
  userMessage: string;
}): AppHttpError {
  const appError = new Error(input.userMessage) as AppHttpError;

  Object.defineProperties(appError, {
    name: { value: 'AppHttpError' as const },
    kind: { value: input.kind },
    status: { value: input.status },
    method: { value: input.method },
    url: { value: input.url },
    traceId: { value: input.traceId },
    timestamp: { value: new Date().toISOString() },
    userMessage: { value: input.userMessage },
  });

  return appError;
}
