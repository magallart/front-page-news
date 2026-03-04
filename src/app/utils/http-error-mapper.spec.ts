import { describe, expect, it } from 'vitest';

import { APP_HTTP_ERROR_KIND } from '../interfaces/app-http-error-kind.interface';

import { mapHttpErrorToUserMessage } from './http-error-mapper';

describe('http-error-mapper', () => {
  it('returns offline message', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.OFFLINE, status: 0 });

    expect(result).toContain('internet');
  });

  it('returns timeout message', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.TIMEOUT, status: 0 });

    expect(result).toContain('demasiado');
  });

  it('returns network message', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.NETWORK, status: 0 });

    expect(result).toContain('No se pudo contactar');
  });

  it('returns server message for 5xx errors', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.SERVER, status: 503 });

    expect(result).toContain('disponible temporalmente');
  });

  it('returns not-found message for 404', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 404 });

    expect(result).toContain('no existe');
  });

  it('returns permissions message for 401 and 403', () => {
    const unauthorized = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 401 });
    const forbidden = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 403 });

    expect(unauthorized).toContain('No tienes permisos');
    expect(forbidden).toContain('No tienes permisos');
  });

  it('returns invalid request message for 400 and 422', () => {
    const badRequest = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 400 });
    const unprocessable = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 422 });

    expect(badRequest).toContain('solicitud contiene datos');
    expect(unprocessable).toContain('solicitud contiene datos');
  });

  it('returns rate-limit message for 429', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 429 });

    expect(result).toContain('demasiadas solicitudes');
  });

  it('returns generic client message for unknown client status', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 418 });

    expect(result).toContain('No se pudo completar la solicitud');
  });

  it('returns generic fallback message for unknown kind', () => {
    const result = mapHttpErrorToUserMessage({ kind: 'unexpected' as never, status: null });

    expect(result).toContain('error inesperado');
  });
});
