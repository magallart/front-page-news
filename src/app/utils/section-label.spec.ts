import { describe, expect, it } from 'vitest';

import { formatSectionLabel } from './section-label';

describe('section-label', () => {
  it('formats slug labels with uppercase words', () => {
    expect(formatSectionLabel('ultima-hora')).toBe('Ultima Hora');
    expect(formatSectionLabel('economia')).toBe('Economia');
  });

  it('falls back when slug is empty', () => {
    expect(formatSectionLabel('')).toBe('Actualidad');
  });
});
