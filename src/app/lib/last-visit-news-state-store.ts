import { Injectable } from '@angular/core';

import type { LastVisitNewsState } from '../interfaces/last-visit-news-state.interface';

const LAST_VISIT_STORAGE_KEY_PREFIX = 'fpn:last-visit-news-state:';

@Injectable({ providedIn: 'root' })
export class LastVisitNewsStateStore {
  read(queryKey: string): LastVisitNewsState | null {
    const storage = getSafeStorage();
    if (!storage) {
      return null;
    }

    const rawValue = storage.getItem(this.toStorageKey(queryKey));
    if (typeof rawValue !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as unknown;
      return isLastVisitNewsState(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  write(queryKey: string, articleFingerprints: readonly string[]): void {
    const storage = getSafeStorage();
    if (!storage) {
      return;
    }

    const payload: LastVisitNewsState = {
      articleFingerprints: [...articleFingerprints],
      seenAt: Date.now(),
    };

    storage.setItem(this.toStorageKey(queryKey), JSON.stringify(payload));
  }

  private toStorageKey(queryKey: string): string {
    return `${LAST_VISIT_STORAGE_KEY_PREFIX}${queryKey}`;
  }
}

function getSafeStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isLastVisitNewsState(value: unknown): value is LastVisitNewsState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LastVisitNewsState>;
  return (
    Array.isArray(candidate.articleFingerprints) &&
    candidate.articleFingerprints.every((fingerprint) => typeof fingerprint === 'string') &&
    typeof candidate.seenAt === 'number' &&
    Number.isFinite(candidate.seenAt)
  );
}
