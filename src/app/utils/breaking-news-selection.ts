import { normalizeSourceKey } from './source-key';

import type { NewsItem } from '../interfaces/news-item.interface';

const BREAKING_MAX_PER_SOURCE = 2;

export function selectBreakingNews(items: readonly NewsItem[], total = 6): readonly NewsItem[] {
  if (items.length <= 1) {
    return items.slice(0, total);
  }

  const sortedByRecency = [...items].sort(compareByRecencyDesc);
  const selected: NewsItem[] = [];
  const selectedIds = new Set<string>();
  const selectedBySource = new Map<string, number>();

  // Pass 1: maximize source diversity.
  for (const item of sortedByRecency) {
    if (selected.length >= total) {
      break;
    }

    const sourceKey = normalizeSourceKey(item.source);
    if ((selectedBySource.get(sourceKey) ?? 0) > 0) {
      continue;
    }

    selectItem(item, selected, selectedIds, selectedBySource);
  }

  // Pass 2: fill remaining slots with per-source cap.
  for (const item of sortedByRecency) {
    if (selected.length >= total) {
      break;
    }

    if (selectedIds.has(item.id)) {
      continue;
    }

    const sourceKey = normalizeSourceKey(item.source);
    if ((selectedBySource.get(sourceKey) ?? 0) >= BREAKING_MAX_PER_SOURCE) {
      continue;
    }

    selectItem(item, selected, selectedIds, selectedBySource);
  }

  // Pass 3: fallback to pure recency if dataset is very narrow.
  for (const item of sortedByRecency) {
    if (selected.length >= total) {
      break;
    }

    if (selectedIds.has(item.id)) {
      continue;
    }

    selectItem(item, selected, selectedIds, selectedBySource);
  }

  return selected;
}

function selectItem(
  item: NewsItem,
  selected: NewsItem[],
  selectedIds: Set<string>,
  selectedBySource: Map<string, number>,
): void {
  selected.push(item);
  selectedIds.add(item.id);
  const sourceKey = normalizeSourceKey(item.source);
  selectedBySource.set(sourceKey, (selectedBySource.get(sourceKey) ?? 0) + 1);
}

function compareByRecencyDesc(first: NewsItem, second: NewsItem): number {
  const firstTimestamp = toTimestamp(first.publishedAt);
  const secondTimestamp = toTimestamp(second.publishedAt);
  return secondTimestamp - firstTimestamp;
}

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}
