import type { AttentionReason, ClassroomContentKind, StudentAssignmentStatus } from '../types/classroom';

export const ATTENTION_LABEL: Record<AttentionReason, string> = {
  overdue: 'Overdue work',
  'not-started': 'Hasn’t started',
  inactive: 'Inactive',
  struggling: 'Struggling',
};

export const STATUS_LABEL: Record<StudentAssignmentStatus, string> = {
  done: 'Done',
  'awaiting-review': 'Awaiting review',
  overdue: 'Overdue',
  pending: 'Not done',
};

export function describeAttemptLimit(maxAttempts: number | null | undefined): string {
  if (!maxAttempts) return 'Unlimited attempts';
  return maxAttempts === 1 ? '1 attempt' : `${maxAttempts} attempts`;
}

export function describeAttemptsLeft(attemptsLeft: number | null | undefined): string | null {
  if (attemptsLeft === null || attemptsLeft === undefined) return null;
  if (attemptsLeft === 0) return 'no attempts left';
  return attemptsLeft === 1 ? '1 attempt left' : `${attemptsLeft} attempts left`;
}

export const KIND_LABEL: Record<ClassroomContentKind, string> = {
  lesson: 'Lessons',
  quiz: 'Quizzes',
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
};

export function weakestKind(byKind: { kind: ClassroomContentKind; averageScore: number }[]): ClassroomContentKind | null {
  if (byKind.length < 2) return null;
  const sorted = [...byKind].sort((a, b) => a.averageScore - b.averageScore);
  return sorted[0].averageScore < sorted[sorted.length - 1].averageScore ? sorted[0].kind : null;
}

export function tagsFromInput(input: string): string[] {
  return [...new Set(input.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

export function filterBank<T extends { prompt: string; answer: string; tags: string[]; readingId?: string | null }>(
  questions: T[],
  search: string,
  tag: string | null,
  article: string | null = null
): T[] {
  const needle = search.trim().toLowerCase();
  return questions.filter(
    (q) =>
      (!tag || q.tags.includes(tag)) &&
      (!article || q.readingId === article) &&
      (!needle || q.prompt.toLowerCase().includes(needle) || q.answer.toLowerCase().includes(needle))
  );
}
