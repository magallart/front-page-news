import { describe, expect, it } from 'vitest';

import { BREAKING_NEWS_TIMESTAMP_FALLBACK, formatBreakingNewsTimestamp } from './breaking-news-timestamp';

describe('breaking-news-timestamp', () => {
  const now = new Date('2026-03-04T12:00:00.000Z');

  it('formats elapsed minutes when the item is recent', () => {
    expect(formatBreakingNewsTimestamp('2026-03-04T11:55:00.000Z', now)).toBe('Hace 5 min');
  });

  it('formats elapsed hours when the item is older than one hour', () => {
    expect(formatBreakingNewsTimestamp('2026-03-04T09:00:00.000Z', now)).toBe('Hace 3 h');
  });

  it('formats elapsed days when the item is older than one day', () => {
    expect(formatBreakingNewsTimestamp('2026-03-02T12:00:00.000Z', now)).toBe('Hace 2 d');
  });

  it('returns fallback for invalid or future dates', () => {
    expect(formatBreakingNewsTimestamp('invalid-date', now)).toBe(BREAKING_NEWS_TIMESTAMP_FALLBACK);
    expect(formatBreakingNewsTimestamp('2026-03-04T13:10:00.000Z', now)).toBe(BREAKING_NEWS_TIMESTAMP_FALLBACK);
  });
});
