import { UI_VIEW_STATE } from '../interfaces/ui-view-state.interface';

import type { UiPageMatrix } from '../interfaces/ui-page-matrix.interface';
import type { DetailUiStateInput } from '../interfaces/ui-state-input.interface';
import type { ListingUiStateInput } from '../interfaces/ui-state-input.interface';
import type { UiViewState } from '../interfaces/ui-view-state.interface';

export const UI_STATE_MATRIX: UiPageMatrix = {
  home: [
    { state: UI_VIEW_STATE.LOADING, when: 'loading=true and itemCount=0' },
    { state: UI_VIEW_STATE.ERROR_TOTAL, when: 'error!=null and itemCount=0' },
    { state: UI_VIEW_STATE.EMPTY, when: 'loading=false and error=null and itemCount=0' },
    { state: UI_VIEW_STATE.ERROR_PARTIAL, when: 'itemCount>0 and (warnings>0 or error!=null)' },
    { state: UI_VIEW_STATE.READY, when: 'itemCount>0 and warnings=0 and error=null' },
  ],
  section: [
    { state: UI_VIEW_STATE.LOADING, when: 'loading=true and itemCount=0' },
    { state: UI_VIEW_STATE.ERROR_TOTAL, when: 'error!=null and itemCount=0' },
    { state: UI_VIEW_STATE.EMPTY, when: 'loading=false and error=null and itemCount=0' },
    { state: UI_VIEW_STATE.ERROR_PARTIAL, when: 'itemCount>0 and (warnings>0 or error!=null)' },
    { state: UI_VIEW_STATE.READY, when: 'itemCount>0 and warnings=0 and error=null' },
  ],
  detail: [
    { state: UI_VIEW_STATE.LOADING, when: 'loading=true and hasItem=false' },
    { state: UI_VIEW_STATE.ERROR_TOTAL, when: 'error!=null and hasItem=false' },
    { state: UI_VIEW_STATE.EMPTY, when: 'loading=false and error=null and hasItem=false' },
    { state: UI_VIEW_STATE.ERROR_PARTIAL, when: 'hasItem=true and (warnings>0 or error!=null)' },
    { state: UI_VIEW_STATE.READY, when: 'hasItem=true and warnings=0 and error=null' },
  ],
};

export function resolveHomeUiState(input: ListingUiStateInput): UiViewState {
  return resolveListingUiState(input);
}

export function resolveSectionUiState(input: ListingUiStateInput): UiViewState {
  return resolveListingUiState(input);
}

export function resolveDetailUiState(input: DetailUiStateInput): UiViewState {
  if (input.loading && !input.hasItem) {
    return UI_VIEW_STATE.LOADING;
  }

  if (input.error && !input.hasItem) {
    return UI_VIEW_STATE.ERROR_TOTAL;
  }

  if (!input.hasItem) {
    return UI_VIEW_STATE.EMPTY;
  }

  if (hasPartialIssue(input.error, input.warnings)) {
    return UI_VIEW_STATE.ERROR_PARTIAL;
  }

  return UI_VIEW_STATE.READY;
}

function resolveListingUiState(input: ListingUiStateInput): UiViewState {
  if (input.loading && input.itemCount === 0) {
    return UI_VIEW_STATE.LOADING;
  }

  if (input.error && input.itemCount === 0) {
    return UI_VIEW_STATE.ERROR_TOTAL;
  }

  if (input.itemCount === 0) {
    return UI_VIEW_STATE.EMPTY;
  }

  if (hasPartialIssue(input.error, input.warnings)) {
    return UI_VIEW_STATE.ERROR_PARTIAL;
  }

  return UI_VIEW_STATE.READY;
}

function hasPartialIssue(error: string | null, warnings: readonly unknown[]): boolean {
  return Boolean(error) || warnings.length > 0;
}
