export const NEWS_SERVICE_RESULT_SOURCE = {
  MEMORY: 'memory',
  INDEXEDDB: 'indexeddb',
  REMOTE_SNAPSHOT: 'remote_snapshot',
  NETWORK: 'network',
} as const;

export type NewsServiceResultSource =
  (typeof NEWS_SERVICE_RESULT_SOURCE)[keyof typeof NEWS_SERVICE_RESULT_SOURCE];
