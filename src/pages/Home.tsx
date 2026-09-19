import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, RotateCcw, ChevronRight, Sparkles, Search, TrendingDown } from 'lucide-react';
import { UNITS, getTotalLessons } from '../data/units';
import { useProgressStore } from '../stores/progressStore';
import { UnitCard } from '../components/home/UnitCard';
import { OnboardingModal } from '../components/home/OnboardingModal';
import { A1Banner } from '../components/home/A1Banner';
import { ProgressBar } from '../components/layout/ProgressBar';
import { TAP_SPRING } from '../utils/motion';
import { useHomeInsights } from '../hooks/useHomeInsights';
import { useLearningPath } from '../hooks/useLearningPath';
import { PathPanel } from '../components/home/PathPanel';
import { UpNextList } from '../components/home/UpNextList';
import { describeStep } from '../utils/learningPath';

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function Home() {
  const { completedLessons, onboardingDone, isUnit12Unlocked, streak, xp, bookmarkedLessons, srsData } = useProgressStore();
  const [searchQuery, setSearchQuery] = useState('');
  const unit12Unlocked = isUnit12Unlocked();

  const totalLessons = getTotalLessons();
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  const { dueCount, nextReviewDate, bookmarkDetails } = useHomeInsights({ completedLessons, srsData, bookmarkedLessons });
  const { path, fixUps } = useLearningPath();
  const testedOutUnitIds = new Set(path.testedOutUnitIds);
  const nextUp = path.steps[0];
  const todoItems = path.steps.slice(0, 3).map(step => ({
    ...step,
    verb: step.unit.lessons.some(l => completedLessons.includes(l.id)) ? 'Finish' : 'Start',
    why: describeStep(step),
  }));

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
              transition={TAP_SPRING}
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
                  <p className="text-xs text-muted truncate">{describeStep(nextUp) ?? nextUp.unit.title}</p>
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

      {/* "Up Next" — desktop only; mobile gets the Continue CTA above */}
      {todoItems.length > 0 && onboardingDone && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="card hidden sm:block overflow-hidden mb-6"
        >
          <UpNextList items={todoItems} />
        </motion.div>
      )}

      <A1Banner />

      {onboardingDone && <PathPanel path={path} />}

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
      <AnimatePresence mode="wait">
        {dueCount > 0 ? (
          <motion.div key="due" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
            <Link to="/review" className="no-underline block">
              <motion.div
                whileTap={{ scale: 0.98 }}
                transition={TAP_SPRING}
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
          <motion.div key="caught-up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
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
      </AnimatePresence>

      {/* Weak spots recommendation */}
      {fixUps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={13} style={{ color: 'var(--accent)' }} />
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Needs more practice</h2>
            </div>
            <div className="space-y-2">
              {fixUps.map(({ unit, lesson, reason }) => (
                <Link
                  key={lesson.id}
                  to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                  className="no-underline flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-[var(--bg-card-hover)]"
                  style={{ backgroundColor: 'var(--bg-inset)' }}
                >
                  <span
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: `color-mix(in srgb, ${unit.color} 15%, transparent)` }}
                  >
                    {unit.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-primary truncate">{lesson.title}</p>
                    <p className="text-xs text-muted truncate">{reason}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

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
          {UNITS.length} units of practical French — from your very first sound to arguing about it in B2.
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

      {/* Unit Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search units…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="ios-input w-full pl-9 pr-4"
        />
      </div>

      {/* Unit Grid — grouped by level, or flat filtered results */}
      {(() => {
        const unitWithMeta = UNITS.map((unit, i) => {
          const completedCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
          const progress = Math.round((completedCount / unit.lessons.length) * 100);
          const isLocked = unit.id === 'slang' && !unit12Unlocked;
          return { unit, progress, isLocked, index: i };
        });

        if (searchQuery.trim()) {
          const results = unitWithMeta.filter(({ unit }) =>
            fuzzyMatch(searchQuery.trim(), unit.title + ' ' + unit.tagline)
          );
          return results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(({ unit, progress, isLocked, index }) => (
                <UnitCard key={unit.id} unit={unit} progress={progress} isLocked={isLocked} testedOut={testedOutUnitIds.has(unit.id)} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted py-10">No units match "{searchQuery}"</p>
          );
        }

        const sections: Array<{ label: string; units: typeof unitWithMeta }> = [
          { label: 'Getting Started', units: unitWithMeta.filter(({ unit }) => unit.isPreA1) },
          { label: 'Core French', units: unitWithMeta.filter(({ unit }) => unit.isA1 && !unit.isPreA1 && !unit.isA1A2 && !unit.isBeyondA1) },
          { label: 'Going Further', units: unitWithMeta.filter(({ unit }) => unit.isA1A2) },
          { label: 'Bonus', units: unitWithMeta.filter(({ unit }) => unit.isBeyondA1) },
          { label: 'Connecting the Dots · A2→B1', units: unitWithMeta.filter(({ unit }) => unit.isBridge) },
          { label: 'Independent · B1', units: unitWithMeta.filter(({ unit }) => unit.isB1) },
          { label: 'Confident · B2', units: unitWithMeta.filter(({ unit }) => unit.isB2) },
        ];

        return (
          <div className="space-y-8">
            {sections.map(({ label, units }) =>
              units.length === 0 ? null : (
                <div key={label}>
                  <p className="section-label">{label}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {units.map(({ unit, progress, isLocked, index }) => (
                      <UnitCard key={unit.id} unit={unit} progress={progress} isLocked={isLocked} testedOut={testedOutUnitIds.has(unit.id)} index={index} />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        );
      })()}

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
