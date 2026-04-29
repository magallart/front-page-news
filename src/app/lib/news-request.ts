import { HttpParams } from '@angular/common/http';

import { toNewsSnapshotKey } from '../../../shared/lib/snapshot-key';

import type { NewsQuery } from '../../../shared/interfaces/news-query.interface';

export type NewsRequestQuery = Partial<NewsQuery>;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export function buildNewsHttpParams(query: NewsRequestQuery): HttpParams {
  let params = new HttpParams();

  if (isNonEmptyString(query.id)) {
    params = params.set('id', query.id.trim());
  }

  if (isNonEmptyString(query.section)) {
    params = params.set('section', query.section.trim().toLowerCase());
  }

  if (Array.isArray(query.sourceIds) && query.sourceIds.length > 0) {
    const sourceValue = query.sourceIds
      .map((sourceId) => sourceId.trim())
      .filter((sourceId) => sourceId.length > 0)
      .filter((sourceId, index, values) => values.indexOf(sourceId) === index)
      .sort((left, right) => left.localeCompare(right))
      .join(',');

    if (sourceValue.length > 0) {
      params = params.set('source', sourceValue);
    }
  }

  if (isNonEmptyString(query.searchQuery)) {
    params = params.set('q', query.searchQuery.trim().toLowerCase());
  }

  if (isPositiveInteger(query.page)) {
    params = params.set('page', String(query.page));
  }

  if (isPositiveInteger(query.limit)) {
    params = params.set('limit', String(query.limit));
  }

  return params;
}

export function toNewsCacheKey(params: HttpParams): string {
  const query = params.toString();
  return query.length > 0 ? `/api/news?${query}` : '/api/news';
}

export function toNewsSnapshotQuery(query: NewsRequestQuery): NewsQuery {
  return {
    id: normalizeIdValue(query.id),
    section: normalizeQueryValue(query.section),
    sourceIds: normalizeSourceIds(query.sourceIds),
    searchQuery: normalizeQueryValue(query.searchQuery),
    page: normalizePositiveInteger(query.page, DEFAULT_PAGE),
    limit: normalizePositiveInteger(query.limit, DEFAULT_LIMIT),
  };
}

export function toNewsRequestSnapshotKey(query: NewsRequestQuery): string {
  return toNewsSnapshotKey(toNewsSnapshotQuery(query));
}

export function normalizeSection(value: string): string {
  return value.trim().toLowerCase();
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function normalizeSourceIds(value: readonly string[] | undefined): readonly string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [];
  }

  return value
    .map((sourceId) => normalizeQueryValue(sourceId))
    .filter((sourceId): sourceId is string => sourceId !== null);
}

function normalizeQueryValue(value: string | null | undefined): string | null {
  if (!isNonEmptyString(value)) {
    return null;
  }

  return value.trim().toLowerCase();
}

function normalizeIdValue(value: string | null | undefined): string | null {
  if (!isNonEmptyString(value)) {
    return null;
  }

  return value.trim();
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  return isPositiveInteger(value) ? value : fallback;
}

