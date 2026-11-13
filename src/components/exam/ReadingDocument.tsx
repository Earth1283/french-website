import { BookOpen } from 'lucide-react';
import type { ReadingDoc } from '../../types/exam';
import { ListeningQuestions } from './ListeningQuestions';

export function ReadingDocument({ doc, answers, onAnswer, results }: {
  doc: ReadingDoc;
  answers: (string | undefined)[];
  onAnswer: (index: number, answer: string) => void;
  results?: boolean[] | null;
}) {
  return (
    <div className="space-y-5">
      <div className="card p-5 space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5"><BookOpen size={13} /> {doc.genre}</p>
        <div className="text-[0.95rem] text-primary leading-relaxed space-y-3" lang="fr">{doc.passage.split(/\n+/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
      </div>
      <ListeningQuestions questions={doc.questions} answers={answers} results={results} onAnswer={onAnswer} />
    </div>
  );
}
