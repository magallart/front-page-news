import { WARNING_CODE } from '../constants/warning-code.constants.js';
import { parseFeedItems } from './rss-parser.js';
import { normalizeFeedItem } from './rss-normalization.js';

import { toFeedTargetKey, toSource } from './news-feed-selection.js';

import type { FeedSuccessLike } from '../interfaces/feed-success-like.interface';
import type { ParsedFeedsResult } from '../interfaces/parsed-feeds-result.interface';
import type { SourceFeedTarget } from '../../src/interfaces/source-feed-target.interface';
import type { Article } from '../../src/interfaces/article.interface';
import type { Warning } from '../../src/interfaces/warning.interface';

export function parseFetchedFeeds(
  feeds: readonly FeedSuccessLike[],
  targetsByKey: ReadonlyMap<string, readonly SourceFeedTarget[]>,
): ParsedFeedsResult {
  const articles: Article[] = [];
  const warnings: Warning[] = [];

  for (const feed of feeds) {
    const targets = targetsByKey.get(toFeedTargetKey(feed.sourceId, feed.feedUrl));
    if (!targets || targets.length === 0) {
      continue;
    }

    for (const target of targets) {
      try {
        const parsed = parseFeedItems({
          xml: feed.body,
          source: toSource(target),
          sectionSlug: target.sectionSlug,
        });

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
            sourceId: target.sourceId,
            feedUrl: target.feedUrl,
          });
        }
      } catch (error) {
        warnings.push({
          code: WARNING_CODE.SOURCE_PARSE_FAILED,
          message: `Unable to parse feed XML: ${toErrorMessage(error)}`,
          sourceId: target.sourceId,
          feedUrl: target.feedUrl,
        });
      }
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
