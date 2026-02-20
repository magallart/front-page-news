import { WARNING_CODE } from '../interfaces/warning.interface.js';

import type { Source } from '../interfaces/source.interface';
import type { Warning } from '../interfaces/warning.interface';

const DEFAULT_FETCH_TIMEOUT_MS = 8000;

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
  fetchFn: FetchFunction = fetch
): Promise<FeedFetchResult> {
  const settled = await Promise.allSettled(
    sources.map((source) => fetchSingleFeed(source, timeoutMs, fetchFn))
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
  fetchFn: FetchFunction
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

    const body = await response.text();
    return {
      success: true,
      data: {
        sourceId: source.id,
        feedUrl: source.feedUrl,
        body,
        contentType: response.headers.get('content-type'),
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
