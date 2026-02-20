import { describe, expect, it, vi } from 'vitest';

import { resolveTopScrollBehavior, scrollToTopAfterNavigation } from './navigation-scroll';

describe('navigation-scroll', () => {
  it('uses smooth scroll behavior when reduced motion is disabled', () => {
    const behavior = resolveTopScrollBehavior({
      matchMedia: () => ({ matches: false } as MediaQueryList),
    });

    expect(behavior).toBe('smooth');
  });

  it('uses auto scroll behavior when reduced motion is enabled', () => {
    const behavior = resolveTopScrollBehavior({
      matchMedia: () => ({ matches: true } as MediaQueryList),
    });

    expect(behavior).toBe('auto');
  });

  it('scrolls to top when navigation has no fragment', () => {
    const scrollTo = vi.fn();

    scrollToTopAfterNavigation('/seccion/economia', {
      matchMedia: () => ({ matches: false } as MediaQueryList),
      scrollTo,
    });

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });

  it('does not override anchor navigation scroll', () => {
    const scrollTo = vi.fn();

    scrollToTopAfterNavigation('/#most-read', {
      matchMedia: () => ({ matches: false } as MediaQueryList),
      scrollTo,
    });

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
