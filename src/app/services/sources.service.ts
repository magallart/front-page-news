import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, shareReplay, throwError } from 'rxjs';

import type { Section } from '../../interfaces/section.interface';
import type { Source } from '../../interfaces/source.interface';
import type { SourcesResponse } from '../../interfaces/sources-response.interface';
import type { SourcesCacheEntry } from '../interfaces/sources-cache-entry.interface';
import type { SourcesRequestOptions } from '../interfaces/sources-request-options.interface';

export const SOURCES_CACHE_TTL_MS = 300_000;

@Injectable({ providedIn: 'root' })
export class SourcesService {
  private readonly http = inject(HttpClient);
  private cachedResponse: SourcesCacheEntry | null = null;

  getSources(options: SourcesRequestOptions = {}) {
    if (options.forceRefresh) {
      this.clear();
    }

    if (this.cachedResponse && !isExpired(this.cachedResponse.expiresAt)) {
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

export function adaptSourcesResponse(payload: Record<string, unknown>): SourcesResponse {
  return {
    sources: asSourceArray(payload['sources']),
    sections: asSectionArray(payload['sections']),
  };
}

function asSourceArray(value: unknown): readonly Source[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid sources response: "sources" must be an array');
  }

  return value.map((source, index) => toSource(source, index));
}

function asSectionArray(value: unknown): readonly Section[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid sources response: "sections" must be an array');
  }

  return value.map((section, index) => toSection(section, index));
}

function toSource(value: unknown, index: number): Source {
  const record = asRecord(value, `sources[${index}]`);

  return {
    id: asString(record['id'], `sources[${index}].id`),
    name: asString(record['name'], `sources[${index}].name`),
    baseUrl: asString(record['baseUrl'], `sources[${index}].baseUrl`),
    feedUrl: asString(record['feedUrl'], `sources[${index}].feedUrl`),
    sectionSlugs: asStringArray(record['sectionSlugs'], `sources[${index}].sectionSlugs`),
  };
}

function toSection(value: unknown, index: number): Section {
  const record = asRecord(value, `sections[${index}]`);

  return {
    id: asString(record['id'], `sections[${index}].id`),
    slug: asString(record['slug'], `sections[${index}].slug`),
    name: asString(record['name'], `sections[${index}].name`),
  };
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid sources response: "${field}" must be an object`);
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid sources response: "${field}" must be a string`);
  }

  return value;
}

function asStringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Invalid sources response: "${field}" must be an array of strings`);
  }

  return value;
}

function isExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}
