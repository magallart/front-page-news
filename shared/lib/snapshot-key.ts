import type { NewsQuery } from '../interfaces/news-query.interface';

const EMPTY_KEY_PART = '-';

export function toNewsSnapshotKey(query: NewsQuery): string {
  const normalizedSourceIds = [...query.sourceIds]
    .map((sourceId) => sourceId.trim().toLowerCase())
    .filter((sourceId) => sourceId.length > 0)
    .filter((sourceId, index, values) => values.indexOf(sourceId) === index)
    .sort((left, right) => left.localeCompare(right));

  return [
    'news',
    `id=${normalizeIdPart(query.id)}`,
    `section=${normalizeNullablePart(query.section)}`,
    `source=${normalizeListPart(normalizedSourceIds)}`,
    `q=${normalizeNullablePart(query.searchQuery)}`,
    `page=${query.page}`,
    `limit=${query.limit}`,
  ].join(':');
}

export function toSourcesSnapshotKey(): string {
  return 'sources:default';
}

function normalizeNullablePart(value: string | null): string {
  if (typeof value !== 'string') {
    return EMPTY_KEY_PART;
  }

  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue.length > 0 ? normalizedValue : EMPTY_KEY_PART;
}

function normalizeIdPart(value: string | null): string {
  if (typeof value !== 'string') {
    return EMPTY_KEY_PART;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : EMPTY_KEY_PART;
}

function normalizeListPart(values: readonly string[]): string {
  return values.length > 0 ? values.join(',') : EMPTY_KEY_PART;
}
