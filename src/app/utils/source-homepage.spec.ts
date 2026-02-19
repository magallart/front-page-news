import { describe, expect, it } from 'vitest';

import { resolveSourceHomepage } from './source-homepage';

import type { Source } from '../../interfaces/source.interface';

describe('resolveSourceHomepage', () => {
  it('returns publisher homepage for known source id', () => {
    const source: Source = {
      id: 'source-expansion',
      name: 'Expansión',
      baseUrl: 'https://e01-expansion.uecdn.es',
      feedUrl: 'https://e01-expansion.uecdn.es/rss/portada.xml',
      sectionSlugs: ['actualidad'],
    };

    expect(resolveSourceHomepage(source)).toBe('https://www.expansion.com');
  });

  it('falls back to source.baseUrl for unknown source ids', () => {
    const source: Source = {
      id: 'source-custom',
      name: 'Custom Source',
      baseUrl: 'https://custom-source.test',
      feedUrl: 'https://custom-source.test/rss.xml',
      sectionSlugs: ['actualidad'],
    };

    expect(resolveSourceHomepage(source)).toBe('https://custom-source.test');
  });
});
