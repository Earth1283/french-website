import { useState, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Volume2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { Button } from '../ui/Button';
import { speak } from '../../utils/speech';
import { checkAnswer } from '../../utils/fuzzy';

interface FillInBlankProps {
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

export function FillInBlank({ exercise, onCorrect, onWrong }: FillInBlankProps) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'typo' | 'wrong'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

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
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Fill in the Blank</p>
        <p className="text-lg font-semibold text-primary leading-snug">{exercise.prompt}</p>
        {exercise.hint && (
          <p className="text-xs text-muted italic mt-1">Hint: {exercise.hint}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => { if (status === 'idle') setValue(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter') check(); }}
            placeholder="Type your answer"
            disabled={status !== 'idle'}
            className="ios-input pr-10 text-sm font-medium"
            style={{ padding: '1rem', ...STATUS_STYLES[status] }}
            autoFocus
          />
          {status === 'correct' && <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--success)' }} />}
          {status === 'typo' && <AlertCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />}
          {status === 'wrong' && <XCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--danger)' }} />}
        </div>

        {status === 'typo' && (
          <div
            className="flex items-center gap-2 p-3"
            style={{
              backgroundColor: 'color-mix(in srgb, #f59e0b 10%, var(--bg-card))',
              border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <p className="text-sm flex-1" style={{ color: '#b45309' }}>
              Almost — watch the spelling:{' '}
              <strong className="text-primary">{exercise.answer}</strong>
            </p>
            <button
              onClick={() => speak(exercise.answer)}
              className="w-7 h-7 flex items-center justify-center rounded-full ios-press cursor-pointer flex-shrink-0"
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
              aria-label="Hear correct answer"
            >
              <Volume2 size={15} />
            </button>
          </div>
        )}

        {status === 'wrong' && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted">
              Correct answer: <strong className="text-primary">{exercise.answer}</strong>
            </p>
            <button
              onClick={() => speak(exercise.answer)}
              className="w-7 h-7 flex items-center justify-center rounded-full ios-press cursor-pointer flex-shrink-0"
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
              aria-label="Hear correct answer"
            >
              <Volume2 size={15} />
            </button>
          </div>
        )}

        {status === 'idle' && (
          <Button
            onClick={check}
            disabled={!value.trim()}
            className="w-full"
          >
            Check Answer
          </Button>
        )}
      </div>
    </div>
  );
}
