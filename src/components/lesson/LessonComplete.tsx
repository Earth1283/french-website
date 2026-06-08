import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Home, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { BADGES } from '../../stores/progressStore';

interface LessonCompleteProps {
  xpEarned: number;
  newBadges: string[];
  unitSlug: string;
  nextLessonId?: string;
  onReplay: () => void;
}

export function LessonComplete({ xpEarned, newBadges, unitSlug, nextLessonId, onReplay }: LessonCompleteProps) {
  return (
    <div className="w-full max-w-lg mx-auto text-center py-8 space-y-6">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="text-6xl"
      >
        🎉
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-3xl font-bold text-[--text-primary]">Lesson Complete!</h2>
        <p className="text-[--text-secondary] mt-1">You absolute legend.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="inline-flex items-center gap-2 bg-[--gold-light] text-yellow-700 dark:text-[--gold] px-6 py-3 rounded-xl font-bold text-xl"
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
          <p className="text-sm font-semibold text-[--text-muted]">New badges earned:</p>
          {newBadges.map(id => {
            const badge = BADGES[id];
            if (!badge) return null;
            return (
              <div key={id} className="card p-3 flex items-center gap-3">
                <span className="text-2xl">{badge.emoji}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm">{badge.name}</p>
                  <p className="text-xs text-[--text-muted]">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3 justify-center flex-wrap"
      >
        <Link to={`/unit/${unitSlug}`}>
          <Button variant="secondary">
            <Home size={16} /> Back to Unit
          </Button>
        </Link>
        <Button variant="secondary" onClick={onReplay}>
          <RotateCcw size={16} /> Replay
        </Button>
        {nextLessonId && (
          <Link to={`/unit/${unitSlug}/lesson/${nextLessonId}`}>
            <Button variant="primary">
              Next Lesson <ArrowRight size={16} />
            </Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
