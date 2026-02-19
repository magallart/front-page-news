export const UI_VIEW_STATE = {
  LOADING: 'loading',
  EMPTY: 'empty',
  ERROR_TOTAL: 'error_total',
  ERROR_PARTIAL: 'error_partial',
  READY: 'ready',
} as const;

export type UiViewState = (typeof UI_VIEW_STATE)[keyof typeof UI_VIEW_STATE];
