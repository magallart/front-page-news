import { inject, Injectable, signal } from '@angular/core';

import { areNewsResponsesEqual } from '../../../shared/lib/news-response-equality';
import { toNewsRequestSnapshotKey } from '../lib/news-request';
import { NewsService } from '../services/news.service';
import { getUserErrorMessage } from '../utils/app-http-error.utils';

import type { NewsResponse } from '../../../shared/interfaces/news-response.interface';
import type { Warning } from '../../../shared/interfaces/warning.interface';
import type { NewsRequestQuery } from '../services/news.service';
import type { Subscription } from 'rxjs';

interface NewsStoreEntryState {
  readonly query: NewsRequestQuery;
  readonly visibleResponse: NewsResponse | null;
  readonly error: string | null;
  readonly lastUpdated: number | null;
  readonly isHydrated: boolean;
  readonly isInitialLoading: boolean;
  readonly isRefreshing: boolean;
  readonly isShowingStaleData: boolean;
  readonly hasFreshUpdateAvailable: boolean;
  readonly activeRequestId: number;
}

type NewsStoreState = Readonly<Record<string, NewsStoreEntryState>>;

@Injectable({ providedIn: 'root' })
export class NewsStore {
  private readonly newsService = inject(NewsService);
  private readonly entriesSignal = signal<NewsStoreState>({});
  private readonly lastQueryKeySignal = signal<string | null>(null);
  private readonly subscriptions = new Map<string, Subscription>();

  load(query: NewsRequestQuery = {}): void {
    const key = toQueryKey(query);
    this.lastQueryKeySignal.set(key);
    this.fetchNews(query, false);
  }

  refresh(query?: NewsRequestQuery): void {
    const resolvedQuery = this.resolveQuery(query);
    if (!resolvedQuery) {
      return;
    }

    this.fetchNews(resolvedQuery, true);
  }

  dismissFreshUpdateNotice(query?: NewsRequestQuery): void {
    const resolvedQuery = this.resolveQuery(query);
    if (!resolvedQuery) {
      return;
    }

    const key = toQueryKey(resolvedQuery);
    const currentEntry = this.getEntry(key);

    this.setEntry(key, {
      ...currentEntry,
      hasFreshUpdateAvailable: false,
    });
  }

  clearError(query?: NewsRequestQuery): void {
    const resolvedQuery = this.resolveQuery(query);
    if (!resolvedQuery) {
      return;
    }

    const key = toQueryKey(resolvedQuery);
    this.setEntry(key, {
      ...this.getEntry(key),
      error: null,
    });
  }

  data(query?: NewsRequestQuery): NewsResponse['articles'] {
    return this.getResolvedEntry(query).visibleResponse?.articles ?? [];
  }

  warnings(query?: NewsRequestQuery): readonly Warning[] {
    return this.getResolvedEntry(query).visibleResponse?.warnings ?? [];
  }

  error(query?: NewsRequestQuery): string | null {
    return this.getResolvedEntry(query).error;
  }

  lastUpdated(query?: NewsRequestQuery): number | null {
    return this.getResolvedEntry(query).lastUpdated;
  }

  isHydrated(query?: NewsRequestQuery): boolean {
    return this.getResolvedEntry(query).isHydrated;
  }

  isInitialLoading(query?: NewsRequestQuery): boolean {
    return this.getResolvedEntry(query).isInitialLoading;
  }

  isRefreshing(query?: NewsRequestQuery): boolean {
    return this.getResolvedEntry(query).isRefreshing;
  }

  isShowingStaleData(query?: NewsRequestQuery): boolean {
    return this.getResolvedEntry(query).isShowingStaleData;
  }

  hasFreshUpdateAvailable(query?: NewsRequestQuery): boolean {
    return this.getResolvedEntry(query).hasFreshUpdateAvailable;
  }

