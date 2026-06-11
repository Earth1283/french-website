import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Volume2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { Button } from '../ui/Button';
import { speak } from '../../utils/speech';
import { checkAnswer } from '../../utils/fuzzy';

interface TranslationChallengeProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  idle: {},
  correct: {
    borderColor: 'var(--success)',
    backgroundColor: 'var(--success-light)',
    boxShadow: '0 0 0 3.5px color-mix(in srgb, var(--success) 15%, transparent)',
  },
  typo: {
    borderColor: '#f59e0b',
    backgroundColor: 'color-mix(in srgb, #f59e0b 10%, var(--bg-card))',
    boxShadow: '0 0 0 3.5px color-mix(in srgb, #f59e0b 15%, transparent)',
  },
  wrong: {
    borderColor: 'var(--danger)',
    backgroundColor: 'color-mix(in srgb, var(--danger) 8%, var(--bg-card))',
    boxShadow: '0 0 0 3.5px color-mix(in srgb, var(--danger) 12%, transparent)',
  },
};

export function TranslationChallenge({ exercise, onCorrect, onWrong }: TranslationChallengeProps) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'typo' | 'wrong'>('idle');

  const check = () => {
    if (!value.trim()) return;
    const result = checkAnswer(value.trim(), exercise.answer);
    setStatus(result);
    setTimeout(() => {
      if (result === 'correct' || result === 'typo') onCorrect();
      else onWrong();
    }, result === 'wrong' ? 1400 : 1200);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="card p-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Translation</p>
        <p className="text-lg font-semibold text-primary leading-snug">{exercise.prompt}</p>
        {exercise.hint && (
          <p className="text-xs text-muted italic mt-1">💡 {exercise.hint}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={value}
            onChange={e => { if (status === 'idle') setValue(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check(); } }}
            placeholder="Type your translation"
            disabled={status !== 'idle'}
            rows={2}
            className="ios-input resize-none text-sm font-medium"
            style={{ padding: '1rem', ...STATUS_STYLES[status] }}
            autoFocus
          />
          {status === 'correct' && (
            <div className="absolute right-3 top-3">
              <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            </div>
          )}
          {status === 'typo' && (
            <div className="absolute right-3 top-3">
              <AlertCircle size={18} className="text-amber-500" />
            </div>
          )}
          {status === 'wrong' && (
            <div className="absolute right-3 top-3">
              <XCircle size={18} style={{ color: 'var(--danger)' }} />
            </div>
          )}
        </div>

        {status === 'typo' && (
          <div
            className="p-3"
            style={{
              backgroundColor: 'color-mix(in srgb, #f59e0b 10%, var(--bg-card))',
              border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#b45309' }}>Almost — watch the spelling:</p>
                <p className="text-sm font-semibold text-primary">{exercise.answer}</p>
              </div>
              <button
                onClick={() => speak(exercise.answer)}
                className="w-8 h-8 flex items-center justify-center rounded-full ios-press cursor-pointer flex-shrink-0"
                style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
                aria-label="Hear correct answer"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
        )}

        {status === 'wrong' && (
          <div
            className="p-3"
            style={{
              backgroundColor: 'var(--bg-inset)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted mb-0.5">Correct answer:</p>
                <p className="text-sm font-semibold text-primary">{exercise.answer}</p>
              </div>
              <button
                onClick={() => speak(exercise.answer)}
                className="w-8 h-8 flex items-center justify-center rounded-full ios-press cursor-pointer flex-shrink-0"
                style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
                aria-label="Hear correct answer"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <Button onClick={check} disabled={!value.trim()} className="w-full">
            Check Translation
          </Button>
        )}
      </div>
    </div>
  );
}
