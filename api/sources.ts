import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';


import { buildSourcesResponseFromRecords } from '../src/lib/rss-sources-catalog';

import type { RssSourceRecord } from '../src/interfaces/rss-source-record.interface';
import type { SourcesResponse } from '../src/interfaces/sources-response.interface';
import type { IncomingMessage, ServerResponse } from 'node:http';

const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'data/rss-sources.json');
const CACHE_CONTROL_HEADER_VALUE = 'public, s-maxage=300, stale-while-revalidate=900';

interface ApiErrorResponse {
  readonly error: string;
}

type SourcesApiResponse = SourcesResponse | ApiErrorResponse;

interface ApiRequest extends IncomingMessage {
  readonly method?: string;
}

export default async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const catalogJson = await readFile(RSS_SOURCES_FILE_PATH, 'utf8');
    const payload = buildSourcesResponseFromRecords(parseCatalogRecords(catalogJson));
    sendJson(response, 200, payload);
  } catch {
    sendJson(response, 500, { error: 'Unable to load RSS sources catalog' });
  }
}

function parseCatalogRecords(value: string): readonly RssSourceRecord[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid catalog JSON: expected array');
  }

  const records: RssSourceRecord[] = [];
  for (const item of parsed) {
    if (!isCatalogRecord(item)) {
      continue;
    }

    records.push({
      sourceName: item.sourceName,
      feedUrl: item.feedUrl,
      sectionName: item.sectionName,
    });
  }

  if (records.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  return records;
}

function isCatalogRecord(value: unknown): value is RssSourceRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['sourceName'] === 'string' &&
    typeof candidate['feedUrl'] === 'string' &&
    typeof candidate['sectionName'] === 'string'
  );
}

function sendJson(response: ServerResponse, statusCode: number, body: SourcesApiResponse): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader(
    'cache-control',
    isCacheableStatus(statusCode) ? CACHE_CONTROL_HEADER_VALUE : 'no-store, max-age=0'
  );
  response.end(JSON.stringify(body));
}

function isCacheableStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}
