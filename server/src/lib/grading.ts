import type { ContentBody } from './validation.js';

// Mirrors src/utils/normalize.ts and src/utils/fuzzy.ts on the frontend so a
// typed answer the app accepts is accepted here too. test/grading.test.ts
// checks the two stay in agreement.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/['''`]/g, "'")
    .replace(/[?!.,;:«»""]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function typoThreshold(expectedLength: number): number {
  if (expectedLength <= 5) return 1;
  if (expectedLength <= 12) return 2;
  return 3;
}

export function isTypedAnswerAccepted(input: string, expected: string): boolean {
  const a = normalize(input);
  const b = normalize(expected);
  return a === b || levenshtein(a, b) <= typoThreshold(b.length);
}

interface GradableExercise {
  type: 'multiple-choice' | 'fill-blank' | 'translation';
  answer: string;
}

export function isAnswerCorrect(exercise: GradableExercise, answerGiven: string): boolean {
  if (exercise.type === 'multiple-choice') return answerGiven === exercise.answer;
  return isTypedAnswerAccepted(answerGiven.trim(), exercise.answer);
}

export interface SubmittedResponse {
  index: number;
  answerGiven?: string;
}

export interface GradedResponse {
  index: number;
  correct: boolean;
  answerGiven: string;
}

export type GradeResult =
  | { ok: true; score: number | null; xpEarned: number; responses: GradedResponse[] }
  | { ok: false; error: string };

export function gradeAttempt(body: ContentBody, submitted: SubmittedResponse[]): GradeResult {
  if (body.kind === 'reading') {
    return {
      ok: true,
      score: body.gradable ? 100 : null,
      xpEarned: body.gradable ? body.xpReward : 0,
      responses: [],
    };
  }

  const exercises = body.kind === 'lesson' ? body.exercises : body.items;
  if (submitted.length !== exercises.length) {
    return { ok: false, error: `Expected an answer for each of the ${exercises.length} questions` };
  }

  const graded = new Map<number, GradedResponse>();
  for (const { index, answerGiven } of submitted) {
    const exercise = exercises[index];
    if (!exercise || graded.has(index)) {
      return { ok: false, error: 'Answers must be for distinct questions in this assignment' };
    }
    if (answerGiven === undefined) {
      return { ok: false, error: 'Answers are missing. Your app may be out of date; refresh the page and try again' };
    }
    graded.set(index, { index, correct: isAnswerCorrect(exercise, answerGiven), answerGiven });
  }

  const responses = [...graded.values()].sort((a, b) => a.index - b.index);
  const correctCount = responses.filter((r) => r.correct).length;
  return {
    ok: true,
    score: Math.round((correctCount / exercises.length) * 100),
    xpEarned: body.xpReward,
    responses,
  };
}
