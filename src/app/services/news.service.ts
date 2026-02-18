import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import type { Article } from '../../interfaces/article.interface';
import type { NewsQuery } from '../../interfaces/news-query.interface';
import type { NewsResponse } from '../../interfaces/news-response.interface';
import type { Warning, WarningCode } from '../../interfaces/warning.interface';

export type NewsRequestQuery = Partial<NewsQuery>;

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);

  getNews(query: NewsRequestQuery = {}) {
    return this.http
      .get<Record<string, unknown>>('/api/news', { params: buildNewsHttpParams(query) })
      .pipe(map((payload) => adaptNewsResponse(payload)));
  }
}

export function buildNewsHttpParams(query: NewsRequestQuery): HttpParams {
  let params = new HttpParams();

  if (isNonEmptyString(query.section)) {
    params = params.set('section', query.section.trim().toLowerCase());
  }

  if (Array.isArray(query.sourceIds) && query.sourceIds.length > 0) {
    const sourceValue = query.sourceIds
      .map((sourceId) => sourceId.trim())
      .filter((sourceId) => sourceId.length > 0)
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

export function adaptNewsResponse(payload: Record<string, unknown>): NewsResponse {
  return {
    articles: asArticleArray(payload['articles']),
    total: asNumber(payload['total'], 'total'),
    page: asNumber(payload['page'], 'page'),
    limit: asNumber(payload['limit'], 'limit'),
    warnings: asWarningsArray(payload['warnings']),
  };
}

function asArticleArray(value: unknown): readonly Article[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid news response: "articles" must be an array');
  }

  return value.map((article, index) => toArticle(article, index));
}

function toArticle(value: unknown, index: number): Article {
  const record = asRecord(value, `articles[${index}]`);

  return {
    id: asString(record['id'], `articles[${index}].id`),
    externalId: asNullableString(record['externalId'], `articles[${index}].externalId`),
    title: asString(record['title'], `articles[${index}].title`),
    summary: asString(record['summary'], `articles[${index}].summary`),
    url: asString(record['url'], `articles[${index}].url`),
    canonicalUrl: asNullableString(record['canonicalUrl'], `articles[${index}].canonicalUrl`),
    imageUrl: asNullableString(record['imageUrl'], `articles[${index}].imageUrl`),
    sourceId: asString(record['sourceId'], `articles[${index}].sourceId`),
    sourceName: asString(record['sourceName'], `articles[${index}].sourceName`),
    sectionSlug: asString(record['sectionSlug'], `articles[${index}].sectionSlug`),
    author: asNullableString(record['author'], `articles[${index}].author`),
    publishedAt: asNullableString(record['publishedAt'], `articles[${index}].publishedAt`),
  };
}

function asWarningsArray(value: unknown): readonly Warning[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid news response: "warnings" must be an array');
  }

  return value.map((warning, index) => toWarning(warning, index));
}

function toWarning(value: unknown, index: number): Warning {
  const record = asRecord(value, `warnings[${index}]`);

  return {
    code: asString(record['code'], `warnings[${index}].code`) as WarningCode,
    message: asString(record['message'], `warnings[${index}].message`),
    sourceId: asNullableString(record['sourceId'], `warnings[${index}].sourceId`),
    feedUrl: asNullableString(record['feedUrl'], `warnings[${index}].feedUrl`),
  };
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid news response: "${field}" must be an object`);
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid news response: "${field}" must be a string`);
  }

  return value;
}

function asNullableString(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`Invalid news response: "${field}" must be a string or null`);
  }

  return value;
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid news response: "${field}" must be a finite number`);
  }

  return value;
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}
