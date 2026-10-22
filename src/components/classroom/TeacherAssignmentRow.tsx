import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, CalendarClock, Eye, EyeOff, Flag, Trash2 } from 'lucide-react';
import { describeDue, dueDateInputToIso, isOverdue, isoToDueDateInput } from '../../utils/classroomDates';
import type { AssignmentInfo } from '../../types/classroom';

interface TeacherAssignmentRowProps {
  classId: string;
  assignment: AssignmentInfo;
  onChange: (fields: { dueAt?: string | null; visible?: boolean }) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function TeacherAssignmentRow({ classId, assignment, onChange, onRemove }: TeacherAssignmentRowProps) {
  const [editingDue, setEditingDue] = useState(false);
  const hidden = !assignment.visible;
  const overdue = isOverdue(assignment.due_at);
  const resultsPath = `/classes/${classId}/assignments/${assignment.id}/results`;

  async function saveDueDate(dateInput: string) {
    await onChange({ dueAt: dueDateInputToIso(dateInput) });
    setEditingDue(false);
  }

  return (
    <div className="inset-divider">
      <div className="inset-row justify-between" style={{ borderTop: 'none', opacity: hidden ? 0.6 : 1 }}>
        <Link to={resultsPath} className="flex items-center gap-2.5 no-underline min-w-0">
          <BookOpen size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{assignment.title}</p>
            <p className="text-xs text-muted capitalize">
              {assignment.kind}
              {hidden && ' · hidden from students'}
            </p>
          </div>
          {!!assignment.unresolvedFlagCount && (
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}
            >
              <Flag size={10} /> {assignment.unresolvedFlagCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link to={resultsPath} aria-label="View results" className="p-1.5 rounded-full" style={{ color: 'var(--text-muted)' }}>
            <BarChart3 size={14} />
          </Link>
          <button
            onClick={() => onChange({ visible: hidden })}
            aria-label={hidden ? 'Show to students' : 'Hide from students'}
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
          >
            {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove assignment"
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 -mt-1.5">
        {editingDue ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              defaultValue={isoToDueDateInput(assignment.due_at)}
              onChange={(e) => e.target.value && saveDueDate(e.target.value)}
              aria-label="Due date"
              className="ios-input py-1 text-sm"
            />
            {assignment.due_at && (
              <button
                onClick={() => saveDueDate('')}
                className="text-xs text-muted hover:underline cursor-pointer"
                style={{ background: 'transparent', border: 'none' }}
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setEditingDue(false)}
              className="text-xs text-muted hover:underline cursor-pointer"
              style={{ background: 'transparent', border: 'none' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingDue(true)}
            className="text-xs hover:underline cursor-pointer flex items-center gap-1"
            style={{ background: 'transparent', border: 'none', color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            <CalendarClock size={11} />
            {assignment.due_at ? describeDue(assignment.due_at) : 'Set due date'}
          </button>
        )}
      </div>
    </div>
  );
}
