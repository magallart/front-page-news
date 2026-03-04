import { describe, expect, it } from 'vitest';

import { isRouteInSet, normalizeRoutePath } from './route-path';

describe('route-path', () => {
  it('normalizes query params and trailing slash', () => {
    expect(normalizeRoutePath('/aviso-legal/?foo=1#bar')).toBe('/aviso-legal');
  });

  it('adds leading slash for plain values', () => {
    expect(normalizeRoutePath('privacidad')).toBe('/privacidad');
  });

  it('checks route membership after normalization', () => {
    const routes = new Set(['/cookies']);
    expect(isRouteInSet('/cookies?utm=1', routes)).toBe(true);
    expect(isRouteInSet('/privacidad', routes)).toBe(false);
  });
});
