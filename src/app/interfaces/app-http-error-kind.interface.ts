export const APP_HTTP_ERROR_KIND = {
  OFFLINE: 'offline',
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  CLIENT: 'client',
  SERVER: 'server',
  UNKNOWN: 'unknown',
} as const;

export type AppHttpErrorKind = (typeof APP_HTTP_ERROR_KIND)[keyof typeof APP_HTTP_ERROR_KIND];
