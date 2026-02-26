export const CACHE_CONTROL_SUCCESS = 'public, s-maxage=600, stale-while-revalidate=86400';
export const CACHE_CONTROL_ERROR = 'no-store, max-age=0';
export const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);
export const MAX_REDIRECTS = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const UPSTREAM_FETCH_TIMEOUT_MS = 8000;
export const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
