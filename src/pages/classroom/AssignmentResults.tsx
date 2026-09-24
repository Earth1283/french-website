import { useEffect, useState } from 'react';
import { RubricScorecard } from '../../components/exam/RubricScorecard';
import { Button } from '../../components/ui/Button';
import { RUBRIC_CRITERIA } from '../../data/exam/rubric';
import type { DelfLevel, RubricBand, RubricCriterionId } from '../../types/exam';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Flag, Check } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { MissedQuestionsChart } from '../../components/classroom/MissedQuestionsChart';
import type { AssignmentInfo, ClassroomContent, FlagInfo, QuestionStat, WritingSubmissionInfo } from '../../types/classroom';

interface ResultsResponse {
  assignment: AssignmentInfo;
  content: ClassroomContent | null;
  questions: QuestionStat[];
  flags: FlagInfo[];
  submissions?: WritingSubmissionInfo[];
}

const DEFAULT_BANDS = Object.fromEntries(RUBRIC_CRITERIA.map(c => [c.id, 2])) as Record<RubricCriterionId, RubricBand>;

function SubmissionReview({ submission, level, onSaved }: { submission: WritingSubmissionInfo; level: DelfLevel; onSaved: () => Promise<void> }) {
  const [open, setOpen] = useState(!submission.reviewedAt);
  const [bands, setBands] = useState(submission.review?.bands ?? DEFAULT_BANDS);
  const [feedback, setFeedback] = useState(submission.review?.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await classroomApi.post(`/api/teacher/attempts/${submission.attemptId}/review`, { bands, feedback });
      await onSaved();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this mark.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full p-4 flex items-center justify-between gap-3 cursor-pointer text-left"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div>
          <p className="text-sm font-semibold text-primary">{submission.studentName}</p>
          <p className="text-xs text-muted">
            {submission.wordCount} mots · {new Date(submission.submittedAt.replace(' ', 'T') + 'Z').toLocaleDateString()}
          </p>
        </div>
        <span className="text-xs font-semibold" style={{ color: submission.reviewedAt ? 'var(--success)' : 'var(--gold)' }}>
          {submission.reviewedAt ? `Marked · ${submission.score}%` : 'To mark'}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed p-3" lang="fr" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
            {submission.text}
          </p>
          <RubricScorecard level={level} bands={bands} onBandChange={(id, b) => setBands(prev => ({ ...prev, [id]: b }))} />
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Feedback for the student (optional)"
            rows={3}
            maxLength={5000}
            className="ios-input py-2 text-sm"
          />
          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? 'Saving…' : submission.reviewedAt ? 'Update mark' : 'Save mark'}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AssignmentResults() {
  const { classId, assignmentId } = useParams<{ classId: string; assignmentId: string }>();
  const [data, setData] = useState<ResultsResponse | null>(null);

  async function load() {
    if (!classId || !assignmentId) return;
    const res = await classroomApi.get<ResultsResponse>(
      `/api/teacher/classes/${classId}/assignments/${assignmentId}/results`
    );
    setData(res);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, assignmentId]);

  async function resolve(flagId: string) {
    await classroomApi.post(`/api/teacher/flags/${flagId}/resolve`);
    await load();
  }

  if (!data) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;
  }

  const { content, questions, flags } = data;
  const submissions = data.submissions ?? [];
  const writingLevel: DelfLevel | null =
    content?.kind === 'writing' && content.body_json ? (JSON.parse(content.body_json) as { level: DelfLevel }).level : null;
  const unresolvedFirst = [...flags].sort((a, b) => Number(!!a.resolved_at) - Number(!!b.resolved_at));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to={`/classes/${classId}`}
          className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> Class
        </Link>
        <h1 className="text-3xl font-bold text-primary">{content?.title ?? 'Results'}</h1>
      </motion.div>

      {writingLevel ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="section-label">
            Submissions · {submissions.filter(s => !s.reviewedAt).length} to mark
          </div>
          <div className="space-y-3">
            {submissions.length === 0 && <p className="card p-4 text-sm text-muted">No one has handed in their text yet.</p>}
            {submissions.map(s => (
              <SubmissionReview key={`${s.attemptId}-${s.reviewedAt ?? ''}-${s.submittedAt}`} submission={s} level={writingLevel} onSaved={load} />
            ))}
          </div>
        </motion.section>
      ) : (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="section-label">Most missed questions</div>
          <div className="card p-4">
            <MissedQuestionsChart questions={questions} />
          </div>
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-label">Flagged by students</div>
        <div className="inset-group">
          {unresolvedFirst.length === 0 && <p className="p-4 text-sm text-muted">No flags on this assignment.</p>}
          {unresolvedFirst.map((f) => {
            const q = questions.find((qq) => qq.index === f.question_index);
            return (
              <div key={f.id} className="inset-row justify-between items-start gap-3">
                <div className="flex items-start gap-2.5">
                  <Flag
                    size={14}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: f.resolved_at ? 'var(--text-muted)' : 'var(--danger)' }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {f.studentName} · Q{f.question_index + 1}
                    </p>
                    {q && <p className="text-xs text-muted mt-0.5">{q.prompt}</p>}
                    {f.reason && <p className="text-xs text-secondary mt-1 italic">"{f.reason}"</p>}
                  </div>
                </div>
                {f.resolved_at ? (
                  <span className="text-xs text-muted flex items-center gap-1 flex-shrink-0">
                    <Check size={12} /> Resolved
                  </span>
                ) : (
                  <button
                    onClick={() => resolve(f.id)}
                    className="chip cursor-pointer flex-shrink-0"
                    style={{ border: 'none' }}
                  >
                    Mark resolved
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
