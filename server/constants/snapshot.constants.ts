import type { NewsQuery } from '../../shared/interfaces/news-query.interface';

export const SNAPSHOT_STALE_AFTER_MS = 15 * 60 * 1000;
export const SNAPSHOT_EXPIRES_AFTER_MS = 36 * 60 * 60 * 1000;
export const HOME_SNAPSHOT_NEWS_LIMIT = 250;
export const SECTION_SNAPSHOT_NEWS_LIMIT = 300;
export const CRON_SECRET_ENV = 'CRON_SECRET';

export const BASE_SNAPSHOT_SECTION_SLUGS = [
  'actualidad',
  'ciencia',
  'cultura',
  'deportes',
  'economia',
  'espana',
  'internacional',
  'opinion',
  'sociedad',
  'tecnologia',
] as const;

export function buildBaseNewsSnapshotQueries(): readonly NewsQuery[] {
  return [
    {
      id: null,
      section: null,
      sourceIds: [],
      searchQuery: null,
      page: 1,
      limit: HOME_SNAPSHOT_NEWS_LIMIT,
    },
    ...BASE_SNAPSHOT_SECTION_SLUGS.map<NewsQuery>((section) => ({
      id: null,
      section,
      sourceIds: [],
      searchQuery: null,
      page: 1,
      limit: SECTION_SNAPSHOT_NEWS_LIMIT,
    })),
  ];
}
