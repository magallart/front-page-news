import type { IncomingMessage, ServerResponse } from 'node:http';
import { isPublicHttpUrl } from '../src/lib/ssrf-guard';

const CACHE_CONTROL_SUCCESS = 'public, s-maxage=600, stale-while-revalidate=86400';
const CACHE_CONTROL_ERROR = 'no-store, max-age=0';
const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);
const MAX_REDIRECTS = 5;
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);

interface ApiRequest extends IncomingMessage {
  readonly method?: string;
  readonly url?: string;
}

export default async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET') {
    sendError(response, 405, 'Method Not Allowed');
    return;
  }

  const imageUrl = getImageUrl(request.url);
  if (!imageUrl) {
    sendError(response, 400, 'Missing "url" query param');
    return;
  }

  const targetUrl = toAllowedImageUrl(imageUrl);
  if (!targetUrl) {
    sendError(response, 400, 'Invalid image url');
    return;
  }

  if (!(await isPublicHttpUrl(targetUrl))) {
    sendError(response, 400, 'Invalid image url');
    return;
  }

  let upstream: Response;
  try {
    upstream = await fetchWithSafeRedirects(targetUrl);
  } catch {
    sendError(response, 502, 'Unable to fetch remote image');
    return;
  }

  if (!upstream.ok) {
    sendError(response, 502, `Remote image responded with status ${upstream.status}`);
    return;
  }

  const contentType = upstream.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('image/')) {
    sendError(response, 415, 'Remote resource is not an image');
    return;
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  response.statusCode = 200;
  response.setHeader('content-type', contentType);
  response.setHeader('cache-control', CACHE_CONTROL_SUCCESS);
  response.end(body);
}

function getImageUrl(requestUrl: string | undefined): string | null {
  if (!requestUrl) {
    return null;
  }

  const parsed = new URL(requestUrl, 'http://localhost');
  return parsed.searchParams.get('url');
}

function toAllowedImageUrl(rawUrl: string): URL | null {
  try {
    const parsedUrl = new URL(rawUrl);
    if (!SUPPORTED_PROTOCOLS.has(parsedUrl.protocol)) {
      return null;
    }
    return parsedUrl;
  } catch {
    return null;
  }
}

async function fetchWithSafeRedirects(initialUrl: URL): Promise<Response> {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const upstream = await fetch(currentUrl.toString(), { redirect: 'manual' });
    if (!REDIRECT_STATUS_CODES.has(upstream.status)) {
      return upstream;
    }

    if (redirectCount === MAX_REDIRECTS) {
      throw new Error('Too many redirects');
    }

    const location = upstream.headers.get('location');
    if (!location) {
      throw new Error('Redirect without location');
    }

    const redirectedUrl = new URL(location, currentUrl);
    if (!(await isPublicHttpUrl(redirectedUrl))) {
      throw new Error('Unsafe redirect target');
    }

    currentUrl = redirectedUrl;
  }

  throw new Error('Unable to resolve redirects');
}

function sendError(response: ServerResponse, statusCode: number, message: string): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', CACHE_CONTROL_ERROR);
  response.end(JSON.stringify({ error: message }));
}
