const MINUTE_MS = 60_000;
const HOUR_IN_MINUTES = 60;
const DAY_IN_MINUTES = 1_440;

export const BREAKING_NEWS_TIMESTAMP_FALLBACK = 'Ahora';

export function formatBreakingNewsTimestamp(
  publishedAt: string,
  now: Date = new Date(),
  fallback = BREAKING_NEWS_TIMESTAMP_FALLBACK,
): string {
  const publishedAtTimestamp = Date.parse(publishedAt);
  const nowTimestamp = now.getTime();
  if (!Number.isFinite(publishedAtTimestamp) || !Number.isFinite(nowTimestamp)) {
    return fallback;
  }

  const elapsedMinutes = Math.floor((nowTimestamp - publishedAtTimestamp) / MINUTE_MS);
  if (!Number.isFinite(elapsedMinutes) || elapsedMinutes <= 0) {
    return fallback;
  }

  if (elapsedMinutes < HOUR_IN_MINUTES) {
    return `Hace ${elapsedMinutes} min`;
  }

  if (elapsedMinutes < DAY_IN_MINUTES) {
    return `Hace ${Math.floor(elapsedMinutes / HOUR_IN_MINUTES)} h`;
  }

  return `Hace ${Math.floor(elapsedMinutes / DAY_IN_MINUTES)} d`;
}
