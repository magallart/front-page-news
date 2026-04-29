import { Injectable } from '@angular/core';

import type { NewsViewPreferences } from '../interfaces/news-view-preferences.interface';

const VIEW_PREFERENCES_STORAGE_KEY_PREFIX = 'fpn:view-preferences:';

@Injectable({ providedIn: 'root' })
export class NewsViewPreferencesStore {
  read(scopeKey: string): NewsViewPreferences | null {
    const storage = getSafeStorage();
    if (!storage) {
      return null;
    }

    const rawValue = storage.getItem(this.toStorageKey(scopeKey));
    if (typeof rawValue !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as unknown;
      return isNewsViewPreferences(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  write(scopeKey: string, preferences: NewsViewPreferences): void {
    const storage = getSafeStorage();
    if (!storage) {
      return;
    }

    storage.setItem(
      this.toStorageKey(scopeKey),
      JSON.stringify({
        hasCustomSelection: preferences.hasCustomSelection,
        selectedValues: [...preferences.selectedValues],
        sortDirection: preferences.sortDirection,
      } satisfies NewsViewPreferences),
    );
  }

  private toStorageKey(scopeKey: string): string {
    return `${VIEW_PREFERENCES_STORAGE_KEY_PREFIX}${scopeKey}`;
  }
}

function getSafeStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isNewsViewPreferences(value: unknown): value is NewsViewPreferences {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<NewsViewPreferences>;
  return (
    typeof candidate.hasCustomSelection === 'boolean' &&
    Array.isArray(candidate.selectedValues) &&
    candidate.selectedValues.every((selectedValue) => typeof selectedValue === 'string') &&
    (candidate.sortDirection === 'asc' || candidate.sortDirection === 'desc')
  );
}
