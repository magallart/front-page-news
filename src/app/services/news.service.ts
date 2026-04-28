import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';

import { toNewsSnapshotKey } from '../../../shared/lib/snapshot-key';
import {
  FORCE_REFRESH_HEADER,
  LOCAL_NEWS_SNAPSHOT_EXPIRES_AFTER_MS,
  LOCAL_NEWS_SNAPSHOT_STALE_AFTER_MS,
  NEWS_CACHE_MAX_ENTRIES,
  NEWS_CACHE_TTL_MS,
} from '../constants/news-cache.constants';
import { IndexedDbSnapshotCache } from '../lib/indexeddb-snapshot-cache';
import {
  buildNewsHttpParams,
  normalizeSection,
  toNewsSnapshotQuery,
  type NewsRequestQuery as NewsRequestQueryInput,
} from '../lib/news-request';
import { adaptNewsResponse } from '../lib/news-response-adapter';

import { RemoteNewsSnapshotService } from './remote-news-snapshot.service';

import type { NewsQuery } from '../../../shared/interfaces/news-query.interface';
import type { NewsResponse } from '../../../shared/interfaces/news-response.interface';
import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';
import type { NewsCacheEntry } from '../interfaces/news-cache-entry.interface';
import type { NewsRequestOptions } from '../interfaces/news-request-options.interface';
import type { NewsServiceResultSource } from '../interfaces/news-service-result-source.interface';
import type { NewsServiceResult } from '../interfaces/news-service-result.interface';
import type { NewsRequestQuery } from '../lib/news-request';

export type { NewsRequestQuery } from '../lib/news-request';

