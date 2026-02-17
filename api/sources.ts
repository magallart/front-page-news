import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { buildSourcesResponse } from '../src/lib/rss-sources-catalog';

import type { SourcesResponse } from '../src/interfaces/sources-response.interface';

const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'docs/rss-sources.md');
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
    const catalogMarkdown = await readFile(RSS_SOURCES_FILE_PATH, 'utf8');
    const payload = buildSourcesResponse(catalogMarkdown);
    sendJson(response, 200, payload);
  } catch {
    sendJson(response, 500, { error: 'Unable to load RSS sources catalog' });
  }
}

function sendJson(response: ServerResponse, statusCode: number, body: SourcesApiResponse): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', CACHE_CONTROL_HEADER_VALUE);
  response.end(JSON.stringify(body));
}
