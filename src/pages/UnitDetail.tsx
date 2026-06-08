import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, ChevronRight, Lock } from 'lucide-react';
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
        <p className="text-[--text-muted]">Unit not found.</p>
        <Link to="/" className="text-[--accent] text-sm mt-2 block">← Back to home</Link>
      </div>
    );
  }

  const isLocked = unit.id === 'slang' && !isUnit12Unlocked();

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock size={48} className="mx-auto text-[--text-muted] mb-4" />
        <h2 className="text-2xl font-bold mb-2">Not yet!</h2>
        <p className="text-[--text-secondary]">Complete 2 units to unlock this one.</p>
        <Link to="/">
          <Button variant="primary" className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const completedCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text-primary] mb-6 transition-colors no-underline">
        <ArrowLeft size={14} /> Back to all units
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div
          className="card p-6 mb-6 relative overflow-hidden"
          style={{ borderTopColor: unit.color, borderTopWidth: 3 }}
        >
          <div className="flex items-start gap-4">
            <span className="text-5xl">{unit.emoji}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[--text-primary]">{unit.title}</h1>
                {unit.isA1 && <span className="a1-tag">A1</span>}
                {unit.isBeyondA1 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                    Bonus
                  </span>
                )}
              </div>
              <p className="text-sm text-[--text-muted] font-medium mb-2">{unit.tagline}</p>
              <p className="text-sm text-[--text-secondary] leading-relaxed">
                {unit.funnyDescription}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-[--border] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-bar-fill"
                style={{
                  width: `${Math.round((completedCount / unit.lessons.length) * 100)}%`,
                  backgroundColor: unit.color,
                }}
              />
            </div>
            <span className="text-xs text-[--text-muted] whitespace-nowrap">
              {completedCount} / {unit.lessons.length} lessons
            </span>
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex flex-col gap-3">
          {unit.lessons.map((lesson, i) => {
            const done = completedLessons.includes(lesson.id);
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                  className="no-underline block"
                >
                  <div className="card card-lift p-4 flex items-center gap-4">
                    {done
                      ? <CheckCircle2 size={22} style={{ color: unit.color, flexShrink: 0 }} />
                      : <Circle size={22} className="text-[--border] flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[--text-primary] truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-[--text-muted] truncate">{lesson.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="xp-badge">+{lesson.xpReward} XP</span>
                      <ChevronRight size={16} className="text-[--text-muted]" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
