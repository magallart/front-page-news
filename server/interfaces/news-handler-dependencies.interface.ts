import type { FeedFetchResultLike } from './feed-fetch-result-like.interface';
import type { SnapshotReader } from './snapshot-reader.interface';
import type { SourceFeedTarget } from '../../shared/interfaces/source-feed-target.interface';
import type { Source } from '../../shared/interfaces/source.interface';

export interface NewsHandlerDependencies {
  readonly loadSourcesCatalog: () => Promise<readonly SourceFeedTarget[]>;
  readonly fetchFeeds: (sources: readonly Source[], timeoutMs: number) => Promise<FeedFetchResultLike>;
  readonly snapshotReader: SnapshotReader;
}

