import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Volume2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { Button } from '../ui/Button';
import { speak } from '../../utils/speech';
import { normalize } from '../../utils/normalize';
import { checkAnswer } from '../../utils/fuzzy';

interface TranslationChallengeProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}

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
        <p className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">Translation</p>
        <p className="text-lg font-semibold text-[--text-primary] leading-snug">{exercise.prompt}</p>
        {exercise.hint && (
          <p className="text-xs text-[--text-muted] italic mt-1">💡 {exercise.hint}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={value}
            onChange={e => { if (status === 'idle') setValue(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check(); } }}
            placeholder="Type your translation..."
            disabled={status !== 'idle'}
            rows={2}
            className={`w-full p-4 rounded-xl border-2 text-sm font-medium text-[--text-primary] bg-[--bg-card] outline-none resize-none transition-all ${
              status === 'correct' ? 'border-[--success] bg-green-50 dark:bg-green-900/20'
              : status === 'typo' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
              : status === 'wrong' ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
              : 'border-[--border] focus:border-[--accent]'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
          {status === 'correct' && (
            <div className="absolute right-3 top-3">
              <CheckCircle2 size={18} className="text-[--success]" />
            </div>
          )}
          {status === 'typo' && (
            <div className="absolute right-3 top-3">
              <AlertCircle size={18} className="text-amber-500" />
            </div>
          )}
          {status === 'wrong' && (
            <div className="absolute right-3 top-3">
              <XCircle size={18} className="text-red-500" />
            </div>
          )}
        </div>

        {status === 'typo' && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">Almost — watch the spelling:</p>
                <p className="text-sm font-semibold text-[--text-primary]">{exercise.answer}</p>
              </div>
              <button
                onClick={() => speak(exercise.answer)}
                className="p-1.5 rounded-lg text-[--text-muted] hover:text-[--accent] hover:bg-[--bg-card-hover] transition-colors flex-shrink-0"
                aria-label="Hear correct answer"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
        )}

        {status === 'wrong' && (
          <div className="p-3 rounded-xl bg-[--bg] border border-[--border]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-[--text-muted] mb-0.5">Correct answer:</p>
                <p className="text-sm font-semibold text-[--text-primary]">{exercise.answer}</p>
              </div>
              <button
                onClick={() => speak(exercise.answer)}
                className="p-1.5 rounded-lg text-[--text-muted] hover:text-[--accent] hover:bg-[--bg-card-hover] transition-colors flex-shrink-0"
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
