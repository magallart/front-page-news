import { describe, expect, it } from 'vitest';

import { normalizeSearchQuery } from './search-query';

describe('normalizeSearchQuery', () => {
  it('returns null for empty-like values', () => {
    expect(normalizeSearchQuery(null)).toBeNull();
    expect(normalizeSearchQuery('')).toBeNull();
    expect(normalizeSearchQuery('   ')).toBeNull();
  });

  it('trims and lowercases the search term', () => {
    expect(normalizeSearchQuery(' Inflacion ')).toBe('inflacion');
  });
});
