import type { NewsSnapshot } from '../../shared/interfaces/news-snapshot.interface';
import type { SourcesSnapshot } from '../../shared/interfaces/sources-snapshot.interface';

export interface SnapshotWriter {
  putNewsSnapshot(snapshot: NewsSnapshot): Promise<void>;
  putSourcesSnapshot(snapshot: SourcesSnapshot): Promise<void>;
}
