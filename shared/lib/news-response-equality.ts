import type { NewsResponse } from '../interfaces/news-response.interface';

export function areNewsResponsesEqual(left: NewsResponse, right: NewsResponse): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
