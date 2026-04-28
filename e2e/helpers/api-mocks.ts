import type { Page } from '@playwright/test';

interface MockArticle {
  readonly id: string;
  readonly externalId: string | null;
  readonly title: string;
  readonly summary: string;
  readonly url: string;
  readonly canonicalUrl: string | null;
  readonly imageUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly sourceId: string;
  readonly sourceName: string;
  readonly sectionSlug: string;
  readonly author: string | null;
  readonly publishedAt: string | null;
}

interface MockSource {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly feedUrl: string;
  readonly sectionSlugs: readonly string[];
}

const HOME_NEWS_ARTICLES = [
  createArticle({
    id: 'home-1',
    title: 'Acuerdo europeo para reforzar la seguridad energetica',
    sectionSlug: 'actualidad',
    sourceId: 'mundo-diario',
    sourceName: 'Mundo Diario',
    publishedAt: '2026-03-04T10:20:00.000Z',
  }),
  createArticle({
    id: 'home-2',
    title: 'Nuevas medidas para impulsar la vivienda asequible',
    sectionSlug: 'actualidad',
    sourceId: 'actualidad-24',
    sourceName: 'Actualidad 24',
    publishedAt: '2026-03-04T10:10:00.000Z',
  }),
  createArticle({
    id: 'home-3',
    title: 'La inflacion interanual se modera en febrero',
    sectionSlug: 'economia',
    sourceId: 'boletin-justicia',
    sourceName: 'Boletin Justicia',
    publishedAt: '2026-03-04T09:55:00.000Z',
  }),
  createArticle({
    id: 'home-4',
    title: 'El sector turistico anticipa una temporada historica',
    sectionSlug: 'economia',
    sourceId: 'portada-nacional',
    sourceName: 'Portada Nacional',
    publishedAt: '2026-03-04T09:40:00.000Z',
  }),
  createArticle({
    id: 'home-5',
    title: 'El festival de cine abre su edicion mas internacional',
    sectionSlug: 'cultura',
    sourceId: 'salud-ciencia',
    sourceName: 'Salud y Ciencia',
    publishedAt: '2026-03-04T09:35:00.000Z',
  }),
  createArticle({
    id: 'home-6',
    title: 'Nueva exposicion dedicada al arte contemporaneo',
    sectionSlug: 'cultura',
    sourceId: 'mundo-diario',
    sourceName: 'Mundo Diario',
    publishedAt: '2026-03-04T09:20:00.000Z',
  }),
  createArticle({
    id: 'home-7',
    title: 'La seleccion prepara una convocatoria con nuevas caras',
    sectionSlug: 'deportes',
    sourceId: 'actualidad-24',
    sourceName: 'Actualidad 24',
    publishedAt: '2026-03-04T09:15:00.000Z',
  }),
  createArticle({
    id: 'home-8',
    title: 'Un estudio mejora el diagnostico temprano de enfermedades',
    sectionSlug: 'ciencia',
    sourceId: 'salud-ciencia',
    sourceName: 'Salud y Ciencia',
    publishedAt: '2026-03-04T09:05:00.000Z',
  }),
  createArticle({
    id: 'home-9',
    title: 'Crece la inversion en startups de inteligencia artificial',
    sectionSlug: 'tecnologia',
    sourceId: 'portada-nacional',
    sourceName: 'Portada Nacional',
    publishedAt: '2026-03-04T08:55:00.000Z',
  }),
  createArticle({
    id: 'home-10',
    title: 'Las universidades amplian su oferta de titulaciones',
    sectionSlug: 'sociedad',
    sourceId: 'boletin-justicia',
    sourceName: 'Boletin Justicia',
    publishedAt: '2026-03-04T08:45:00.000Z',
  }),
  createArticle({
    id: 'home-11',
    title: 'Analisis: retos politicos para el segundo semestre',
    sectionSlug: 'opinion',
    sourceId: 'mundo-diario',
    sourceName: 'Mundo Diario',
    publishedAt: '2026-03-04T08:35:00.000Z',
  }),
  createArticle({
    id: 'home-12',
    title: 'Tension diplomatica tras la cumbre regional',
    sectionSlug: 'internacional',
    sourceId: 'actualidad-24',
    sourceName: 'Actualidad 24',
    publishedAt: '2026-03-04T08:25:00.000Z',
  }),
] as const;

const SECTION_ACTUALIDAD_ARTICLES = [
  createArticle({
    id: 'sec-1',
    title: 'Actualidad internacional marcada por acuerdos energeticos',
    sectionSlug: 'actualidad',
    sourceId: 'mundo-diario',
    sourceName: 'Mundo Diario',
    publishedAt: '2026-03-04T10:10:00.000Z',
  }),
  createArticle({
    id: 'sec-2',
    title: 'Reunion de urgencia en el congreso para aprobar medidas',
    sectionSlug: 'actualidad',
    sourceId: 'actualidad-24',
    sourceName: 'Actualidad 24',
    publishedAt: '2026-03-04T09:50:00.000Z',
  }),
  createArticle({
    id: 'sec-3',
    title: 'Portada nacional centra el debate en vivienda publica',
    sectionSlug: 'actualidad',
    sourceId: 'portada-nacional',
    sourceName: 'Portada Nacional',
    publishedAt: '2026-03-04T09:40:00.000Z',
  }),
  createArticle({
    id: 'sec-4',
    title: 'Boletin justicia revisa el nuevo marco regulatorio',
    sectionSlug: 'actualidad',
    sourceId: 'boletin-justicia',
    sourceName: 'Boletin Justicia',
    publishedAt: '2026-03-04T09:30:00.000Z',
  }),
  createArticle({
    id: 'sec-5',
    title: 'Salud y ciencia alerta sobre el pico de alergias estacional',
    sectionSlug: 'actualidad',
    sourceId: 'salud-ciencia',
    sourceName: 'Salud y Ciencia',
    publishedAt: '2026-03-04T09:20:00.000Z',
  }),
] as const;

