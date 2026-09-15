import { Bookmark, X } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';
import type { Line } from '../../data/lines';
import type { Lesson } from '../../types';
import { Button, ButtonLink } from '../ui/Button';
import { TripProgress } from '../ui/Signage';

interface LessonBarProps {
  line: Line;
  lesson: Lesson;
  step?: number;
  total?: number;
  caption?: string;
}

export function LessonBar({ line, lesson, step = 0, total = 0, caption }: LessonBarProps) {
  const saved = useProgressStore(s => s.bookmarkedLessons.includes(lesson.id));
  const toggleBookmark = useProgressStore(s => s.toggleBookmark);

  return (
    <div className="lessonbar">
      <div className="lessonbar__inner">
        <ButtonLink to={`/unit/${line.unit.slug}`} variant="quiet" aria-label={`Close lesson, back to line ${line.number}`}>
          <X size={22} aria-hidden="true" />
        </ButtonLink>
        {total > 0 ? (
          <>
            <TripProgress step={step} total={total} label="Lesson progress" />
            <span className="t-small num whitespace-nowrap">
              {step} / {total}
            </span>
          </>
        ) : (
          <span className="t-small num flex-1 truncate">{caption ?? lesson.title}</span>
        )}
        <Button
          variant="quiet"
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved lessons' : 'Save for later'}
          onClick={() => toggleBookmark(lesson.id)}
        >
          <Bookmark size={20} aria-hidden="true" className={saved ? 'is-saved' : undefined} />
        </Button>
      </div>
    </div>
  );
}
