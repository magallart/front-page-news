import { buildBaseNewsSnapshotQueries } from '../constants/snapshot.constants.js';
import { WARNING_CODE } from '../constants/warning-code.constants.js';
import { buildNewsPayload } from './news-payload-builder.js';
import { createNoopSnapshotReader } from './noop-snapshot-reader.js';
import { buildNewsSnapshot, buildSourcesSnapshot } from './snapshot-builder.js';
import { buildSourceFeedTargetsFromRecords, buildSourcesResponseFromRecords } from './rss-sources-catalog.js';

import type { FeedFetchResultLike } from '../interfaces/feed-fetch-result-like.interface';
import type { SnapshotWriter } from '../interfaces/snapshot-writer.interface';
import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { Source } from '../../shared/interfaces/source.interface';
import type { WarningCode } from '../../shared/interfaces/warning-code.interface';

export interface BaseSnapshotRegenerationDependencies {
  readonly loadCatalogRecords: () => Promise<readonly RssSourceRecord[]>;
  readonly fetchFeeds: (sources: readonly Source[], timeoutMs: number) => Promise<FeedFetchResultLike>;
  readonly snapshotWriter: SnapshotWriter;
  readonly now?: () => number;
}

export interface BaseSnapshotRegenerationResult {
  readonly newsSnapshots: number;
  readonly sourcesSnapshots: number;
  readonly keys: readonly string[];
}

export async function regenerateBaseSnapshots(
  dependencies: BaseSnapshotRegenerationDependencies,
): Promise<BaseSnapshotRegenerationResult> {
  const now = dependencies.now ?? (() => Date.now());
  const catalogRecords = await dependencies.loadCatalogRecords();
  const feedTargets = buildSourceFeedTargetsFromRecords(catalogRecords);
  if (feedTargets.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  const loadSourcesCatalog = async () => feedTargets;
  const newsQueries = buildBaseNewsSnapshotQueries();
  const generatedKeys: string[] = [];

  for (const query of newsQueries) {
    const { payload } = await buildNewsPayload(
      {
        loadSourcesCatalog,
        fetchFeeds: dependencies.fetchFeeds,
        snapshotReader: createNoopSnapshotReader(),
      },
      query,
      now,
    );

    if (!shouldPersistNewsPayload(payload)) {
      continue;
    }

    const snapshot = buildNewsSnapshot(query, payload, now());
    await dependencies.snapshotWriter.putNewsSnapshot(snapshot);
    generatedKeys.push(snapshot.key);
  }

  const sourcesSnapshot = buildSourcesSnapshot(buildSourcesResponseFromRecords(catalogRecords), now());
  await dependencies.snapshotWriter.putSourcesSnapshot(sourcesSnapshot);
  generatedKeys.push(sourcesSnapshot.key);

  return {
    newsSnapshots: newsQueries.length,
    sourcesSnapshots: 1,
    keys: generatedKeys,
  };
}

const PERSIST_BLOCKING_WARNING_CODES: ReadonlySet<WarningCode> = new Set([
  WARNING_CODE.SOURCE_FETCH_FAILED,
  WARNING_CODE.SOURCE_PARSE_FAILED,
  WARNING_CODE.SOURCE_TIMEOUT,
]);

function shouldPersistNewsPayload(payload: {
  readonly articles: readonly unknown[];
  readonly warnings: readonly { code: WarningCode }[];
}): boolean {
  if (payload.articles.length === 0) {
    return false;
  }

  return !payload.warnings.some((warning) => PERSIST_BLOCKING_WARNING_CODES.has(warning.code));
}
