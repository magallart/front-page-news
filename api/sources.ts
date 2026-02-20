import { resolve } from 'node:path';


import * as rssSourcesCatalogModule from '../src/lib/rss-sources-catalog.js';

import { loadRssCatalogRecords } from './lib/rss-catalog.js';
import { sendJson } from './lib/send-json.js';

import type { buildSourcesResponseFromRecords as buildSourcesResponseFromRecordsType } from '../src/lib/rss-sources-catalog';
import type { IncomingMessage, ServerResponse } from 'node:http';

const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'data/rss-sources.json');
const CACHE_CONTROL_HEADER_VALUE = 'public, s-maxage=300, stale-while-revalidate=900';
const buildSourcesResponseFromRecords = getModuleExport<BuildSourcesResponseFromRecords>(
  rssSourcesCatalogModule,
  'buildSourcesResponseFromRecords'
);

type BuildSourcesResponseFromRecords = typeof buildSourcesResponseFromRecordsType;

export const config = {
  includeFiles: ['data/rss-sources.json'],
};

interface ApiRequest extends IncomingMessage {
  readonly method?: string;
}

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

function getModuleExport<T>(moduleRecord: unknown, exportName: string): T {
  if (isRecord(moduleRecord) && exportName in moduleRecord) {
    return moduleRecord[exportName] as T;
  }

  if (isRecord(moduleRecord) && 'default' in moduleRecord) {
    const defaultExport = moduleRecord['default'];
    if (isRecord(defaultExport) && exportName in defaultExport) {
      return defaultExport[exportName] as T;
    }
  }

  throw new Error(`Unable to resolve export "${exportName}" from runtime module`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
