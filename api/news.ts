import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { buildSourceFeedTargetsFromRecords } from '../src/lib/rss-sources-catalog';
import { fetchFeedsConcurrently } from '../src/lib/feed-fetcher';
import { applyNewsFilters, parseNewsQuery } from '../src/lib/news-query';
import { parseFeedItems } from '../src/lib/rss-parser';
import { dedupeAndSortArticles, normalizeFeedItem } from '../src/lib/rss-normalization';

import type { Article } from '../src/interfaces/article.interface';
import type { NewsResponse } from '../src/interfaces/news-response.interface';
import type { RssSourceRecord } from '../src/interfaces/rss-source-record.interface';
import type { SourceFeedTarget } from '../src/interfaces/source-feed-target.interface';
import type { Source } from '../src/interfaces/source.interface';
import { WARNING_CODE } from '../src/interfaces/warning.interface';
import type { Warning } from '../src/interfaces/warning.interface';

const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'data/rss-sources.json');
const FEED_FETCH_TIMEOUT_MS = 8000;
const CACHE_CONTROL_HEADER_VALUE = 'public, s-maxage=120, stale-while-revalidate=600';

interface ApiErrorResponse {
  readonly error: string;
}

type NewsApiResponse = NewsResponse | ApiErrorResponse;

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
      sendJson(response, 405, { error: 'Method Not Allowed' });
      return;
    }

    let availableSources: readonly SourceFeedTarget[];
    try {
      availableSources = await dependencies.loadSourcesCatalog();
    } catch {
      sendJson(response, 500, { error: 'Unable to load RSS sources catalog' });
      return;
    }

    const query = parseNewsQuery(request.url);
    const selectedFeedTargets = selectFeedTargetsForFetch(availableSources, query.section, query.sourceIds);
    const fetchSources = selectedFeedTargets.map(toSource);
    const fetchResult = await dependencies.fetchFeeds(fetchSources, FEED_FETCH_TIMEOUT_MS);
    const targetsByKey = new Map(
      selectedFeedTargets.map((target) => [toFeedTargetKey(target.sourceId, target.feedUrl), target])
    );
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

    sendJson(response, 200, payload);
  };
}

export default createNewsHandler();

function parseFetchedFeeds(feeds: readonly FeedSuccessLike[], targetsByKey: ReadonlyMap<string, SourceFeedTarget>): ParsedFeedsResult {
  const articles: Article[] = [];
  const warnings: Warning[] = [];

  for (const feed of feeds) {
    const target = targetsByKey.get(toFeedTargetKey(feed.sourceId, feed.feedUrl));
    if (!target) {
      continue;
    }

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
  const json = await readFile(RSS_SOURCES_FILE_PATH, 'utf8');
  const records = parseCatalogRecords(json);
  const feedTargets = buildSourceFeedTargetsFromRecords(records);

  if (feedTargets.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  return feedTargets;
}

function parseCatalogRecords(value: string): readonly RssSourceRecord[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid catalog JSON: expected array');
  }

  const records: RssSourceRecord[] = [];
  for (const item of parsed) {
    if (!isCatalogRecord(item)) {
      continue;
    }

    records.push({
      sourceName: item.sourceName,
      feedUrl: item.feedUrl,
      sectionName: item.sectionName,
    });
  }

  if (records.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  return records;
}

function isCatalogRecord(value: unknown): value is RssSourceRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['sourceName'] === 'string' &&
    typeof candidate['feedUrl'] === 'string' &&
    typeof candidate['sectionName'] === 'string'
  );
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

function toFeedTargetKey(sourceId: string, feedUrl: string): string {
  return `${sourceId}|${feedUrl}`;
}

function sendJson(response: ServerResponse, statusCode: number, body: NewsApiResponse): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader(
    'cache-control',
    isCacheableStatus(statusCode) ? CACHE_CONTROL_HEADER_VALUE : 'no-store, max-age=0'
  );
  response.end(JSON.stringify(body));
}

function isCacheableStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}
