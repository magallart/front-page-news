import type { NewsItem } from '../interfaces/news-item.interface';

const FEATURED_NEWS_LIMIT = 5;
const FEATURED_MAX_PER_SOURCE = 2;

export function selectFeaturedNews(items: readonly NewsItem[]): readonly NewsItem[] {
  const itemsWithImage = items.filter((item) => hasFeaturedImage(item.imageUrl));
  if (itemsWithImage.length <= 1) {
    return itemsWithImage;
  }

  const sortedByRecency = [...itemsWithImage].sort(compareByRecencyDesc);
  const selectedIds = new Set<string>();
  const selectedPerSource = new Map<string, number>();
  const selected: NewsItem[] = [];

  // How it works:
  // 1) Pick the newest article per section to maximize diversity.
  // 2) Fill remaining slots by global recency.
  // In both passes, each source is capped to avoid dominance.

  const firstBySection = new Map<string, NewsItem>();
  for (const item of sortedByRecency) {
    if (!firstBySection.has(item.section)) {
      firstBySection.set(item.section, item);
    }
  }

  for (const item of firstBySection.values()) {
    if (selected.length >= FEATURED_NEWS_LIMIT) {
      break;
    }

    if (canSelectFromSource(item.source, selectedPerSource)) {
      selectItem(item, selected, selectedIds, selectedPerSource);
    }
  }

  for (const item of sortedByRecency) {
    if (selected.length >= FEATURED_NEWS_LIMIT) {
      break;
    }

    if (selectedIds.has(item.id)) {
      continue;
    }

    if (!canSelectFromSource(item.source, selectedPerSource)) {
      continue;
    }

    selectItem(item, selected, selectedIds, selectedPerSource);
  }

  return selected;
}

function hasFeaturedImage(imageUrl: string): boolean {
  const normalized = imageUrl.trim();
  return normalized.length > 0 && normalized !== '/images/no-image.jpg';
}

function canSelectFromSource(
  source: string,
  selectedPerSource: ReadonlyMap<string, number>,
): boolean {
  return (selectedPerSource.get(source) ?? 0) < FEATURED_MAX_PER_SOURCE;
}

function selectItem(
  item: NewsItem,
  selected: NewsItem[],
  selectedIds: Set<string>,
  selectedPerSource: Map<string, number>,
): void {
  selected.push(item);
  selectedIds.add(item.id);
  selectedPerSource.set(item.source, (selectedPerSource.get(item.source) ?? 0) + 1);
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
