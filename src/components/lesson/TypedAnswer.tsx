import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { speak } from '../../utils/speech';
import { checkAnswer } from '../../utils/fuzzy';
import type { AnswerResult } from '../../utils/fuzzy';
import { Button } from '../ui/Button';
import { Correct, OhNon } from '../ui/Feedback';

interface TypedAnswerProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
  multiline?: boolean;
  placeholder: string;
  checkLabel: string;
}

const WRONG_REVEAL_MS = 1400;
const RIGHT_REVEAL_MS = 1200;

const FIELD_STATE: Record<AnswerResult | 'idle', string> = {
  idle: 'field',
  correct: 'field field--correct',
  typo: 'field field--correct',
  wrong: 'field field--wrong',
};

export function TypedAnswer({ exercise, onCorrect, onWrong, multiline = false, placeholder, checkLabel }: TypedAnswerProps) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<AnswerResult | 'idle'>('idle');

  const check = () => {
    if (!value.trim() || status !== 'idle') return;
    const result = checkAnswer(value.trim(), exercise.answer);
    setStatus(result);
    window.setTimeout(
      () => (result === 'wrong' ? onWrong() : onCorrect()),
      result === 'wrong' ? WRONG_REVEAL_MS : RIGHT_REVEAL_MS,
    );
  };

  const hearAnswer = (
    <button type="button" className="say say--sm ml-2 align-middle" onClick={() => speak(exercise.answer)} aria-label={`Hear ${exercise.answer}`}>
      <Volume2 aria-hidden="true" />
    </button>
  );

  const fieldProps = {
    value,
    placeholder,
    disabled: status !== 'idle',
    className: FIELD_STATE[status],
    'aria-label': 'Your answer',
    autoFocus: true,
  };

  return (
    <div>
      <p className="exercise__prompt">{exercise.prompt}</p>
      {exercise.hint && <p className="exercise__hint">Hint: {exercise.hint}</p>}

      <div className="mt-5">
        {multiline ? (
          <textarea
            {...fieldProps}
            rows={2}
            onChange={event => setValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                check();
              }
            }}
          />
        ) : (
          <input
            {...fieldProps}
            type="text"
            onChange={event => setValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') check();
            }}
          />
        )}
      </div>

      <div className="mt-4">
        {status === 'idle' && (
          <Button block onClick={check} disabled={!value.trim()}>
            {checkLabel}
          </Button>
        )}
        {status === 'correct' && <Correct />}
        {status === 'typo' && (
          <Correct title="Almost">
            Watch the spelling: <b className="fr">{exercise.answer}</b>
            {hearAnswer}
          </Correct>
        )}
        {status === 'wrong' && (
          <OhNon>
            The answer is <b className="fr">{exercise.answer}</b>.{hearAnswer}
          </OhNon>
        )}
      </div>
    </div>
  );
}
