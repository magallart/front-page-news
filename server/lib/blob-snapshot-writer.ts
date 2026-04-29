import { put } from '@vercel/blob';

import { buildSnapshotBlobPath } from './blob-snapshot-path.js';
import { createNoopSnapshotWriter } from './noop-snapshot-writer.js';

import type { SnapshotWriter } from '../interfaces/snapshot-writer.interface';
import type { NewsSnapshot } from '../../shared/interfaces/news-snapshot.interface';
import type { SourcesSnapshot } from '../../shared/interfaces/sources-snapshot.interface';

interface BlobSnapshotWriterOptions {
  readonly put?: typeof put;
  readonly token?: string;
  readonly access?: 'public' | 'private';
}

export const BLOB_READ_WRITE_TOKEN_ENV = 'BLOB_READ_WRITE_TOKEN';

export function createBlobSnapshotWriter(options: BlobSnapshotWriterOptions = {}): SnapshotWriter {
  const putBlob = options.put ?? put;
  const token = normalizeToken(options.token ?? process.env[BLOB_READ_WRITE_TOKEN_ENV]);
  const access = options.access ?? 'public';

  if (!token) {
    return createNoopSnapshotWriter();
  }

  return {
    async putNewsSnapshot(snapshot: NewsSnapshot): Promise<void> {
      await writeSnapshot(putBlob, snapshot, token, access);
    },
    async putSourcesSnapshot(snapshot: SourcesSnapshot): Promise<void> {
      await writeSnapshot(putBlob, snapshot, token, access);
    },
  };
}

async function writeSnapshot(
  putBlob: typeof put,
  snapshot: NewsSnapshot | SourcesSnapshot,
  token: string,
  access: 'public' | 'private',
): Promise<void> {
  await putBlob(buildSnapshotBlobPath(snapshot.key), JSON.stringify(snapshot), {
    access,
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json; charset=utf-8',
  });
}

function normalizeToken(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
