import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Home, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { BADGES } from '../../stores/progressStore';

interface MissedItem {
  prompt: string;
  answer: string;
}

interface LessonCompleteProps {
  xpEarned: number;
  newBadges: string[];
  unitSlug: string;
  nextLessonId?: string;
  onReplay: () => void;
  missedItems?: MissedItem[];
}

const CONFETTI_COLORS = ['#E63946', '#F4A261', '#2A9D8F', '#6A4C93', '#E9C46A', '#3B82F6', '#EC4899'];

function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 340,
      y: -(Math.random() * 220 + 80),
      rotate: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      delay: Math.random() * 0.15,
    }))
  , []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: p.scale, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale * 0.4, rotate: p.rotate }}
          transition={{ duration: 0.9 + Math.random() * 0.4, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.shape === 'rect' ? 8 : 7,
            height: p.shape === 'rect' ? 12 : 7,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

export function LessonComplete({ xpEarned, newBadges, unitSlug, nextLessonId, onReplay, missedItems }: LessonCompleteProps) {
  return (
    <div className="w-full max-w-lg mx-auto text-center py-8 space-y-6">
      <div className="relative inline-block">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <Confetti />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-3xl font-bold text-primary">Lesson Complete!</h2>
        <p className="text-secondary mt-1">You absolute legend.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', damping: 16, stiffness: 320 }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xl"
        style={{ backgroundColor: 'var(--gold-light)', color: '#b86a20', boxShadow: 'var(--shadow-1)' }}
      >
        <Trophy size={22} />
        +{xpEarned} XP
      </motion.div>

      {newBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <p className="text-sm font-semibold text-muted">New badges earned:</p>
          {newBadges.map(id => {
            const badge = BADGES[id];
            if (!badge) return null;
            return (
              <div key={id} className="card p-3 flex items-center gap-3">
                <span
                  className="text-2xl w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-tint)' }}
                >
                  {badge.emoji}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-sm text-primary">{badge.name}</p>
                  <p className="text-xs text-muted">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {missedItems && missedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-left w-full"
        >
          <p className="section-label" style={{ paddingLeft: 0 }}>
            Review your mistakes ({missedItems.length})
          </p>
          <div className="inset-group">
            {missedItems.map((item, i) => (
              <div
                key={i}
                className="p-3 flex items-start gap-3"
                style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
              >
                <XCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                <div className="min-w-0">
                  <p className="text-xs text-muted truncate">{item.prompt}</p>
                  <p className="text-sm font-semibold text-primary">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center"
      >
        <Link to={`/unit/${unitSlug}`} className="flex flex-col">
          <Button variant="secondary">
            <Home size={16} /> Back to Unit
          </Button>
        </Link>
        <Button variant="secondary" onClick={onReplay}>
          <RotateCcw size={16} /> Replay
        </Button>
        {nextLessonId && (
          <Link to={`/unit/${unitSlug}/lesson/${nextLessonId}`} className="flex flex-col">
            <Button variant="primary">
              Next Lesson <ArrowRight size={16} />
            </Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
