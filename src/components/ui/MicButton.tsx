import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';
import { TAP_TRANSITION } from '../../utils/motion';

interface MicButtonProps {
  listening: boolean;
  onClick: () => void;
  disabled?: boolean;
  idleLabel?: string;
  diameter?: number;
}

export function MicButton({ listening, onClick, disabled, idleLabel = 'Say it out loud', diameter = 40 }: MicButtonProps) {
  const icon = Math.round(diameter * 0.45);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      transition={TAP_TRANSITION}
      aria-label={listening ? 'Stop listening' : idleLabel}
      aria-pressed={listening}
      className="relative flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer disabled:opacity-40"
      style={{
        width: diameter,
        height: diameter,
        border: 'none',
        backgroundColor: listening ? 'var(--accent)' : 'var(--accent-tint)',
        color: listening ? '#fff' : 'var(--accent)',
      }}
    >
      {listening && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid var(--accent)' }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {listening ? <Square size={Math.round(icon * 0.75)} fill="currentColor" /> : <Mic size={icon} />}
    </motion.button>
  );
}
