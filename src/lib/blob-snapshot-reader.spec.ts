import { describe, expect, it, vi } from 'vitest';

import { createBlobSnapshotReader } from '../../server/lib/blob-snapshot-reader';

describe('server/lib/blob-snapshot-reader', () => {
  it('returns null when base url is missing', async () => {
    const reader = createBlobSnapshotReader({
      baseUrl: '',
      fetch: vi.fn(),
    });

    await expect(
      reader.getNewsSnapshot({
        id: null,
        section: null,
        sourceIds: [],
        searchQuery: null,
        page: 1,
        limit: 20,
      }),
    ).resolves.toBeNull();
  });

  it('loads a news snapshot from blob url', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          key: 'news:id=-:section=-:source=-:q=-:page=1:limit=20',
          kind: 'news',
          generatedAt: '2026-04-28T08:00:00.000Z',
          staleAt: '2026-04-28T08:15:00.000Z',
          expiresAt: '2026-04-29T20:00:00.000Z',
          query: {
            id: null,
            section: null,
            sourceIds: [],
            searchQuery: null,
            page: 1,
            limit: 20,
          },
          payload: {
            articles: [],
            total: 0,
            page: 1,
            limit: 20,
            warnings: [],
          },
        }),
        { status: 200 },
      ),
    );

    const reader = createBlobSnapshotReader({
      baseUrl: 'https://blob.example.com/base',
      fetch: fetchMock as typeof fetch,
    });

    const snapshot = await reader.getNewsSnapshot({
      id: null,
      section: null,
      sourceIds: [],
      searchQuery: null,
      page: 1,
      limit: 20,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(snapshot?.kind).toBe('news');
    expect(snapshot?.payload.limit).toBe(20);
  });

  it('returns null when blob payload is malformed', async () => {
    const reader = createBlobSnapshotReader({
      baseUrl: 'https://blob.example.com/base',
      fetch: vi.fn(async () => new Response('{"kind":"news"}', { status: 200 })) as typeof fetch,
    });

    await expect(
      reader.getNewsSnapshot({
        id: null,
        section: null,
        sourceIds: [],
        searchQuery: null,
        page: 1,
        limit: 20,
      }),
    ).resolves.toBeNull();
  });
});
