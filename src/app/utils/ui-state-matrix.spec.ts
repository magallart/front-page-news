import { describe, expect, it } from 'vitest';

import { UI_VIEW_STATE } from '../interfaces/ui-view-state.interface';

import { resolveDetailUiState, resolveHomeUiState, resolveSectionUiState } from './ui-state-matrix';

import type { DetailUiStateInput } from '../interfaces/ui-state-input.interface';
import type { ListingUiStateInput } from '../interfaces/ui-state-input.interface';

describe('ui-state-matrix', () => {
  it('resolves listing loading state', () => {
    const input = createListingInput({ loading: true, itemCount: 0 });

    expect(resolveHomeUiState(input)).toBe(UI_VIEW_STATE.LOADING);
    expect(resolveSectionUiState(input)).toBe(UI_VIEW_STATE.LOADING);
  });

  it('resolves listing total error state', () => {
    const input = createListingInput({ error: 'boom', itemCount: 0 });

    expect(resolveHomeUiState(input)).toBe(UI_VIEW_STATE.ERROR_TOTAL);
    expect(resolveSectionUiState(input)).toBe(UI_VIEW_STATE.ERROR_TOTAL);
  });

  it('resolves listing empty state', () => {
    const input = createListingInput({ itemCount: 0 });

    expect(resolveHomeUiState(input)).toBe(UI_VIEW_STATE.EMPTY);
    expect(resolveSectionUiState(input)).toBe(UI_VIEW_STATE.EMPTY);
  });

  it('resolves listing partial error state when warnings exist', () => {
    const input = createListingInput({
      itemCount: 2,
      warnings: [{ code: 'source_timeout', message: 'timeout', sourceId: null, feedUrl: null }],
    });

    expect(resolveHomeUiState(input)).toBe(UI_VIEW_STATE.ERROR_PARTIAL);
    expect(resolveSectionUiState(input)).toBe(UI_VIEW_STATE.ERROR_PARTIAL);
  });

  it('resolves listing ready state when data is available without warnings/error', () => {
    const input = createListingInput({ itemCount: 3 });

    expect(resolveHomeUiState(input)).toBe(UI_VIEW_STATE.READY);
    expect(resolveSectionUiState(input)).toBe(UI_VIEW_STATE.READY);
  });

  it('resolves detail loading state', () => {
    const input = createDetailInput({ loading: true, hasItem: false });
    expect(resolveDetailUiState(input)).toBe(UI_VIEW_STATE.LOADING);
  });

  it('resolves detail total error state', () => {
    const input = createDetailInput({ error: 'boom', hasItem: false });
    expect(resolveDetailUiState(input)).toBe(UI_VIEW_STATE.ERROR_TOTAL);
  });

  it('resolves detail empty state when article does not exist', () => {
    const input = createDetailInput({ hasItem: false });
    expect(resolveDetailUiState(input)).toBe(UI_VIEW_STATE.EMPTY);
  });

  it('resolves detail partial error state when article exists with warnings', () => {
    const input = createDetailInput({
      hasItem: true,
      warnings: [{ code: 'source_timeout', message: 'timeout', sourceId: null, feedUrl: null }],
    });
    expect(resolveDetailUiState(input)).toBe(UI_VIEW_STATE.ERROR_PARTIAL);
  });

  it('resolves detail ready state when article exists and no warnings/errors', () => {
    const input = createDetailInput({ hasItem: true });
    expect(resolveDetailUiState(input)).toBe(UI_VIEW_STATE.READY);
  });
});

function createListingInput(overrides: Partial<ListingUiStateInput>): ListingUiStateInput {
  return {
    loading: false,
    error: null,
    warnings: [],
    itemCount: 0,
    ...overrides,
  };
}

function createDetailInput(overrides: Partial<DetailUiStateInput>): DetailUiStateInput {
  return {
    loading: false,
    error: null,
    warnings: [],
    hasItem: false,
    ...overrides,
  };
}
