import { CACHE_CONTROL_HEADER_VALUE, FEED_FETCH_TIMEOUT_MS, RSS_SOURCES_FILE_PATH } from '../server/constants/news.constants.js';
import { WARNING_CODE } from '../server/constants/warning-code.constants.js';
import { fetchFeedsConcurrently } from '../server/lib/feed-fetcher.js';
import { applyNewsFilters, parseNewsQuery } from '../server/lib/news-query.js';
import { dedupeAndSortArticles, normalizeFeedItem } from '../server/lib/rss-normalization.js';
import { parseFeedItems } from '../server/lib/rss-parser.js';
import { buildSourceFeedTargetsFromRecords } from '../server/lib/rss-sources-catalog.js';

import { loadRssCatalogRecords } from './lib/rss-catalog.js';
import { sendJson } from './lib/send-json.js';

import type { ApiRequest } from '../server/interfaces/api-request.interface';
import type { FeedSuccessLike } from '../server/interfaces/feed-success-like.interface';
import type { NewsHandlerDependencies } from '../server/interfaces/news-handler-dependencies.interface';
import type { ParsedFeedsResult } from '../server/interfaces/parsed-feeds-result.interface';
import type { Article } from '../src/interfaces/article.interface';
import type { NewsQuery } from '../src/interfaces/news-query.interface';
import type { NewsResponse } from '../src/interfaces/news-response.interface';
import type { SourceFeedTarget } from '../src/interfaces/source-feed-target.interface';
import type { Source } from '../src/interfaces/source.interface';
import type { Warning } from '../src/interfaces/warning.interface';
import type { ServerResponse } from 'node:http';

export const config = {
  includeFiles: ['data/rss-sources.json'],
};

const defaultDependencies: NewsHandlerDependencies = {
  loadSourcesCatalog,
  fetchFeeds: fetchFeedsConcurrently,
};

const NEWS_HANDLER_CACHE_TTL_MS = 60_000;
const PERF_LOGS_ENV_FLAG = 'NEWS_PERF_LOGS';
const HOME_MAX_FEEDS = 24;
const HOME_MAX_FEEDS_PER_SOURCE = 2;
const HOME_MAX_FEEDS_PER_SECTION = 3;
const HOME_FETCH_TIMEOUT_MS = 3500;
const HOME_QUERY_MIN_LIMIT = 200;
const HOME_SECTION_PRIORITY_ORDER = [
  'actualidad',
  'economia',
  'espana',
  'internacional',
  'cultura',
  'deportes',
  'ciencia',
  'tecnologia',
  'sociedad',
  'opinion',
  'ultima-hora',
];

interface CachedNewsPayload {
  readonly expiresAt: number;
  readonly payloadPromise: Promise<{ payload: NewsResponse; timings: NewsPayloadTimings }>;
}

interface NewsHandlerRuntimeOptions {
  readonly cacheTtlMs?: number;
  readonly now?: () => number;
  readonly enablePerfLogs?: boolean;
}

interface NewsPayloadTimings {
  readonly catalogMs: number;
  readonly fetchMs: number;
  readonly parseAndFilterMs: number;
}

class SourcesCatalogLoadError extends Error {}

