import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});