const SOURCES = [
  createSource({
    id: 'mundo-diario',
    name: 'Mundo Diario',
    baseUrl: 'https://www.mundodiario.test',
    sectionSlugs: ['actualidad', 'economia', 'internacional'],
  }),
  createSource({
    id: 'actualidad-24',
    name: 'Actualidad 24',
    baseUrl: 'https://www.actualidad24.test',
    sectionSlugs: ['actualidad', 'deportes', 'opinion'],
  }),
  createSource({
    id: 'portada-nacional',
    name: 'Portada Nacional',
    baseUrl: 'https://www.portadanacional.test',
    sectionSlugs: ['actualidad', 'tecnologia', 'sociedad'],
  }),
  createSource({
    id: 'boletin-justicia',
    name: 'Boletin Justicia',
    baseUrl: 'https://www.boletinjusticia.test',
    sectionSlugs: ['actualidad', 'economia'],
  }),
  createSource({
    id: 'salud-ciencia',
    name: 'Salud y Ciencia',
    baseUrl: 'https://www.saludyciencia.test',
    sectionSlugs: ['actualidad', 'ciencia', 'cultura'],
  }),
] as const;

const SECTIONS = [
  { id: 'actualidad', slug: 'actualidad', name: 'Actualidad' },
  { id: 'economia', slug: 'economia', name: 'Economia' },
  { id: 'cultura', slug: 'cultura', name: 'Cultura' },
  { id: 'ciencia', slug: 'ciencia', name: 'Ciencia' },
  { id: 'deportes', slug: 'deportes', name: 'Deportes' },
  { id: 'internacional', slug: 'internacional', name: 'Internacional' },
  { id: 'opinion', slug: 'opinion', name: 'Opinion' },
  { id: 'sociedad', slug: 'sociedad', name: 'Sociedad' },
  { id: 'tecnologia', slug: 'tecnologia', name: 'Tecnologia' },
  { id: 'ultima-hora', slug: 'ultima-hora', name: 'Ultima hora' },
] as const;

const SECTION_BY_SLUG: Readonly<Record<string, readonly MockArticle[]>> = {
  actualidad: SECTION_ACTUALIDAD_ARTICLES,
  'ultima-hora': SECTION_ACTUALIDAD_ARTICLES.slice(0, 4),
  economia: HOME_NEWS_ARTICLES.filter((article) => article.sectionSlug === 'economia'),
  cultura: HOME_NEWS_ARTICLES.filter((article) => article.sectionSlug === 'cultura'),
  ciencia: HOME_NEWS_ARTICLES.filter((article) => article.sectionSlug === 'ciencia'),
  deportes: [],
  internacional: HOME_NEWS_ARTICLES.filter((article) => article.sectionSlug === 'internacional'),
  opinion: HOME_NEWS_ARTICLES.filter((article) => article.sectionSlug === 'opinion'),
  sociedad: HOME_NEWS_ARTICLES.filter((article) => article.sectionSlug === 'sociedad'),
  tecnologia: HOME_NEWS_ARTICLES.filter((article) => article.sectionSlug === 'tecnologia'),
};

const ALL_ARTICLES = [...HOME_NEWS_ARTICLES, ...SECTION_ACTUALIDAD_ARTICLES] as const;

export async function mockApiRoutes(page: Page): Promise<void> {
  await page.route('**/api/image**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/gif',
      body: 'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
      isBase64: true,
    });
  });

  await page.route('**/api/sources', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sources: SOURCES,
        sections: SECTIONS,
      }),
    });
  });

  await page.route('**/api/news**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const section = requestUrl.searchParams.get('section');
    const articleId = requestUrl.searchParams.get('id');

    let articles: readonly MockArticle[] = HOME_NEWS_ARTICLES;

    if (section) {
      articles = SECTION_BY_SLUG[section] ?? [];
    }

    if (articleId) {
      const found = ALL_ARTICLES.find((article) => article.id === articleId);
      articles = found ? [found] : [];
    }

    const pageValue = parsePositiveInteger(requestUrl.searchParams.get('page'), 1);
    const limitValue = parsePositiveInteger(requestUrl.searchParams.get('limit'), articles.length || 1);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        articles,
        total: articles.length,
        page: pageValue,
        limit: limitValue,
        warnings: [],
      }),
    });
  });
}

function createArticle(params: {
  readonly id: string;
  readonly title: string;
  readonly sectionSlug: string;
  readonly sourceId: string;
  readonly sourceName: string;
  readonly publishedAt: string;
}): MockArticle {
  return {
    id: params.id,
    externalId: null,
    title: params.title,
    summary: `Resumen de ${params.title.toLowerCase()}`,
    url: `https://www.example.com/${params.id}`,
    canonicalUrl: null,
    imageUrl: `https://cdn.example.com/images/${params.id}.jpg`,
    thumbnailUrl: `https://cdn.example.com/images/${params.id}-thumb.jpg`,
    sourceId: params.sourceId,
    sourceName: params.sourceName,
    sectionSlug: params.sectionSlug,
    author: 'Redaccion Front Page News',
    publishedAt: params.publishedAt,
  };
}

function createSource(params: {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly sectionSlugs: readonly string[];
}): MockSource {
  return {
    id: params.id,
    name: params.name,
    baseUrl: params.baseUrl,
    feedUrl: `${params.baseUrl}/rss`,
    sectionSlugs: params.sectionSlugs,
  };
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

