import type { NewsItem } from '../interfaces/news-item.interface';

const MAX_PER_SECTION = 2;
const MAX_PER_SOURCE = 2;
const ROW_SIZE = 3;

export function selectHomeMixedNews(items: readonly NewsItem[], total = 15): readonly NewsItem[] {
  if (items.length <= 1) {
    return items;
  }

  const sortedByRecency = [...items].sort(compareByRecencyDesc);
  const selected: NewsItem[] = [];
  const selectedIds = new Set<string>();
  const sectionCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();

  // Pass 1: maximize section coverage (at least one per section when possible).
  for (const item of sortedByRecency) {
    if (selected.length >= total) {
      break;
    }

    if ((sectionCounts.get(item.section) ?? 0) > 0) {
      continue;
    }

    if ((sourceCounts.get(item.source) ?? 0) >= MAX_PER_SOURCE) {
      continue;
    }

    selectItem(item, selected, selectedIds, sectionCounts, sourceCounts);
  }

  // Pass 2: fill while preserving section/source balance.
  for (const item of sortedByRecency) {
    if (selected.length >= total) {
      break;
    }

    if (selectedIds.has(item.id)) {
      continue;
    }

    if ((sectionCounts.get(item.section) ?? 0) >= MAX_PER_SECTION) {
      continue;
    }

    if ((sourceCounts.get(item.source) ?? 0) >= MAX_PER_SOURCE) {
      continue;
    }

    selectItem(item, selected, selectedIds, sectionCounts, sourceCounts);
  }

  // Pass 3: relax source cap if needed, keep section cap.
  for (const item of sortedByRecency) {
    if (selected.length >= total) {
      break;
    }

    if (selectedIds.has(item.id)) {
      continue;
    }

    if ((sectionCounts.get(item.section) ?? 0) >= MAX_PER_SECTION) {
      continue;
    }

    selectItem(item, selected, selectedIds, sectionCounts, sourceCounts);
  }

  // Pass 4: fallback to raw recency if still not enough.
  for (const item of sortedByRecency) {
    if (selected.length >= total) {
      break;
    }

    if (selectedIds.has(item.id)) {
      continue;
    }

    selectItem(item, selected, selectedIds, sectionCounts, sourceCounts);
  }

  return rebalanceForLayout(selected);
}

export function chunkNewsItems(items: readonly NewsItem[], size = 3): readonly (readonly NewsItem[])[] {
  if (size <= 0 || items.length === 0) {
    return [];
  }

  const rows: NewsItem[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

function selectItem(
  item: NewsItem,
  selected: NewsItem[],
  selectedIds: Set<string>,
  sectionCounts: Map<string, number>,
  sourceCounts: Map<string, number>,
): void {
  selected.push(item);
  selectedIds.add(item.id);
  sectionCounts.set(item.section, (sectionCounts.get(item.section) ?? 0) + 1);
  sourceCounts.set(item.source, (sourceCounts.get(item.source) ?? 0) + 1);
}

function compareByRecencyDesc(first: NewsItem, second: NewsItem): number {
  const firstTimestamp = toTimestamp(first.publishedAt);
  const secondTimestamp = toTimestamp(second.publishedAt);
  return secondTimestamp - firstTimestamp;
}

function rebalanceForLayout(items: readonly NewsItem[]): readonly NewsItem[] {
  if (items.length <= ROW_SIZE) {
    return items;
  }

  const remaining = [...items];
  const balanced: NewsItem[] = [];

  while (remaining.length > 0) {
    const rowStart = balanced.length - (balanced.length % ROW_SIZE);
    const currentRow = balanced.slice(rowStart);
    const previous = balanced.at(-1) ?? null;
    const nextIndex = pickNextIndex(remaining, currentRow, previous);
    const [next] = remaining.splice(nextIndex, 1);
    balanced.push(next);
  }

  return balanced;
}

function pickNextIndex(candidates: readonly NewsItem[], row: readonly NewsItem[], previous: NewsItem | null): number {
  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const score = scoreCandidate(candidate, row, previous);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function scoreCandidate(candidate: NewsItem, row: readonly NewsItem[], previous: NewsItem | null): number {
  let score = 0;

  const sectionInRow = row.some((item) => item.section === candidate.section);
  const sourceInRow = row.some((item) => item.source === candidate.source);
  if (!sectionInRow) {
    score += 3;
  }
  if (!sourceInRow) {
    score += 2;
  }

  if (previous !== null && previous.section !== candidate.section) {
    score += 1;
  }
  if (previous !== null && previous.source !== candidate.source) {
    score += 1;
  }

  return score;
}

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}
