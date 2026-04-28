import type { NewsQuery } from './news-query.interface';
import type { NewsResponse } from './news-response.interface';
import type { SnapshotEnvelope } from './snapshot-envelope.interface';

export interface NewsSnapshot extends SnapshotEnvelope<NewsResponse, NewsQuery> {
  readonly kind: 'news';
}
