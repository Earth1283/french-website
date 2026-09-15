import { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useClock } from '../hooks/useClock';
import { phraseByTick } from '../data/phrases';
import { Board } from '../components/ui/Board';
import { ButtonLink } from '../components/ui/Button';
import { Wordmark } from '../components/ui/Signage';
import { PomodoroTimer } from '../components/ambient/PomodoroTimer';
import { Postcard } from '../components/ambient/Postcard';
import { clockTime } from '../components/ambient/FlipClock';

const FOCUS_XP = 5;
const WORD_ROTATION_MS = 30_000;
const TOAST_MS = 4000;

export function Focus() {
  const addXP = useProgressStore(s => s.addXP);
  const now = useClock(1000);
  const [tick, setTick] = useState(0);
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setTick(value => value + 1), WORD_ROTATION_MS);
    return () => window.clearInterval(id);
  }, []);

  const handleComplete = () => {
    addXP(FOCUS_XP);
    setRewarded(true);
    window.setTimeout(() => setRewarded(false), TOAST_MS);
  };

  return (
    <div className="landing">
      <header className="flex items-center justify-between gap-4">
        <Wordmark />
        <ButtonLink to="/practice" variant="quiet">
          <X size={20} aria-hidden="true" />
          Leave focus
        </ButtonLink>
      </header>

      <div className="landing__grid">
        <Board
          titleAs="h1"
          titleId="focus-title"
          title="Focus"
          aside={<span className="board__status num">{clockTime(now)}</span>}
        >
          <PomodoroTimer onComplete={handleComplete} />
        </Board>

        <aside className="landing__side">
          <Postcard phrase={phraseByTick(tick)} label="Le mot du moment" now={now} />
        </aside>
      </div>

      {rewarded && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2" role="status">
          <span className="toast">
            <span lang="fr">Bravo&#8239;!</span>
            <span className="toast__xp flex items-center gap-1">
              <Zap size={16} aria-hidden="true" />+{FOCUS_XP} XP
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
