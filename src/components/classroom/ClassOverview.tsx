import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { ATTENTION_LABEL } from '../../utils/classroomAttention';
import type { StudentSummary } from '../../types/classroom';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center py-3" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export function ClassOverview({ classId, students }: { classId: string; students: StudentSummary[] }) {
  const totalPossible = students.reduce((sum, s) => sum + s.total, 0);
  if (students.length === 0 || totalPossible === 0) return null;

  const totalCompleted = students.reduce((sum, s) => sum + s.completed, 0);
  const scored = students.filter((s) => s.averageScore !== null);
  const classAverage = scored.length ? scored.reduce((sum, s) => sum + s.averageScore!, 0) / scored.length : null;
  const awaitingReview = students.reduce((sum, s) => sum + s.awaitingReview, 0);
  const needingAttention = students.filter((s) => s.reasons.length > 0);

  return (
    <section>
      <div className="section-label">Overview</div>
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <Stat label="Completion" value={`${Math.round((totalCompleted / totalPossible) * 100)}%`} />
          <Stat label="Class average" value={classAverage === null ? '—' : `${Math.round(classAverage)}%`} />
          <Stat label="To review" value={String(awaitingReview)} />
        </div>
        {needingAttention.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} style={{ color: 'var(--danger)' }} /> Needs attention
            </p>
            {needingAttention.map((student) => (
              <Link
                key={student.id}
                to={`/classes/${classId}/students/${student.id}`}
                className="flex items-center justify-between gap-2 py-1.5 text-sm no-underline"
              >
                <span className="text-primary">{student.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted text-right">
                  {student.reasons.map((r) => (r === 'overdue' ? `${student.overdue} overdue` : ATTENTION_LABEL[r])).join(' · ')}
                  <ChevronRight size={13} className="flex-shrink-0" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
