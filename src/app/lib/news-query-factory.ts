import { HOME_PAGE_NEWS_LIMIT, NAVBAR_TICKER_NEWS_LIMIT, SECTION_PAGE_NEWS_LIMIT } from '../constants/news-limit.constants';

import type { NewsQuery } from '../../../shared/interfaces/news-query.interface';
import type { SectionQueryFilters } from '../interfaces/section-query-filters.interface';

export type NewsRequestQuery = Partial<NewsQuery>;

export function createHomeNewsQuery(): NewsRequestQuery {
  return {
    page: 1,
    limit: HOME_PAGE_NEWS_LIMIT,
  };
}

export function createLatestNewsTickerQuery(): NewsRequestQuery {
  return {
    section: 'ultima-hora',
    page: 1,
    limit: NAVBAR_TICKER_NEWS_LIMIT,
  };
}

export function createSectionNewsQuery(sectionSlug: string, filters: SectionQueryFilters): NewsRequestQuery {
  return {
    section: sectionSlug,
    sourceIds: filters.sourceIds,
    searchQuery: filters.searchQuery,
    page: filters.page,
    limit: filters.limit,
  };
}

export function createSourceNewsQuery(sourceId: string): NewsRequestQuery {
  return {
    sourceIds: [sourceId],
    page: 1,
    limit: SECTION_PAGE_NEWS_LIMIT,
  };
}
