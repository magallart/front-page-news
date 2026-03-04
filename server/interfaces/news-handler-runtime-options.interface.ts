export interface NewsHandlerRuntimeOptions {
  readonly cacheTtlMs?: number;
  readonly cacheMaxEntries?: number;
  readonly now?: () => number;
  readonly enablePerfLogs?: boolean;
}
