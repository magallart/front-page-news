import type { RawFeedItem } from './raw-feed-item.interface';

export interface ParsedFeedItems {
  readonly items: readonly RawFeedItem[];
}
