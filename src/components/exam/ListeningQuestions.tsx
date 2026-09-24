import { CheckCircle2, XCircle } from 'lucide-react';
import type { ListeningQuestion } from '../../types/exam';

interface ListeningQuestionsProps {
  questions: ListeningQuestion[];
  answers: (string | undefined)[];
  onAnswer: (index: number, value: string) => void;
  /** After submission: per-question correctness, and answers are locked. */
  results?: boolean[] | null;
  showExplanations?: boolean;
}

export function ListeningQuestions({ questions, answers, onAnswer, results, showExplanations = true }: ListeningQuestionsProps) {
  const locked = !!results;
  return (
    <ol className="space-y-3 list-none p-0 m-0">
      {questions.map((q, i) => {
        const result = results?.[i];
        return (
          <li key={i} className="card p-4 space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold text-muted mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
              <p className="text-sm font-semibold text-primary flex-1">{q.prompt}</p>
              {locked && (result
                ? <CheckCircle2 size={18} style={{ color: 'var(--success)' }} className="flex-shrink-0" aria-label="Correct" />
                : <XCircle size={18} style={{ color: 'var(--danger)' }} className="flex-shrink-0" aria-label="Incorrect" />)}
            </div>

            {q.type === 'multiple-choice' ? (
              <div className="grid gap-1.5 pl-7" role="radiogroup" aria-label={`Question ${i + 1}`}>
                {(q.options ?? []).map((opt, j) => {
                  const chosen = answers[i] === opt;
                  const isAnswer = opt === q.answer;
                  let style: React.CSSProperties = { border: '1px solid var(--hairline)', backgroundColor: 'var(--bg-card)' };
                  if (!locked && chosen) style = { border: '1px solid var(--accent)', backgroundColor: 'var(--accent-tint)' };
                  if (locked && isAnswer) style = { border: '1px solid color-mix(in srgb, var(--success) 45%, transparent)', backgroundColor: 'var(--success-light)' };
                  if (locked && chosen && !isAnswer) style = { border: '1px solid color-mix(in srgb, var(--danger) 45%, transparent)', backgroundColor: 'color-mix(in srgb, var(--danger) 10%, var(--bg-card))' };
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      disabled={locked}
                      onClick={() => onAnswer(i, opt)}
                      className={`text-left text-sm px-3 py-2 flex items-center gap-2.5 text-primary ${locked ? 'cursor-default' : 'cursor-pointer ios-press'}`}
                      style={{ ...style, borderRadius: 'var(--radius-sm)' }}
                    >
                      <span className="text-[0.7rem] font-bold text-muted w-4">{String.fromCharCode(65 + j)}</span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="pl-7 space-y-1.5">
                <input
                  value={answers[i] ?? ''}
                  onChange={e => onAnswer(i, e.target.value)}
                  disabled={locked}
                  placeholder="Votre réponse"
                  aria-label={`Answer to question ${i + 1}`}
                  className="ios-input py-2 text-sm"
                  lang="fr"
                  autoComplete="off"
                  spellCheck={false}
                />
                {locked && !result && (
                  <p className="text-xs text-secondary">Réponse attendue : <strong className="text-primary">{q.answer}</strong></p>
                )}
              </div>
            )}

            {locked && showExplanations && q.explanation && (
              <p className="text-xs text-muted pl-7">{q.explanation}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
