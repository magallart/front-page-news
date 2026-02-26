import { CACHE_CONTROL_HEADER_VALUE, RSS_SOURCES_FILE_PATH } from '../server/constants/sources.constants.js';
import { buildSourcesResponseFromRecords } from '../server/lib/rss-sources-catalog.js';

import { loadRssCatalogRecords } from './lib/rss-catalog.js';
import { sendJson } from './lib/send-json.js';

import type { ApiRequest } from '../server/interfaces/api-request.interface';
import type { ServerResponse } from 'node:http';

export const config = {
  includeFiles: ['data/rss-sources.json'],
};

export default async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method Not Allowed' }, CACHE_CONTROL_HEADER_VALUE);
    return;
  }

  try {
    const catalogRecords = await loadRssCatalogRecords(RSS_SOURCES_FILE_PATH);
    const payload = buildSourcesResponseFromRecords(catalogRecords);
    sendJson(response, 200, payload, CACHE_CONTROL_HEADER_VALUE);
  } catch {
    sendJson(response, 500, { error: 'Unable to load RSS sources catalog' }, CACHE_CONTROL_HEADER_VALUE);
  }
}
