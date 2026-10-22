import { AlertTriangle } from 'lucide-react';
import { ATTENTION_LABEL, attentionReason } from '../../utils/classroomDates';
import type { RosterStudent } from '../../types/classroom';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center py-3" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export function ClassOverview({ roster, assignmentCount }: { roster: RosterStudent[]; assignmentCount: number }) {
  if (roster.length === 0 || assignmentCount === 0) return null;

  const totalPossible = roster.length * assignmentCount;
  const totalCompleted = roster.reduce((sum, s) => sum + s.completedAssignments, 0);
  const scoredStudents = roster.filter((s) => s.averageScore > 0);
  const classAverage = scoredStudents.length
    ? scoredStudents.reduce((sum, s) => sum + s.averageScore, 0) / scoredStudents.length
    : null;
  const awaitingReview = roster.reduce((sum, s) => sum + s.awaitingReview, 0);
  const needingAttention = roster
    .map((student) => ({ student, reason: attentionReason(student) }))
    .filter((entry) => entry.reason !== null);

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
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={12} style={{ color: 'var(--danger)' }} /> Needs attention
            </p>
            {needingAttention.map(({ student, reason }) => (
              <div key={student.id} className="flex items-center justify-between text-sm">
                <span className="text-primary">{student.name}</span>
                <span className="text-xs text-muted">{ATTENTION_LABEL[reason!]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
