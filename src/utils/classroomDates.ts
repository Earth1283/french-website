const DAY_MS = 24 * 60 * 60 * 1000;

export const INACTIVE_AFTER_DAYS = 7;
export const STRUGGLING_BELOW_PERCENT = 60;

export function dueDateInputToIso(dateInput: string): string | null {
  if (!dateInput) return null;
  const endOfDayLocal = new Date(`${dateInput}T23:59:00`);
  return Number.isNaN(endOfDayLocal.getTime()) ? null : endOfDayLocal.toISOString();
}

export function isoToDueDateInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isOverdue(dueAt: string | null, now: Date = new Date()): boolean {
  return !!dueAt && new Date(dueAt).getTime() < now.getTime();
}

export function describeDue(dueAt: string, now: Date = new Date()): string {
  const msUntilDue = new Date(dueAt).getTime() - now.getTime();
  const daysUntilDue = Math.ceil(msUntilDue / DAY_MS);
  if (msUntilDue < 0) {
    const daysLate = Math.max(1, Math.floor(-msUntilDue / DAY_MS));
    return daysLate === 1 ? 'Overdue by 1 day' : `Overdue by ${daysLate} days`;
  }
  if (daysUntilDue <= 1) return 'Due today';
  if (daysUntilDue === 2) return 'Due tomorrow';
  return `Due ${new Date(dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export function describeLastActive(lastActiveAt: string | null, now: Date = new Date()): string {
  if (!lastActiveAt) return 'No activity yet';
  const parsed = new Date(lastActiveAt.includes('T') ? lastActiveAt : `${lastActiveAt.replace(' ', 'T')}Z`);
  const daysAgo = Math.floor((now.getTime() - parsed.getTime()) / DAY_MS);
  if (daysAgo <= 0) return 'Active today';
  if (daysAgo === 1) return 'Active yesterday';
  return `Active ${daysAgo} days ago`;
}

export interface AttentionInput {
  lastActiveAt: string | null;
  averageScore: number;
  completedAssignments: number;
  totalAssignments: number;
}

export type AttentionReason = 'not-started' | 'inactive' | 'struggling';

export function attentionReason(student: AttentionInput, now: Date = new Date()): AttentionReason | null {
  if (student.totalAssignments === 0) return null;
  if (student.completedAssignments === 0) return 'not-started';
  const lastActive = student.lastActiveAt
    ? new Date(student.lastActiveAt.includes('T') ? student.lastActiveAt : `${student.lastActiveAt.replace(' ', 'T')}Z`)
    : null;
  const quietForDays = lastActive ? (now.getTime() - lastActive.getTime()) / DAY_MS : Infinity;
  if (quietForDays > INACTIVE_AFTER_DAYS && student.completedAssignments < student.totalAssignments) return 'inactive';
  if (student.averageScore > 0 && student.averageScore < STRUGGLING_BELOW_PERCENT) return 'struggling';
  return null;
}

export const ATTENTION_LABEL: Record<AttentionReason, string> = {
  'not-started': 'Hasn’t started',
  inactive: 'Inactive',
  struggling: 'Struggling',
};
