import { WARNING_CODE } from '../constants/warning-code.constants.js';

import type { Source } from '../../shared/interfaces/source.interface';
import type { Warning } from '../../shared/interfaces/warning.interface';

const DEFAULT_FETCH_TIMEOUT_MS = 8000;
const FEED_SNIPPET_BYTES = 2048;
const FALLBACK_CHARSETS = ['utf-8', 'windows-1252'] as const;
const MAX_FEED_FETCH_CONCURRENCY = 10;

interface FeedFetchSuccess {
  readonly sourceId: string;
  readonly feedUrl: string;
  readonly body: string;
  readonly contentType: string | null;
}

interface FeedFetchResult {
  readonly successes: readonly FeedFetchSuccess[];
  readonly warnings: readonly Warning[];
}

type FetchFunction = (input: string, init?: RequestInit) => Promise<Response>;

export async function fetchFeedsConcurrently(
  sources: readonly Source[],
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  fetchFn: FetchFunction = fetch,
): Promise<FeedFetchResult> {
  const settled = await runWithConcurrencyLimit(
    sources,
    MAX_FEED_FETCH_CONCURRENCY,
    (source) => fetchSingleFeed(source, timeoutMs, fetchFn),
  );

  const successes: FeedFetchSuccess[] = [];
  const warnings: Warning[] = [];

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        successes.push(result.value.data);
      } else {
        warnings.push(result.value.warning);
      }
      continue;
    }

    warnings.push({
      code: WARNING_CODE.SOURCE_FETCH_FAILED,
      message: `Unexpected fetch error: ${toErrorMessage(result.reason)}`,
      sourceId: null,
      feedUrl: null,
    });
  }

  return {
    successes,
    warnings,
  };
}

async function runWithConcurrencyLimit<TItem, TResult>(
  items: readonly TItem[],
  maxConcurrency: number,
  worker: (item: TItem) => Promise<TResult>,
): Promise<readonly PromiseSettledResult<TResult>[]> {
  if (items.length === 0) {
    return [];
  }

  const settled: PromiseSettledResult<TResult>[] = new Array(items.length);
  const concurrency = Math.min(maxConcurrency, items.length);
  let nextIndex = 0;

  async function consume(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      try {
        settled[currentIndex] = {
          status: 'fulfilled',
          value: await worker(items[currentIndex] as TItem),
        };
      } catch (reason) {
        settled[currentIndex] = {
          status: 'rejected',
          reason,
        };
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => consume()));
  return settled;
}

interface FetchSingleFeedSuccess {
  readonly success: true;
  readonly data: FeedFetchSuccess;
}

interface FetchSingleFeedFailure {
  readonly success: false;
  readonly warning: Warning;
}

type FetchSingleFeedResult = FetchSingleFeedSuccess | FetchSingleFeedFailure;

async function fetchSingleFeed(
  source: Source,
  timeoutMs: number,
  fetchFn: FetchFunction,
): Promise<FetchSingleFeedResult> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(source.feedUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        warning: {
          code: WARNING_CODE.SOURCE_FETCH_FAILED,
          message: `Fetch failed with status ${response.status}`,
          sourceId: source.id,
          feedUrl: source.feedUrl,
        },
      };
    }

    const contentType = response.headers.get('content-type');
    const body = await decodeFeedResponseBody(response, contentType);
    return {
      success: true,
      data: {
        sourceId: source.id,
        feedUrl: source.feedUrl,
        body,
        contentType,
      },
    };
  } catch (error) {
    if (isAbortError(error)) {
      return {
        success: false,
        warning: {
          code: WARNING_CODE.SOURCE_TIMEOUT,
          message: `Fetch timeout after ${timeoutMs}ms`,
          sourceId: source.id,
          feedUrl: source.feedUrl,
        },
      };
    }

    return {
      success: false,
      warning: {
        code: WARNING_CODE.SOURCE_FETCH_FAILED,
        message: `Fetch request error: ${toErrorMessage(error)}`,
        sourceId: source.id,
        feedUrl: source.feedUrl,
      },
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function decodeFeedResponseBody(response: Response, contentType: string | null): Promise<string> {
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const xmlSnippet = decodeLatin1(bytes.subarray(0, Math.min(bytes.length, FEED_SNIPPET_BYTES)));
  const headerCharset = extractCharsetFromContentType(contentType);
  const xmlCharset = extractXmlEncoding(xmlSnippet);
  const candidates = buildCharsetCandidates(headerCharset, xmlCharset);

  let fallbackDecoded: string | null = null;
  for (const candidate of candidates) {
    const decoded = tryDecode(bytes, candidate);
    if (decoded === null) {
      continue;
    }

    if (fallbackDecoded === null) {
      fallbackDecoded = decoded;
    }

    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  }

  return fallbackDecoded ?? decodeLatin1(bytes);
}

function extractCharsetFromContentType(contentType: string | null): string | null {
  if (!contentType) {
    return null;
  }

  const charsetMatch = contentType.match(/;\s*charset\s*=\s*("?)([^";,\s]+)\1/i);
  if (!charsetMatch?.[2]) {
    return null;
  }

  return normalizeCharsetLabel(charsetMatch[2]);
}

function extractXmlEncoding(xmlSnippet: string): string | null {
  const xmlDeclarationMatch = xmlSnippet.match(/<\?xml\b[^>]*\bencoding\s*=\s*(['"])([^'"]+)\1/i);
  if (!xmlDeclarationMatch?.[2]) {
    return null;
  }

  return normalizeCharsetLabel(xmlDeclarationMatch[2]);
}

function normalizeCharsetLabel(charset: string): string {
  return charset.trim().toLowerCase();
}

function buildCharsetCandidates(headerCharset: string | null, xmlCharset: string | null): readonly string[] {
  const unique = new Set<string>();
  if (headerCharset) {
    unique.add(headerCharset);
  }

  if (xmlCharset) {
    unique.add(xmlCharset);
  }

  for (const fallbackCharset of FALLBACK_CHARSETS) {
    unique.add(fallbackCharset);
  }

  return Array.from(unique);
}

function tryDecode(bytes: Uint8Array, charset: string): string | null {
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return null;
  }
}

function decodeLatin1(bytes: Uint8Array): string {
  return new TextDecoder('windows-1252').decode(bytes);
}

