import { Link } from 'react-router-dom';
import { ArrowRight, Home, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { BADGES } from '../../stores/progressStore';
import { speak } from '../../utils/speech';
import type { VocabItem } from '../../types';

interface MissedItem {
  prompt: string;
  answer: string;
  explanation?: string;
}

interface LessonCompleteProps {
  vocab: VocabItem[];
  firstTryCorrect: number;
  exerciseCount: number;
  alreadyCompleted: boolean;
  xpEarned: number;
  newBadges: string[];
  unitSlug: string;
  nextLessonId?: string;
  onReplay: () => void;
  missedItems?: MissedItem[];
}

function verdict(ratio: number): { title: string; note: string } {
  if (ratio === 1) return { title: 'Clean run.', note: 'Every answer right on the first try.' };
  if (ratio >= 0.7) return { title: 'Solid.', note: 'A couple of slips, and you’ve already had a second go at them.' };
  if (ratio >= 0.4) return { title: 'Getting there.', note: 'Plenty stuck. Read the notes on the misses below; review will bring them back.' };
  return { title: 'That one was hard.', note: 'Normal for a first pass. A replay tomorrow will feel very different.' };
}

export function LessonComplete({
  vocab, firstTryCorrect, exerciseCount, alreadyCompleted, xpEarned, newBadges, unitSlug, nextLessonId, onReplay, missedItems = [],
}: LessonCompleteProps) {
  const { title, note } = verdict(exerciseCount > 0 ? firstTryCorrect / exerciseCount : 1);

  return (
    <div className="w-full max-w-lg mx-auto py-6 space-y-7">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary font-display">{title}</h2>
        <p className="text-secondary">{note}</p>
        <p className="text-sm text-muted">
          {firstTryCorrect} of {exerciseCount} right first time
          {!alreadyCompleted && <> · <span className="xp-badge">+{xpEarned} XP</span></>}
        </p>
      </div>

      <div>
        <p className="section-label" style={{ paddingLeft: 0 }}>You can now say</p>
        <div className="inset-group">
          {vocab.map((item, i) => (
            <button
              key={item.french}
              type="button"
              onClick={() => speak(item.french)}
              className="w-full p-3 flex items-center gap-3 text-left cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ background: 'transparent', border: 'none', borderTop: i > 0 ? '0.5px solid var(--hairline)' : 'none' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold font-display" style={{ color: 'var(--accent)' }}>{item.french}</p>
                <p className="text-xs text-muted">{item.english}</p>
              </div>
              <Volume2 size={14} className="text-muted flex-shrink-0" aria-hidden />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          These join your review deck. A few minutes of review tomorrow does more than an hour next week.
        </p>
      </div>

      {missedItems.length > 0 && (
        <div>
          <p className="section-label" style={{ paddingLeft: 0 }}>Worth another look ({missedItems.length})</p>
          <div className="inset-group">
            {missedItems.map((item, i) => (
              <div
                key={i}
                className="p-3 flex items-start gap-3"
                style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
              >
                <XCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs text-muted">{item.prompt}</p>
                  <p className="text-sm font-semibold text-primary">{item.answer}</p>
                  {item.explanation && <p className="text-xs text-secondary leading-relaxed">{item.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {newBadges.length > 0 && (
        <div className="space-y-2">
          <p className="section-label" style={{ paddingLeft: 0 }}>Milestone</p>
          {newBadges.map(id => {
            const badge = BADGES[id];
            if (!badge) return null;
            return (
              <div key={id} className="card p-3 flex items-center gap-3">
                <span
                  className="text-2xl w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-tint)' }}
                >
                  {badge.emoji}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-sm text-primary">{badge.name}</p>
                  <p className="text-xs text-muted">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
        <Link to={`/unit/${unitSlug}`} className="flex flex-col">
          <Button variant="secondary">
            <Home size={16} /> Back to Unit
          </Button>
        </Link>
        <Button variant="secondary" onClick={onReplay}>
          <RotateCcw size={16} /> Replay
        </Button>
        {nextLessonId ? (
          <Link to={`/unit/${unitSlug}/lesson/${nextLessonId}`} className="flex flex-col">
            <Button variant="primary">
              Next Lesson <ArrowRight size={16} />
            </Button>
          </Link>
        ) : (
          <Link to="/review" className="flex flex-col">
            <Button variant="primary">
              Review <ArrowRight size={16} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
