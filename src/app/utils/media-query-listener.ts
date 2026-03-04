import type { DestroyRef } from '@angular/core';

export function registerMediaQueryListener(options: {
  readonly query: string;
  readonly onChange: (matches: boolean) => void;
  readonly destroyRef: DestroyRef;
}): void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return;
  }

  const mediaQuery = window.matchMedia(options.query);
  const update = (): void => {
    options.onChange(mediaQuery.matches);
  };

  update();

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', update);
    options.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', update);
    });
    return;
  }

  mediaQuery.addListener(update);
  options.destroyRef.onDestroy(() => {
    mediaQuery.removeListener(update);
  });
}
