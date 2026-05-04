import { describe, expect, it } from 'vitest';

import { buildSourceRoute, findSourceBySlug, sourceIdsMatch, toSourceRouteSlug, toSourceSlug } from './source-routing';

describe('source-routing', () => {
  it('uses the normalized source id when available', () => {
    expect(toSourceSlug('  Mundo-Diario  ', 'Mundo Diario')).toBe('mundo-diario');
  });

  it('falls back to a slugified source name when id is empty', () => {
    expect(toSourceSlug('   ', 'El Pa\xeds Internacional')).toBe('source-el-pais-internacional');
  });

  it('builds the canonical source route tuple', () => {
    expect(buildSourceRoute('source-el-pais', 'El País')).toEqual(['/fuente', 'el-pais']);
    expect(buildSourceRoute('mundo-diario', 'Mundo Diario')).toEqual(['/fuente', 'mundo-diario']);
  });

  it('derives a user-facing route slug without the internal source prefix', () => {
    expect(toSourceRouteSlug('source-el-pais', 'El País')).toBe('el-pais');
    expect(toSourceRouteSlug('mundo-diario', 'Mundo Diario')).toBe('mundo-diario');
  });

  it('finds a source by canonical slug', () => {
    const sources = [
      {
        id: 'source-mundo-diario',
        name: 'Mundo Diario',
        baseUrl: 'https://example.com',
        feedUrl: 'https://example.com/rss',
        sectionSlugs: ['actualidad'],
      },
      {
        id: 'source-actualidad-24',
        name: 'Actualidad 24',
        baseUrl: 'https://actualidad.test',
        feedUrl: 'https://actualidad.test/rss',
        sectionSlugs: ['actualidad'],
      },
    ] as const;

    expect(findSourceBySlug(sources, 'actualidad-24')).toEqual(sources[1]);
    expect(findSourceBySlug(sources, 'source-actualidad-24')).toEqual(sources[1]);
    expect(findSourceBySlug(sources, '  MUNDO-DIARIO  ')).toEqual(sources[0]);
  });

  it('returns null for missing or empty slugs', () => {
    const sources = [
      {
        id: 'source-mundo-diario',
        name: 'Mundo Diario',
        baseUrl: 'https://example.com',
        feedUrl: 'https://example.com/rss',
        sectionSlugs: ['actualidad'],
      },
    ] as const;

    expect(findSourceBySlug(sources, null)).toBeNull();
    expect(findSourceBySlug(sources, '   ')).toBeNull();
    expect(findSourceBySlug(sources, 'desconocido')).toBeNull();
  });

  it('matches prefixed and legacy source identifiers for the same medium', () => {
    expect(sourceIdsMatch('source-el-pais', 'El País', 'source-el-pais', 'El País')).toBe(true);
    expect(sourceIdsMatch('source-el-pais', 'El País', 'el-pais', 'El País')).toBe(true);
    expect(sourceIdsMatch('mundo-diario', 'Mundo Diario', 'source-mundo-diario', 'Mundo Diario')).toBe(true);
    expect(sourceIdsMatch('source-el-pais', 'El País', 'source-el-mundo', 'El Mundo')).toBe(false);
  });
});
