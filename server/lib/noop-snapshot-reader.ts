import type { SnapshotReader } from '../interfaces/snapshot-reader.interface';

const NOOP_SNAPSHOT_READER: SnapshotReader = {
  async getNewsSnapshot() {
    return null;
  },
  async getSourcesSnapshot() {
    return null;
  },
};

export function createNoopSnapshotReader(): SnapshotReader {
  return NOOP_SNAPSHOT_READER;
}
