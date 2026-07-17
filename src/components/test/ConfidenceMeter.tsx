import { motion } from 'framer-motion';
import { SE_STOP_THRESHOLD } from '../../utils/irt';

interface ConfidenceMeterProps {
  se: number;
  questionNumber: number;
}

// SE starts at 1 (the prior's uncertainty) and the test stops once it drops
// below SE_STOP_THRESHOLD — so confidence is just that shrinking distance,
// normalized to 0-1. There's no fixed item count to show a "% of N" against.
export function ConfidenceMeter({ se, questionNumber }: ConfidenceMeterProps) {
  const confidence = Math.max(0, Math.min(1, (1 - se) / (1 - SE_STOP_THRESHOLD)));

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-muted whitespace-nowrap">
        Question {questionNumber}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--accent)', width: '100%', transformOrigin: 'left' }}
          animate={{ scaleX: confidence }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs text-muted whitespace-nowrap">
        {Math.round(confidence * 100)}% confident
      </span>
    </div>
  );
}
