import { toNewsResponseFingerprint } from './article-identity';

import type { NewsResponse } from '../interfaces/news-response.interface';

export function areNewsResponsesEqual(left: NewsResponse, right: NewsResponse): boolean {
  return toNewsResponseFingerprint(left) === toNewsResponseFingerprint(right);
}
