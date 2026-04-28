import type { NewsSnapshot } from '../../shared/interfaces/news-snapshot.interface';
import type { SourcesSnapshot } from '../../shared/interfaces/sources-snapshot.interface';

export function parseNewsSnapshot(input: string): NewsSnapshot | null {
  const parsed = parseJson(input);
  if (!isNewsSnapshot(parsed)) {
    return null;
  }

  return parsed;
}

export function parseSourcesSnapshot(input: string): SourcesSnapshot | null {
  const parsed = parseJson(input);
  if (!isSourcesSnapshot(parsed)) {
    return null;
  }

  return parsed;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

function isNewsSnapshot(value: unknown): value is NewsSnapshot {
  if (!isSnapshotRecord(value, 'news')) {
    return false;
  }

  return isNewsPayload(value.payload);
}

function isSourcesSnapshot(value: unknown): value is SourcesSnapshot {
  if (!isSnapshotRecord(value, 'sources')) {
    return false;
  }

  return isSourcesPayload(value.payload) && value.query === null;
}

function isSnapshotRecord(
  value: unknown,
  expectedKind: 'news' | 'sources',
): value is {
  readonly key: string;
  readonly kind: 'news' | 'sources';
  readonly generatedAt: string;
  readonly staleAt: string;
  readonly expiresAt: string;
  readonly query: unknown;
  readonly payload: unknown;
} {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value['kind'] === expectedKind &&
    isNonEmptyString(value['key']) &&
    isIsoDateString(value['generatedAt']) &&
    isIsoDateString(value['staleAt']) &&
    isIsoDateString(value['expiresAt']) &&
    'payload' in value
  );
}

function isNewsPayload(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value['articles']) &&
    typeof value['total'] === 'number' &&
    typeof value['page'] === 'number' &&
    typeof value['limit'] === 'number' &&
    Array.isArray(value['warnings'])
  );
}

function isSourcesPayload(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value['sources']) && Array.isArray(value['sections']);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
