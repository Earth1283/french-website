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
        className="mb-6 p-4 flex items-center gap-3"
        style={{
          backgroundColor: 'var(--success-light)',
          border: '0.5px solid color-mix(in srgb, var(--success) 35%, transparent)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <span
          className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-white"
          style={{ backgroundColor: 'var(--success)' }}
        >
          <GraduationCap size={20} />
        </span>
        <div className="flex-1">
          <p className="font-bold text-primary text-sm">
            🎓 You've reached A1 level! Félicitations!
          </p>
          <p className="text-xs text-secondary mt-0.5">
            You can now introduce yourself, order food, get around, and survive France without crying.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="p-1.5 rounded-full ios-press cursor-pointer flex-shrink-0"
          style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', border: 'none' }}
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
