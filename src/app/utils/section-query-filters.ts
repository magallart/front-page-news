import { SECTION_PAGE_NEWS_LIMIT } from '../constants/news-limit.constants';

import type { SectionQueryFilters } from '../interfaces/section-query-filters.interface';

const DEFAULT_PAGE = 1;

export const DEFAULT_SECTION_QUERY_FILTERS: SectionQueryFilters = {
  sourceIds: [],
  searchQuery: null,
  page: DEFAULT_PAGE,
  limit: SECTION_PAGE_NEWS_LIMIT,
};

export function parseSectionQueryFilters(params: {
  get(name: string): string | null;
}): SectionQueryFilters {
  return {
    sourceIds: parseSourceIds(params.get('source')),
    searchQuery: normalizeQueryValue(params.get('q')),
    page: parsePositiveNumber(params.get('page'), DEFAULT_PAGE),
    limit: parsePositiveNumber(params.get('limit'), SECTION_PAGE_NEWS_LIMIT),
  };
}

function parseSourceIds(value: string | null): readonly string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((sourceId) => normalizeQueryValue(sourceId))
    .filter((sourceId): sourceId is string => Boolean(sourceId));
}

function normalizeQueryValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePositiveNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}
