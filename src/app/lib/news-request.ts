import { HttpParams } from '@angular/common/http';

import type { NewsQuery } from '../../../shared/interfaces/news-query.interface';

export type NewsRequestQuery = Partial<NewsQuery>;

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

export function normalizeSection(value: string): string {
  return value.trim().toLowerCase();
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

