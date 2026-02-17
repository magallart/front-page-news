import { describe, expect, it } from 'vitest';

import { WARNING_CODE } from '../interfaces/warning.interface';

import { fetchFeedsConcurrently } from './feed-fetcher';

import type { Source } from '../interfaces/source.interface';

describe('feed-fetcher', () => {
  it('returns success for healthy feeds', async () => {
    const sources: readonly Source[] = [makeSource('source-a', 'https://a.test/rss.xml')];
    const fetchFn = async () =>
      new Response('<rss><channel><item/></channel></rss>', {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      });

    const result = await fetchFeedsConcurrently(sources, 1000, fetchFn);

    expect(result.warnings).toHaveLength(0);
    expect(result.successes).toHaveLength(1);
    expect(result.successes[0]?.sourceId).toBe('source-a');
  });

  it('returns warning when response status is not ok', async () => {
    const sources: readonly Source[] = [makeSource('source-a', 'https://a.test/rss.xml')];
    const fetchFn = async () => new Response('failed', { status: 500 });

    const result = await fetchFeedsConcurrently(sources, 1000, fetchFn);

    expect(result.successes).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toBe(WARNING_CODE.SOURCE_FETCH_FAILED);
  });

  it('returns timeout warning when fetch is aborted', async () => {
    const sources: readonly Source[] = [makeSource('source-a', 'https://a.test/rss.xml')];
    const fetchFn = (_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        signal?.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });

    const result = await fetchFeedsConcurrently(sources, 5, fetchFn);

    expect(result.successes).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toBe(WARNING_CODE.SOURCE_TIMEOUT);
  });
});

function makeSource(id: string, feedUrl: string): Source {
  return {
    id,
    name: id,
    baseUrl: 'https://example.com',
    feedUrl,
    sectionSlugs: ['actualidad'],
  };
}
