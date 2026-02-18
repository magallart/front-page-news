import type { SourcesResponse } from '../../interfaces/sources-response.interface';
import type { Observable } from 'rxjs';

export interface SourcesCacheEntry {
  readonly response$: Observable<SourcesResponse>;
  readonly expiresAt: number;
}
