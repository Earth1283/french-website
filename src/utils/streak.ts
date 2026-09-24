function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Calendar date in the learner's own timezone as YYYY-MM-DD. */
export function dateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayString(): string {
  return dateString(new Date());
}

export function addDays(base: string, days: number): string {
  const [y, m, d] = base.split('-').map(Number);
  return dateString(new Date(y, m - 1, d + days));
}

export function yesterdayString(): string {
  return addDays(todayString(), -1);
}

/** Returns the new streak count given the last studied date and current streak. */
export function computeNewStreak(lastStudiedDate: string, currentStreak: number): number {
  const today = todayString();
  if (lastStudiedDate === today) return currentStreak;           // already studied today
  if (lastStudiedDate === yesterdayString()) return currentStreak + 1; // continuing
  return 1;                                                      // streak broken/new
}

/** True when the user hasn't studied yet today (streak is at risk). */
export function isStreakAtRisk(lastStudiedDate: string): boolean {
  return lastStudiedDate !== todayString();
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86_400_000);
}
