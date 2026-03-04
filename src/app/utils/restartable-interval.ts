import { DestroyRef, inject } from '@angular/core';

export interface RestartTimer {
  restart(): void;
}

export function createRestartableInterval(onTick: () => void, intervalMs: number): RestartTimer {
  const destroyRef = inject(DestroyRef);
  let timerId: ReturnType<typeof setInterval> | undefined;

  const restart = (): void => {
    if (timerId !== undefined) {
      clearInterval(timerId);
    }

    timerId = setInterval(() => {
      onTick();
    }, intervalMs);
  };

  restart();

  destroyRef.onDestroy(() => {
    if (timerId !== undefined) {
      clearInterval(timerId);
    }
  });

  return { restart };
}
