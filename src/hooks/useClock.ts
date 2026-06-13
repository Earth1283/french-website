import { useEffect, useState } from 'react';

/**
 * A ticking clock source shared by the ambient clock, greeting, and timers.
 * Re-renders once per `intervalMs` (default every second) with the current Date.
 */
export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
