import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';

export function A1Banner() {
  const { isA1Complete, earnedBadges } = useProgressStore();
  const [dismissed, setDismissed] = useState(false);

  const a1Done = isA1Complete();
  const hasBadge = earnedBadges.includes('a1-certified');

  if (!a1Done || !hasBadge || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="mb-6 p-4 rounded-xl border border-[--success] bg-[--success-light] flex items-center gap-3"
      >
        <GraduationCap size={22} className="text-[--success] flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-[--text-primary] text-sm">
            🎓 You've reached A1 level! Félicitations!
          </p>
          <p className="text-xs text-[--text-secondary] mt-0.5">
            You can now introduce yourself, order food, get around, and survive France without crying.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card] transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
