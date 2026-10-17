import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ArrowRight } from 'lucide-react';
import { REVEAL } from '../../utils/motion';
import { speak } from '../../utils/speech';
import { Button } from '../ui/Button';

export type FeedbackTone = 'wrong' | 'almost';

interface AnswerFeedbackProps {
  tone: FeedbackTone;
  answer: string;
  heading?: string;
  given?: string;
  givenLabel?: string;
  explanation?: string;
  onContinue?: () => void;
}

const TONE_STYLE: Record<FeedbackTone, { background: string; border: string; label: string }> = {
  wrong: {
    background: 'color-mix(in srgb, var(--danger) 7%, var(--bg-card))',
    border: 'color-mix(in srgb, var(--danger) 25%, transparent)',
    label: 'var(--danger)',
  },
  almost: {
    background: 'color-mix(in srgb, #f59e0b 9%, var(--bg-card))',
    border: 'color-mix(in srgb, #f59e0b 30%, transparent)',
    label: '#b45309',
  },
};

export function AnswerFeedback({ tone, answer, heading, given, givenLabel = 'You wrote', explanation, onContinue }: AnswerFeedbackProps) {
  const style = TONE_STYLE[tone];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  return (
    <motion.div ref={ref} {...REVEAL} className="space-y-3" role="status">
      <div
        className="p-4 space-y-2"
        style={{ backgroundColor: style.background, border: `1px solid ${style.border}`, borderRadius: 'var(--radius-sm)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: style.label }}>
          {heading ?? (tone === 'wrong' ? 'The answer' : 'Accepted, but check the spelling')}
        </p>
        {given && (
          <p className="text-sm text-muted">
            {givenLabel} {tone === 'wrong' ? <s>{given}</s> : <span lang="fr">“{given}”</span>}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-primary">{answer}</p>
          <button
            type="button"
            onClick={() => speak(answer)}
            className="w-8 h-8 flex items-center justify-center rounded-full ios-press cursor-pointer flex-shrink-0"
            style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
            aria-label="Hear the answer"
          >
            <Volume2 size={16} />
          </button>
        </div>
        {explanation && (
          <p className="text-sm text-secondary leading-relaxed pt-2" style={{ borderTop: '0.5px solid var(--hairline)' }}>
            {explanation}
          </p>
        )}
      </div>
      {onContinue && (
        <Button autoFocus onClick={onContinue} className="w-full">
          Continue <ArrowRight size={16} />
        </Button>
      )}
    </motion.div>
  );
}
