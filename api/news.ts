import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { buildSourcesResponse } from '../src/lib/rss-sources-catalog';
import { fetchFeedsConcurrently } from '../src/lib/feed-fetcher';
import { applyNewsFilters, parseNewsQuery } from '../src/lib/news-query';

import type { Article } from '../src/interfaces/article.interface';
import type { NewsResponse } from '../src/interfaces/news-response.interface';
import type { Source } from '../src/interfaces/source.interface';

const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'docs/rss-sources.md');
const FEED_FETCH_TIMEOUT_MS = 8000;

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
  const aggregatedArticles: readonly Article[] = [];
  const query = parseNewsQuery(request.url);
  const selectedSources = selectSourcesForFetch(availableSources, query.section, query.sourceIds);
  const fetchResult = await fetchFeedsConcurrently(selectedSources, FEED_FETCH_TIMEOUT_MS);
  const filtered = applyNewsFilters(aggregatedArticles, query);

  const payload: NewsResponse = {
    articles: filtered.articles,
    total: filtered.total,
    page: filtered.page,
    limit: filtered.limit,
    warnings: fetchResult.warnings,
  };

  sendJson(response, 200, payload);
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
  response.end(JSON.stringify(body));
}
