import { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { BADGES } from '../../stores/progressStore';
import type { Line } from '../../data/lines';
import { Badge } from '../ui/Badge';
import { badgeIcon, stampTilt } from '../ui/badgeIcons';
import { Button, ButtonLink } from '../ui/Button';
import { FlipText } from '../ui/FlipText';
import { Roundel } from '../ui/Roundel';
import { StationDots } from '../ui/Signage';

interface MissedItem {
  prompt: string;
  answer: string;
}

interface LessonCompleteProps {
  line: Line;
  lessonsDone: number;
  xpEarned: number;
  newBadges: string[];
  nextLessonId?: string;
  onReplay: () => void;
  missedItems: MissedItem[];
}

const XP_REVEAL_DELAY_MS = 240;

export function LessonComplete({ line, lessonsDone, xpEarned, newBadges, nextLessonId, onReplay, missedItems }: LessonCompleteProps) {
  const { unit } = line;
  const digits = String(xpEarned).length;
  const [shownXp, setShownXp] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setShownXp(xpEarned), XP_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [xpEarned]);

  return (
    <div className="page page--narrow">
      <div className="flex items-center gap-4">
        <Roundel line={line} size="lg" />
        <div>
          <p className="unit-head__meta mb-1">Line {line.number}</p>
          <StationDots line={line} done={lessonsDone} total={unit.lessons.length} />
        </div>
      </div>

      <h1 className="h-page mt-6">Lesson complete</h1>
      <p className="t-body mt-1">You absolute legend.</p>

      <p className="mt-6 text-48 font-bold leading-none text-amber-text">
        <FlipText value={`+${String(shownXp).padStart(digits, '0')}`} label={`${xpEarned} XP earned`} /> XP
      </p>

      {newBadges.length > 0 && (
        <section className="mt-8" aria-labelledby="new-stamps">
          <h2 id="new-stamps" className="h-section text-21">
            New stamps
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {newBadges.flatMap((id, index) => {
              const badge = BADGES[id];
              if (!badge) return [];
              return [
                <Badge key={id} icon={badgeIcon(id)} name={badge.name} description={badge.description} earned tilt={stampTilt(index)} />,
              ];
            })}
          </div>
        </section>
      )}

      {missedItems.length > 0 && (
        <section className="mt-8" aria-labelledby="mistakes">
          <h2 id="mistakes" className="h-section text-21">
            Review your mistakes
          </h2>
          <ul className="sheet rows mt-3">
            {missedItems.map((item, index) => (
              <li key={index} className="row items-start">
                <X size={16} className="mt-1 text-signal-text" aria-label="Missed" />
                <span className="min-w-0">
                  <span className="t-small block">{item.prompt}</span>
                  <span className="fr-solo block text-18">{item.answer}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {nextLessonId && <ButtonLink to={`/unit/${unit.slug}/lesson/${nextLessonId}`}>Next lesson</ButtonLink>}
        <ButtonLink to={`/unit/${unit.slug}`} variant={nextLessonId ? 'quiet' : 'primary'}>
          Back to line {line.number}
        </ButtonLink>
        <Button variant="quiet" onClick={onReplay}>
          <RotateCcw size={16} aria-hidden="true" />
          Replay
        </Button>
      </div>
    </div>
  );
}
