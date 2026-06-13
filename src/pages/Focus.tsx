import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { Backdrop } from '../components/ambient/Backdrop';
import { AmbientClock } from '../components/ambient/AmbientClock';
import { PomodoroTimer } from '../components/ambient/PomodoroTimer';
import { phraseByTick } from '../data/phrases';
import { speak } from '../utils/speech';
import { useProgressStore } from '../stores/progressStore';

const FOCUS_XP = 5;

/**
 * Focus / Study mode (route "/focus"). Ambient backdrop + a real Pomodoro timer,
 * with a French word-of-the-moment rotating every 30s for passive vocab exposure.
 */
export function Focus() {
  const addXP = useProgressStore(s => s.addXP);
  const [tick, setTick] = useState(0);
  const [reward, setReward] = useState<string | null>(null);
  const phrase = phraseByTick(tick);

  // Rotate the word-of-the-moment every 30s.
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const handleComplete = () => {
    addXP(FOCUS_XP);
    setReward(`Bravo ! +${FOCUS_XP} XP`);
    window.setTimeout(() => setReward(null), 4000);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center px-5 py-8 overflow-hidden">
      <Backdrop />

      {/* Top bar: small clock + exit */}
      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between">
        <AmbientClock size="sm" showSeconds={false} />
        <Link
          to="/learn"
          aria-label="Exit focus mode"
          className="no-underline flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:bg-white/20"
        >
          <X size={18} />
        </Link>
      </div>

      {/* Timer */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-6">
        <PomodoroTimer onComplete={handleComplete} />
      </div>

      {/* Word of the moment */}
      <div className="relative z-10 w-full max-w-md pb-[env(safe-area-inset-bottom)] text-center text-white">
        <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/40">
          Le mot du moment
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={tick}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2">
              <span className="font-display text-lg italic text-white">{phrase.french}</span>
              <button
                type="button"
                onClick={() => speak(phrase.french)}
                aria-label="Listen"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white/80 transition-colors hover:bg-white/25"
              >
                <Volume2 size={12} />
              </button>
            </div>
            <span className="mt-0.5 text-sm text-white/65">{phrase.english}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Completion reward toast */}
      <AnimatePresence>
        {reward && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 320 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-xl"
          >
            🎉 {reward}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
