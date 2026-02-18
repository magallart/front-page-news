import type { Article } from '../interfaces/article.interface';
import type { FilteredNews } from '../interfaces/filtered-news.interface';
import type { NewsQuery } from '../interfaces/news-query.interface';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parseNewsQuery(requestUrl: string | undefined): NewsQuery {
  if (!requestUrl) {
    return {
      id: null,
      section: null,
      sourceIds: [],
      searchQuery: null,
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
    };
  }

  const parsedUrl = new URL(requestUrl, 'http://localhost');
  const id = normalizeIdValue(parsedUrl.searchParams.get('id'));
  const section = normalizeQueryValue(parsedUrl.searchParams.get('section'));
  const searchQuery = normalizeQueryValue(parsedUrl.searchParams.get('q'));
  const sourceIds = parseSourceIds(parsedUrl.searchParams.get('source'));
  const page = parsePositiveNumber(parsedUrl.searchParams.get('page'), DEFAULT_PAGE);
  const limit = parsePositiveNumber(parsedUrl.searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT);

  return {
    id,
    section,
    sourceIds,
    searchQuery,
    page,
    limit,
  };
}

export function applyNewsFilters(articles: readonly Article[], query: NewsQuery): FilteredNews {
  const filtered = articles.filter((article) => {
    if (query.id && article.id !== query.id) {
      return false;
    }

    if (query.section && article.sectionSlug !== query.section) {
      return false;
    }

    if (query.sourceIds.length > 0 && !query.sourceIds.includes(article.sourceId)) {
      return false;
    }

    if (query.searchQuery) {
      const haystack = `${article.title} ${article.summary}`.toLowerCase();
      if (!haystack.includes(query.searchQuery)) {
        return false;
      }
    }

    return true;
  });

  const offset = (query.page - 1) * query.limit;
  const paginated = filtered.slice(offset, offset + query.limit);

  return {
    total: filtered.length,
    page: query.page,
    limit: query.limit,
    articles: paginated,
  };
}

function parseSourceIds(value: string | null): readonly string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => normalizeQueryValue(item))
    .filter((item): item is string => Boolean(item));
}

function parsePositiveNumber(value: string | null, fallback: number, max?: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  if (typeof max === 'number' && parsed > max) {
    return max;
  }

  return parsed;
}

function normalizeQueryValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeIdValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
