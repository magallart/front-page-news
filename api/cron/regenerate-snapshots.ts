import { RSS_SOURCES_FILE_PATH } from '../../server/constants/news.constants.js';
import { CRON_SECRET_ENV } from '../../server/constants/snapshot.constants.js';
import { regenerateBaseSnapshots } from '../../server/lib/base-snapshot-regeneration.js';
import { BLOB_READ_WRITE_TOKEN_ENV, createBlobSnapshotWriter } from '../../server/lib/blob-snapshot-writer.js';
import { fetchFeedsConcurrently } from '../../server/lib/feed-fetcher.js';
import { loadRssCatalogRecords } from '../lib/rss-catalog.js';
import { sendJson } from '../lib/send-json.js';

import type { ApiRequest } from '../../server/interfaces/api-request.interface';
import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { ServerResponse } from 'node:http';

export const config = {
  includeFiles: ['data/rss-sources.json'],
};

const RESPONSE_CACHE_CONTROL = 'no-store, max-age=0';

interface CronHandlerDependencies {
  readonly loadCatalogRecords: () => Promise<readonly RssSourceRecord[]>;
  readonly fetchFeeds: typeof fetchFeedsConcurrently;
  readonly snapshotWriter: ReturnType<typeof createBlobSnapshotWriter>;
  readonly now?: () => number;
  readonly cronSecret?: string;
  readonly blobReadWriteToken?: string;
  readonly logger?: Pick<typeof console, 'info' | 'error'>;
}

const defaultDependencies: CronHandlerDependencies = {
  loadCatalogRecords: () => loadRssCatalogRecords(RSS_SOURCES_FILE_PATH),
  fetchFeeds: fetchFeedsConcurrently,
  snapshotWriter: createBlobSnapshotWriter(),
  cronSecret: process.env[CRON_SECRET_ENV],
  blobReadWriteToken: process.env[BLOB_READ_WRITE_TOKEN_ENV],
  logger: console,
};

export function createCronRegenerateSnapshotsHandler(overrides: Partial<CronHandlerDependencies> = {}) {
  const dependencies: CronHandlerDependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const now = dependencies.now ?? (() => Date.now());
  const logger = dependencies.logger ?? console;

  return async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method Not Allowed' }, RESPONSE_CACHE_CONTROL);
      return;
    }

    const secret = normalizeSecret(dependencies.cronSecret);
    if (!secret) {
      sendJson(response, 500, { error: 'Cron secret is not configured' }, RESPONSE_CACHE_CONTROL);
      return;
    }

    if (request.headers?.authorization !== `Bearer ${secret}`) {
      sendJson(response, 401, { error: 'Unauthorized' }, RESPONSE_CACHE_CONTROL);
      return;
    }

    const blobReadWriteToken = normalizeSecret(dependencies.blobReadWriteToken);
    if (!blobReadWriteToken) {
      sendJson(response, 500, { error: 'Blob write token is not configured' }, RESPONSE_CACHE_CONTROL);
      return;
    }

    const startedAt = now();
    logger.info('[api/cron/regenerate-snapshots][start]', {
      startedAt: new Date(startedAt).toISOString(),
    });

    try {
      const result = await regenerateBaseSnapshots({
        loadCatalogRecords: dependencies.loadCatalogRecords,
        fetchFeeds: dependencies.fetchFeeds,
        snapshotWriter: dependencies.snapshotWriter,
        now,
      });

      logger.info('[api/cron/regenerate-snapshots][success]', {
        totalSnapshots: result.keys.length,
        durationMs: now() - startedAt,
      });

      sendJson(
        response,
        200,
        {
          ok: true,
          ...result,
          totalSnapshots: result.keys.length,
          durationMs: now() - startedAt,
        },
        RESPONSE_CACHE_CONTROL,
      );
    } catch (error) {
      logger.error('[api/cron/regenerate-snapshots][error]', {
        durationMs: now() - startedAt,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      sendJson(response, 500, { error: 'Unable to regenerate base snapshots' }, RESPONSE_CACHE_CONTROL);
    }
  };
}

export default createCronRegenerateSnapshotsHandler();

function normalizeSecret(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
