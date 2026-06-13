import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useClock } from '../../hooks/useClock';

interface Props {
  /** 'lg' = hero (Landing), 'sm' = secondary (Focus). */
  size?: 'lg' | 'sm';
  showSeconds?: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Giant ultra-thin clock. The date underneath shows in French by default and
 * morphs to English on hover/focus (and back). Driven by the shared useClock.
 */
export function AmbientClock({ size = 'lg', showSeconds = true }: Props) {
  const now = useClock(1000);
  const [showEnglish, setShowEnglish] = useState(false);
  const reduceMotion = useReducedMotion();

  const time = showSeconds
    ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    : `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const frDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const enDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const dateText = showEnglish ? enDate : frDate;

  const timeClass =
    size === 'lg'
      ? 'text-[clamp(3.5rem,16vw,9rem)] leading-none'
      : 'text-[clamp(2.25rem,9vw,4rem)] leading-none';

  return (
    <div className="text-center text-white select-none">
      <div
        className={`${timeClass} font-extralight tabular-nums`}
        style={{ letterSpacing: '-0.02em', textShadow: '0 2px 30px rgba(0,0,0,0.35)' }}
      >
        {time}
      </div>

      <button
        type="button"
        onMouseEnter={() => setShowEnglish(true)}
        onMouseLeave={() => setShowEnglish(false)}
        onFocus={() => setShowEnglish(true)}
        onBlur={() => setShowEnglish(false)}
        onClick={() => setShowEnglish(v => !v)}
        aria-label={`Date: ${frDate} (${enDate})`}
        className="mt-1 inline-block cursor-pointer border-0 bg-transparent p-0 capitalize text-white/85"
        style={{ fontSize: size === 'lg' ? '1.05rem' : '0.9rem', letterSpacing: '0.01em' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={dateText}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="inline-block"
          >
            {dateText}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
