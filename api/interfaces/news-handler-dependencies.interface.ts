import type { FeedFetchResultLike } from './feed-fetch-result-like.interface';
import type { SourceFeedTarget } from '../../src/interfaces/source-feed-target.interface';
import type { Source } from '../../src/interfaces/source.interface';

export interface NewsHandlerDependencies {
  readonly loadSourcesCatalog: () => Promise<readonly SourceFeedTarget[]>;
  readonly fetchFeeds: (sources: readonly Source[], timeoutMs: number) => Promise<FeedFetchResultLike>;
}
