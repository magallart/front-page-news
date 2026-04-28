import { CACHE_CONTROL_HEADER_VALUE, RSS_SOURCES_FILE_PATH } from '../server/constants/sources.constants.js';
import { createBlobSnapshotReader } from '../server/lib/blob-snapshot-reader.js';
import { buildSourcesResponseFromRecords } from '../server/lib/rss-sources-catalog.js';

import { loadRssCatalogRecords } from './lib/rss-catalog.js';
import { sendJson } from './lib/send-json.js';

import type { ApiRequest } from '../server/interfaces/api-request.interface';
import type { SnapshotReader } from '../server/interfaces/snapshot-reader.interface';
import type { ServerResponse } from 'node:http';

export const config = {
  includeFiles: ['data/rss-sources.json'],
};

export function createSourcesHandler(snapshotReader: SnapshotReader = createBlobSnapshotReader()) {
  return async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method Not Allowed' }, CACHE_CONTROL_HEADER_VALUE);
      return;
    }

    try {
      const snapshot = await snapshotReader.getSourcesSnapshot();
      if (snapshot && Date.parse(snapshot.expiresAt) > Date.now()) {
        sendJson(response, 200, snapshot.payload, CACHE_CONTROL_HEADER_VALUE);
        return;
      }

      const catalogRecords = await loadRssCatalogRecords(RSS_SOURCES_FILE_PATH);
      const payload = buildSourcesResponseFromRecords(catalogRecords);
      sendJson(response, 200, payload, CACHE_CONTROL_HEADER_VALUE);
    } catch {
      sendJson(response, 500, { error: 'Unable to load RSS sources catalog' }, CACHE_CONTROL_HEADER_VALUE);
    }
  };
}

export default createSourcesHandler();
