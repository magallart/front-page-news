import type { Section } from './section.interface';
import type { Source } from './source.interface';

export interface SourcesResponse {
  readonly sources: readonly Source[];
  readonly sections: readonly Section[];
}
