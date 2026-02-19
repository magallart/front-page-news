import type { ServerResponse } from 'node:http';

const ERROR_CACHE_CONTROL_HEADER_VALUE = 'no-store, max-age=0';

export function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
  successCacheControlHeaderValue: string,
): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader(
    'cache-control',
    isCacheableStatus(statusCode) ? successCacheControlHeaderValue : ERROR_CACHE_CONTROL_HEADER_VALUE,
  );
  response.end(JSON.stringify(body));
}

function isCacheableStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}
