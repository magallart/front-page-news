import { describe, expect, it } from 'vitest';

import { buildSourceRoute, findSourceBySlug, toSourceSlug } from './source-routing';

describe('source-routing', () => {
  it('uses the normalized source id when available', () => {
    expect(toSourceSlug('  Mundo-Diario  ', 'Mundo Diario')).toBe('mundo-diario');
  });

  it('falls back to a slugified source name when id is empty', () => {
    expect(toSourceSlug('   ', 'El Pa\xeds Internacional')).toBe('source-el-pais-internacional');
  });

  it('builds the canonical source route tuple', () => {
    expect(buildSourceRoute('mundo-diario', 'Mundo Diario')).toEqual(['/fuente', 'mundo-diario']);
  });

  it('finds a source by canonical slug', () => {
    const sources = [
      {
        id: 'mundo-diario',
        name: 'Mundo Diario',
        baseUrl: 'https://example.com',
        feedUrl: 'https://example.com/rss',
        sectionSlugs: ['actualidad'],
      },
      {
        id: 'actualidad-24',
        name: 'Actualidad 24',
        baseUrl: 'https://actualidad.test',
        feedUrl: 'https://actualidad.test/rss',
        sectionSlugs: ['actualidad'],
      },
    ] as const;

    expect(findSourceBySlug(sources, 'actualidad-24')).toEqual(sources[1]);
    expect(findSourceBySlug(sources, '  MUNDO-DIARIO  ')).toEqual(sources[0]);
  });

  it('returns null for missing or empty slugs', () => {
    const sources = [
      {
        id: 'mundo-diario',
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
});
