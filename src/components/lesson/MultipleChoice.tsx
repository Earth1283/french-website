import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Exercise } from '../../types';

interface MultipleChoiceProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}

export function MultipleChoice({ exercise, onCorrect, onWrong }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setTimeout(() => {
      if (option === exercise.answer) onCorrect();
      else onWrong();
    }, 800);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="card p-5">
        <p className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">Multiple Choice</p>
        <p className="text-lg font-semibold text-[--text-primary] leading-snug">{exercise.prompt}</p>
        {exercise.hint && (
          <p className="text-xs text-[--text-muted] italic mt-1">Hint: {exercise.hint}</p>
        )}
      </div>

      <div className="grid gap-2.5">
        {exercise.options?.map(option => {
          const isCorrect = option === exercise.answer;
          const isSelected = option === selected;

          let stateClass = 'border-[--border] hover:border-[--text-muted] hover:bg-[--bg-card-hover]';
          if (answered && isSelected && isCorrect) stateClass = 'border-[--success] bg-green-50 dark:bg-green-900/20';
          if (answered && isSelected && !isCorrect) stateClass = 'border-red-400 bg-red-50 dark:bg-red-900/20';
          if (answered && !isSelected && isCorrect) stateClass = 'border-[--success] bg-green-50/50 dark:bg-green-900/10';

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`w-full p-4 rounded-xl border-2 text-left text-sm font-medium text-[--text-primary] flex items-center justify-between gap-3 transition-all ${stateClass} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span>{option}</span>
              {answered && isCorrect && <CheckCircle2 size={18} className="text-[--success] flex-shrink-0" />}
              {answered && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
