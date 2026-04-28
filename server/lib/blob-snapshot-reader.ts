import { toNewsSnapshotKey, toSourcesSnapshotKey } from '../../shared/lib/snapshot-key.js';

import { buildSnapshotBlobUrl, SNAPSHOT_BLOB_BASE_URL_ENV } from './blob-snapshot-path.js';
import { createNoopSnapshotReader } from './noop-snapshot-reader.js';
import { parseNewsSnapshot, parseSourcesSnapshot } from './snapshot-json.js';

import type { SnapshotReader } from '../interfaces/snapshot-reader.interface';
import type { NewsQuery } from '../../shared/interfaces/news-query.interface';
import type { NewsSnapshot } from '../../shared/interfaces/news-snapshot.interface';
import type { SourcesSnapshot } from '../../shared/interfaces/sources-snapshot.interface';

interface BlobSnapshotReaderOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof fetch;
}

export function createBlobSnapshotReader(options: BlobSnapshotReaderOptions = {}): SnapshotReader {
  const fetcher = options.fetch ?? globalThis.fetch;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env[SNAPSHOT_BLOB_BASE_URL_ENV]);

  if (!fetcher || !baseUrl) {
    return createNoopSnapshotReader();
  }

  return {
    async getNewsSnapshot(query: NewsQuery): Promise<NewsSnapshot | null> {
      return loadSnapshot(fetcher, buildSnapshotBlobUrl(baseUrl, toNewsSnapshotKey(query)), parseNewsSnapshot);
    },
    async getSourcesSnapshot(): Promise<SourcesSnapshot | null> {
      return loadSnapshot(fetcher, buildSnapshotBlobUrl(baseUrl, toSourcesSnapshotKey()), parseSourcesSnapshot);
    },
  };
}

async function loadSnapshot<TSnapshot>(
  fetcher: typeof fetch,
  url: string,
  parseSnapshot: (input: string) => TSnapshot | null,
): Promise<TSnapshot | null> {
  try {
    const response = await fetcher(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return parseSnapshot(await response.text());
  } catch {
    return null;
  }
}

function normalizeBaseUrl(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
