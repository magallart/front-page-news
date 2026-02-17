import type { Article } from './article.interface';
import type { Warning } from './warning.interface';

export interface NewsResponse {
  readonly articles: readonly Article[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly warnings: readonly Warning[];
}
