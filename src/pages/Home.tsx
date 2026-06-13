import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';
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
        if (next) items.push({ unit, lesson: next, verb: 'Finish' });
      }
      if (items.length >= 3) break;
    }

    if (items.length < 3 && nextUp) {
      const alreadyListed = items.some(i => i.lesson.id === nextUp.lesson.id);
      if (!alreadyListed) items.push({ unit: nextUp.unit, lesson: nextUp.lesson, verb: 'Start' });
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

      {/* Continue CTA — mobile only, only after starting at least one lesson */}
      {nextUp && onboardingDone && completedLessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="sm:hidden mb-5"
        >
          <Link to={`/unit/${nextUp.unit.slug}/lesson/${nextUp.lesson.id}`} className="no-underline block">
            <motion.div
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', damping: 20, stiffness: 500 }}
              className="glass-card p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-[13px] flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ backgroundColor: 'var(--accent)', boxShadow: 'var(--shadow-1)' }}
                >
                  {nextUp.unit.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold text-muted uppercase tracking-wider">Continue</p>
                  <p className="font-semibold text-sm text-primary truncate">{nextUp.lesson.title}</p>
                  <p className="text-xs text-muted truncate">{nextUp.unit.title}</p>
                </div>
              </div>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)' }}
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </span>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* "Up Next" glass widget — desktop only */}
      <AnimatePresence>
        {todoItems.length > 0 && onboardingDone && (
          <motion.div
            key="up-next-widget"
            className="hidden sm:block"
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.3 }}
            style={{ position: 'fixed', top: '4.5rem', right: '1.25rem', zIndex: 30, width: '16.5rem' }}
          >
            <div className="glass-card overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-2">
                <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted">Up next</p>
              </div>
              <div>
                {todoItems.map(({ unit, lesson, verb }, i) => (
                  <Link
                    key={lesson.id}
                    to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                    className="no-underline flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]"
                    style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
                  >
                    <span
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: `color-mix(in srgb, ${unit.color} 14%, transparent)` }}
                    >
                      {unit.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary truncate">{lesson.title}</p>
                      <p className="text-[0.68rem] text-muted truncate">{verb} · {unit.title}</p>
                    </div>
                    <ChevronRight size={13} className="text-muted flex-shrink-0 opacity-60" />
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
          className="flex items-center gap-2.5 mb-4 flex-wrap"
        >
          {streak > 0 && (
            <div className="chip" style={{ color: '#ea7317', backgroundColor: 'var(--gold-light)', border: 'none' }}>
              🔥 {streak} day streak
            </div>
          )}
          {xp > 0 && (
            <div className="xp-badge text-sm px-3 py-1.5">
              ⚡ {xp} XP total
            </div>
          )}
          <p className="text-xs text-muted">Keep it up!</p>
        </motion.div>
      )}

      {/* Review banner */}
      {dueCount > 0 ? (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to="/review" className="no-underline block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', damping: 20, stiffness: 500 }}
              className="card card-lift p-4 flex items-center justify-between gap-3"
              style={{ backgroundColor: 'var(--accent-soft-bg)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <RotateCcw size={17} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-primary">
                    {dueCount} card{dueCount !== 1 ? 's' : ''} due for review
                  </p>
                  <p className="text-xs text-muted">Spaced repetition — keep your French sharp</p>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
            </motion.div>
          </Link>
        </motion.div>
      ) : nextReviewDate && completedLessons.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="card p-3 flex items-center gap-3 opacity-70">
            <RotateCcw size={14} className="text-muted flex-shrink-0" />
            <p className="text-xs text-muted">
              All caught up! Next review due{' '}
              <span className="font-semibold text-primary">
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
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="mb-10 text-center"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
          You've been teleported
          <br />
          <span className="french-word">to France.</span>
        </h1>
        <p className="text-secondary text-lg max-w-xl mx-auto">
          21 units of practical French — from your very first sound to real conversation.
          Funny. Skippable. Honest about how weird French is.
        </p>

        {completedLessons.length > 0 && (
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-muted mb-1.5">
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
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Saved for later</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookmarkDetails.map(({ unit, lesson }) => (
              <Link
                key={lesson.id}
                to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                className="no-underline chip ios-press hover:bg-[var(--bg-card-hover)]"
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
        className="text-center text-xs text-muted mt-10"
      >
        All units are skippable. No judgment. Learn what you need.
      </motion.p>
    </div>
  );
}
