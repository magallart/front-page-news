import { describe, expect, it } from 'vitest';

import { buildAlternatingRows, buildFixedRows } from './source-directory-rows';

import type { SourceDirectoryItem } from '../interfaces/source-directory-item.interface';

describe('source-directory-rows', () => {
  const items: readonly SourceDirectoryItem[] = [
    { id: 'a', name: 'A', url: 'https://a.test', logoUrl: '/a.png' },
    { id: 'b', name: 'B', url: 'https://b.test', logoUrl: '/b.png' },
    { id: 'c', name: 'C', url: 'https://c.test', logoUrl: '/c.png' },
    { id: 'd', name: 'D', url: 'https://d.test', logoUrl: '/d.png' },
    { id: 'e', name: 'E', url: 'https://e.test', logoUrl: '/e.png' },
  ];

  it('builds fixed rows with balanced split', () => {
    const rows = buildFixedRows(items, 2);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveLength(3);
    expect(rows[1]).toHaveLength(2);
  });

  it('builds alternating rows in 3/2 pattern', () => {
    const rows = buildAlternatingRows(items);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveLength(3);
    expect(rows[1]).toHaveLength(2);
  });
});
