import { applyNewsFilters } from './news-query.js';
import {
  buildTargetsLookup,
  buildUniqueFetchSources,
  optimizeFeedTargetsForQuery,
  resolveFetchTimeoutMs,
  selectFeedTargetsForFetch,
} from './news-feed-selection.js';
import { parseFetchedFeeds } from './news-feed-parsing.js';
import { dedupeAndSortArticles } from './rss-normalization.js';

import type { NewsHandlerDependencies } from '../interfaces/news-handler-dependencies.interface';
import type { NewsPayloadBuildResult } from '../interfaces/news-payload-build-result.interface';
import type { NewsQuery } from '../../shared/interfaces/news-query.interface';
import type { SourceFeedTarget } from '../../shared/interfaces/source-feed-target.interface';

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

  return {
    payload: {
      articles: filtered.articles,
      total: filtered.total,
      page: filtered.page,
      limit: filtered.limit,
      warnings: [...fetchResult.warnings, ...parseResult.warnings],
    },
    timings: {
      catalogMs,
      fetchMs,
      parseAndFilterMs,
    },
  };
}

