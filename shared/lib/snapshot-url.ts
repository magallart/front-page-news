const SNAPSHOT_BLOB_PREFIX = 'snapshots';

export function normalizeSnapshotBaseUrl(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function buildSnapshotBlobPath(snapshotKey: string): string {
  return `${SNAPSHOT_BLOB_PREFIX}/${encodeURIComponent(snapshotKey)}.json`;
}

export function buildSnapshotBlobUrl(baseUrl: string, snapshotKey: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${buildSnapshotBlobPath(snapshotKey)}`;
}
