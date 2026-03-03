import { describe, expect, it } from 'vitest';

import { fetchFeedsConcurrently } from './feed-fetcher';
import { WARNING_CODE } from './warning-code';

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

  it('decodes feed body using charset from content-type header', async () => {
    const sources: readonly Source[] = [makeSource('source-a', 'https://a.test/rss.xml')];
    const feedBytes = buildXmlBytesWithSingleByteChar('ISO-8859-1');
    const fetchFn = async () =>
      new Response(feedBytes, {
        status: 200,
        headers: { 'content-type': 'application/rss+xml; charset=ISO-8859-1' },
      });

    const result = await fetchFeedsConcurrently(sources, 1000, fetchFn);

    expect(result.warnings).toHaveLength(0);
    expect(result.successes).toHaveLength(1);
    expect(result.successes[0]?.body).toContain('<title>Espa\u00f1a</title>');
  });

  it('falls back to xml declaration encoding when content-type has no charset', async () => {
    const sources: readonly Source[] = [makeSource('source-a', 'https://a.test/rss.xml')];
    const feedBytes = buildXmlBytesWithSingleByteChar('ISO-8859-1');
    const fetchFn = async () =>
      new Response(feedBytes, {
        status: 200,
        headers: { 'content-type': 'application/rss+xml' },
      });

    const result = await fetchFeedsConcurrently(sources, 1000, fetchFn);

    expect(result.warnings).toHaveLength(0);
    expect(result.successes).toHaveLength(1);
    expect(result.successes[0]?.body).toContain('<title>Espa\u00f1a</title>');
  });

  it('limits concurrent feed fetches to avoid load spikes', async () => {
    const sources = Array.from({ length: 25 }, (_, index) => makeSource(`source-${index}`, `https://test/${index}.xml`));
    let activeRequests = 0;
    let maxActiveRequests = 0;
    const fetchFn = async () => {
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      await delay(15);
      activeRequests -= 1;

      return new Response('<rss><channel><item/></channel></rss>', {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      });
    };

    const result = await fetchFeedsConcurrently(sources, 1000, fetchFn);

    expect(result.warnings).toHaveLength(0);
    expect(result.successes).toHaveLength(25);
    expect(maxActiveRequests).toBeLessThanOrEqual(10);
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

function buildXmlBytesWithSingleByteChar(encoding: string): ArrayBuffer {
  const encoder = new TextEncoder();
  const prefix = encoder.encode(
    `<?xml version="1.0" encoding="${encoding}"?><rss><channel><item><title>Espa`
  );
  const suffix = encoder.encode('a</title></item></channel></rss>');
  const bytes = new Uint8Array(prefix.length + 1 + suffix.length);
  bytes.set(prefix, 0);
  bytes[prefix.length] = 0xf1;
  bytes.set(suffix, prefix.length + 1);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
