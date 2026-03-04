import { describe, expect, it } from 'vitest';

import { DEFAULT_SECTION_QUERY_FILTERS, parseSectionQueryFilters } from './section-query-filters';

describe('section-query-filters', () => {
  it('returns defaults for empty params', () => {
    const filters = parseSectionQueryFilters({
      get: () => null,
    });

    expect(filters).toEqual(DEFAULT_SECTION_QUERY_FILTERS);
  });

  it('parses and normalizes values from query params', () => {
    const values = new Map<string, string>([
      ['source', ' source-b, source-a, ,source-a'],
      ['q', '  Inflacion  '],
      ['page', '3'],
      ['limit', '40'],
    ]);

    const filters = parseSectionQueryFilters({
      get: (name) => values.get(name) ?? null,
    });

    expect(filters).toEqual({
      sourceIds: ['source-b', 'source-a', 'source-a'],
      searchQuery: 'inflacion',
      page: 3,
      limit: 40,
    });
  });

  it('falls back to defaults for invalid numbers', () => {
    const values = new Map<string, string>([
      ['page', '0'],
      ['limit', '-1'],
    ]);

    const filters = parseSectionQueryFilters({
      get: (name) => values.get(name) ?? null,
    });

    expect(filters.page).toBe(DEFAULT_SECTION_QUERY_FILTERS.page);
    expect(filters.limit).toBe(DEFAULT_SECTION_QUERY_FILTERS.limit);
  });
});
