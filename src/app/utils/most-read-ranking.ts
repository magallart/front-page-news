import type { NewsItem } from '../interfaces/news-item.interface';

const MOST_READ_RECENCY_WEIGHT = 0.7;
const MOST_READ_SOURCE_REPEAT_WEIGHT = 0.3;
const MOST_READ_WINDOW_MS = 48 * 60 * 60 * 1000;
const MOST_READ_MAX_PER_SOURCE = 3;

export function rankMostReadNews(items: readonly NewsItem[], nowMs = Date.now()): readonly NewsItem[] {
  if (items.length === 0) {
    return [];
  }

  // Ranking strategy:
  // 1) Score each article by weighted recency and source repetition in the current dataset.
  // 2) Sort by score (and recency as tie-breaker).
  // 3) Apply a per-source cap to avoid one outlet dominating the list.

  const sourceFrequency = new Map<string, number>();
  for (const item of items) {
    const current = sourceFrequency.get(item.source) ?? 0;
    sourceFrequency.set(item.source, current + 1);
  }

  const maxSourceFrequency = Math.max(...sourceFrequency.values());

  const scored = items.map((item) => {
    const timestamp = Date.parse(item.publishedAt);
    const recencyScore = toRecencyScore(timestamp, nowMs);
    const sourceRepeatScore = toSourceRepeatScore(sourceFrequency.get(item.source) ?? 0, maxSourceFrequency);
    const score = recencyScore * MOST_READ_RECENCY_WEIGHT + sourceRepeatScore * MOST_READ_SOURCE_REPEAT_WEIGHT;

    return {
      item,
      timestamp,
      score,
    };
  });

  scored.sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }

    const firstTimestamp = Number.isFinite(first.timestamp) ? first.timestamp : Number.NEGATIVE_INFINITY;
    const secondTimestamp = Number.isFinite(second.timestamp) ? second.timestamp : Number.NEGATIVE_INFINITY;
    return secondTimestamp - firstTimestamp;
  });

  const result: NewsItem[] = [];
  const selectedPerSource = new Map<string, number>();

  for (const candidate of scored) {
    const selectedCount = selectedPerSource.get(candidate.item.source) ?? 0;
    if (selectedCount >= MOST_READ_MAX_PER_SOURCE) {
      continue;
    }

    result.push(candidate.item);
    selectedPerSource.set(candidate.item.source, selectedCount + 1);
  }

  return result;
}

function toRecencyScore(timestamp: number, nowMs: number): number {
  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  const ageMs = Math.max(0, nowMs - timestamp);
  if (ageMs >= MOST_READ_WINDOW_MS) {
    return 0;
  }

  return 1 - ageMs / MOST_READ_WINDOW_MS;
}

function toSourceRepeatScore(sourceFrequency: number, maxSourceFrequency: number): number {
  if (maxSourceFrequency <= 1) {
    return 0;
  }

  return (sourceFrequency - 1) / (maxSourceFrequency - 1);
}
