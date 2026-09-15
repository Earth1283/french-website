import { useProgressStore } from '../stores/progressStore';
import { useClock } from '../hooks/useClock';
import { phraseOfDay } from '../data/phrases';
import { DepartureBoard } from '../components/ambient/DepartureBoard';
import { Postcard } from '../components/ambient/Postcard';
import { ButtonLink } from '../components/ui/Button';
import { StatChip, Wordmark } from '../components/ui/Signage';

export function Landing() {
  const now = useClock(1000);
  const streak = useProgressStore(s => s.streak);
  const xp = useProgressStore(s => s.xp);

  return (
    <div className="landing">
      <header className="flex items-center justify-between gap-4">
        <Wordmark />
        <ButtonLink to="/learn" variant="quiet">
          Open the app
        </ButtonLink>
      </header>

      <div className="landing__grid">
        <DepartureBoard now={now} />

        <aside className="landing__side">
          <Postcard phrase={phraseOfDay(now)} label="Phrase du jour" now={now} />
          {(streak > 0 || xp > 0) && (
            <div className="flex flex-wrap gap-2">
              {streak > 0 && <StatChip kind="streak">{streak}-day streak</StatChip>}
              {xp > 0 && <StatChip kind="xp">{xp} XP</StatChip>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
