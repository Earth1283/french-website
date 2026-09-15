import { useEffect, useRef, useState } from 'react';
import { Check, Volume2, X } from 'lucide-react';
import type { Exercise } from '../../types';
import { speak } from '../../utils/speech';
import { KeyCap } from '../ui/Signage';
import { Correct, OhNon } from '../ui/Feedback';

interface MultipleChoiceProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
  keyboardSelect?: number | null;
}

const REVEAL_MS = 800;

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function optionState(option: string, selected: string | null, answer: string) {
  if (selected === null) return '';
  if (option === answer) return 'option--correct';
  if (option === selected) return 'option--wrong';
  return 'option--dim';
}

export function MultipleChoice({ exercise, onCorrect, onWrong, keyboardSelect }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [options] = useState(() => shuffle(exercise.options ?? []));
  const previousKeyboardSelect = useRef<number | null>(null);
  const answered = selected !== null;

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    window.setTimeout(() => (option === exercise.answer ? onCorrect() : onWrong()), REVEAL_MS);
  };

  useEffect(() => {
    if (keyboardSelect === null || keyboardSelect === undefined) {
      previousKeyboardSelect.current = null;
      return;
    }
    if (keyboardSelect !== previousKeyboardSelect.current) {
      previousKeyboardSelect.current = keyboardSelect;
      const option = options[keyboardSelect];
      if (option) handleSelect(option);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardSelect]);

  return (
    <div>
      <p className="exercise__prompt">{exercise.prompt}</p>
      {exercise.hint && <p className="exercise__hint">Hint: {exercise.hint}</p>}

      <div className="options mt-5">
        {options.map((option, index) => {
          const state = optionState(option, selected, exercise.answer);
          return (
            <div key={option} className="option-wrap">
              <button
                type="button"
                className={state ? `option ${state}` : 'option'}
                onClick={() => handleSelect(option)}
                disabled={answered}
              >
                <KeyCap>{index + 1}</KeyCap>
                <span className="option__text">{option}</span>
                {state === 'option--correct' && (
                  <span className="option__mark">
                    <Check aria-hidden="true" />
                    <span className="sr-only">Correct answer</span>
                  </span>
                )}
                {state === 'option--wrong' && (
                  <span className="option__mark">
                    <X aria-hidden="true" />
                    <span className="sr-only">Your answer, wrong</span>
                  </span>
                )}
              </button>
              <button
                type="button"
                className="say say--sm option__say"
                onClick={() => speak(option)}
                aria-label={`Hear ${option}`}
              >
                <Volume2 aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        {answered && selected !== exercise.answer && (
          <OhNon>
            The answer is <b className="fr">{exercise.answer}</b>.
          </OhNon>
        )}
        {answered && selected === exercise.answer && <Correct />}
        {!answered && (
          <p className="t-small hidden text-center pointer-fine:block">
            Press <KeyCap>1</KeyCap> to <KeyCap>{options.length}</KeyCap> to answer
          </p>
        )}
      </div>
    </div>
  );
}
