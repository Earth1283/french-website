import { useEffect, useRef, useState } from 'react';
import { Timer } from 'lucide-react';
import { formatClock } from './WritingWorkspace';

/** A deadline, rather than interval ticks, keeps the clock accurate in background tabs. */
export function ReadingClock({ minutes, onExpire, label = 'Time remaining' }: { minutes: number; onExpire: () => void; label?: string }) {
  const [deadline] = useState(() => Date.now() + minutes * 60_000);
  const [remaining, setRemaining] = useState(minutes * 60);
  const expire = useRef(onExpire);
  const expired = useRef(false);
  expire.current = onExpire;
  useEffect(() => {
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0 && !expired.current) { expired.current = true; expire.current(); }
    };
    const timer = setInterval(tick, 250);
    tick();
    return () => clearInterval(timer);
  }, [deadline]);
  return <p className="text-xs text-muted flex items-center justify-between px-1" role="timer" aria-label={label}><span>{label}</span><span className="inline-flex items-center gap-1 tabular-nums" style={{ color: remaining < 60 ? 'var(--danger)' : 'var(--text-secondary)' }}><Timer size={13} /> {formatClock(remaining)}</span></p>;
}
