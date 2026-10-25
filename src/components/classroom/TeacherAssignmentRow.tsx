import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, CalendarClock, Eye, EyeOff, Flag, Settings2, Trash2 } from 'lucide-react';
import { describeDue, dueDateInputToIso, isOverdue, isoToDueDateInput } from '../../utils/classroomDates';
import { describeAttemptLimit } from '../../utils/classroomAttention';
import type { AssignmentInfo } from '../../types/classroom';

export interface AssignmentFields {
  dueAt?: string | null;
  visible?: boolean;
  maxAttempts?: number | null;
  acceptLate?: boolean;
}

const ATTEMPT_CHOICES = [null, 1, 2, 3, 5];

interface TeacherAssignmentRowProps {
  classId: string;
  assignment: AssignmentInfo;
  onChange: (fields: AssignmentFields) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function TeacherAssignmentRow({ classId, assignment, onChange, onRemove }: TeacherAssignmentRowProps) {
  const [editingDue, setEditingDue] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        <button
          onClick={() => setSettingsOpen((open) => !open)}
          aria-expanded={settingsOpen}
          className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1 mt-1"
          style={{ background: 'transparent', border: 'none' }}
        >
          <Settings2 size={11} />
          {describeAttemptLimit(assignment.max_attempts)}
          {!assignment.accept_late && ' · closes at due date'}
        </button>
        {settingsOpen && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-xs text-secondary">
              Attempts
              <select
                value={assignment.max_attempts ?? ''}
                onChange={(e) => onChange({ maxAttempts: e.target.value ? Number(e.target.value) : null })}
                className="ios-input py-1 text-sm"
              >
                {ATTEMPT_CHOICES.map((choice) => (
                  <option key={choice ?? 'unlimited'} value={choice ?? ''}>
                    {choice === null ? 'Unlimited' : choice}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={!assignment.accept_late}
                onChange={(e) => onChange({ acceptLate: !e.target.checked })}
              />
              Close submissions at the due date
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
