import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { Exercise } from '../../types';
import { Button } from '../ui/Button';
import { speak } from '../../utils/speech';
import { checkAnswer } from '../../utils/fuzzy';
import { checkSpoken } from '../../utils/spokenAnswer';
import { listenErrorMessage } from '../../utils/recognition';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { MicButton } from '../ui/MicButton';
import { AnswerFeedback } from './AnswerFeedback';

export interface TypedExerciseProps {
  exercise: Exercise;
  onCorrect: (answerGiven?: string) => void;
  onWrong: (answerGiven?: string) => void;
  /** Pause on a miss or a near-miss to show the answer and explanation until the learner continues. */
  teach?: boolean;
  speech?: boolean;
}

interface TypedAnswerProps extends TypedExerciseProps {
  label: string;
  placeholder: string;
  checkLabel: string;
  multiline?: boolean;
}

type Status = 'idle' | 'correct' | 'typo' | 'wrong';

const STATUS_STYLES: Record<Status, React.CSSProperties> = {
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

const STATUS_ICON: Record<Exclude<Status, 'idle'>, React.ReactNode> = {
  correct: <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />,
  typo: <AlertCircle size={18} className="text-amber-500" />,
  wrong: <XCircle size={18} style={{ color: 'var(--danger)' }} />,
};

export function TypedAnswer({ exercise, onCorrect, onWrong, teach = false, speech = false, label, placeholder, checkLabel, multiline = false }: TypedAnswerProps) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [almostHeading, setAlmostHeading] = useState('');
  const [spoken, setSpoken] = useState(false);

  const settle = (passed: boolean, given = value.trim()) => (passed ? onCorrect(given) : onWrong(given));

  const finish = (next: Exclude<Status, 'idle'>, given: string) => {
    const passed = next !== 'wrong';
    setStatus(next);
    if (passed) speak(exercise.answer);
    if (teach && next !== 'correct') return;
    setTimeout(() => settle(passed, given), next === 'correct' ? 900 : 1400);
  };

  const check = () => {
    if (!value.trim() || status !== 'idle') return;
    const result = checkAnswer(value.trim(), exercise.answer);
    setAlmostHeading(`Accepted — watch the ${result === 'accent' ? 'accents' : 'spelling'}`);
    finish(result === 'accent' ? 'typo' : result, value.trim());
  };

  const mic = useSpeechInput(readings => {
    if (status !== 'idle') return;
    const { result, heard } = checkSpoken(readings, exercise.answer);
    setValue(heard);
    setSpoken(true);
    setAlmostHeading('Close enough — listen to how it should sound');
    finish(result === 'close' ? 'typo' : result, heard);
  });
  const showMic = speech && mic.available && status === 'idle';

  const fieldProps = {
    value: mic.listening ? mic.interim : value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (status === 'idle') setValue(e.target.value); },
    placeholder: mic.listening ? 'Listening…' : showMic ? `${placeholder}, or tap the mic and say it` : placeholder,
    disabled: status !== 'idle' || mic.listening,
    autoFocus: true,
    autoCapitalize: 'off',
    autoCorrect: 'off',
    spellCheck: false,
    lang: 'fr',
    'aria-label': exercise.prompt,
    style: { padding: '1rem', ...STATUS_STYLES[status] },
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="card p-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{label}</p>
        <p className="text-lg font-semibold text-primary leading-snug">{exercise.prompt}</p>
        {exercise.hint && (
          <p className="text-xs text-muted italic mt-1">Hint: {exercise.hint}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          {multiline ? (
            <textarea
              {...fieldProps}
              rows={2}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check(); } }}
              className="ios-input resize-none text-sm font-medium pr-10"
            />
          ) : (
            <input
              {...fieldProps}
              type="text"
              onKeyDown={e => { if (e.key === 'Enter') check(); }}
              className="ios-input pr-10 text-sm font-medium"
            />
          )}
          {status !== 'idle' && (
            <span className={`absolute right-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'}`}>{STATUS_ICON[status]}</span>
          )}
        </div>

        {status === 'typo' && (
          <AnswerFeedback
            tone="almost"
            heading={almostHeading}
            given={spoken ? value : undefined}
            givenLabel="We heard"
            answer={exercise.answer}
            explanation={teach ? exercise.explanation : undefined}
            onContinue={teach ? () => settle(true) : undefined}
          />
        )}

        {status === 'wrong' && (
          <AnswerFeedback
            tone="wrong"
            given={teach || spoken ? value.trim() : undefined}
            givenLabel={spoken ? 'We heard' : undefined}
            answer={exercise.answer}
            explanation={teach ? exercise.explanation : undefined}
            onContinue={teach ? () => settle(false) : undefined}
          />
        )}

        {mic.error && status === 'idle' && (
          <p className="text-xs text-muted" role="status">{listenErrorMessage(mic.error)}</p>
        )}

        {status === 'idle' && (
          <div className="flex items-center gap-2">
            <Button onClick={check} disabled={!value.trim() || mic.listening} className="flex-1">
              {checkLabel}
            </Button>
            {showMic && <MicButton listening={mic.listening} onClick={mic.toggle} idleLabel="Say it in French" />}
          </div>
        )}
      </div>
    </div>
  );
}
