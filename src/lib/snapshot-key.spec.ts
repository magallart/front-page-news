import { describe, expect, it } from 'vitest';

import { toNewsSnapshotKey, toSourcesSnapshotKey } from '../../shared/lib/snapshot-key';

describe('shared/lib/snapshot-key', () => {
  it('builds a deterministic key for news queries', () => {
    expect(
      toNewsSnapshotKey({
        id: null,
        section: ' Economia ',
        sourceIds: ['source-b', 'source-a', 'source-b'],
        searchQuery: ' Ibex ',
        page: 1,
        limit: 250,
      }),
    ).toBe('news:id=-:section=economia:source=source-a,source-b:q=ibex:page=1:limit=250');
  });

  it('uses explicit empty markers for missing values', () => {
    expect(
      toNewsSnapshotKey({
        id: null,
        section: null,
        sourceIds: [],
        searchQuery: null,
        page: 1,
        limit: 20,
      }),
    ).toBe('news:id=-:section=-:source=-:q=-:page=1:limit=20');
  });

  it('builds the default sources key', () => {
    expect(toSourcesSnapshotKey()).toBe('sources:default');
  });
});
