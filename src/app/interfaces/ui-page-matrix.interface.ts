import type { UiStateRule } from './ui-state-rule.interface';

export interface UiPageMatrix {
  readonly home: readonly UiStateRule[];
  readonly section: readonly UiStateRule[];
  readonly detail: readonly UiStateRule[];
}
