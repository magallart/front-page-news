import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, shareReplay, throwError } from 'rxjs';

import { isCacheExpired } from '../lib/cache-ttl';
import { adaptSourcesResponse } from '../lib/sources-response-adapter';

import type { SourcesCacheEntry } from '../interfaces/sources-cache-entry.interface';
import type { SourcesRequestOptions } from '../interfaces/sources-request-options.interface';

export { adaptSourcesResponse } from '../lib/sources-response-adapter';

export const SOURCES_CACHE_TTL_MS = 300_000;

@Injectable({ providedIn: 'root' })
export class SourcesService {
  private readonly http = inject(HttpClient);
  private cachedResponse: SourcesCacheEntry | null = null;

  getSources(options: SourcesRequestOptions = {}) {
    if (options.forceRefresh) {
      this.clear();
    }

    if (this.cachedResponse && !isCacheExpired(this.cachedResponse.expiresAt)) {
      return this.cachedResponse.response$;
    }

    if (this.cachedResponse) {
      this.cachedResponse = null;
    }

    const request$ = this.http.get<Record<string, unknown>>('/api/sources').pipe(
      map((payload) => adaptSourcesResponse(payload)),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((error) => {
        this.clear();
        return throwError(() => error);
      }),
    );

    this.cachedResponse = {
      response$: request$,
      expiresAt: Date.now() + SOURCES_CACHE_TTL_MS,
    };

    return request$;
  }

  clear(): void {
    this.cachedResponse = null;
  }
}
