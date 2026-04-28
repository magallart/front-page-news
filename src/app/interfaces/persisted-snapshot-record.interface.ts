export interface PersistedSnapshotRecord<TSnapshot> {
  readonly key: string;
  readonly snapshot: TSnapshot;
  readonly persistedAtMs: number;
  readonly lastReadAtMs: number;
  readonly staleAtMs: number;
  readonly expiresAtMs: number;
}
