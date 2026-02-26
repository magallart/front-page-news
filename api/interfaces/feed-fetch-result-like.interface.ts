import type { FeedSuccessLike } from './feed-success-like.interface';
import type { Warning } from '../../src/interfaces/warning.interface';

export interface FeedFetchResultLike {
  readonly successes: readonly FeedSuccessLike[];
  readonly warnings: readonly Warning[];
}
