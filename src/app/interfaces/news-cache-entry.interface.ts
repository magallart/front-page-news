import type { NewsServiceResult } from './news-service-result.interface';

export interface NewsCacheEntry {
  readonly section: string | null;
  readonly result: NewsServiceResult;
  readonly memoryExpiresAt: number;
}

