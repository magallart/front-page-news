import { describe, expect, it } from 'vitest';

import { getUserErrorMessage, isAppHttpError } from './app-http-error.utils';

describe('app-http-error.utils', () => {
  it('detects AppHttpError objects by shape', () => {
    expect(isAppHttpError({ name: 'AppHttpError', userMessage: 'Fallo controlado' })).toBe(true);
    expect(isAppHttpError({ name: 'AppHttpError' })).toBe(false);
    expect(isAppHttpError('error')).toBe(false);
    expect(isAppHttpError(null)).toBe(false);
  });

  it('returns trimmed AppHttpError user message when available', () => {
    const message = getUserErrorMessage(
      {
        name: 'AppHttpError',
        userMessage: '  Error de API  ',
      },
      'Fallback',
    );

    expect(message).toBe('Error de API');
  });

  it('falls back to Error.message and then provided fallback', () => {
    expect(getUserErrorMessage(new Error('Fallo de red'), 'Fallback')).toBe('Fallo de red');
    expect(getUserErrorMessage({ name: 'AppHttpError', userMessage: '  ' }, 'Fallback')).toBe('Fallback');
    expect(getUserErrorMessage(undefined, 'Fallback')).toBe('Fallback');
  });
});

