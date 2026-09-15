import { Link, useParams } from 'react-router-dom';
import { BookOpenText, Bookmark, Check, ChevronLeft } from 'lucide-react';
import { UNITS } from '../data/units';
import { lineFor, lineStyle } from '../data/lines';
import { getDeepLessonPages } from '../content/deepLessons';
import { useProgressStore } from '../stores/progressStore';
import { ButtonLink } from '../components/ui/Button';
import { Roundel } from '../components/ui/Roundel';
import { LevelTag } from '../components/ui/Signage';
import { OhNon } from '../components/ui/Feedback';
import type { Lesson, Unit } from '../types';

type StopState = 'done' | 'here' | 'next';

function Stop({ unit, lesson, state, saved }: { unit: Unit; lesson: Lesson; state: StopState; saved: boolean }) {
  const to = `/unit/${unit.slug}/lesson/${lesson.id}`;
  const pages = getDeepLessonPages(unit.slug, lesson.id)?.length ?? 0;
  const dotLabel = { done: 'Done', here: 'Current lesson', next: 'Not started' }[state];

  return (
    <li className={`stop stop--${state}`}>
      <span className="stop__dot" role="img" aria-label={dotLabel}>
        {state === 'done' && <Check aria-hidden="true" />}
      </span>
      <div className="min-w-0">
        {state === 'here' && (
          <p className="youarehere">
            <span lang="fr">Vous êtes ici</span>
            <small>You are here</small>
          </p>
        )}
        <h2 className="stop__title">
          <Link to={to}>{lesson.title}</Link>
        </h2>
        <p className="stop__sub">{lesson.subtitle}</p>
        {state !== 'done' && (
          <p className="stop__meta num">
            <span>+{lesson.xpReward} XP</span>
            {pages > 0 && (
              <span className="stop__deep">
                <BookOpenText size={16} aria-hidden="true" />
                Full lesson, {pages} pages
              </span>
            )}
          </p>
        )}
      </div>
      <div className="stop__end">
        {state === 'done' && (
          <span className="stop__earned num">
            <Check size={16} aria-hidden="true" />+{lesson.xpReward} XP
          </span>
        )}
        {state === 'here' && (
          <ButtonLink to={to} size="sm">
            Start
          </ButtonLink>
        )}
        {state === 'next' && saved && <Bookmark size={16} className="text-enamel-text" aria-label="Saved for later" />}
      </div>
    </li>
  );
}

export function UnitDetail() {
  const { slug } = useParams<{ slug: string }>();
  const completedLessons = useProgressStore(s => s.completedLessons);
  const bookmarkedLessons = useProgressStore(s => s.bookmarkedLessons);
  const slangUnlocked = useProgressStore(s => s.isUnit12Unlocked());
  const unit = UNITS.find(candidate => candidate.slug === slug);

  const backLink = (
    <ButtonLink to="/learn" variant="quiet" className="-ml-1.5 mb-3">
      <ChevronLeft size={20} aria-hidden="true" />
      Learn
    </ButtonLink>
  );

  if (!unit) {
    return (
      <div className="page page--narrow">
        {backLink}
        <OhNon>There is no line at this address. Pick one from Learn.</OhNon>
      </div>
    );
  }

  const line = lineFor(unit);
  const locked = unit.id === 'slang' && !slangUnlocked;
  const doneCount = unit.lessons.filter(lesson => completedLessons.includes(lesson.id)).length;
  const hereIndex = unit.lessons.findIndex(lesson => !completedLessons.includes(lesson.id));
  const totalXp = unit.lessons.reduce((sum, lesson) => sum + lesson.xpReward, 0);
  const earnedXp = unit.lessons
    .filter(lesson => completedLessons.includes(lesson.id))
    .reduce((sum, lesson) => sum + lesson.xpReward, 0);

  return (
    <div className="page page--narrow">
      {backLink}

      <header className="unit-head">
        <Roundel line={line} size="xl" locked={locked} />
        <div className="min-w-0">
          <p className="unit-head__meta">
            <span>Line {line.number}</span>
            <LevelTag level={line.level} />
          </p>
          <h1 className="h-page">{unit.title}</h1>
          <p className="t-body mt-1">{unit.tagline}</p>
        </div>
      </header>

      {locked ? (
        <div className="mt-6">
          <p className="t-body">Finish 2 lines to unlock this one, or open it now in Settings.</p>
          <ButtonLink to="/learn" variant="secondary" className="mt-4">
            Back to Learn
          </ButtonLink>
        </div>
      ) : (
        <>
          <p className="unit-blurb">{unit.funnyDescription}</p>

          <div className="unit-progress t-small num">
            <span>
              {doneCount} of {unit.lessons.length} lessons done
            </span>
            <span>
              {earnedXp} of {totalXp} XP
            </span>
          </div>

          <ol className="linemap" style={lineStyle(line)}>
            {unit.lessons.map((lesson, index) => {
              const state: StopState = completedLessons.includes(lesson.id)
                ? 'done'
                : index === hereIndex
                  ? 'here'
                  : 'next';
              return (
                <Stop
                  key={lesson.id}
                  unit={unit}
                  lesson={lesson}
                  state={state}
                  saved={bookmarkedLessons.includes(lesson.id)}
                />
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
