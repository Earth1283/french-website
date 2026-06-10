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
        <p className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">Fill in the Blank</p>
        <p className="text-lg font-semibold text-[--text-primary] leading-snug">{exercise.prompt}</p>
        {exercise.hint && (
          <p className="text-xs text-[--text-muted] italic mt-1">Hint: {exercise.hint}</p>
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
            placeholder="Type your answer..."
            disabled={status !== 'idle'}
            className={`w-full p-4 rounded-xl border-2 text-sm font-medium text-[--text-primary] bg-[--bg-card] outline-none transition-all pr-10 ${
              status === 'correct' ? 'border-[--success] bg-green-50 dark:bg-green-900/20'
              : status === 'typo' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
              : status === 'wrong' ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
              : 'border-[--border] focus:border-[--accent]'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
          {status === 'correct' && <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[--success]" />}
          {status === 'typo' && <AlertCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />}
          {status === 'wrong' && <XCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
        </div>

        {status === 'typo' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
              Almost — watch the spelling:{' '}
              <strong className="text-[--text-primary]">{exercise.answer}</strong>
            </p>
            <button
              onClick={() => speak(exercise.answer)}
              className="p-1 rounded text-[--text-muted] hover:text-[--accent] transition-colors flex-shrink-0"
              aria-label="Hear correct answer"
            >
              <Volume2 size={15} />
            </button>
          </div>
        )}

        {status === 'wrong' && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-[--text-muted]">
              Correct answer: <strong className="text-[--text-primary]">{exercise.answer}</strong>
            </p>
            <button
              onClick={() => speak(exercise.answer)}
              className="p-1 rounded text-[--text-muted] hover:text-[--accent] transition-colors flex-shrink-0"
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
