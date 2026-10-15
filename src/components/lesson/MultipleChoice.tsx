import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { speak } from '../../utils/speech';
import { AnswerFeedback } from './AnswerFeedback';

interface MultipleChoiceProps {
  exercise: Exercise;
  onCorrect: (answerGiven?: string) => void;
  onWrong: (answerGiven?: string) => void;
  keyboardSelect?: number | null;
  /** Pause on a miss to show the answer and explanation until the learner continues. */
  teach?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MultipleChoice({ exercise, onCorrect, onWrong, keyboardSelect, teach = false }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  // Authored option order is not reliably randomized (the correct answer is
  // often first) — shuffle once per question so position carries no signal.
  const [options] = useState(() => shuffle(exercise.options ?? []));
  const answered = selected !== null;
  const missed = answered && selected !== exercise.answer;
  const prevKeyboardSelect = useRef<number | null>(null);

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    const correct = option === exercise.answer;
    if (correct) speak(option);
    if (teach && !correct) return;
    setTimeout(() => {
      if (correct) onCorrect(option);
      else onWrong(option);
    }, correct ? 700 : 1400);
  };

  useEffect(() => {
    if (keyboardSelect === null || keyboardSelect === undefined) {
      prevKeyboardSelect.current = null;
      return;
    }
    if (keyboardSelect !== prevKeyboardSelect.current) {
      prevKeyboardSelect.current = keyboardSelect;
      const option = options[keyboardSelect];
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
        {options.map((option, i) => {
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
            <div
              key={option}
              className="flex items-center transition-all"
              style={{ ...stateStyle, borderRadius: 'var(--radius-sm)' }}
            >
              <button
                type="button"
                onClick={() => handleSelect(option)}
                disabled={answered}
                className={`flex-1 min-w-0 p-4 pr-1 text-left text-sm font-medium text-primary flex items-center gap-3 ios-press ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                style={{ background: 'transparent', border: 'none' }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-muted)' }}
                >
                  {i + 1}
                </span>
                <span className="flex-1">{option}</span>
                {answered && isCorrect && <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: 'var(--success)' }} />}
                {answered && isSelected && !isCorrect && <XCircle size={18} className="flex-shrink-0" style={{ color: 'var(--danger)' }} />}
              </button>
              <button
                type="button"
                onClick={() => speak(option)}
                className="w-9 h-9 mr-2 flex items-center justify-center rounded-full flex-shrink-0 ios-press cursor-pointer"
                style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
                aria-label={`Hear ${option}`}
              >
                <Volume2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {missed && (
        <AnswerFeedback
          tone="wrong"
          answer={exercise.answer}
          explanation={teach ? exercise.explanation : undefined}
          onContinue={teach ? () => onWrong(selected ?? undefined) : undefined}
        />
      )}

      {!answered && <p className="text-center text-xs text-muted">Press 1–{options.length} to select</p>}
    </div>
  );
}
