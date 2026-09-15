import { useState } from 'react';
import { FlipText } from '../ui/FlipText';

const pad = (value: number) => value.toString().padStart(2, '0');

export function clockTime(now: Date): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function FlipClock({ now }: { now: Date }) {
  const [showEnglish, setShowEnglish] = useState(false);
  const time = clockTime(now);
  const frenchDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const englishDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="landing__clock">
      <FlipText value={time} cells label={`The time is ${time}`} />
      <button
        type="button"
        className="landing__date"
        lang={showEnglish ? 'en' : 'fr'}
        aria-label={`${frenchDate}, ${englishDate}`}
        onMouseEnter={() => setShowEnglish(true)}
        onMouseLeave={() => setShowEnglish(false)}
        onFocus={() => setShowEnglish(true)}
        onBlur={() => setShowEnglish(false)}
        onClick={() => setShowEnglish(value => !value)}
      >
        {showEnglish ? englishDate : frenchDate}
      </button>
    </div>
  );
}
