import type { SnapshotWriter } from '../interfaces/snapshot-writer.interface';

const NOOP_SNAPSHOT_WRITER: SnapshotWriter = {
  async putNewsSnapshot() {
    return;
  },
  async putSourcesSnapshot() {
    return;
  },
};

export function createNoopSnapshotWriter(): SnapshotWriter {
  return NOOP_SNAPSHOT_WRITER;
}
