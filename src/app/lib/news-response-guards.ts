import type { WarningCode } from '../../interfaces/warning.interface';

const NEWS_ERROR_PREFIX = 'Invalid news response';

export function toNewsResponseError(field: string, expected: string): Error {
  return new Error(`${NEWS_ERROR_PREFIX}: "${field}" must be ${expected}`);
}

export function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw toNewsResponseError(field, 'an object');
  }

  return value as Record<string, unknown>;
}

export function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw toNewsResponseError(field, 'a string');
  }

  return value;
}

export function asNullableString(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw toNewsResponseError(field, 'a string or null');
  }

  return value;
}

export function asOptionalNullableString(value: unknown, field: string): string | null | undefined {
  if (typeof value === 'undefined') {
    return undefined;
  }

  return asNullableString(value, field);
}

export function asNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw toNewsResponseError(field, 'a finite number');
  }

  return value;
}

export function asWarningCode(value: unknown, field: string): WarningCode {
  return asString(value, field) as WarningCode;
}
