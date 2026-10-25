export const INACTIVE_AFTER_DAYS = 7;
export const STRUGGLING_BELOW_PERCENT = 60;
export const NOT_STARTED_GRACE_DAYS = 3;
const STRUGGLING_MIN_SCORED = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

export type AttentionReason = 'overdue' | 'not-started' | 'inactive' | 'struggling';
export type AssignmentStatus = 'done' | 'awaiting-review' | 'overdue' | 'pending';
type Kind = 'lesson' | 'quiz' | 'reading' | 'listening' | 'writing';

export interface ActivityInput {
  students: { id: string; name: string; email: string; joinedAt: string }[];
  assignments: {
    id: string;
    title: string;
    kind: Kind;
    dueAt: string | null;
    maxAttempts: number | null;
    acceptLate: boolean;
  }[];
  attempts: {
    studentId: string;
    assignmentId: string;
    completedAt: string | null;
    score: number | null;
    hasSubmissionText: boolean;
    attemptCount: number;
  }[];
  overrides: { studentId: string; assignmentId: string; dueAt: string | null; extraAttempts: number }[];
}

export interface StudentAssignmentReport {
  assignmentId: string;
  title: string;
  kind: Kind;
  status: AssignmentStatus;
  dueAt: string | null;
  score: number | null;
  completedAt: string | null;
  attemptsUsed: number;
  attemptsAllowed: number | null;
  override: { dueAt: string | null; extraAttempts: number } | null;
}

export interface KindAverage {
  kind: Kind;
  averageScore: number;
  count: number;
}

export interface StudentReport {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  completed: number;
  total: number;
  averageScore: number | null;
  lastActiveAt: string | null;
  awaitingReview: number;
  overdue: number;
  reasons: AttentionReason[];
  assignments: StudentAssignmentReport[];
  byKind: KindAverage[];
}

export function parseTimestamp(value: string): Date {
  return new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
}

export function buildStudentReports(input: ActivityInput, now: Date = new Date()): StudentReport[] {
  return input.students.map((student) => {
    const joinedAt = parseTimestamp(student.joinedAt);
    const attemptFor = new Map(
      input.attempts.filter((a) => a.studentId === student.id).map((a) => [a.assignmentId, a])
    );
    const overrideFor = new Map(
      input.overrides.filter((o) => o.studentId === student.id).map((o) => [o.assignmentId, o])
    );

    const assignments: StudentAssignmentReport[] = input.assignments.map((asg) => {
      const attempt = attemptFor.get(asg.id);
      const override = overrideFor.get(asg.id) ?? null;
      const dueAt = override?.dueAt ?? asg.dueAt;
      const completed = !!attempt?.completedAt;
      let status: AssignmentStatus = 'pending';
      if (completed) status = attempt!.score === null && attempt!.hasSubmissionText ? 'awaiting-review' : 'done';
      else if (dueAt && new Date(dueAt).getTime() < now.getTime() && new Date(dueAt).getTime() >= joinedAt.getTime()) {
        status = 'overdue';
      }
      return {
        assignmentId: asg.id,
        title: asg.title,
        kind: asg.kind,
        status,
        dueAt,
        score: attempt?.score ?? null,
        completedAt: attempt?.completedAt ?? null,
        attemptsUsed: attempt?.attemptCount ?? 0,
        attemptsAllowed: asg.maxAttempts === null ? null : asg.maxAttempts + (override?.extraAttempts ?? 0),
        override: override ? { dueAt: override.dueAt, extraAttempts: override.extraAttempts } : null,
      };
    });

    const done = assignments.filter((a) => a.completedAt);
    const scored = done.filter((a) => a.score !== null);
    const averageScore = scored.length ? scored.reduce((sum, a) => sum + a.score!, 0) / scored.length : null;
    const lastActiveAt = done.reduce<string | null>(
      (latest, a) => (!latest || parseTimestamp(a.completedAt!) > parseTimestamp(latest) ? a.completedAt : latest),
      null
    );
    const overdue = assignments.filter((a) => a.status === 'overdue').length;

    const reasons: AttentionReason[] = [];
    if (overdue > 0) reasons.push('overdue');
    if (assignments.length > 0 && done.length === 0 && now.getTime() - joinedAt.getTime() > NOT_STARTED_GRACE_DAYS * DAY_MS) {
      reasons.push('not-started');
    }
    if (
      lastActiveAt &&
      done.length < assignments.length &&
      now.getTime() - parseTimestamp(lastActiveAt).getTime() > INACTIVE_AFTER_DAYS * DAY_MS
    ) {
      reasons.push('inactive');
    }
    if (scored.length >= STRUGGLING_MIN_SCORED && averageScore! < STRUGGLING_BELOW_PERCENT) reasons.push('struggling');

    const kinds = [...new Set(scored.map((a) => a.kind))];
    const byKind = kinds.map((kind) => {
      const ofKind = scored.filter((a) => a.kind === kind);
      return { kind, averageScore: ofKind.reduce((sum, a) => sum + a.score!, 0) / ofKind.length, count: ofKind.length };
    });

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      joinedAt: student.joinedAt,
      completed: done.length,
      total: assignments.length,
      averageScore,
      lastActiveAt,
      awaitingReview: assignments.filter((a) => a.status === 'awaiting-review').length,
      overdue,
      reasons,
      assignments,
      byKind,
    };
  });
}
