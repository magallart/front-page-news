import { describe, expect, it } from 'vitest';

import { adaptArticleToNewsItem, adaptSourceToFilterItem } from './api-ui-adapters';

describe('api-ui-adapters', () => {
  it('adapts article with safe fallback values for nullable fields', () => {
    const result = adaptArticleToNewsItem({
      id: 'news-1',
      externalId: null,
      title: 'Titulo',
      summary: 'Resumen',
      url: 'https://example.com/news-1',
      canonicalUrl: null,
      imageUrl: null,
      sourceId: 'source-1',
      sourceName: 'Fuente Uno',
      sectionSlug: 'actualidad',
      author: null,
      publishedAt: null,
    });

    expect(result).toEqual({
      id: 'news-1',
      title: 'Titulo',
      summary: 'Resumen',
      imageUrl: '/images/no-image.jpg',
      thumbnailUrl: '/images/no-image.jpg',
      source: 'Fuente Uno',
      section: 'actualidad',
      publishedAt: '',
      author: 'Redacción',
      url: 'https://example.com/news-1',
    });
  });

  it('routes remote image URLs through the local image proxy', () => {
    const result = adaptArticleToNewsItem({
      id: 'news-2',
      externalId: null,
      title: 'Imagen remota',
      summary: 'Resumen',
      url: 'https://example.com/news-2',
      canonicalUrl: null,
      imageUrl: 'https://s1.staticld.com/2026/02/18/lisa-tuttle-berlinale.jpg',
      sourceId: 'source-2',
      sourceName: 'Fuente Dos',
      sectionSlug: 'cultura',
      author: 'Autor',
      publishedAt: '2026-02-18T17:13:00.000Z',
    });

    expect(result.imageUrl).toBe(
      '/api/image?url=https%3A%2F%2Fs1.staticld.com%2F2026%2F02%2F18%2Flisa-tuttle-berlinale.jpg'
    );
  });

  it('falls back to generated id and default text when article strings are empty', () => {
    const result = adaptArticleToNewsItem({
      id: ' ',
      externalId: null,
      title: ' ',
      summary: ' ',
      url: ' ',
      canonicalUrl: null,
      imageUrl: ' ',
      sourceId: 'source-1',
      sourceName: ' ',
      sectionSlug: ' ',
      author: ' ',
      publishedAt: ' ',
    });

    expect(result.id).toBe('generated-noticia-sin-titular');
    expect(result.title).toBe('Noticia sin titular');
    expect(result.summary).toBe('Resumen no disponible.');
    expect(result.imageUrl).toBe('/images/no-image.jpg');
    expect(result.source).toBe('Fuente desconocida');
    expect(result.section).toBe('actualidad');
    expect(result.author).toBe('Redacción');
    expect(result.publishedAt).toBe('');
    expect(result.url).toBe('#');
  });

  it('uses canonicalUrl when url is relative and canonical is absolute', () => {
    const result = adaptArticleToNewsItem({
      id: 'news-3',
      externalId: null,
      title: 'Con canonical',
      summary: 'Resumen',
      url: '/deportes/noticia',
      canonicalUrl: 'https://example.com/deportes/noticia',
      imageUrl: null,
      sourceId: 'source-3',
      sourceName: 'Fuente Tres',
      sectionSlug: 'deportes',
      author: 'Autor',
      publishedAt: '2026-03-03T10:00:00.000Z',
    });

    expect(result.url).toBe('https://example.com/deportes/noticia');
  });

  it('falls back to # when both url and canonicalUrl are non-http(s)', () => {
    const result = adaptArticleToNewsItem({
      id: 'news-4',
      externalId: null,
      title: 'Sin enlace valido',
      summary: 'Resumen',
      url: '/cultura/sin-host',
      canonicalUrl: 'mailto:editor@example.com',
      imageUrl: null,
      sourceId: 'source-4',
      sourceName: 'Fuente Cuatro',
      sectionSlug: 'cultura',
      author: 'Autor',
      publishedAt: '2026-03-03T11:00:00.000Z',
    });

    expect(result.url).toBe('#');
  });

  it('adapts source with fallback id and normalized section slugs', () => {
    const result = adaptSourceToFilterItem({
      id: ' ',
      name: 'El País',
      baseUrl: 'https://elpais.com',
      feedUrl: 'https://elpais.com/rss.xml',
      sectionSlugs: ['Actualidad Nacional', ''],
    });

    expect(result).toEqual({
      id: 'source-el-pais',
      label: 'El País',
      sectionSlugs: ['actualidad-nacional', 'actualidad'],
    });
  });
});
