import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { speak } from '../../utils/speech';

interface MultipleChoiceProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
  keyboardSelect?: number | null;
}

export function MultipleChoice({ exercise, onCorrect, onWrong, keyboardSelect }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const prevKeyboardSelect = useRef<number | null>(null);

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setTimeout(() => {
      if (option === exercise.answer) onCorrect();
      else onWrong();
    }, 800);
  };

  useEffect(() => {
    if (keyboardSelect === null || keyboardSelect === undefined) {
      prevKeyboardSelect.current = null;
      return;
    }
    if (keyboardSelect !== prevKeyboardSelect.current) {
      prevKeyboardSelect.current = keyboardSelect;
      const option = exercise.options?.[keyboardSelect];
      if (option) handleSelect(option);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardSelect]);

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
        {exercise.options?.map((option, i) => {
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
              className={`w-full p-4 rounded-xl border-2 text-left text-sm font-medium text-[--text-primary] flex items-center gap-3 transition-all ${stateClass} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="text-xs text-[--text-muted] font-mono w-4 flex-shrink-0">{i + 1}</span>
              <span className="flex-1">{option}</span>
              <button
                onClick={e => { e.stopPropagation(); speak(option); }}
                className="p-1 rounded text-[--text-muted] hover:text-[--accent] transition-colors flex-shrink-0"
                aria-label={`Hear ${option}`}
                tabIndex={-1}
              >
                <Volume2 size={14} />
              </button>
              {answered && isCorrect && <CheckCircle2 size={18} className="text-[--success] flex-shrink-0" />}
              {answered && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {answered && selected !== exercise.answer && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-[--text-muted] flex-1">
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

      <p className="text-center text-xs text-[--text-muted]">Press 1–{exercise.options?.length} to select</p>
    </div>
  );
}
