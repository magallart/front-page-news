import type { Article } from '../../interfaces/article.interface';
import type { Source } from '../../interfaces/source.interface';
import type { NewsItem } from '../interfaces/news-item.interface';
import type { SourceFilterItem } from '../interfaces/source-filter-item.interface';

const DEFAULT_NEWS_IMAGE_URL = '/images/no-image.jpg';
const DEFAULT_NEWS_AUTHOR = 'Redaccion';
const DEFAULT_NEWS_SOURCE = 'Fuente desconocida';
const DEFAULT_NEWS_SECTION = 'actualidad';
const DEFAULT_NEWS_TITLE = 'Noticia sin titular';
const DEFAULT_NEWS_SUMMARY = 'Resumen no disponible.';
const IMAGE_PROXY_PATH = '/api/image?url=';

export function adaptArticleToNewsItem(article: Article): NewsItem {
  const normalizedSource = normalizeString(article.sourceName, DEFAULT_NEWS_SOURCE);
  const normalizedSection = normalizeSlug(article.sectionSlug, DEFAULT_NEWS_SECTION);
  const normalizedTitle = normalizeString(article.title, DEFAULT_NEWS_TITLE);

  return {
    id: normalizeId(article.id, article.externalId, normalizedTitle),
    title: normalizedTitle,
    summary: normalizeString(article.summary, DEFAULT_NEWS_SUMMARY),
    imageUrl: toDisplayImageUrl(normalizeNullableString(article.imageUrl, DEFAULT_NEWS_IMAGE_URL)),
    source: normalizedSource,
    section: normalizedSection,
    publishedAt: normalizeNullableString(article.publishedAt, ''),
    author: normalizeNullableString(article.author, DEFAULT_NEWS_AUTHOR),
    url: normalizeString(article.url, '#'),
  };
}

export function adaptArticlesToNewsItems(articles: readonly Article[]): readonly NewsItem[] {
  return articles.map((article) => adaptArticleToNewsItem(article));
}

export function adaptSourceToFilterItem(source: Source): SourceFilterItem {
  const label = normalizeString(source.name, DEFAULT_NEWS_SOURCE);
  const id = normalizeSourceId(source.id, label);

  return {
    id,
    label,
    sectionSlugs: source.sectionSlugs.map((sectionSlug) => normalizeSlug(sectionSlug, DEFAULT_NEWS_SECTION)),
  };
}

export function adaptSourcesToFilterItems(sources: readonly Source[]): readonly SourceFilterItem[] {
  return sources.map((source) => adaptSourceToFilterItem(source));
}

function normalizeString(value: string, fallback: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeNullableString(value: string | null, fallback: string): string {
  if (value === null) {
    return fallback;
  }

  return normalizeString(value, fallback);
}

function normalizeSlug(value: string, fallback: string): string {
  const normalized = normalizeString(value, fallback).toLowerCase();
  return normalized.replace(/\s+/g, '-');
}

function normalizeId(id: string, externalId: string | null, title: string): string {
  const normalizedId = id.trim();
  if (normalizedId.length > 0) {
    return normalizedId;
  }

  const normalizedExternalId = externalId?.trim();
  if (normalizedExternalId) {
    return normalizedExternalId;
  }

  return `generated-${slugify(title) || 'news'}`;
}

function normalizeSourceId(id: string, sourceName: string): string {
  const normalizedId = id.trim();
  if (normalizedId.length > 0) {
    return normalizedId;
  }

  return `source-${slugify(sourceName) || 'unknown'}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toDisplayImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  if (imageUrl.startsWith(IMAGE_PROXY_PATH)) {
    return imageUrl;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return `${IMAGE_PROXY_PATH}${encodeURIComponent(imageUrl)}`;
  }

  return DEFAULT_NEWS_IMAGE_URL;
}
