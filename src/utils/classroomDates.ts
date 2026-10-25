const DAY_MS = 24 * 60 * 60 * 1000;

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
