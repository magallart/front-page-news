import { CACHE_CONTROL_HEADER_VALUE, RSS_SOURCES_FILE_PATH } from '../server/constants/news.constants.js';
import { fetchFeedsConcurrently } from '../server/lib/feed-fetcher.js';
import { isExpired, logPerf, toNewsQueryCacheKey } from '../server/lib/news-handler-cache.js';
import { buildNewsPayload, SourcesCatalogLoadError } from '../server/lib/news-payload-builder.js';
import { parseNewsQuery } from '../server/lib/news-query.js';
import { buildSourceFeedTargetsFromRecords } from '../server/lib/rss-sources-catalog.js';

import { loadRssCatalogRecords } from './lib/rss-catalog.js';
import { sendJson } from './lib/send-json.js';

import type { ApiRequest } from '../server/interfaces/api-request.interface';
import type { NewsHandlerDependencies } from '../server/interfaces/news-handler-dependencies.interface';
import type { NewsHandlerRuntimeOptions } from '../server/interfaces/news-handler-runtime-options.interface';
import type { NewsPayloadBuildResult } from '../server/interfaces/news-payload-build-result.interface';
import type { SourceFeedTarget } from '../shared/interfaces/source-feed-target.interface';
import type { ServerResponse } from 'node:http';

export const config = {
  includeFiles: ['data/rss-sources.json'],
};

const NEWS_HANDLER_CACHE_TTL_MS = 60_000;
const NEWS_HANDLER_CACHE_MAX_ENTRIES = 64;
const PERF_LOGS_ENV_FLAG = 'NEWS_PERF_LOGS';

const defaultDependencies: NewsHandlerDependencies = {
  loadSourcesCatalog,
  fetchFeeds: fetchFeedsConcurrently,
};

interface CachedNewsPayload {
  readonly expiresAt: number;
  readonly payloadPromise: Promise<NewsPayloadBuildResult>;
}

export function createNewsHandler(
  overrides: Partial<NewsHandlerDependencies> = {},
  runtimeOptions: NewsHandlerRuntimeOptions = {},
) {
  const dependencies: NewsHandlerDependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const cacheTtlMs = runtimeOptions.cacheTtlMs ?? NEWS_HANDLER_CACHE_TTL_MS;
  const cacheMaxEntries = Math.max(1, runtimeOptions.cacheMaxEntries ?? NEWS_HANDLER_CACHE_MAX_ENTRIES);
  const now = runtimeOptions.now ?? (() => Date.now());
  const enablePerfLogs = runtimeOptions.enablePerfLogs ?? process.env[PERF_LOGS_ENV_FLAG] === '1';
  const responseCache = new Map<string, CachedNewsPayload>();

  return async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method Not Allowed' }, CACHE_CONTROL_HEADER_VALUE);
      return;
    }

    const startedAt = now();
    pruneExpiredCacheEntries(responseCache, startedAt);

    const query = parseNewsQuery(request.url);
    const cacheKey = toNewsQueryCacheKey(query);
    const cached = responseCache.get(cacheKey);

    if (cached && !isExpired(cached.expiresAt, startedAt)) {
      try {
        promoteCacheEntry(responseCache, cacheKey, cached);
        const { payload } = await cached.payloadPromise;
        if (enablePerfLogs) {
          logPerf('cache-hit', {
            cacheKey,
            totalMs: now() - startedAt,
          });
        }

        sendJson(response, 200, payload, CACHE_CONTROL_HEADER_VALUE);
        return;
      } catch {
        responseCache.delete(cacheKey);
      }
    }

    if (cached) {
      responseCache.delete(cacheKey);
    }

    const payloadPromise = buildNewsPayload(dependencies, query, now);
    responseCache.set(cacheKey, {
      payloadPromise,
      expiresAt: now() + cacheTtlMs,
    });
    enforceCacheSizeLimit(responseCache, cacheMaxEntries);

    try {
      const { payload, timings } = await payloadPromise;
      sendJson(response, 200, payload, CACHE_CONTROL_HEADER_VALUE);

      if (enablePerfLogs) {
        logPerf('cache-miss', {
          cacheKey,
          catalogMs: timings.catalogMs,
          fetchMs: timings.fetchMs,
          parseAndFilterMs: timings.parseAndFilterMs,
          totalMs: now() - startedAt,
          warningsCount: payload.warnings.length,
          articlesReturned: payload.articles.length,
        });
      }
      return;
    } catch (error) {
      responseCache.delete(cacheKey);
      if (error instanceof SourcesCatalogLoadError) {
        sendJson(response, 500, { error: 'Unable to load RSS sources catalog' }, CACHE_CONTROL_HEADER_VALUE);
        return;
      }

      sendJson(response, 500, { error: 'Unable to load RSS sources catalog' }, CACHE_CONTROL_HEADER_VALUE);
      return;
    }
  };
}

export default createNewsHandler();

function pruneExpiredCacheEntries(cache: Map<string, CachedNewsPayload>, nowTimestamp: number): void {
  for (const [cacheKey, cacheEntry] of cache.entries()) {
    if (isExpired(cacheEntry.expiresAt, nowTimestamp)) {
      cache.delete(cacheKey);
    }
  }
}

function promoteCacheEntry(cache: Map<string, CachedNewsPayload>, cacheKey: string, cacheEntry: CachedNewsPayload): void {
  cache.delete(cacheKey);
  cache.set(cacheKey, cacheEntry);
}

function enforceCacheSizeLimit(cache: Map<string, CachedNewsPayload>, maxEntries: number): void {
  while (cache.size > maxEntries) {
    const oldestCacheKey = cache.keys().next().value;
    if (typeof oldestCacheKey !== 'string') {
      return;
    }

    cache.delete(oldestCacheKey);
  }
}

async function loadSourcesCatalog(): Promise<readonly SourceFeedTarget[]> {
  const records = await loadRssCatalogRecords(RSS_SOURCES_FILE_PATH);
  const feedTargets = buildSourceFeedTargetsFromRecords(records);

  if (feedTargets.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  return feedTargets;
}

