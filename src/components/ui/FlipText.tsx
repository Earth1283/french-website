import { useEffect, useRef, useState } from 'react';

const FLIP_MS = 240;

interface FlipTextProps {
  value: string;
  cells?: boolean;
  label?: string;
  className?: string;
}

export function FlipText({ value, cells = false, label, className }: FlipTextProps) {
  const previous = useRef(value);
  const [changed, setChanged] = useState<boolean[]>([]);

  useEffect(() => {
    const before = previous.current;
    previous.current = value;
    if (before === value) return;
    setChanged([...value].map((char, index) => char !== before[index]));
    const timer = window.setTimeout(() => setChanged([]), FLIP_MS);
    return () => window.clearTimeout(timer);
  }, [value]);

  const rootClass = [cells ? 'flaps' : 'flipnum', className].filter(Boolean).join(' ');

  return (
    <>
      <span aria-hidden="true" className={rootClass}>
        {[...value].map((char, index) => {
          if (cells && char === ':') {
            return (
              <span key={index} className="flaps__colon">
                :
              </span>
            );
          }
          const classes = [cells && 'flap', changed[index] && 'flap--flipping'].filter(Boolean).join(' ');
          return (
            <span key={index} className={classes || undefined}>
              {char}
            </span>
          );
        })}
      </span>
      <span className="sr-only">{label ?? value}</span>
    </>
  );
}