export { buildNewsHttpParams } from '../lib/news-request';
export { adaptNewsResponse } from '../lib/news-response-adapter';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly indexedDbSnapshotCache = inject(IndexedDbSnapshotCache);
  private readonly remoteNewsSnapshotService = inject(RemoteNewsSnapshotService);
  private readonly responseCache = new Map<string, NewsCacheEntry>();
  private readonly inFlightFreshRequests = new Map<string, Promise<NewsServiceResult>>();

  getNews(query: NewsRequestQuery = {}, options: NewsRequestOptions = {}): Observable<NewsServiceResult> {
    const normalizedQuery = toNewsSnapshotQuery(query);
    const params = buildNewsHttpParams(query);
    const snapshotKey = toNewsSnapshotKey(normalizedQuery);
    const section = params.get('section');
    const forceRefresh = options.forceRefresh === true;

    this.pruneExpiredEntries();

    if (!forceRefresh) {
      const cached = this.responseCache.get(snapshotKey);
      if (cached && !isExpired(cached.memoryExpiresAt)) {
        this.promoteCacheEntry(snapshotKey, cached);
        return new Observable((subscriber) => {
          subscriber.next({
            ...cached.result,
            source: 'memory',
            isRefreshing: false,
            isStale: isExpired(cached.result.staleAtMs),
          });
          subscriber.complete();
        });
      }

      if (cached) {
        this.responseCache.delete(snapshotKey);
      }
    }

    return new Observable<NewsServiceResult>((subscriber) => {
      let cancelled = false;

      const execute = async (): Promise<void> => {
        let hydratedResult: NewsServiceResult | null = null;

        if (!forceRefresh) {
          hydratedResult =
            (await this.loadIndexedDbSnapshot(query)) ??
            (await this.loadRemoteSnapshot(query));

          if (cancelled) {
            return;
          }

          if (hydratedResult) {
            this.cacheResult(snapshotKey, section, hydratedResult);
            const shouldRefresh = hydratedResult.isStale;

            subscriber.next({
              ...hydratedResult,
              isRefreshing: shouldRefresh,
            });

            if (!shouldRefresh) {
              subscriber.complete();
              return;
            }
          }
        }

        try {
          const freshResult = await this.getOrCreateFreshRequest(query, normalizedQuery, params, snapshotKey, section);
          if (cancelled) {
            return;
          }

          if (!hydratedResult || !areNewsResponsesEqual(hydratedResult.response, freshResult.response)) {
            subscriber.next(freshResult);
          }

          subscriber.complete();
        } catch (error) {
          if (!hydratedResult) {
            subscriber.error(error);
            return;
          }

          subscriber.complete();
        }
      };

      void execute();

      return () => {
        cancelled = true;
      };
    });
  }

  clear(): void {
    this.responseCache.clear();
  }

  invalidateBySection(sectionSlug: string): void {
    this.pruneExpiredEntries();

    const normalizedSection = normalizeSection(sectionSlug);
    for (const [cacheKey, cacheEntry] of this.responseCache.entries()) {
      if (cacheEntry.section === normalizedSection) {
        this.responseCache.delete(cacheKey);
      }
    }
  }

  private async loadIndexedDbSnapshot(query: NewsRequestQueryInput): Promise<NewsServiceResult | null> {
    const record = await this.indexedDbSnapshotCache.getNewsSnapshot(query);
    if (!record) {
      return null;
    }

    return this.toServiceResult(record.snapshot, 'indexeddb', record.staleAtMs, record.expiresAtMs);
  }

  private async loadRemoteSnapshot(query: NewsRequestQueryInput): Promise<NewsServiceResult | null> {
    const snapshot = await this.remoteNewsSnapshotService.getNewsSnapshot(query);
    if (!snapshot) {
      return null;
    }

    const generatedAtMs = Date.parse(snapshot.generatedAt);
    const staleAtMs = Date.parse(snapshot.staleAt);
    const expiresAtMs = Math.min(
      Date.parse(snapshot.expiresAt),
      generatedAtMs + LOCAL_NEWS_SNAPSHOT_EXPIRES_AFTER_MS,
    );

    await this.indexedDbSnapshotCache.putNewsSnapshot(snapshot, {
      staleAtMs,
      expiresAtMs,
    });

    return this.toServiceResult(snapshot, 'remote_snapshot', staleAtMs, expiresAtMs);
  }

  private async getOrCreateFreshRequest(
    originalQuery: NewsRequestQueryInput,
    normalizedQuery: NewsQuery,
    params: ReturnType<typeof buildNewsHttpParams>,
    snapshotKey: string,
    section: string | null,
  ): Promise<NewsServiceResult> {
    const inFlight = this.inFlightFreshRequests.get(snapshotKey);
    if (inFlight) {
      return inFlight;
    }

    const requestPromise = firstValueFrom(
      this.http.get<Record<string, unknown>>('/api/news', {
        params,
        headers: new HttpHeaders({
          [FORCE_REFRESH_HEADER]: '1',
        }),
      }).pipe(map((payload) => adaptNewsResponse(payload))),
    )
      .then(async (response) => {
        const snapshot = buildLocalNewsSnapshot(normalizedQuery, response, Date.now());
        await this.indexedDbSnapshotCache.putNewsSnapshot(snapshot);

        const result = this.toServiceResult(
          snapshot,
          'network',
          Date.parse(snapshot.staleAt),
          Date.parse(snapshot.expiresAt),
        );
        this.cacheResult(snapshotKey, section, result);
        return result;
      })
      .finally(() => {
        this.inFlightFreshRequests.delete(snapshotKey);
      });

    this.inFlightFreshRequests.set(snapshotKey, requestPromise);
    return requestPromise;
  }

  private pruneExpiredEntries(): void {
    for (const [cacheKey, cacheEntry] of this.responseCache.entries()) {
      if (isExpired(cacheEntry.memoryExpiresAt)) {
        this.responseCache.delete(cacheKey);
      }
    }
  }

  private promoteCacheEntry(cacheKey: string, cacheEntry: NewsCacheEntry): void {
    this.responseCache.delete(cacheKey);
    this.responseCache.set(cacheKey, cacheEntry);
  }

  private cacheResult(cacheKey: string, section: string | null, result: NewsServiceResult): void {
    this.responseCache.set(cacheKey, {
      section,
      result,
      memoryExpiresAt: Date.now() + NEWS_CACHE_TTL_MS,
    });
    this.enforceCacheSizeLimit();
  }

  private enforceCacheSizeLimit(): void {
    while (this.responseCache.size > NEWS_CACHE_MAX_ENTRIES) {
      const oldestCacheKey = this.responseCache.keys().next().value;
      if (typeof oldestCacheKey !== 'string') {
        return;
      }

      this.responseCache.delete(oldestCacheKey);
    }
  }

  private toServiceResult(
    snapshot: NewsSnapshot,
    source: NewsServiceResultSource,
    staleAtMs: number,
    expiresAtMs: number,
  ): NewsServiceResult {
    return {
      key: snapshot.key,
      query: snapshot.query,
      response: snapshot.payload,
      source,
      staleAtMs,
      expiresAtMs,
      isStale: isExpired(staleAtMs),
      isRefreshing: false,
    };
  }
}

function buildLocalNewsSnapshot(query: NewsQuery, payload: NewsResponse, generatedAtMs: number): NewsSnapshot {
  return {
    key: toNewsSnapshotKey(query),
    kind: 'news',
    generatedAt: new Date(generatedAtMs).toISOString(),
    staleAt: new Date(generatedAtMs + LOCAL_NEWS_SNAPSHOT_STALE_AFTER_MS).toISOString(),
    expiresAt: new Date(generatedAtMs + LOCAL_NEWS_SNAPSHOT_EXPIRES_AFTER_MS).toISOString(),
    query,
    payload,
  };
}

function areNewsResponsesEqual(left: NewsResponse, right: NewsResponse): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isExpired(timestamp: number): boolean {
  return Date.now() >= timestamp;
}
