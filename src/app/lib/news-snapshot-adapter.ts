import { adaptNewsResponse } from './news-response-adapter';

import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';

export function adaptNewsSnapshot(payload: Record<string, unknown>): NewsSnapshot {
  const key = asString(payload['key'], 'key');
  const kind = asNewsKind(payload['kind']);
  const generatedAt = asIsoDate(payload['generatedAt'], 'generatedAt');
  const staleAt = asIsoDate(payload['staleAt'], 'staleAt');
  const expiresAt = asIsoDate(payload['expiresAt'], 'expiresAt');
  const query = asNewsQuery(payload['query']);
  const response = adaptNewsResponse(asRecord(payload['payload'], 'payload'));

  return {
    key,
    kind,
    generatedAt,
    staleAt,
    expiresAt,
    query,
    payload: response,
  };
}

function asRecord(value: unknown, fieldName: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid news snapshot: "${fieldName}" must be an object`);
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid news snapshot: "${fieldName}" must be a non-empty string`);
  }

  return value;
}

function asIsoDate(value: unknown, fieldName: string): string {
  const dateValue = asString(value, fieldName);
  if (!Number.isFinite(Date.parse(dateValue))) {
    throw new Error(`Invalid news snapshot: "${fieldName}" must be an ISO date string`);
  }

  return dateValue;
}

function asNewsKind(value: unknown): 'news' {
  if (value !== 'news') {
    throw new Error('Invalid news snapshot: "kind" must be "news"');
  }

  return value;
}

function asNewsQuery(value: unknown): NewsSnapshot['query'] {
  const record = asRecord(value, 'query');

  return {
    id: asNullableTrimmedString(record['id'], 'query.id', false),
    section: asNullableTrimmedString(record['section'], 'query.section', true),
    sourceIds: asStringArray(record['sourceIds'], 'query.sourceIds'),
    searchQuery: asNullableTrimmedString(record['searchQuery'], 'query.searchQuery', true),
    page: asPositiveInteger(record['page'], 'query.page'),
    limit: asPositiveInteger(record['limit'], 'query.limit'),
  };
}

function asNullableTrimmedString(
  value: unknown,
  fieldName: string,
  normalizeLowerCase: boolean,
): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`Invalid news snapshot: "${fieldName}" must be a string or null`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return null;
  }

  return normalizeLowerCase ? trimmedValue.toLowerCase() : trimmedValue;
}

function asStringArray(value: unknown, fieldName: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid news snapshot: "${fieldName}" must be an array`);
  }

  return value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new Error(`Invalid news snapshot: "${fieldName}[${index}]" must be a string`);
    }

    return item.trim().toLowerCase();
  });
}

function asPositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid news snapshot: "${fieldName}" must be a positive integer`);
  }

  return value;
}
