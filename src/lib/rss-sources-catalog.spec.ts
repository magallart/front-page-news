import { describe, expect, it } from 'vitest';

import { buildSourcesResponse } from './rss-sources-catalog';

describe('rss-sources-catalog', () => {
  it('builds deduped sections and sources from catalog markdown', () => {
    const markdown = `
# ACTUALIDAD

## 1
- Nombre periódico: El País
- URL: https://feeds.elpais.com/portada.xml
- Sección: Actualidad

## 2
- Nombre periódico: El País
- URL: https://feeds.elpais.com/economia.xml
- Sección: Economía

## 3
- Nombre periódico: ABC
- URL: https://www.abc.es/rss/2.0/portada/
- Sección: Actualidad
`;

    const response = buildSourcesResponse(markdown);

    expect(response.sources).toHaveLength(2);
    expect(response.sections).toHaveLength(2);

    const elPais = response.sources.find((item) => item.id === 'source-el-pais');
    expect(elPais?.sectionSlugs).toEqual(['actualidad', 'economia']);
    expect(elPais?.baseUrl).toBe('https://feeds.elpais.com');
  });

  it('keeps accented text and builds normalized slugs', () => {
    const markdown = `
# ÚLTIMA HORA

## 1
- Nombre periódico: Expansión
- URL: https://e01-expansion.uecdn.es/rss/portada.xml
- Sección: Última hora
`;

    const response = buildSourcesResponse(markdown);

    expect(response.sources[0]?.name).toBe('Expansión');
    expect(response.sections[0]?.name).toBe('Última hora');
    expect(response.sections[0]?.slug).toBe('ultima-hora');
  });
});