  private fetchNews(query: NewsRequestQuery, forceRefresh: boolean): void {
    const key = toQueryKey(query);
    const currentEntry = this.getEntry(key);
    const requestId = currentEntry.activeRequestId + 1;

    this.subscriptions.get(key)?.unsubscribe();

    this.setEntry(key, {
      ...currentEntry,
      query: { ...query },
      error: null,
      isInitialLoading: currentEntry.visibleResponse === null,
      isRefreshing: currentEntry.visibleResponse !== null || forceRefresh,
      activeRequestId: requestId,
      hasFreshUpdateAvailable: false,
    });

    const subscription = this.newsService.getNews(query, { forceRefresh }).subscribe({
      next: (result) => {
        const latestEntry = this.getEntry(key);
        if (latestEntry.activeRequestId !== requestId) {
          return;
        }

        this.applyVisibleResult(key, latestEntry, result.response, result.isStale, result.isRefreshing);
      },
      error: (error: unknown) => {
        const latestEntry = this.getEntry(key);
        if (latestEntry.activeRequestId !== requestId) {
          return;
        }

        this.finalizeRequest(key, requestId, {
          ...latestEntry,
          error: getUserErrorMessage(error, 'No se pudieron cargar las noticias.'),
          isInitialLoading: false,
          isRefreshing: false,
        });
      },
      complete: () => {
        const latestEntry = this.getEntry(key);
        if (latestEntry.activeRequestId !== requestId) {
          return;
        }

        this.finalizeRequest(key, requestId, {
          ...latestEntry,
          isInitialLoading: false,
          isRefreshing: false,
        });
      },
    });

    this.subscriptions.set(key, subscription);
  }

  private applyVisibleResult(
    key: string,
    currentEntry: NewsStoreEntryState,
    response: NewsResponse,
    isStale: boolean,
    isRefreshing: boolean,
  ): void {
    const hasVisibleResponse = currentEntry.visibleResponse !== null;
    const hasChangedVisibleContent =
      hasVisibleResponse && !areNewsResponsesEqual(currentEntry.visibleResponse, response);
    const shouldNotifyFreshUpdate =
      hasChangedVisibleContent && currentEntry.isRefreshing && !isRefreshing;

    this.setEntry(key, {
      ...currentEntry,
      visibleResponse: response,
      error: null,
      lastUpdated: Date.now(),
      isHydrated: true,
      isInitialLoading: false,
      isRefreshing,
      isShowingStaleData: isStale,
      hasFreshUpdateAvailable: shouldNotifyFreshUpdate,
    });
  }

  private resolveQuery(query?: NewsRequestQuery): NewsRequestQuery | null {
    if (query) {
      return query;
    }

    const key = this.lastQueryKeySignal();
    if (!key) {
      return null;
    }

    return this.getEntry(key).query;
  }

  private getResolvedEntry(query?: NewsRequestQuery): NewsStoreEntryState {
    const resolvedQuery = this.resolveQuery(query);
    if (!resolvedQuery) {
      return createEmptyEntry({});
    }

    return this.getEntry(toQueryKey(resolvedQuery));
  }

  private getEntry(key: string): NewsStoreEntryState {
    return this.entriesSignal()[key] ?? createEmptyEntry({});
  }

  private setEntry(key: string, entry: NewsStoreEntryState): void {
    this.entriesSignal.update((state) => ({
      ...state,
      [key]: entry,
    }));
  }

  private finalizeRequest(key: string, requestId: number, entry: NewsStoreEntryState): void {
    const latestEntry = this.getEntry(key);
    if (latestEntry.activeRequestId !== requestId) {
      return;
    }

    this.setEntry(key, entry);
    this.subscriptions.delete(key);
  }
}

function toQueryKey(query: NewsRequestQuery): string {
  return toNewsRequestSnapshotKey(query);
}

function createEmptyEntry(query: NewsRequestQuery): NewsStoreEntryState {
  return {
    query,
    visibleResponse: null,
    error: null,
    lastUpdated: null,
    isHydrated: false,
    isInitialLoading: false,
    isRefreshing: false,
    isShowingStaleData: false,
    hasFreshUpdateAvailable: false,
    activeRequestId: 0,
  };
}
