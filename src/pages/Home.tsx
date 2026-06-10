import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, RotateCcw } from 'lucide-react';
import { UNITS, getTotalLessons } from '../data/units';
import { useProgressStore } from '../stores/progressStore';
import { UnitCard } from '../components/home/UnitCard';
import { OnboardingModal } from '../components/home/OnboardingModal';
import { A1Banner } from '../components/home/A1Banner';
import { ProgressBar } from '../components/layout/ProgressBar';
import { vocabKey, defaultCard, isDue } from '../utils/srs';

export function Home() {
  const { completedLessons, onboardingDone, isUnit12Unlocked, streak, xp, bookmarkedLessons, srsData } = useProgressStore();
  const unit12Unlocked = isUnit12Unlocked();

  const totalLessons = getTotalLessons();
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  const nextUp = useMemo(() => {
    for (const unit of UNITS) {
      if (unit.id === 'slang' && !unit12Unlocked) continue;
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return { unit, lesson };
        }
      }
    }
    return null;
  }, [completedLessons, unit12Unlocked]);

  const todoItems = useMemo(() => {
    if (completedLessons.length === 0) return [];
    type Item = { unit: (typeof UNITS)[0]; lesson: (typeof UNITS)[0]['lessons'][0]; verb: string };
    const items: Item[] = [];

    for (const unit of UNITS) {
      if (unit.id === 'slang' && !unit12Unlocked) continue;
      const doneCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
      if (doneCount > 0 && doneCount < unit.lessons.length) {
        const next = unit.lessons.find(l => !completedLessons.includes(l.id));
        if (next) items.push({ unit, lesson: next, verb: 'finish' });
      }
      if (items.length >= 3) break;
    }

    if (items.length < 3 && nextUp) {
      const alreadyListed = items.some(i => i.lesson.id === nextUp.lesson.id);
      if (!alreadyListed) items.push({ unit: nextUp.unit, lesson: nextUp.lesson, verb: 'start' });
    }

    return items.slice(0, 3);
  }, [completedLessons, unit12Unlocked, nextUp]);

  const { dueCount, nextReviewDate } = useMemo(() => {
    if (completedLessons.length === 0) return { dueCount: 0, nextReviewDate: null };
    let count = 0;
    let earliest: string | null = null;
    const today = new Date().toISOString().slice(0, 10);
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) continue;
        lesson.vocab.forEach((_, idx) => {
          const card = srsData[vocabKey(lesson.id, idx)] ?? defaultCard();
          if (isDue(card)) {
            count++;
          } else if (card.nextReview > today) {
            if (!earliest || card.nextReview < earliest) earliest = card.nextReview;
          }
        });
      }
    }
    return { dueCount: count, nextReviewDate: earliest };
  }, [completedLessons, srsData]);

  const bookmarkDetails = useMemo(() => {
    return bookmarkedLessons.flatMap(lessonId => {
      for (const unit of UNITS) {
        const lesson = unit.lessons.find(l => l.id === lessonId);
        if (lesson) return [{ unit, lesson }];
      }
      return [];
    });
  }, [bookmarkedLessons]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <OnboardingModal open={!onboardingDone} />

      {/* Continue CTA — mobile only */}
      {nextUp && onboardingDone && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:hidden mb-5"
        >
          <Link to={`/unit/${nextUp.unit.slug}/lesson/${nextUp.lesson.id}`} className="no-underline block">
            <div
              className="card p-4 flex items-center justify-between gap-3 border-2 transition-opacity hover:opacity-90"
              style={{ borderColor: 'var(--accent)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  {nextUp.unit.emoji}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">Continue</p>
                  <p className="font-semibold text-sm text-[--text-primary]">{nextUp.lesson.title}</p>
                  <p className="text-xs text-[--text-muted]">{nextUp.unit.title}</p>
                </div>
              </div>
              <span className="text-[--accent] font-bold text-xl flex-shrink-0">→</span>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Sticky-note resume widget — desktop only */}
      <AnimatePresence>
        {todoItems.length > 0 && onboardingDone && (
          <motion.div
            key="sticky-note"
            className="hidden sm:block"
            initial={{ opacity: 0, rotate: -6, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, rotate: -2, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.35 }}
            style={{ position: 'fixed', top: '4.25rem', right: '1rem', zIndex: 30 }}
          >
            <div
              style={{
                backgroundColor: '#fef08a',
                color: '#4a3000',
                padding: '0.9rem 1.1rem 1rem',
                borderRadius: '2px',
                boxShadow: '3px 5px 14px rgba(0,0,0,0.25)',
                width: '15rem',
                fontFamily: "'Caveat', cursive",
                userSelect: 'none',
                borderTop: '3px solid #fbbf24',
              }}
            >
              <p style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.55, marginBottom: '0.5rem', lineHeight: 1.2 }}>
                todo:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {todoItems.map(({ unit, lesson, verb }) => (
                  <Link
                    key={lesson.id}
                    to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                    className="no-underline"
                    style={{ color: '#4a3000', display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}
                  >
                    <span style={{ opacity: 0.5, flexShrink: 0, fontSize: '1.1rem' }}>☐</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>
                      {verb} "{lesson.title}"
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <A1Banner />

      {/* Streak + XP row */}
      {(streak > 0 || xp > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-4 flex-wrap"
        >
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-bold">
              🔥 {streak} day streak
            </div>
          )}
          {xp > 0 && (
            <div className="xp-badge text-sm px-3 py-1.5">
              ⚡ {xp} XP total
            </div>
          )}
          <p className="text-xs text-[--text-muted]">Keep it up!</p>
        </motion.div>
      )}

      {/* Review banner */}
      {dueCount > 0 ? (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to="/review" className="no-underline block">
            <div
              className="card p-4 flex items-center justify-between gap-3 border-2 transition-opacity hover:opacity-90"
              style={{ borderColor: 'var(--accent)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  <RotateCcw size={16} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[--text-primary]">
                    {dueCount} card{dueCount !== 1 ? 's' : ''} due for review
                  </p>
                  <p className="text-xs text-[--text-muted]">Spaced repetition — keep your French sharp</p>
                </div>
              </div>
              <span className="text-[--accent] font-bold text-lg">→</span>
            </div>
          </Link>
        </motion.div>
      ) : nextReviewDate && completedLessons.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="card p-3 flex items-center gap-3 opacity-70">
            <RotateCcw size={14} className="text-[--text-muted] flex-shrink-0" />
            <p className="text-xs text-[--text-muted]">
              All caught up! Next review due{' '}
              <span className="font-semibold text-[--text-primary]">
                {new Date(nextReviewDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-[--text-primary] mb-3">
          You've been teleported
          <br />
          <span style={{ color: 'var(--accent)' }}>to France.</span>
        </h1>
        <p className="text-[--text-secondary] text-lg max-w-xl mx-auto">
          12 units of practical French — the stuff you actually need.
          Funny. Skippable. Honest about how weird French is.
        </p>

        {completedLessons.length > 0 && (
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-[--text-muted] mb-1.5">
              <span>Overall progress</span>
              <span className="font-bold">{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} height={8} />
          </div>
        )}
      </motion.div>

      {/* Bookmarked lessons */}
      {bookmarkDetails.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark size={13} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
            <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">Saved for later</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookmarkDetails.map(({ unit, lesson }) => (
              <Link
                key={lesson.id}
                to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                className="no-underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <span>{unit.emoji}</span>
                <span>{lesson.title}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Unit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UNITS.map((unit, i) => {
          const completedCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
          const progress = Math.round((completedCount / unit.lessons.length) * 100);
          const isLocked = unit.id === 'slang' && !unit12Unlocked;

          return (
            <UnitCard
              key={unit.id}
              unit={unit}
              progress={progress}
              isLocked={isLocked}
              index={i}
            />
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-[--text-muted] mt-10"
      >
        All units are skippable. No judgment. Learn what you need.
      </motion.p>
    </div>
  );
}
