import { DestroyRef, inject } from '@angular/core';

export interface RestartTimer {
  restart(): void;
  stop(): void;
}

interface RestartableIntervalOptions {
  readonly startOnCreate?: boolean;
}

export function createRestartableInterval(
  onTick: () => void,
  intervalMs: number,
  options: RestartableIntervalOptions = {},
): RestartTimer {
  const destroyRef = inject(DestroyRef);
  let timerId: ReturnType<typeof setInterval> | undefined;

  const stop = (): void => {
    if (timerId !== undefined) {
      clearInterval(timerId);
      timerId = undefined;
    }
  };

  const restart = (): void => {
    stop();
    timerId = setInterval(() => {
      onTick();
    }, intervalMs);
  };

  if (options.startOnCreate ?? true) {
    restart();
  }

  destroyRef.onDestroy(() => {
    stop();
  });

  return { restart, stop };
}
