import { describe, expect, it } from 'vitest';

import { HOME_PAGE_NEWS_LIMIT, NAVBAR_TICKER_NEWS_LIMIT } from '../constants/news-limit.constants';

import { createHomeNewsQuery, createLatestNewsTickerQuery, createSectionNewsQuery, createSourceNewsQuery } from './news-query-factory';

describe('news-query-factory', () => {
  it('creates the canonical home query', () => {
    expect(createHomeNewsQuery()).toEqual({
      page: 1,
      limit: HOME_PAGE_NEWS_LIMIT,
    });
  });

  it('creates the canonical latest-news ticker query', () => {
    expect(createLatestNewsTickerQuery()).toEqual({
      section: 'ultima-hora',
      page: 1,
      limit: NAVBAR_TICKER_NEWS_LIMIT,
    });
  });

  it('creates section queries from slug and parsed filters', () => {
    expect(
      createSectionNewsQuery('economia', {
        sourceIds: ['source-a', 'source-b'],
        searchQuery: 'inflacion',
        page: 2,
        limit: 40,
      }),
    ).toEqual({
      section: 'economia',
      sourceIds: ['source-a', 'source-b'],
      searchQuery: 'inflacion',
      page: 2,
      limit: 40,
    });
  });

  it('creates source page queries from source id', () => {
    expect(createSourceNewsQuery('mundo-diario')).toEqual({
      sourceIds: ['mundo-diario'],
      page: 1,
      limit: 300,
    });
  });
});
