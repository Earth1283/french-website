import type { ContentBody } from './validation.js';

// Mirrors src/utils/normalize.ts and src/utils/fuzzy.ts on the frontend so a
// typed answer the app accepts is accepted here too. test/grading.test.ts
// checks the two stay in agreement.
/** Canonical form for comparing typed answers. Keeps accents, since they carry meaning in French. */
function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[‘’`]/g, "'")
    .replace(/[?!.,;:«»“”"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * `accent` and `typo` both pass, but the learner is shown the right spelling.
 * Anything that changes the grammar or the word itself is `wrong`.
 */
type AnswerResult = 'correct' | 'accent' | 'typo' | 'wrong';

// Words where the accent picks a different word (a/à, ou/où, ...).
const ACCENT_MINIMAL_PAIRS = new Set(['a', 'ou', 'la', 'sur', 'du', 'mur', 'des', 'peche', 'cote', 'tache', 'sale', 'pate']);
const INFLECTION_LETTERS = 'aeirstxzn';

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function typoThreshold(expectedLen: number): number {
  if (expectedLen <= 5) return 1;
  if (expectedLen <= 12) return 2;
  return 3;
}

/**
 * True when two accent-free words differ only by a grammatical ending
 * (parle/parles, parti/partie, le/les). Those are the mistakes a lesson is
 * teaching, so they are never forgiven as typos. A repeated letter such as
 * merci/mercii is a keystroke slip, except a doubled e/s/x/t.
 */
function endingOnlyDifference(a: string, b: string): boolean {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (short.length === long.length) {
    const last = [short[short.length - 1], long[long.length - 1]];
    return short.slice(0, -1) === long.slice(0, -1) && last.every(c => INFLECTION_LETTERS.includes(c));
  }
  if (long.length - short.length > 2 || !long.startsWith(short)) return false;
  const extra = long.slice(short.length);
  const repeatedKeystroke = extra.length === 1 && extra === short[short.length - 1] && !'esxt'.includes(extra);
  return !repeatedKeystroke && [...extra].every(c => INFLECTION_LETTERS.includes(c));
}

/** Accents matter when they separate two words, or sit on a word's last letter (é participles, à, où, là). */
function missingAccentChangesMeaning(a: string, b: string): boolean {
  const wordsA = a.split(' ');
  const wordsB = b.split(' ');
  return wordsA.some((word, i) => {
    const other = wordsB[i];
    if (word === other) return false;
    return ACCENT_MINIMAL_PAIRS.has(stripAccents(word)) || word[word.length - 1] !== other[other.length - 1];
  });
}

function checkAnswer(input: string, expected: string): AnswerResult {
  const a = normalize(input);
  const b = normalize(expected);
  if (a === b) return 'correct';

  const plainA = stripAccents(a);
  const plainB = stripAccents(b);
  if (plainA === plainB) return missingAccentChangesMeaning(a, b) ? 'wrong' : 'accent';

  const wordsA = plainA.split(' ');
  const wordsB = plainB.split(' ');
  if (wordsA.length === wordsB.length && wordsA.some((w, i) => w !== wordsB[i] && endingOnlyDifference(w, wordsB[i]))) {
    return 'wrong';
  }
  return levenshtein(plainA, plainB) <= typoThreshold(plainB.length) ? 'typo' : 'wrong';
}

export function isTypedAnswerAccepted(input: string, expected: string): boolean {
  return checkAnswer(input, expected) !== 'wrong';
}

interface GradableExercise {
  type: 'multiple-choice' | 'fill-blank' | 'translation';
  answer: string;
}

export function isAnswerCorrect(exercise: GradableExercise, answerGiven: string): boolean {
  if (exercise.type === 'multiple-choice') return answerGiven === exercise.answer;
  return isTypedAnswerAccepted(answerGiven.trim(), exercise.answer);
}

/** Listening questions: MCQs match exactly, short written answers get the typed-answer tolerance. */
export function isListeningAnswerCorrect(question: { type: 'multiple-choice' | 'short'; answer: string }, answerGiven: string): boolean {
  if (question.type === 'multiple-choice') return answerGiven === question.answer;
  return isTypedAnswerAccepted(answerGiven.trim(), question.answer);
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
  | { ok: true; score: number | null; xpEarned: number; responses: GradedResponse[]; submissionText?: string }
  | { ok: false; error: string };

export function gradeAttempt(body: ContentBody, submitted: SubmittedResponse[], text?: string): GradeResult {
  if (body.kind === 'reading') {
    return {
      ok: true,
      score: body.gradable ? 100 : null,
      xpEarned: body.gradable ? body.xpReward : 0,
      responses: [],
    };
  }

  // Writing is marked by the teacher later: the score stays null until then,
  // and XP is earned for handing the work in.
  if (body.kind === 'writing') {
    const trimmed = text?.trim() ?? '';
    if (!trimmed) return { ok: false, error: 'Write your text before submitting' };
    return { ok: true, score: null, xpEarned: body.xpReward, responses: [], submissionText: trimmed };
  }

  const checkers: ((answer: string) => boolean)[] =
    body.kind === 'listening'
      ? body.questions.map((q) => (a: string) => isListeningAnswerCorrect(q, a))
      : (body.kind === 'lesson' ? body.exercises : body.items).map((ex) => (a: string) => isAnswerCorrect(ex, a));
  if (submitted.length !== checkers.length) {
    return { ok: false, error: `Expected an answer for each of the ${checkers.length} questions` };
  }

  const graded = new Map<number, GradedResponse>();
  for (const { index, answerGiven } of submitted) {
    const check = checkers[index];
    if (!check || graded.has(index)) {
      return { ok: false, error: 'Answers must be for distinct questions in this assignment' };
    }
    if (answerGiven === undefined) {
      return { ok: false, error: 'Answers are missing. Your app may be out of date; refresh the page and try again' };
    }
    graded.set(index, { index, correct: check(answerGiven), answerGiven });
  }

  const responses = [...graded.values()].sort((a, b) => a.index - b.index);
  const correctCount = responses.filter((r) => r.correct).length;
  return {
    ok: true,
    score: Math.round((correctCount / checkers.length) * 100),
    xpEarned: body.xpReward,
    responses,
  };
}
