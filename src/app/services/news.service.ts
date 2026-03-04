import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, shareReplay, throwError } from 'rxjs';

import { isCacheExpired } from '../lib/cache-ttl';
import {
  buildNewsHttpParams,
  normalizeSection,
  toNewsCacheKey,
  type NewsRequestQuery as NewsRequestQueryInput,
} from '../lib/news-request';
import { adaptNewsResponse } from '../lib/news-response-adapter';

import type { NewsCacheEntry } from '../interfaces/news-cache-entry.interface';
import type { NewsRequestOptions } from '../interfaces/news-request-options.interface';
import type { HttpParams } from '@angular/common/http';

export type NewsRequestQuery = NewsRequestQueryInput;

export { buildNewsHttpParams } from '../lib/news-request';
export { adaptNewsResponse } from '../lib/news-response-adapter';

export const NEWS_CACHE_TTL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly responseCache = new Map<string, NewsCacheEntry>();

  getNews(query: NewsRequestQuery = {}, options: NewsRequestOptions = {}) {
    const params = buildNewsHttpParams(query);
    const cacheKey = toNewsCacheKey(params);
    const section = params.get('section');

    if (options.forceRefresh) {
      this.responseCache.delete(cacheKey);
    }

    const cached = this.responseCache.get(cacheKey);
    if (cached && !isCacheExpired(cached.expiresAt)) {
      return cached.response$;
    }

    if (cached) {
      this.responseCache.delete(cacheKey);
    }

    const request$ = this.createRequest(params, cacheKey);
    this.responseCache.set(cacheKey, {
      section,
      response$: request$,
      expiresAt: Date.now() + NEWS_CACHE_TTL_MS,
    });

    return request$;
  }

  clear(): void {
    this.responseCache.clear();
  }

  invalidateBySection(sectionSlug: string): void {
    const normalizedSection = normalizeSection(sectionSlug);
    for (const [cacheKey, cacheEntry] of this.responseCache.entries()) {
      if (cacheEntry.section === normalizedSection) {
        this.responseCache.delete(cacheKey);
      }
    }
  }

  private createRequest(params: HttpParams, cacheKey: string) {
    return this.http.get<Record<string, unknown>>('/api/news', { params }).pipe(
      map((payload) => adaptNewsResponse(payload)),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((error) => {
        this.responseCache.delete(cacheKey);
        return throwError(() => error);
      }),
    );
  }
}
