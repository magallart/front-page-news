import {
  asNullableString,
  asNumber,
  asOptionalNullableString,
  asRecord,
  asString,
  asWarningCode,
  toNewsResponseError,
} from './news-response-guards';

import type { Article } from '../../../shared/interfaces/article.interface';
import type { NewsResponse } from '../../../shared/interfaces/news-response.interface';
import type { Warning } from '../../../shared/interfaces/warning.interface';

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
    throw toNewsResponseError('articles', 'an array');
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
    thumbnailUrl: asOptionalNullableString(record['thumbnailUrl'], `articles[${index}].thumbnailUrl`),
    sourceId: asString(record['sourceId'], `articles[${index}].sourceId`),
    sourceName: asString(record['sourceName'], `articles[${index}].sourceName`),
    sectionSlug: asString(record['sectionSlug'], `articles[${index}].sectionSlug`),
    author: asNullableString(record['author'], `articles[${index}].author`),
    publishedAt: asNullableString(record['publishedAt'], `articles[${index}].publishedAt`),
  };
}

function asWarningsArray(value: unknown): readonly Warning[] {
  if (!Array.isArray(value)) {
    throw toNewsResponseError('warnings', 'an array');
  }

  return value.map((warning, index) => toWarning(warning, index));
}

function toWarning(value: unknown, index: number): Warning {
  const record = asRecord(value, `warnings[${index}]`);

  return {
    code: asWarningCode(record['code'], `warnings[${index}].code`),
    message: asString(record['message'], `warnings[${index}].message`),
    sourceId: asNullableString(record['sourceId'], `warnings[${index}].sourceId`),
    feedUrl: asNullableString(record['feedUrl'], `warnings[${index}].feedUrl`),
  };
}

