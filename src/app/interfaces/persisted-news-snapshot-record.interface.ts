import type { PersistedSnapshotRecord } from './persisted-snapshot-record.interface';
import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';

export type PersistedNewsSnapshotRecord = PersistedSnapshotRecord<NewsSnapshot>;
