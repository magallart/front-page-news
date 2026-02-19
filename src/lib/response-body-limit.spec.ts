import { describe, expect, it } from 'vitest';

import { PayloadTooLargeError, readResponseBodyWithLimit, streamResponseBodyWithLimit } from '../../api/lib/response-body-limit';

describe('response-body-limit', () => {
  it('reads body when content-length is under limit', async () => {
    const response = new Response('hello', {
      headers: { 'content-length': '5' },
    });

    const result = await readResponseBodyWithLimit(response, 10);

    expect(new TextDecoder().decode(result)).toBe('hello');
  });

  it('fails fast when content-length is above limit', async () => {
    const response = new Response('hello', {
      headers: { 'content-length': '100' },
    });

    await expect(readResponseBodyWithLimit(response, 10)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });

  it('fails when streamed content exceeds limit', async () => {
    const response = new Response('hello world');

    await expect(readResponseBodyWithLimit(response, 5)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });

  it('streams body when content-length is under limit', async () => {
    const response = new Response('hello', {
      headers: { 'content-length': '5' },
    });
    const chunks: Uint8Array[] = [];

    const totalBytes = await streamResponseBodyWithLimit(response, 10, (chunk) => {
      chunks.push(chunk);
    });

    expect(totalBytes).toBe(5);
    expect(new TextDecoder().decode(chunks[0] ?? new Uint8Array())).toBe('hello');
  });

  it('fails fast for streaming when content-length is above limit', async () => {
    const response = new Response('hello', {
      headers: { 'content-length': '100' },
    });

    await expect(streamResponseBodyWithLimit(response, 10, () => undefined)).rejects.toBeInstanceOf(
      PayloadTooLargeError,
    );
  });

  it('fails while streaming when body exceeds limit', async () => {
    const response = new Response('hello world');
    const chunks: Uint8Array[] = [];

    await expect(
      streamResponseBodyWithLimit(response, 5, (chunk) => {
        chunks.push(chunk);
      }),
    ).rejects.toBeInstanceOf(PayloadTooLargeError);
  });
});
