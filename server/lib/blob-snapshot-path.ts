export const SNAPSHOT_BLOB_BASE_URL_ENV = 'SNAPSHOT_BLOB_BASE_URL';
const SNAPSHOT_BLOB_PREFIX = 'snapshots';

export function buildSnapshotBlobPath(snapshotKey: string): string {
  return `${SNAPSHOT_BLOB_PREFIX}/${encodeURIComponent(snapshotKey)}.json`;
}

export function buildSnapshotBlobUrl(baseUrl: string, snapshotKey: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${buildSnapshotBlobPath(snapshotKey)}`;
}
