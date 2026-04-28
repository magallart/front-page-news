import type { NewsQuery } from '../../shared/interfaces/news-query.interface';
import type { NewsSnapshot } from '../../shared/interfaces/news-snapshot.interface';
import type { SourcesSnapshot } from '../../shared/interfaces/sources-snapshot.interface';

export interface SnapshotReader {
  getNewsSnapshot(query: NewsQuery): Promise<NewsSnapshot | null>;
  getSourcesSnapshot(): Promise<SourcesSnapshot | null>;
}
