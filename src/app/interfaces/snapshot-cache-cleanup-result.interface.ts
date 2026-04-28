export interface SnapshotCacheCleanupResult {
  readonly newsSnapshotsRemoved: number;
  readonly sourcesSnapshotsRemoved: number;
  readonly totalRemoved: number;
}
