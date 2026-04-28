import type { NewsServiceResultSource } from './news-service-result-source.interface';
import type { NewsQuery } from '../../../shared/interfaces/news-query.interface';
import type { NewsResponse } from '../../../shared/interfaces/news-response.interface';

export interface NewsServiceResult {
  readonly key: string;
  readonly query: NewsQuery;
  readonly response: NewsResponse;
  readonly source: NewsServiceResultSource;
  readonly staleAtMs: number;
  readonly expiresAtMs: number;
  readonly isStale: boolean;
  readonly isRefreshing: boolean;
}
