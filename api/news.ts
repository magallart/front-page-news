import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { buildSourcesResponse } from '../src/lib/rss-sources-catalog';
import { fetchFeedsConcurrently } from '../src/lib/feed-fetcher';
import { applyNewsFilters, parseNewsQuery } from '../src/lib/news-query';
import { parseFeedItems } from '../src/lib/rss-parser';
import { dedupeAndSortArticles, normalizeFeedItem } from '../src/lib/rss-normalization';

import type { Article } from '../src/interfaces/article.interface';
import type { NewsResponse } from '../src/interfaces/news-response.interface';
import type { Source } from '../src/interfaces/source.interface';
import { WARNING_CODE } from '../src/interfaces/warning.interface';
import type { Warning } from '../src/interfaces/warning.interface';

const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'docs/rss-sources.md');
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

export default async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method Not Allowed' });
    return;
  }

  const availableSources = await loadSourcesCatalog();
  const query = parseNewsQuery(request.url);
  const selectedSources = selectSourcesForFetch(availableSources, query.section, query.sourceIds);
  const fetchResult = await fetchFeedsConcurrently(selectedSources, FEED_FETCH_TIMEOUT_MS);
  const sourcesById = new Map(selectedSources.map((source) => [source.id, source]));
  const parseResult = parseFetchedFeeds(fetchResult.successes, sourcesById, query.section);
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
}

interface FeedSuccessLike {
  readonly sourceId: string;
  readonly feedUrl: string;
  readonly body: string;
}

interface ParsedFeedsResult {
  readonly articles: readonly Article[];
  readonly warnings: readonly Warning[];
}

function parseFetchedFeeds(
  feeds: readonly FeedSuccessLike[],
  sourcesById: ReadonlyMap<string, Source>,
  sectionFromQuery: string | null
): ParsedFeedsResult {
  const articles: Article[] = [];
  const warnings: Warning[] = [];

  for (const feed of feeds) {
    const source = sourcesById.get(feed.sourceId);
    if (!source) {
      continue;
    }

    try {
      const sectionSlug = sectionFromQuery ?? source.sectionSlugs[0] ?? 'actualidad';
      const parsed = parseFeedItems({ xml: feed.body, source, sectionSlug });

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
          sourceId: source.id,
          feedUrl: source.feedUrl,
        });
      }
    } catch (error) {
      warnings.push({
        code: WARNING_CODE.SOURCE_PARSE_FAILED,
        message: `Unable to parse feed XML: ${toErrorMessage(error)}`,
        sourceId: source.id,
        feedUrl: source.feedUrl,
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

async function loadSourcesCatalog(): Promise<readonly Source[]> {
  try {
    const markdown = await readFile(RSS_SOURCES_FILE_PATH, 'utf8');
    return buildSourcesResponse(markdown).sources;
  } catch {
    return [];
  }
}

function selectSourcesForFetch(
  sources: readonly Source[],
  sectionSlug: string | null,
  sourceIds: readonly string[]
): readonly Source[] {
  return sources.filter((source) => {
    if (sourceIds.length > 0 && !sourceIds.includes(source.id)) {
      return false;
    }

    if (sectionSlug && !source.sectionSlugs.includes(sectionSlug)) {
      return false;
    }

    return true;
  });
}

function sendJson(response: ServerResponse, statusCode: number, body: NewsApiResponse): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', CACHE_CONTROL_HEADER_VALUE);
  response.end(JSON.stringify(body));
}
