import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { UNITS, getTotalLessons } from '../data/units';
import { useProgressStore } from '../stores/progressStore';
import { useLearnSearch } from '../stores/learnSearchStore';
import { getNextLesson } from '../utils/nextLesson';
import { defaultCard, vocabKey } from '../utils/srs';
import { OnboardingModal } from '../components/home/OnboardingModal';
import { TodayTicket } from '../components/home/TodayTicket';
import { Revisit } from '../components/home/Revisit';
import type { RevisitItem } from '../components/home/Revisit';
import { LineNetwork } from '../components/home/LineNetwork';
import { ButtonLink } from '../components/ui/Button';

const WEAK_EASE = 2.1;
const REVISIT_LIMIT = 3;

export function Home() {
  const completedLessons = useProgressStore(s => s.completedLessons);
  const onboardingDone = useProgressStore(s => s.onboardingDone);
  const bookmarkedLessons = useProgressStore(s => s.bookmarkedLessons);
  const srsData = useProgressStore(s => s.srsData);
  const slangUnlocked = useProgressStore(s => s.isUnit12Unlocked());
  const dueCount = useProgressStore(s => s.getDueReviewCount());
  const searchOpen = useLearnSearch(s => s.open);
  const query = useLearnSearch(s => s.query);
  const setQuery = useLearnSearch(s => s.setQuery);

  const nextUp = useMemo(() => getNextLesson(completedLessons, slangUnlocked), [completedLessons, slangUnlocked]);
  const isNewLearner = completedLessons.length === 0;

  const revisitItems = useMemo(() => {
    const items: RevisitItem[] = [];
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id) || lesson.vocab.length === 0) continue;
        const eases = lesson.vocab.map((_, index) => (srsData[vocabKey(lesson.id, index)] ?? defaultCard()).ease);
        const slipping = eases.filter(ease => ease < WEAK_EASE).length;
        const averageEase = eases.reduce((sum, ease) => sum + ease, 0) / eases.length;
        if (averageEase < WEAK_EASE) {
          items.push({ unit, lesson, reason: `Needs practice: ${slipping} ${slipping === 1 ? 'word keeps' : 'words keep'} slipping` });
        }
      }
    }
    for (const lessonId of bookmarkedLessons) {
      const unit = UNITS.find(candidate => candidate.lessons.some(lesson => lesson.id === lessonId));
      const lesson = unit?.lessons.find(candidate => candidate.id === lessonId);
      if (unit && lesson && !items.some(item => item.lesson.id === lessonId)) {
        items.push({ unit, lesson, reason: 'Saved for later' });
      }
    }
    return items.slice(0, REVISIT_LIMIT);
  }, [completedLessons, srsData, bookmarkedLessons]);

  return (
    <div className="page">
      <OnboardingModal open={!onboardingDone} />
      <h1 className="sr-only">Learn</h1>

      <div className="learn-grid">
        <section className="learn-today" aria-labelledby="today">
          {isNewLearner && nextUp ? (
            <div className="py-2">
              <h2 id="today" className="read-display">
                You've been teleported to France.
              </h2>
              <p className="t-body mt-3">
                Start with how French sounds, then work down the lines at your own pace. Every line is open.
              </p>
              <ButtonLink to={`/unit/${nextUp.unit.slug}/lesson/${nextUp.lesson.id}`} className="mt-5">
                Start line 1
              </ButtonLink>
            </div>
          ) : (
            <>
              <h2 id="today" className="h-section mb-1">
                Today
              </h2>
              {nextUp ? (
                <TodayTicket unit={nextUp.unit} lesson={nextUp.lesson} />
              ) : (
                <div className="sheet p-5">
                  <p className="t-title">Every line is finished.</p>
                  <p className="t-small mt-1">Keep your French sharp with practice and reviews.</p>
                  <ButtonLink to="/practice" className="mt-4">
                    Practice
                  </ButtonLink>
                </div>
              )}
            </>
          )}

          {dueCount > 0 && (
            <Link to="/review" className="notice">
              <RotateCcw size={20} className="text-enamel-text" aria-hidden="true" />
              <span className="notice__text flex-1">
                {dueCount} {dueCount === 1 ? 'card' : 'cards'} due
                <small>Spaced review keeps words from slipping</small>
              </span>
              <span className="btn btn--quiet btn--sm">Review</span>
            </Link>
          )}

          <Revisit items={revisitItems} />
        </section>

        <section aria-labelledby="lines">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="lines" className="h-section">
              Your lines
            </h2>
            <span className="t-small num">
              {completedLessons.length} of {getTotalLessons()} lessons done
            </span>
          </div>

          {searchOpen && (
            <input
              type="search"
              className="field mt-4"
              placeholder="Search lines by topic"
              aria-label="Search lines"
              value={query}
              onChange={event => setQuery(event.target.value)}
              autoFocus
            />
          )}

          <LineNetwork completedLessons={completedLessons} slangUnlocked={slangUnlocked} query={searchOpen ? query : ''} />
        </section>
      </div>
    </div>
  );
}
