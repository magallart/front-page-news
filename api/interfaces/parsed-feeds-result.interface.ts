import type { Article } from '../../src/interfaces/article.interface';
import type { Warning } from '../../src/interfaces/warning.interface';

export interface ParsedFeedsResult {
  readonly articles: readonly Article[];
  readonly warnings: readonly Warning[];
}
