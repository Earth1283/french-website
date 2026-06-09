import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UNITS, getTotalLessons } from '../data/units';
import { useProgressStore } from '../stores/progressStore';
import { UnitCard } from '../components/home/UnitCard';
import { OnboardingModal } from '../components/home/OnboardingModal';
import { A1Banner } from '../components/home/A1Banner';
import { ProgressBar } from '../components/layout/ProgressBar';

export function Home() {
  const { completedLessons, onboardingDone, isUnit12Unlocked, streak, xp } = useProgressStore();
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

  // Sticky note: up to 3 items — in-progress units first, then next unstarted unit.
  // Only shown after the user has done at least one lesson.
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

    // Pad with the next fully-unstarted unit if we have room
    if (items.length < 3 && nextUp) {
      const alreadyListed = items.some(i => i.lesson.id === nextUp.lesson.id);
      if (!alreadyListed) items.push({ unit: nextUp.unit, lesson: nextUp.lesson, verb: 'start' });
    }

    return items.slice(0, 3);
  }, [completedLessons, unit12Unlocked, nextUp]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <OnboardingModal open={!onboardingDone} />

      {/* Sticky-note resume widget — desktop only, only after user has started */}
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

      {/* Streak + XP row when user has progress */}
      {(streak > 0 || xp > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-6 flex-wrap"
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

      {/* Footer note */}
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
