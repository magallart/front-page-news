import { describe, expect, it } from 'vitest';

import { normalizeSourceKey } from './source-key';

describe('normalizeSourceKey', () => {
  it('normalizes casing, trims and collapses whitespace', () => {
    expect(normalizeSourceKey('   ABC   Noticias   ')).toBe('abc noticias');
  });

  it('removes accents to keep source-key comparisons stable', () => {
    expect(normalizeSourceKey('  El País  ')).toBe('el pais');
    expect(normalizeSourceKey('Economía y Opinión')).toBe('economia y opinion');
  });
});

