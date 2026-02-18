import { describe, expect, it } from 'vitest';

import { APP_HTTP_ERROR_KIND } from '../interfaces/app-http-error-kind.interface';

import { mapHttpErrorToUserMessage } from './http-error-mapper';

describe('http-error-mapper', () => {
  it('returns offline message', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.OFFLINE, status: 0 });

    expect(result).toContain('No hay conexión');
  });

  it('returns server message for 5xx errors', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.SERVER, status: 503 });

    expect(result).toContain('no está disponible temporalmente');
  });

  it('returns not-found message for 404', () => {
    const result = mapHttpErrorToUserMessage({ kind: APP_HTTP_ERROR_KIND.CLIENT, status: 404 });

    expect(result).toContain('no existe');
  });
});
