export interface NewsHandlerRuntimeOptions {
  readonly cacheTtlMs?: number;
  readonly now?: () => number;
  readonly enablePerfLogs?: boolean;
}
