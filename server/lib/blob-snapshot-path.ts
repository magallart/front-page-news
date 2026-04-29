import { buildSnapshotBlobPath as buildSharedSnapshotBlobPath, buildSnapshotBlobUrl as buildSharedSnapshotBlobUrl } from '../../shared/lib/snapshot-url.js';

export const SNAPSHOT_BLOB_BASE_URL_ENV = 'SNAPSHOT_BLOB_BASE_URL';

export function buildSnapshotBlobPath(snapshotKey: string): string {
  return buildSharedSnapshotBlobPath(snapshotKey);
}

export function buildSnapshotBlobUrl(baseUrl: string, snapshotKey: string): string {
  return buildSharedSnapshotBlobUrl(baseUrl, snapshotKey);
}
