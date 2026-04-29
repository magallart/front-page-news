import { buildBaseNewsSnapshotQueries } from '../constants/snapshot.constants.js';
import { WARNING_CODE } from '../constants/warning-code.constants.js';
import {
  buildNewsPayloadFromFetchResult,
  selectTargetsForNewsQuery,
} from './news-payload-builder.js';
import { buildNewsSnapshot, buildSourcesSnapshot } from './snapshot-builder.js';
import { buildUniqueFetchSources, resolveFetchTimeoutMs } from './news-feed-selection.js';
import { buildSourceFeedTargetsFromRecords, buildSourcesResponseFromRecords } from './rss-sources-catalog.js';
import { toNewsSnapshotKey, toSourcesSnapshotKey } from '../../shared/lib/snapshot-key.js';

import type { FeedFetchResultLike } from '../interfaces/feed-fetch-result-like.interface';
import type { SnapshotWriter } from '../interfaces/snapshot-writer.interface';
import type { NewsQuery } from '../../shared/interfaces/news-query.interface';
import type { NewsResponse } from '../../shared/interfaces/news-response.interface';
import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { Source } from '../../shared/interfaces/source.interface';
import type { SourceFeedTarget } from '../../shared/interfaces/source-feed-target.interface';
import type { WarningCode } from '../../shared/interfaces/warning-code.interface';

export interface BaseSnapshotRegenerationDependencies {
  readonly loadCatalogRecords: () => Promise<readonly RssSourceRecord[]>;
  readonly fetchFeeds: (sources: readonly Source[], timeoutMs: number) => Promise<FeedFetchResultLike>;
  readonly snapshotWriter: SnapshotWriter;
  readonly now?: () => number;
  readonly logger?: Pick<typeof console, 'info'>;
}

export interface BaseSnapshotRegenerationResult {
  readonly newsSnapshots: number;
  readonly sourcesSnapshots: number;
  readonly keys: readonly string[];
  readonly attemptedKeys: readonly string[];
  readonly persistedKeys: readonly string[];
  readonly skippedKeys: readonly string[];
  readonly skippedReasons: Readonly<Record<string, string>>;
  readonly warningsCount: number;
}

