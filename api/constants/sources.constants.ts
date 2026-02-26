import { resolve } from 'node:path';

export const RSS_SOURCES_FILE_PATH = resolve(process.cwd(), 'data/rss-sources.json');
export const CACHE_CONTROL_HEADER_VALUE = 'public, s-maxage=300, stale-while-revalidate=900';
