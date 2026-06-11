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
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Multiple Choice</p>
        <p className="text-lg font-semibold text-primary leading-snug">{exercise.prompt}</p>
        {exercise.hint && (
          <p className="text-xs text-muted italic mt-1">Hint: {exercise.hint}</p>
        )}
      </div>

      <div className="grid gap-2.5">
        {exercise.options?.map((option, i) => {
          const isCorrect = option === exercise.answer;
          const isSelected = option === selected;

          let stateStyle: React.CSSProperties = {
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-1)',
          };
          if (answered && isCorrect) {
            stateStyle = {
              backgroundColor: 'var(--success-light)',
              border: '1px solid color-mix(in srgb, var(--success) 40%, transparent)',
            };
          } else if (answered && isSelected && !isCorrect) {
            stateStyle = {
              backgroundColor: 'color-mix(in srgb, var(--danger) 10%, var(--bg-card))',
              border: '1px solid color-mix(in srgb, var(--danger) 40%, transparent)',
            };
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`w-full p-4 text-left text-sm font-medium text-primary flex items-center gap-3 transition-all ios-press ${answered ? 'cursor-default' : 'cursor-pointer'}`}
              style={{ ...stateStyle, borderRadius: 'var(--radius-sm)' }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-bold flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-muted)' }}
              >
                {i + 1}
              </span>
              <span className="flex-1">{option}</span>
              <span
                onClick={e => { e.stopPropagation(); speak(option); }}
                role="button"
                tabIndex={-1}
                className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ios-press"
                style={{ color: 'var(--text-muted)' }}
                aria-label={`Hear ${option}`}
              >
                <Volume2 size={14} />
              </span>
              {answered && isCorrect && <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: 'var(--success)' }} />}
              {answered && isSelected && !isCorrect && <XCircle size={18} className="flex-shrink-0" style={{ color: 'var(--danger)' }} />}
            </button>
          );
        })}
      </div>

      {answered && selected !== exercise.answer && (
        <div
          className="flex items-center gap-2 p-3"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--danger) 8%, var(--bg-card))',
            border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <p className="text-sm text-muted flex-1">
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

      <p className="text-center text-xs text-muted">Press 1–{exercise.options?.length} to select</p>
    </div>
  );
}
