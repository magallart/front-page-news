import type { NewsQuery } from '../../shared/interfaces/news-query.interface';

export function toNewsQueryCacheKey(query: NewsQuery): string {
  const sourceValue = query.sourceIds.length > 0 ? query.sourceIds.join(',') : '';

  return [
    `id=${query.id ?? ''}`,
    `section=${query.section ?? ''}`,
    `source=${sourceValue}`,
    `q=${query.searchQuery ?? ''}`,
    `page=${query.page}`,
    `limit=${query.limit}`,
  ].join('&');
}

export function isExpired(expiresAt: number, timestamp: number): boolean {
  return timestamp >= expiresAt;
}

export function logPerf(event: 'cache-hit' | 'cache-miss', details: Record<string, unknown>): void {
  console.info(`[api/news][${event}]`, details);
}

