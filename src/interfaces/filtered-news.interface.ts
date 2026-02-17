import type { Article } from './article.interface';

export interface FilteredNews {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly articles: readonly Article[];
}
