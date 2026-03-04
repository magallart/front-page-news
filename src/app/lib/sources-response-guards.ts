const SOURCES_ERROR_PREFIX = 'Invalid sources response';

export function toSourcesResponseError(field: string, expected: string): Error {
  return new Error(`${SOURCES_ERROR_PREFIX}: "${field}" must be ${expected}`);
}

export function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw toSourcesResponseError(field, 'an object');
  }

  return value as Record<string, unknown>;
}

export function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw toSourcesResponseError(field, 'a string');
  }

  return value;
}

export function asStringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw toSourcesResponseError(field, 'an array of strings');
  }

  return value;
}
