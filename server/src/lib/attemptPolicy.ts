export interface AttemptPolicyInput {
  dueAt: string | null;
  acceptLate: boolean;
  maxAttempts: number | null;
  override: { dueAt: string | null; extraAttempts: number } | null;
  attemptsUsed: number;
  now?: Date;
}

export type ClosedReason = 'attempts' | 'late';

export interface AttemptPolicy {
  effectiveDueAt: string | null;
  attemptsUsed: number;
  attemptsAllowed: number | null;
  attemptsLeft: number | null;
  closed: ClosedReason | null;
}

export function evaluateAttemptPolicy(input: AttemptPolicyInput): AttemptPolicy {
  const now = input.now ?? new Date();
  const effectiveDueAt = input.override?.dueAt ?? input.dueAt;
  const attemptsAllowed = input.maxAttempts === null ? null : input.maxAttempts + (input.override?.extraAttempts ?? 0);
  const attemptsLeft = attemptsAllowed === null ? null : Math.max(0, attemptsAllowed - input.attemptsUsed);

  let closed: ClosedReason | null = null;
  if (attemptsLeft === 0) closed = 'attempts';
  else if (!input.acceptLate && effectiveDueAt && new Date(effectiveDueAt).getTime() < now.getTime()) closed = 'late';

  return { effectiveDueAt, attemptsUsed: input.attemptsUsed, attemptsAllowed, attemptsLeft, closed };
}

export function closedMessage(policy: AttemptPolicy): string {
  if (policy.closed === 'attempts') return 'You have used all your attempts on this assignment.';
  return 'This assignment closed on its due date. Ask your teacher if you need more time.';
}
