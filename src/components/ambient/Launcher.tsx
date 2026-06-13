import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Timer, BookOpen, MessageSquare, Play, ArrowRight } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';
import { getNextLesson } from '../../utils/nextLesson';

const TAP = { type: 'spring', damping: 18, stiffness: 480 } as const;

/** Frosted-glass pill styling for actions floating over the photo. */
const glassPill =
  'no-underline pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white/90 ' +
  'border border-white/20 bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20';

export function Launcher() {
  const { completedLessons, isUnit12Unlocked, streak, xp } = useProgressStore();
  const next = getNextLesson(completedLessons, isUnit12Unlocked());
  const started = completedLessons.length > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Streak / XP — compact glass chips */}
      {(streak > 0 || xp > 0) && (
        <div className="flex items-center gap-2 text-xs font-semibold text-white/85">
          {streak > 0 && (
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
              🔥 {streak} day{streak !== 1 ? 's' : ''}
            </span>
          )}
          {xp > 0 && (
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
              ⚡ {xp} XP
            </span>
          )}
        </div>
      )}

      {/* Primary CTA — continue / start the next lesson */}
      {next && (
        <motion.div whileTap={{ scale: 0.97 }} transition={TAP} className="w-full max-w-sm">
          <Link
            to={`/unit/${next.unit.slug}/lesson/${next.lesson.id}`}
            className="no-underline flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-xl transition-colors hover:bg-white/25"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl">
                {next.unit.emoji}
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[0.62rem] font-semibold uppercase tracking-wider text-white/55">
                  {started ? 'Continue' : 'Start learning'}
                </span>
                <span className="block truncate text-sm font-semibold text-white">{next.lesson.title}</span>
              </span>
            </span>
            <ChevronRight size={18} className="flex-shrink-0 text-white/80" />
          </Link>
        </motion.div>
      )}

      {/* Secondary launcher pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <motion.div whileTap={{ scale: 0.94 }} transition={TAP}>
          <Link to="/focus" className={glassPill}>
            <Timer size={15} /> Focus
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.94 }} transition={TAP}>
          <Link to="/phrasebook" className={glassPill}>
            <BookOpen size={15} /> Phrasebook
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.94 }} transition={TAP}>
          <Link to="/converse" className={glassPill}>
            <MessageSquare size={15} /> Converse
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.94 }} transition={TAP}>
          <Link
            to="/learn"
            className="no-underline pointer-events-auto flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-transform hover:gap-2.5"
          >
            {started ? <ArrowRight size={15} /> : <Play size={15} />}
            Enter
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
