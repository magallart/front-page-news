import type { Article } from '../../shared/interfaces/article.interface';
import type { Warning } from '../../shared/interfaces/warning.interface';

export interface ParsedFeedsResult {
  readonly articles: readonly Article[];
  readonly warnings: readonly Warning[];
}

