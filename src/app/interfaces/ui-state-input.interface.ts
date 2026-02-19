import type { Warning } from '../../interfaces/warning.interface';

export interface UiStateInput {
  readonly loading: boolean;
  readonly error: string | null;
  readonly warnings: readonly Warning[];
}

export interface ListingUiStateInput extends UiStateInput {
  readonly itemCount: number;
}

export interface DetailUiStateInput extends UiStateInput {
  readonly hasItem: boolean;
}
