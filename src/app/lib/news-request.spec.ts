import { describe, expect, it } from 'vitest';

import { toNewsSnapshotQuery } from './news-request';

describe('src/app/lib/news-request', () => {
  it('fills default page and limit values for snapshot queries', () => {
    expect(
      toNewsSnapshotQuery({
        section: ' Actualidad ',
      }),
    ).toEqual({
      id: null,
      section: 'actualidad',
      sourceIds: [],
      searchQuery: null,
      page: 1,
      limit: 20,
    });
  });

  it('preserves id casing while normalizing the rest of the query', () => {
    expect(
      toNewsSnapshotQuery({
        id: ' Article-ABC ',
        section: ' Tecnologia ',
        sourceIds: [' Source-B ', 'source-a', 'source-a'],
        searchQuery: ' IA ',
        page: 3,
        limit: 50,
      }),
    ).toEqual({
      id: 'Article-ABC',
      section: 'tecnologia',
      sourceIds: ['source-b', 'source-a', 'source-a'],
      searchQuery: 'ia',
      page: 3,
      limit: 50,
    });
  });
});
