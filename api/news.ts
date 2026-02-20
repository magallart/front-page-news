import { resolve } from 'node:path';


import { WARNING_CODE } from '../src/interfaces/warning.interface.js';
import { fetchFeedsConcurrently } from '../src/lib/feed-fetcher.js';
import { applyNewsFilters, parseNewsQuery } from '../src/lib/news-query.js';
import { dedupeAndSortArticles, normalizeFeedItem } from '../src/lib/rss-normalization.js';
import { parseFeedItems } from '../src/lib/rss-parser.js';
import { buildSourceFeedTargetsFromRecords } from '../src/lib/rss-sources-catalog.js';

import { loadRssCatalogRecords } from './lib/rss-catalog.js';
import { sendJson } from './lib/send-json.js';

import type { Article } from '../src/interfaces/article.interface';
import type { NewsResponse } from '../src/interfaces/news-response.interface';
import type { SourceFeedTarget } from '../src/interfaces/source-feed-target.interface';
import type { Source } from '../src/interfaces/source.interface';
import type { Warning } from '../src/interfaces/warning.interface';
import type { IncomingMessage, ServerResponse } from 'node:http';

const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'data/rss-sources.json');
const FEED_FETCH_TIMEOUT_MS = 8000;
const CACHE_CONTROL_HEADER_VALUE = 'public, s-maxage=120, stale-while-revalidate=600';

export const config = {
  includeFiles: ['data/rss-sources.json'],
};

interface ApiRequest extends IncomingMessage {
  readonly method?: string;
  readonly url?: string;
}

interface FeedSuccessLike {
  readonly sourceId: string;
  readonly feedUrl: string;
  readonly body: string;
}

interface FeedFetchResultLike {
  readonly successes: readonly FeedSuccessLike[];
  readonly warnings: readonly Warning[];
}

interface NewsHandlerDependencies {
  readonly loadSourcesCatalog: () => Promise<readonly SourceFeedTarget[]>;
  readonly fetchFeeds: (sources: readonly Source[], timeoutMs: number) => Promise<FeedFetchResultLike>;
}

interface ParsedFeedsResult {
  readonly articles: readonly Article[];
  readonly warnings: readonly Warning[];
}

const defaultDependencies: NewsHandlerDependencies = {
  loadSourcesCatalog,
  fetchFeeds: fetchFeedsConcurrently,
};

export function createNewsHandler(overrides: Partial<NewsHandlerDependencies> = {}) {
  const dependencies: NewsHandlerDependencies = {
    ...defaultDependencies,
    ...overrides,
  };

  return async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method Not Allowed' }, CACHE_CONTROL_HEADER_VALUE);
      return;
    }

    let availableSources: readonly SourceFeedTarget[];
    try {
      availableSources = await dependencies.loadSourcesCatalog();
    } catch {
      sendJson(response, 500, { error: 'Unable to load RSS sources catalog' }, CACHE_CONTROL_HEADER_VALUE);
      return;
    }

    const query = parseNewsQuery(request.url);
    const selectedFeedTargets = selectFeedTargetsForFetch(availableSources, query.section, query.sourceIds);
    const fetchSources = buildUniqueFetchSources(selectedFeedTargets);
    const fetchResult = await dependencies.fetchFeeds(fetchSources, FEED_FETCH_TIMEOUT_MS);
    const targetsByKey = buildTargetsLookup(selectedFeedTargets);
    const parseResult = parseFetchedFeeds(fetchResult.successes, targetsByKey);
    const deduped = dedupeAndSortArticles(parseResult.articles);
    const filtered = applyNewsFilters(deduped, query);

    const payload: NewsResponse = {
      articles: filtered.articles,
      total: filtered.total,
      page: filtered.page,
      limit: filtered.limit,
      warnings: [...fetchResult.warnings, ...parseResult.warnings],
    };

    sendJson(response, 200, payload, CACHE_CONTROL_HEADER_VALUE);
  };
}

export default createNewsHandler();

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

