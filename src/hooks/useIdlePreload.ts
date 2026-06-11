import { useEffect } from 'react';

interface IdlePreloadOptions {
  /** How long the user must be idle before preloading starts */
  idleMs?: number;
  /** Pause between consecutive chunk loads while idle */
  paceMs?: number;
}

/**
 * Eagerly preloads lazy route chunks while the user is idle.
 *
 * Waits for `idleMs` without any interaction, then loads the queued imports
 * one at a time (paced by `paceMs`). Any interaction pauses the chain and
 * restarts the idle timer; once every loader has resolved, all listeners are
 * removed. Respects Data Saver and very slow connections by not preloading.
 */
export function useIdlePreload(
  loaders: Array<() => Promise<unknown>>,
  { idleMs = 3000, paceMs = 700 }: IdlePreloadOptions = {},
) {
  useEffect(() => {
    type NetworkInfo = { saveData?: boolean; effectiveType?: string };
    const connection = (navigator as { connection?: NetworkInfo }).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
      return;
    }

    const queue = [...loaders];
    let timer: number | undefined;
    let cancelled = false;

    const events = ['pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'] as const;
    const removeListeners = () =>
      events.forEach(e => window.removeEventListener(e, onActivity));

    const preloadNext = () => {
      if (cancelled) return;
      const next = queue.shift();
      if (!next) {
        removeListeners();
        return;
      }
      next()
        .catch(() => {}) // a failed prefetch is harmless — the route will fetch on demand
        .finally(() => {
          if (cancelled) return;
          if (queue.length === 0) {
            removeListeners();
          } else {
            timer = window.setTimeout(preloadNext, paceMs);
          }
        });
    };

    const scheduleAfterIdle = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => preloadNext(), { timeout: 2000 });
        } else {
          preloadNext();
        }
      }, idleMs);
    };

    // Any activity pauses the preload chain and restarts the idle clock
    const onActivity = () => {
      if (queue.length > 0) scheduleAfterIdle();
    };

    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
    scheduleAfterIdle();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      removeListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
