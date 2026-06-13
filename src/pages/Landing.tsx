import { motion } from 'framer-motion';
import { Backdrop } from '../components/ambient/Backdrop';
import { AmbientClock } from '../components/ambient/AmbientClock';
import { Greeting } from '../components/ambient/Greeting';
import { PhraseOfDay } from '../components/ambient/PhraseOfDay';
import { Launcher } from '../components/ambient/Launcher';

/**
 * Ambient front door (route "/"). Full-bleed backdrop with the giant clock,
 * a time-aware French greeting, the phrase of the day, and a glass launcher
 * into the rest of the app.
 */
export function Landing() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden px-5 py-10 sm:py-14">
      <Backdrop />

      {/* Top: clock + greeting */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="relative z-10 flex flex-col items-center gap-5 pt-6"
      >
        <AmbientClock size="lg" />
        <Greeting />
      </motion.div>

      {/* Middle: phrase of the day */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-8">
        <PhraseOfDay />
      </div>

      {/* Bottom: launcher */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 24, stiffness: 220 }}
        className="relative z-10 w-full pb-[env(safe-area-inset-bottom)]"
      >
        <Launcher />
      </motion.div>
    </div>
  );
}
