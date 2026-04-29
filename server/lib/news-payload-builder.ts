import { applyNewsFilters } from './news-query.js';
import {
  buildTargetsLookup,
  buildUniqueFetchSources,
  optimizeFeedTargetsForQuery,
  resolveFetchTimeoutMs,
  selectFeedTargetsForFetch,
  toFeedTargetKey,
} from './news-feed-selection.js';
import { parseFetchedFeeds } from './news-feed-parsing.js';
import { dedupeAndSortArticles } from './rss-normalization.js';

import type { NewsHandlerDependencies } from '../interfaces/news-handler-dependencies.interface';
import type { FeedFetchResultLike } from '../interfaces/feed-fetch-result-like.interface';
import type { NewsPayloadBuildResult } from '../interfaces/news-payload-build-result.interface';
import type { NewsQuery } from '../../shared/interfaces/news-query.interface';
import type { SourceFeedTarget } from '../../shared/interfaces/source-feed-target.interface';
import type { Warning } from '../../shared/interfaces/warning.interface';

export class SourcesCatalogLoadError extends Error {}

export async function buildNewsPayload(
  dependencies: NewsHandlerDependencies,
  query: NewsQuery,
  now: () => number,
): Promise<NewsPayloadBuildResult> {
  const catalogStartedAt = now();
  let availableSources: readonly SourceFeedTarget[];
  try {
    availableSources = await dependencies.loadSourcesCatalog();
  } catch {
    throw new SourcesCatalogLoadError('Unable to load RSS sources catalog');
  }
  const catalogMs = now() - catalogStartedAt;

  const selectedFeedTargets = selectTargetsForNewsQuery(availableSources, query);
  const fetchSources = buildUniqueFetchSources(selectedFeedTargets);
  const fetchTimeoutMs = resolveFetchTimeoutMs(query);

  const fetchStartedAt = now();
  const fetchResult = await dependencies.fetchFeeds(fetchSources, fetchTimeoutMs);
  const fetchMs = now() - fetchStartedAt;

  return buildNewsPayloadFromFetchResult(query, selectedFeedTargets, fetchResult, now, {
    catalogMs,
    fetchMs,
  });
}

export function selectTargetsForNewsQuery(
  availableSources: readonly SourceFeedTarget[],
  query: NewsQuery,
): readonly SourceFeedTarget[] {
  const selectedFeedTargets = selectFeedTargetsForFetch(availableSources, query.section, query.sourceIds);
  return optimizeFeedTargetsForQuery(selectedFeedTargets, query);
}

export function buildNewsPayloadFromFetchResult(
  query: NewsQuery,
  selectedFeedTargets: readonly SourceFeedTarget[],
  fetchResult: FeedFetchResultLike,
  now: () => number,
  timings: {
    readonly catalogMs: number;
    readonly fetchMs: number;
  },
  options: {
    readonly warningScope?: 'all' | 'selected-targets';
  } = {},
): NewsPayloadBuildResult {
  const parseAndFilterStartedAt = now();
  const targetsByKey = buildTargetsLookup(selectedFeedTargets);
  const selectedTargetKeys = new Set(targetsByKey.keys());
  const relevantSuccesses = fetchResult.successes.filter((feed) =>
    selectedTargetKeys.has(toFeedTargetKey(feed.sourceId, feed.feedUrl)),
  );
  const parseResult = parseFetchedFeeds(relevantSuccesses, targetsByKey);
  const deduped = dedupeAndSortArticles(parseResult.articles);
  const filtered = applyNewsFilters(deduped, query);
  const parseAndFilterMs = now() - parseAndFilterStartedAt;

  return {
    payload: {
      articles: filtered.articles,
      total: filtered.total,
      page: filtered.page,
      limit: filtered.limit,
      warnings: [
        ...resolveFetchWarnings(fetchResult.warnings, selectedTargetKeys, options.warningScope ?? 'all'),
        ...parseResult.warnings,
      ],
    },
    timings: {
      ...timings,
      parseAndFilterMs,
    },
  };
}

function resolveFetchWarnings(
  warnings: readonly Warning[],
  selectedTargetKeys: ReadonlySet<string>,
  warningScope: 'all' | 'selected-targets',
): readonly Warning[] {
  if (warningScope === 'all') {
    return warnings;
  }

  return warnings.filter((warning) => {
    if (!warning.sourceId || !warning.feedUrl) {
      return true;
    }

    return selectedTargetKeys.has(toFeedTargetKey(warning.sourceId, warning.feedUrl));
  });
}

