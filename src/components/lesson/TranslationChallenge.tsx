import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Exercise } from '../../types';
import { Button } from '../ui/Button';

interface TranslationChallengeProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/['''`]/g, "'")
    .replace(/[?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function TranslationChallenge({ exercise, onCorrect, onWrong }: TranslationChallengeProps) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const check = () => {
    if (!value.trim()) return;
    const correct = normalize(value) === normalize(exercise.answer);
    setStatus(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      if (correct) onCorrect();
      else onWrong();
    }, 1000);
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
          {status === 'wrong' && (
            <div className="absolute right-3 top-3">
              <XCircle size={18} className="text-red-500" />
            </div>
          )}
        </div>

        {status === 'wrong' && (
          <div className="p-3 rounded-xl bg-[--bg] border border-[--border]">
            <p className="text-xs text-[--text-muted] mb-1">Correct answer:</p>
            <p className="text-sm font-semibold text-[--text-primary]">{exercise.answer}</p>
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
