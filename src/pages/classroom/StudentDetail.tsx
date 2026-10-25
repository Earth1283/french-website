import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarClock, ChevronLeft, RotateCcw } from 'lucide-react';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { ATTENTION_LABEL, KIND_LABEL, STATUS_LABEL, weakestKind } from '../../utils/classroomAttention';
import { describeDue, describeLastActive, dueDateInputToIso, isoToDueDateInput } from '../../utils/classroomDates';
import type { StudentAssignmentReport, StudentReport } from '../../types/classroom';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center py-3" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

const quietButton = { background: 'transparent', border: 'none' } as const;

function AssignmentRow({
  classId,
  studentId,
  report,
  onChanged,
}: {
  classId: string;
  studentId: string;
  report: StudentAssignmentReport;
  onChanged: () => Promise<void>;
}) {
  const [editingDue, setEditingDue] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const base = `/api/teacher/assignments/${report.assignmentId}/students/${studentId}`;
  const limited = report.attemptsAllowed !== null;

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      setEditingDue(false);
      await onChanged();
    } catch (e) {
      setError(e instanceof ClassroomApiError ? e.message : 'Could not save that change.');
    }
  }

  const statusColor =
    report.status === 'overdue' ? 'var(--danger)' : report.status === 'done' ? 'var(--success)' : 'var(--text-muted)';

  return (
    <div className="inset-divider">
      <div className="inset-row justify-between" style={{ borderTop: 'none' }}>
        <div className="min-w-0">
          <Link
            to={`/classes/${classId}/assignments/${report.assignmentId}/results`}
            className="text-sm font-semibold text-primary no-underline truncate block"
          >
            {report.title}
          </Link>
          <p className="text-xs text-muted capitalize">
            {report.kind}
            {report.dueAt && report.status !== 'done' && ` · ${describeDue(report.dueAt)}`}
            {limited && ` · ${report.attemptsUsed}/${report.attemptsAllowed} attempts`}
            {report.override?.dueAt && ' · extended'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold" style={{ color: statusColor }}>
            {report.score !== null ? `${Math.round(report.score)}%` : STATUS_LABEL[report.status]}
          </p>
        </div>
      </div>

      <div className="px-4 pb-3 -mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {limited && (
          <button
            onClick={() => run(() => classroomApi.post(`${base}/retake`))}
            className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
            style={quietButton}
          >
            <RotateCcw size={11} /> Allow another attempt
          </button>
        )}
        {editingDue ? (
          <span className="flex items-center gap-2">
            <input
              type="date"
              defaultValue={isoToDueDateInput(report.dueAt)}
              onChange={(e) => e.target.value && run(() => classroomApi.put(`${base}/override`, { dueAt: dueDateInputToIso(e.target.value) }))}
              aria-label="Extended due date"
              className="ios-input py-1 text-sm"
            />
            {report.override && (
              <button
                onClick={() => run(() => classroomApi.del(`${base}/override`))}
                className="text-xs text-muted hover:underline cursor-pointer"
                style={quietButton}
              >
                Clear extension
              </button>
            )}
            <button onClick={() => setEditingDue(false)} className="text-xs text-muted hover:underline cursor-pointer" style={quietButton}>
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setEditingDue(true)}
            className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
            style={quietButton}
          >
            <CalendarClock size={11} /> {report.override?.dueAt ? 'Change extension' : 'Extend due date'}
          </button>
        )}
        {error && (
          <span className="text-xs" style={{ color: 'var(--danger)' }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

export function StudentDetail() {
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>();
  const [student, setStudent] = useState<StudentReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await classroomApi.get<{ student: StudentReport }>(`/api/teacher/classes/${classId}/students/${studentId}`);
    setStudent(res.student);
  }

  useEffect(() => {
    load().catch(() => setError('Could not load this student.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, studentId]);

  if (error) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">{error}</div>;
  if (!student) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;

  const weakest = weakestKind(student.byKind);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          to={`/classes/${classId}`}
          className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> Class
        </Link>
        <h1 className="text-3xl font-bold text-primary">{student.name}</h1>
        <p className="text-sm text-muted">
          {student.email} · {describeLastActive(student.lastActiveAt)}
        </p>
        {student.reasons.length > 0 && (
          <p className="text-xs font-medium mt-1.5" style={{ color: 'var(--danger)' }}>
            {student.reasons.map((r) => (r === 'overdue' ? `${student.overdue} overdue` : ATTENTION_LABEL[r])).join(' · ')}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Stat label="Done" value={`${student.completed}/${student.total}`} />
        <Stat label="Average" value={student.averageScore === null ? '—' : `${Math.round(student.averageScore)}%`} />
        <Stat label="To review" value={String(student.awaitingReview)} />
      </div>

      {student.byKind.length > 0 && (
        <section>
          <div className="section-label">By type of work</div>
          <div className="inset-group">
            {student.byKind.map((k) => (
              <div key={k.kind} className="inset-row justify-between">
                <p className="text-sm text-primary">
                  {KIND_LABEL[k.kind]}
                  {weakest === k.kind && (
                    <span className="ml-2 text-xs font-medium" style={{ color: 'var(--danger)' }}>
                      weakest
                    </span>
                  )}
                </p>
                <p className="text-sm text-secondary">
                  {Math.round(k.averageScore)}% <span className="text-xs text-muted">· {k.count}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-label">Assignments</div>
        <div className="inset-group">
          {student.assignments.length === 0 && <p className="p-4 text-sm text-muted">Nothing visible to students yet.</p>}
          {student.assignments.map((a) => (
            <AssignmentRow key={a.assignmentId} classId={classId!} studentId={student.id} report={a} onChanged={load} />
          ))}
        </div>
      </section>
    </div>
  );
}