export async function regenerateBaseSnapshots(
  dependencies: BaseSnapshotRegenerationDependencies,
): Promise<BaseSnapshotRegenerationResult> {
  const now = dependencies.now ?? (() => Date.now());
  const logger = dependencies.logger;
  const catalogRecords = await dependencies.loadCatalogRecords();
  const feedTargets = buildSourceFeedTargetsFromRecords(catalogRecords);
  if (feedTargets.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  const newsQueries = buildBaseNewsSnapshotQueries();
  const homepageQuery = newsQueries.find((query) => query.section === null) ?? null;
  const sectionQueries = newsQueries.filter((query) => query.section !== null);
  const attemptedKeys = newsQueries.map((query) => toNewsSnapshotKey(query));
  const persistedKeys: string[] = [];
  const skippedKeys: string[] = [];
  const skippedReasons = new Map<string, string>();
  let warningsCount = 0;

  const queryPayloads = new Map<string, ReturnType<typeof buildNewsPayloadFromFetchResult>['payload']>();

  if (homepageQuery) {
    const homepageTargets = selectTargetsForNewsQuery(feedTargets, homepageQuery);
    const homepageFetchResult = await dependencies.fetchFeeds(
      buildUniqueFetchSources(homepageTargets),
      resolveFetchTimeoutMs(homepageQuery),
    );
    const homepagePayload = buildNewsPayloadFromFetchResult(homepageQuery, homepageTargets, homepageFetchResult, now, {
      catalogMs: 0,
      fetchMs: 0,
    }, {
      warningScope: 'selected-targets',
    }).payload;
    queryPayloads.set(toQueryKey(homepageQuery), homepagePayload);
  }

  if (sectionQueries.length > 0) {
    const sectionTargets = buildSharedTargetsForQueries(feedTargets, sectionQueries);
    const sectionFetchResult = await dependencies.fetchFeeds(
      buildUniqueFetchSources(sectionTargets),
      resolveFetchTimeoutMs(sectionQueries[0] as NewsQuery),
    );

    for (const query of sectionQueries) {
      const selectedTargets = selectTargetsForNewsQuery(feedTargets, query);
      const payload = buildNewsPayloadFromFetchResult(query, selectedTargets, sectionFetchResult, now, {
        catalogMs: 0,
        fetchMs: 0,
      }, {
        warningScope: 'selected-targets',
      }).payload;
      queryPayloads.set(toQueryKey(query), payload);
    }
  }

  for (const query of newsQueries) {
    const key = toNewsSnapshotKey(query);
    const payload = queryPayloads.get(toQueryKey(query));
    warningsCount += payload?.warnings.length ?? 0;

    const skipReason = payload ? getSkipReason(payload) : 'payload_missing';
    if (!payload || skipReason !== null) {
      skippedKeys.push(key);
      skippedReasons.set(key, skipReason ?? 'payload_missing');
      logger?.info('[server/lib/base-snapshot-regeneration][skipped]', {
        key,
        reason: skipReason ?? 'payload_missing',
        warningsCount: payload?.warnings.length ?? 0,
        articlesCount: payload?.articles.length ?? 0,
      });
      continue;
    }

    const snapshot = buildNewsSnapshot(query, payload, now());
    await dependencies.snapshotWriter.putNewsSnapshot(snapshot);
    persistedKeys.push(snapshot.key);
    logger?.info('[server/lib/base-snapshot-regeneration][persisted]', {
      key: snapshot.key,
      warningsCount: payload.warnings.length,
      articlesCount: payload.articles.length,
    });
  }

  const sourcesSnapshot = buildSourcesSnapshot(buildSourcesResponseFromRecords(catalogRecords), now());
  await dependencies.snapshotWriter.putSourcesSnapshot(sourcesSnapshot);
  persistedKeys.push(sourcesSnapshot.key);
  attemptedKeys.push(toSourcesSnapshotKey());
  logger?.info('[server/lib/base-snapshot-regeneration][persisted]', {
    key: sourcesSnapshot.key,
    warningsCount: 0,
    articlesCount: 0,
  });

  return {
    newsSnapshots: newsQueries.length,
    sourcesSnapshots: 1,
    keys: persistedKeys,
    attemptedKeys,
    persistedKeys,
    skippedKeys,
    skippedReasons: Object.fromEntries(skippedReasons),
    warningsCount,
  };
}

function buildSharedTargetsForQueries(
  feedTargets: readonly SourceFeedTarget[],
  queries: readonly NewsQuery[],
): readonly SourceFeedTarget[] {
  const byKey = new Map<string, SourceFeedTarget>();

  for (const query of queries) {
    for (const target of selectTargetsForNewsQuery(feedTargets, query)) {
      const key = `${target.sourceId}|${target.feedUrl}|${target.sectionSlug}`;
      if (!byKey.has(key)) {
        byKey.set(key, target);
      }
    }
  }

  return Array.from(byKey.values());
}

function toQueryKey(query: NewsQuery): string {
  return JSON.stringify(query);
}

const PERSIST_BLOCKING_WARNING_CODES: ReadonlySet<WarningCode> = new Set([
  WARNING_CODE.SOURCE_FETCH_FAILED,
  WARNING_CODE.SOURCE_PARSE_FAILED,
  WARNING_CODE.SOURCE_TIMEOUT,
]);

function getSkipReason(payload: Pick<NewsResponse, 'articles' | 'warnings'>): string | null {
  if (payload.articles.length === 0) {
    return 'empty_payload';
  }

  if (payload.warnings.some((warning) => PERSIST_BLOCKING_WARNING_CODES.has(warning.code))) {
    return 'blocking_warning';
  }

  return null;
}
