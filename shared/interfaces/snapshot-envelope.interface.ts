export interface SnapshotEnvelope<TPayload, TQuery> {
  readonly key: string;
  readonly kind: string;
  readonly generatedAt: string;
  readonly staleAt: string;
  readonly expiresAt: string;
  readonly query: TQuery;
  readonly payload: TPayload;
}
