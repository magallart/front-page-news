import type { SourcesResponse } from './sources-response.interface';
import type { SnapshotEnvelope } from './snapshot-envelope.interface';

export interface SourcesSnapshot extends SnapshotEnvelope<SourcesResponse, null> {
  readonly kind: 'sources';
}
