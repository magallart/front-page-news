import { resolve } from 'node:path';

export const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'data/rss-sources.json');
export const FEED_FETCH_TIMEOUT_MS = 8000;
export const CACHE_CONTROL_HEADER_VALUE = 'public, s-maxage=120, stale-while-revalidate=600';
