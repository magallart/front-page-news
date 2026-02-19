import type { UiViewState } from './ui-view-state.interface';

export interface UiStateRule {
  readonly state: UiViewState;
  readonly when: string;
}
