import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Circle, ChevronRight, Lock } from 'lucide-react';
import { UNITS } from '../data/units';
import { useProgressStore } from '../stores/progressStore';
import { Button } from '../components/ui/Button';

export function UnitDetail() {
  const { slug } = useParams<{ slug: string }>();
  const unit = UNITS.find(u => u.slug === slug);
  const { completedLessons, isUnit12Unlocked } = useProgressStore();

  if (!unit) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted">Unit not found.</p>
        <Link to="/" className="text-sm mt-2 block" style={{ color: 'var(--accent)' }}>← Back to home</Link>
      </div>
    );
  }

  const isLocked = unit.id === 'slang' && !isUnit12Unlocked();

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span
          className="w-20 h-20 mx-auto mb-5 rounded-[22px] flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-inset)' }}
        >
          <Lock size={36} className="text-muted" />
        </span>
        <h2 className="text-2xl font-bold mb-2 text-primary">Not yet!</h2>
        <p className="text-secondary">Complete 2 units to unlock this one.</p>
        <Link to="/">
          <Button variant="tinted" className="mt-5">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const completedCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* iOS back affordance */}
      <Link
        to="/"
        className="inline-flex items-center gap-0.5 text-[0.95rem] font-medium mb-5 no-underline ios-press"
        style={{ color: 'var(--accent)' }}
      >
        <ChevronLeft size={20} strokeWidth={2.4} className="-ml-1.5" /> Units
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 300 }}>
        {/* Header */}
        <div className="card p-6 mb-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <span
              className="w-16 h-16 rounded-[18px] flex items-center justify-center text-4xl flex-shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, ${unit.color} 14%, transparent)`,
                border: `0.5px solid color-mix(in srgb, ${unit.color} 22%, transparent)`,
              }}
            >
              {unit.emoji}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-primary">{unit.title}</h1>
                {unit.isA1 && <span className="a1-tag">A1</span>}
                {unit.isBeyondA1 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                    Bonus
                  </span>
                )}
              </div>
              <p className="text-sm text-muted font-medium mb-2">{unit.tagline}</p>
              <p className="text-sm text-secondary leading-relaxed">
                {unit.funnyDescription}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
              <div
                className="h-full rounded-full progress-bar-fill"
                style={{
                  width: `${Math.round((completedCount / unit.lessons.length) * 100)}%`,
                  backgroundColor: unit.color,
                }}
              />
            </div>
            <span className="text-xs text-muted whitespace-nowrap font-medium">
              {completedCount} / {unit.lessons.length} lessons
            </span>
          </div>
        </div>

        {/* Lesson list — iOS grouped inset list */}
        <p className="section-label">Lessons</p>
        <div className="inset-group">
          {unit.lessons.map((lesson, i) => {
            const done = completedLessons.includes(lesson.id);
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                  className="no-underline block"
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 500 }}
                    className="inset-row transition-colors hover:bg-[var(--bg-card-hover)]"
                    style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
                  >
                    {done
                      ? <CheckCircle2 size={22} style={{ color: unit.color, flexShrink: 0 }} />
                      : <Circle size={22} className="flex-shrink-0" style={{ color: 'var(--border)' }} />
                    }
                    <div className="flex-1 min-w-0 py-0.5">
                      <p className="font-semibold text-sm text-primary leading-snug">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted truncate">{lesson.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="xp-badge">+{lesson.xpReward} XP</span>
                      <ChevronRight size={16} className="text-muted opacity-60" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
