const DAY_MS = 86_400_000;

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayString(): string {
  return new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
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
