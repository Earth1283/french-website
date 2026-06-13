import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { phraseOfDay } from '../../data/phrases';
import { speak } from '../../utils/speech';

/** The day's French proverb on glass, with a speak button (TTS reused from flashcards). */
export function PhraseOfDay() {
  const phrase = phraseOfDay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, type: 'spring', damping: 24, stiffness: 220 }}
      className="mx-auto max-w-md text-center text-white"
    >
      <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/45">
        Phrase du jour
      </p>
      <div className="flex items-start justify-center gap-2">
        <p className="font-display text-[clamp(1.05rem,3.4vw,1.4rem)] italic leading-snug text-white">
          {phrase.french}
        </p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => speak(phrase.french)}
          aria-label="Listen"
          className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <Volume2 size={14} />
        </motion.button>
      </div>
      <p className="mt-1.5 text-sm text-white/70">{phrase.english}</p>
      <p className="mt-0.5 text-xs italic text-white/40">{phrase.pronunciation}</p>
    </motion.div>
  );
}
