import { describe, expect, it } from 'vitest';

import {
  formatDateLabelUppercase,
  formatDateLong,
  formatDateNumericWithDots,
  formatDateShort,
  formatTime24,
} from './date-formatting';

describe('date-formatting', () => {
  it('formats time and numeric date for valid values', () => {
    const date = new Date('2026-03-04T18:45:00.000Z');

    expect(formatTime24(date)).toMatch(/\d{2}:\d{2}/);
    expect(formatDateNumericWithDots(date)).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });

  it('returns fallbacks for invalid values', () => {
    const invalid = new Date('invalid');

    expect(formatTime24(invalid)).toBe('--:--');
    expect(formatDateNumericWithDots(invalid)).toBe('--.--.----');
    expect(formatDateLong(invalid)).toBe('Fecha no disponible');
    expect(formatDateShort(invalid)).toBe('-- -- --');
  });

  it('returns uppercase long label', () => {
    const date = new Date('2026-03-04T00:00:00.000Z');
    expect(formatDateLabelUppercase(date)).toBe(formatDateLabelUppercase(date).toUpperCase());
  });
});
