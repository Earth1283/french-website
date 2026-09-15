import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, ChevronLeft, Flag } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { MissedQuestionsChart } from '../../components/classroom/MissedQuestionsChart';
import { Button, ButtonLink } from '../../components/ui/Button';
import type { AssignmentInfo, ClassroomContent, FlagInfo, QuestionStat } from '../../types/classroom';

interface ResultsResponse { assignment: AssignmentInfo; content: ClassroomContent | null; questions: QuestionStat[]; flags: FlagInfo[]; }

export function AssignmentResults() {
  const { classId, assignmentId } = useParams<{ classId: string; assignmentId: string }>();
  const [data, setData] = useState<ResultsResponse | null>(null);

  async function load() {
    if (!classId || !assignmentId) return;
    setData(await classroomApi.get<ResultsResponse>(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`));
  }

  useEffect(() => { load(); }, [classId, assignmentId]);

  async function resolve(flagId: string) {
    await classroomApi.post(`/api/teacher/flags/${flagId}/resolve`);
    await load();
  }

  if (!data) return <div className="page text-center text-ink-3 py-16">Loading…</div>;
  const { content, questions, flags } = data;
  const orderedFlags = [...flags].sort((a, b) => Number(!!a.resolved_at) - Number(!!b.resolved_at));

  return (
    <div className="page">
      <header className="mb-6">
        <ButtonLink to={`/classes/${classId}`} variant="quiet" size="sm" className="-ml-2 mb-2"><ChevronLeft size={18} /> Class</ButtonLink>
        <h1 className="h-page">{content?.title ?? 'Results'}</h1>
      </header>
      <div className="results-grid">
        <section className="sheet" aria-labelledby="missed-title">
          <div className="panel__head"><h2 id="missed-title" className="h-section">Most missed questions</h2></div>
          <div className="p-4 pt-0"><MissedQuestionsChart questions={questions} /></div>
        </section>
        <section className="sheet" aria-labelledby="flags-title">
          <div className="panel__head"><h2 id="flags-title" className="h-section">Flagged by students</h2><span className="flagcount"><Flag size={14} />{flags.filter((f) => !f.resolved_at).length}</span></div>
          {orderedFlags.length === 0 && <p className="p-4 border-t border-rule t-small text-ink-3">No flags on this assignment.</p>}
          {orderedFlags.map((flag) => {
            const question = questions.find((item) => item.index === flag.question_index);
            return (
              <article key={flag.id} className={flag.resolved_at ? 'flag flag--done' : 'flag'}>
                <Flag size={16} className={flag.resolved_at ? 'text-ink-3' : 'text-signal-text'} aria-hidden="true" />
                <p className="flag__who">{flag.studentName} · Q{flag.question_index + 1}</p>
                {question && <p className="flag__q">{question.prompt}</p>}
                {flag.reason && <p className="flag__why">{flag.reason}</p>}
                <div className="flag__act">
                  {flag.resolved_at ? <span className="t-small text-ink-3 inline-flex items-center gap-1"><Check size={14} /> Resolved</span> : <Button variant="secondary" size="sm" onClick={() => resolve(flag.id)}>Mark resolved</Button>}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
