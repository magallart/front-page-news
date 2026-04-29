import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NewsViewPreferencesStore } from './news-view-preferences-store';

describe('NewsViewPreferencesStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and restores preferences for the same scope key', () => {
    const store = new NewsViewPreferencesStore();
    const scopeKey = 'news:id=-:section=actualidad:source=-:q=-:page=1:limit=300';

    store.write(scopeKey, {
      hasCustomSelection: true,
      selectedValues: ['Mundo Diario'],
      sortDirection: 'asc',
    });

    expect(store.read(scopeKey)).toEqual({
      hasCustomSelection: true,
      selectedValues: ['Mundo Diario'],
      sortDirection: 'asc',
    });
  });

  it('returns null for malformed persisted data', () => {
    const store = new NewsViewPreferencesStore();
    const scopeKey = 'news:id=-:section=actualidad:source=-:q=-:page=1:limit=300';

    localStorage.setItem(`fpn:view-preferences:${scopeKey}`, '{"sortDirection":"sideways"}');

    expect(store.read(scopeKey)).toBeNull();
  });
});

vi.stubGlobal('localStorage', window.localStorage);
