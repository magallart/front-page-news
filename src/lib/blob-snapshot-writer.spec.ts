import { describe, expect, it, vi } from 'vitest';

import { createBlobSnapshotWriter } from '../../server/lib/blob-snapshot-writer';

describe('server/lib/blob-snapshot-writer', () => {
  it('writes news snapshots to the canonical blob pathname', async () => {
    const putBlob = vi.fn().mockResolvedValue({});
    const writer = createBlobSnapshotWriter({
      put: putBlob,
      token: 'blob-token',
    });

    await writer.putNewsSnapshot({
      key: 'news:id=-:section=actualidad:source=-:q=-:page=1:limit=20',
      kind: 'news',
      generatedAt: '2026-04-28T08:00:00.000Z',
      staleAt: '2026-04-28T08:15:00.000Z',
      expiresAt: '2026-04-29T20:00:00.000Z',
      query: {
        id: null,
        section: 'actualidad',
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
    });

    expect(putBlob).toHaveBeenCalledWith(
      'snapshots/news%3Aid%3D-%3Asection%3Dactualidad%3Asource%3D-%3Aq%3D-%3Apage%3D1%3Alimit%3D20.json',
      expect.any(String),
      expect.objectContaining({
        access: 'public',
        token: 'blob-token',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json; charset=utf-8',
      }),
    );
  });

  it('falls back to a noop writer when no token is configured', async () => {
    const putBlob = vi.fn().mockResolvedValue({});
    const writer = createBlobSnapshotWriter({
      put: putBlob,
      token: '   ',
    });

    await writer.putSourcesSnapshot({
      key: 'sources:default',
      kind: 'sources',
      generatedAt: '2026-04-28T08:00:00.000Z',
      staleAt: '2026-04-28T08:15:00.000Z',
      expiresAt: '2026-04-29T20:00:00.000Z',
      query: null,
      payload: {
        sources: [],
        sections: [],
      },
    });

    expect(putBlob).not.toHaveBeenCalled();
  });
});