export function createNewsHandler(
  overrides: Partial<NewsHandlerDependencies> = {},
  runtimeOptions: NewsHandlerRuntimeOptions = {}
) {
  const dependencies: NewsHandlerDependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const cacheTtlMs = runtimeOptions.cacheTtlMs ?? NEWS_HANDLER_CACHE_TTL_MS;
  const now = runtimeOptions.now ?? (() => Date.now());
  const enablePerfLogs = runtimeOptions.enablePerfLogs ?? process.env[PERF_LOGS_ENV_FLAG] === '1';
  const responseCache = new Map<string, CachedNewsPayload>();

  return async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method Not Allowed' }, CACHE_CONTROL_HEADER_VALUE);
      return;
    }

    const startedAt = now();
    const query = parseNewsQuery(request.url);
    const cacheKey = toNewsQueryCacheKey(query);
    const cached = responseCache.get(cacheKey);
    if (cached && !isExpired(cached.expiresAt, now())) {
      try {
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

async function buildNewsPayload(
  dependencies: NewsHandlerDependencies,
  query: NewsQuery,
  now: () => number
): Promise<{ payload: NewsResponse; timings: NewsPayloadTimings }> {
  const catalogStartedAt = now();
  let availableSources: readonly SourceFeedTarget[];
  try {
    availableSources = await dependencies.loadSourcesCatalog();
  } catch {
    throw new SourcesCatalogLoadError('Unable to load RSS sources catalog');
  }
  const catalogMs = now() - catalogStartedAt;

  const selectedFeedTargets = selectFeedTargetsForFetch(availableSources, query.section, query.sourceIds);
  const optimizedFeedTargets = optimizeFeedTargetsForQuery(selectedFeedTargets, query);
  const fetchSources = buildUniqueFetchSources(optimizedFeedTargets);
  const fetchTimeoutMs = resolveFetchTimeoutMs(query);

  const fetchStartedAt = now();
  const fetchResult = await dependencies.fetchFeeds(fetchSources, fetchTimeoutMs);
  const fetchMs = now() - fetchStartedAt;

  const parseAndFilterStartedAt = now();
  const targetsByKey = buildTargetsLookup(optimizedFeedTargets);
  const parseResult = parseFetchedFeeds(fetchResult.successes, targetsByKey);
  const deduped = dedupeAndSortArticles(parseResult.articles);
  const filtered = applyNewsFilters(deduped, query);
  const parseAndFilterMs = now() - parseAndFilterStartedAt;

  const payload: NewsResponse = {
    articles: filtered.articles,
    total: filtered.total,
    page: filtered.page,
    limit: filtered.limit,
    warnings: [...fetchResult.warnings, ...parseResult.warnings],
  };

  return {
    payload,
    timings: {
      catalogMs,
      fetchMs,
      parseAndFilterMs,
    },
  };
}

function parseFetchedFeeds(
  feeds: readonly FeedSuccessLike[],
  targetsByKey: ReadonlyMap<string, readonly SourceFeedTarget[]>
): ParsedFeedsResult {
  const articles: Article[] = [];
  const warnings: Warning[] = [];

  for (const feed of feeds) {
    const targets = targetsByKey.get(toFeedTargetKey(feed.sourceId, feed.feedUrl));
    if (!targets || targets.length === 0) {
      continue;
    }

    for (const target of targets) {
      try {
        const parsed = parseFeedItems({
          xml: feed.body,
          source: toSource(target),
          sectionSlug: target.sectionSlug,
        });

        let skippedCount = 0;
        for (const rawItem of parsed.items) {
          const normalized = normalizeFeedItem(rawItem);
          if (!normalized) {
            skippedCount += 1;
            continue;
          }

          articles.push(normalized);
        }

        if (skippedCount > 0) {
          warnings.push({
            code: WARNING_CODE.INVALID_ITEM_SKIPPED,
            message: `${skippedCount} items were skipped due to invalid or empty fields`,
            sourceId: target.sourceId,
            feedUrl: target.feedUrl,
          });
        }
      } catch (error) {
        warnings.push({
          code: WARNING_CODE.SOURCE_PARSE_FAILED,
          message: `Unable to parse feed XML: ${toErrorMessage(error)}`,
          sourceId: target.sourceId,
          feedUrl: target.feedUrl,
        });
      }
    }
  }

  return {
    articles,
    warnings,
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function loadSourcesCatalog(): Promise<readonly SourceFeedTarget[]> {
  const records = await loadRssCatalogRecords(RSS_SOURCES_FILE_PATH);
  const feedTargets = buildSourceFeedTargetsFromRecords(records);

  if (feedTargets.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  return feedTargets;
}
function selectFeedTargetsForFetch(
  sources: readonly SourceFeedTarget[],
  sectionSlug: string | null,
  sourceIds: readonly string[]
): readonly SourceFeedTarget[] {
  return sources.filter((source) => {
    if (sourceIds.length > 0 && !sourceIds.includes(source.sourceId)) {
      return false;
    }

    if (sectionSlug && source.sectionSlug !== sectionSlug) {
      return false;
    }

    return true;
  });
}

function optimizeFeedTargetsForQuery(
  targets: readonly SourceFeedTarget[],
  query: NewsQuery,
): readonly SourceFeedTarget[] {
  if (!isHomepageQuery(query)) {
    return targets;
  }

  return selectHomepageFeedTargets(targets);
}

function selectHomepageFeedTargets(targets: readonly SourceFeedTarget[]): readonly SourceFeedTarget[] {
  if (targets.length <= HOME_MAX_FEEDS) {
    return targets;
  }

  const sectionOrder = buildHomepageSectionOrder(targets);
  const groupedBySection = groupTargetsBySection(targets);
  const groupedBySource = groupTargetsBySource(targets);
  const selected: SourceFeedTarget[] = [];
  const selectedKeys = new Set<string>();
  const selectedBySource = new Map<string, number>();
  const selectedBySection = new Map<string, number>();

  // Pass 1: guarantee section coverage on home when available.
  for (const sectionSlug of sectionOrder) {
    if (selected.length >= HOME_MAX_FEEDS) {
      break;
    }

    const sectionQueue = groupedBySection.get(sectionSlug);
    if (!sectionQueue || sectionQueue.length === 0) {
      continue;
    }

    const nextTarget = takeNextSelectableTarget(sectionQueue, selectedBySource, selectedBySection, selectedKeys);
    if (!nextTarget) {
      continue;
    }

    selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
  }

  if (selected.length >= HOME_MAX_FEEDS) {
    return selected;
  }

  // Pass 2: per-source seed (up to cap) to avoid one outlet dominating.
  const sourceOrder = Array.from(groupedBySource.keys());
  for (const sourceId of sourceOrder) {
    if (selected.length >= HOME_MAX_FEEDS) {
      break;
    }

    const sourceQueue = groupedBySource.get(sourceId);
    if (!sourceQueue || sourceQueue.length === 0) {
      continue;
    }

    while (sourceQueue.length > 0 && selected.length < HOME_MAX_FEEDS) {
      const nextTarget = sourceQueue[0];
      if (!nextTarget) {
        break;
      }

      if (isAlreadySelected(nextTarget, selectedKeys)) {
        sourceQueue.shift();
        continue;
      }

      if (!canSelectFeedTarget(nextTarget, selectedBySource, selectedBySection)) {
        break;
      }

      sourceQueue.shift();
      selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
      break;
    }
  }

  if (selected.length >= HOME_MAX_FEEDS) {
    return selected;
  }

  // Pass 3: round-robin by section to keep a balanced mix across home sections.
  const sectionQueues = sectionOrder
    .map((sectionSlug) => groupedBySection.get(sectionSlug))
    .filter((queue): queue is SourceFeedTarget[] => Array.isArray(queue));
  let hasRemainingTargets = true;
  while (selected.length < HOME_MAX_FEEDS && hasRemainingTargets) {
    hasRemainingTargets = false;

    for (const queue of sectionQueues) {
      if (selected.length >= HOME_MAX_FEEDS) {
        break;
      }

      if (queue.length === 0) {
        continue;
      }

      const nextTarget = takeNextSelectableTarget(queue, selectedBySource, selectedBySection, selectedKeys);
      if (!nextTarget) {
        continue;
      }

      selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
      hasRemainingTargets = true;
    }
  }

  if (selected.length >= HOME_MAX_FEEDS) {
    return selected;
  }

  // Pass 4: fallback without caps, still round-robin by source to avoid order bias.
  let hasRemainingBySource = true;
  while (selected.length < HOME_MAX_FEEDS && hasRemainingBySource) {
    hasRemainingBySource = false;

    for (const sourceId of sourceOrder) {
      if (selected.length >= HOME_MAX_FEEDS) {
        break;
      }

      const sourceQueue = groupedBySource.get(sourceId);
      if (!sourceQueue || sourceQueue.length === 0) {
        continue;
      }

      const nextTarget = sourceQueue.shift();
      if (!nextTarget) {
        continue;
      }

      const key = toFeedTargetKey(nextTarget.sourceId, nextTarget.feedUrl);
      if (selectedKeys.has(key)) {
        hasRemainingBySource = true;
        continue;
      }

      selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
      hasRemainingBySource = true;
    }
  }

  return selected;
}

function groupTargetsBySource(targets: readonly SourceFeedTarget[]): ReadonlyMap<string, SourceFeedTarget[]> {
  const grouped = new Map<string, SourceFeedTarget[]>();

  for (const target of targets) {
    const current = grouped.get(target.sourceId);
    if (current) {
      current.push(target);
      continue;
    }

    grouped.set(target.sourceId, [target]);
  }

  return grouped;
}

function groupTargetsBySection(targets: readonly SourceFeedTarget[]): ReadonlyMap<string, SourceFeedTarget[]> {
  const grouped = new Map<string, SourceFeedTarget[]>();

  for (const target of targets) {
    const current = grouped.get(target.sectionSlug);
    if (current) {
      current.push(target);
      continue;
    }

    grouped.set(target.sectionSlug, [target]);
  }

  return grouped;
}

function buildHomepageSectionOrder(targets: readonly SourceFeedTarget[]): readonly string[] {
  const availableSections = new Set(targets.map((target) => target.sectionSlug));
  const ordered = HOME_SECTION_PRIORITY_ORDER.filter((sectionSlug) => availableSections.has(sectionSlug));
  const remaining = Array.from(availableSections).filter((sectionSlug) => !ordered.includes(sectionSlug));

  return [...ordered, ...remaining];
}

function takeNextSelectableTarget(
  queue: SourceFeedTarget[],
  selectedBySource: Map<string, number>,
  selectedBySection: Map<string, number>,
  selectedKeys: ReadonlySet<string> = new Set<string>(),
): SourceFeedTarget | null {
  while (queue.length > 0) {
    const candidate = queue[0];
    if (!candidate) {
      return null;
    }

    if (isAlreadySelected(candidate, selectedKeys)) {
      queue.shift();
      continue;
    }

    if (!canSelectFeedTarget(candidate, selectedBySource, selectedBySection)) {
      return null;
    }

    queue.shift();
    return candidate;
  }

  return null;
}

function canSelectFeedTarget(
  target: SourceFeedTarget,
  selectedBySource: ReadonlyMap<string, number>,
  selectedBySection: ReadonlyMap<string, number>,
): boolean {
  if ((selectedBySource.get(target.sourceId) ?? 0) >= HOME_MAX_FEEDS_PER_SOURCE) {
    return false;
  }

  if ((selectedBySection.get(target.sectionSlug) ?? 0) >= HOME_MAX_FEEDS_PER_SECTION) {
    return false;
  }

  return true;
}

function isAlreadySelected(target: SourceFeedTarget, selectedKeys: ReadonlySet<string>): boolean {
  const key = toFeedTargetKey(target.sourceId, target.feedUrl);
  return selectedKeys.has(key);
}

function selectFeedTarget(
  target: SourceFeedTarget,
  selected: SourceFeedTarget[],
  selectedKeys: Set<string>,
  selectedBySource: Map<string, number>,
  selectedBySection: Map<string, number>,
): void {
  const key = toFeedTargetKey(target.sourceId, target.feedUrl);
  selected.push(target);
  selectedKeys.add(key);
  selectedBySource.set(target.sourceId, (selectedBySource.get(target.sourceId) ?? 0) + 1);
  selectedBySection.set(target.sectionSlug, (selectedBySection.get(target.sectionSlug) ?? 0) + 1);
}

function resolveFetchTimeoutMs(query: NewsQuery): number {
  return isHomepageQuery(query) ? HOME_FETCH_TIMEOUT_MS : FEED_FETCH_TIMEOUT_MS;
}

function isHomepageQuery(query: NewsQuery): boolean {
  return (
    query.id === null &&
    query.section === null &&
    query.sourceIds.length === 0 &&
    query.searchQuery === null &&
    query.page === 1 &&
    query.limit >= HOME_QUERY_MIN_LIMIT
  );
}

function toSource(target: SourceFeedTarget): Source {
  return {
    id: target.sourceId,
    name: target.sourceName,
    baseUrl: target.sourceBaseUrl,
    feedUrl: target.feedUrl,
    sectionSlugs: [target.sectionSlug],
  };
}

function buildTargetsLookup(targets: readonly SourceFeedTarget[]): ReadonlyMap<string, readonly SourceFeedTarget[]> {
  const grouped = new Map<string, SourceFeedTarget[]>();

  for (const target of targets) {
    const key = toFeedTargetKey(target.sourceId, target.feedUrl);
    const current = grouped.get(key) ?? [];
    current.push(target);
    grouped.set(key, current);
  }

  return grouped;
}

function buildUniqueFetchSources(targets: readonly SourceFeedTarget[]): readonly Source[] {
  const unique = new Map<string, Source>();

  for (const target of targets) {
    const key = toFeedTargetKey(target.sourceId, target.feedUrl);
    if (unique.has(key)) {
      continue;
    }

    unique.set(key, toSource(target));
  }

  return Array.from(unique.values());
}

function toFeedTargetKey(sourceId: string, feedUrl: string): string {
  return `${sourceId}|${feedUrl}`;
}

function toNewsQueryCacheKey(query: NewsQuery): string {
  const sourceValue = query.sourceIds.length > 0 ? query.sourceIds.join(',') : '';

  return [
    `id=${query.id ?? ''}`,
    `section=${query.section ?? ''}`,
    `source=${sourceValue}`,
    `q=${query.searchQuery ?? ''}`,
    `page=${query.page}`,
    `limit=${query.limit}`,
  ].join('&');
}

function isExpired(expiresAt: number, timestamp: number): boolean {
  return timestamp >= expiresAt;
}

function logPerf(event: 'cache-hit' | 'cache-miss', details: Record<string, unknown>): void {
  console.info(`[api/news][${event}]`, details);
}

