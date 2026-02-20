export const WARNING_CODE = {
  SOURCE_FETCH_FAILED: 'source_fetch_failed',
  SOURCE_PARSE_FAILED: 'source_parse_failed',
  SOURCE_TIMEOUT: 'source_timeout',
  INVALID_ITEM_SKIPPED: 'invalid_item_skipped',
} as const;

export type WarningCode = (typeof WARNING_CODE)[keyof typeof WARNING_CODE];
