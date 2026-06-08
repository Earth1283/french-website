import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <OnboardingModal open={!onboardingDone} />

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

      {/* Resume shortcut */}
      {nextUp && completedLessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Link
            to={`/unit/${nextUp.unit.slug}/lesson/${nextUp.lesson.id}`}
            className="no-underline block"
          >
            <div
              className="card card-lift p-4 flex items-center gap-4"
              style={{ borderLeftWidth: 4, borderLeftColor: nextUp.unit.color }}
            >
              <span className="text-3xl flex-shrink-0">{nextUp.unit.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[--text-muted] mb-0.5">
                  Continue where you left off
                </p>
                <p className="font-semibold text-[--text-primary] truncate">{nextUp.lesson.title}</p>
                <p className="text-xs text-[--text-muted] truncate">{nextUp.unit.title}</p>
              </div>
              <ArrowRight size={18} className="flex-shrink-0 text-[--text-muted]" />
            </div>
          </Link>
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
