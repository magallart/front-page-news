import type { NewsResponse } from '../../interfaces/news-response.interface';
import type { Observable } from 'rxjs';

export interface NewsCacheEntry {
  readonly section: string | null;
  readonly response$: Observable<NewsResponse>;
  readonly expiresAt: number;
}
