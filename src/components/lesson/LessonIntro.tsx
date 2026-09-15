import { BookOpenText, ChevronLeft } from 'lucide-react';
import type { Line } from '../../data/lines';
import type { Lesson } from '../../types';
import type { MarkdownPage } from '../../utils/markdownPage';
import { Button, ButtonLink } from '../ui/Button';
import { Roundel } from '../ui/Roundel';

interface LessonIntroProps {
  line: Line;
  lesson: Lesson;
  deepPages: MarkdownPage[] | null;
  onRead: () => void;
  onPractice: () => void;
}

export function LessonIntro({ line, lesson, deepPages, onRead, onPractice }: LessonIntroProps) {
  const { unit } = line;
  const position = unit.lessons.findIndex(candidate => candidate.id === lesson.id) + 1;

  return (
    <div className="page page--narrow">
      <ButtonLink to={`/unit/${unit.slug}`} variant="quiet" className="-ml-1.5 mb-4">
        <ChevronLeft size={20} aria-hidden="true" />
        Line {line.number}
      </ButtonLink>

      <div className="flex items-center gap-4">
        <Roundel line={line} size="lg" />
        <p className="unit-head__meta mb-0">
          {unit.title}, lesson {position} of {unit.lessons.length}
        </p>
      </div>

      <h1 className="h-page mt-5">{lesson.title}</h1>
      <p className="t-body mt-2">{lesson.subtitle}</p>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 t-small num">
        <li>{lesson.vocab.length} words</li>
        <li>{lesson.exercises.length} exercises</li>
        <li className="font-semibold text-amber-text">+{lesson.xpReward} XP</li>
        {deepPages && (
          <li className="flex items-center gap-1.5 text-enamel-text">
            <BookOpenText size={16} aria-hidden="true" />
            Full lesson, {deepPages.length} pages
          </li>
        )}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {deepPages ? (
          <>
            <Button onClick={onRead}>Read the full lesson</Button>
            <Button variant="quiet" onClick={onPractice}>
              Skip to practice
            </Button>
          </>
        ) : (
          <Button onClick={onPractice}>Start flashcards</Button>
        )}
      </div>
    </div>
  );
}
