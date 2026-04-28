export interface SnapshotCacheDatabase {
  get<TRecord>(storeName: string, key: string): Promise<TRecord | null>;
  put<TRecord extends { key: string }>(storeName: string, record: TRecord): Promise<void>;
  delete(storeName: string, key: string): Promise<void>;
  getAll<TRecord>(storeName: string): Promise<readonly TRecord[]>;
  clear(storeName: string): Promise<void>;
}
