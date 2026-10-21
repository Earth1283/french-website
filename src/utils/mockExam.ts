import { LISTENING_DOCS } from '../data/exam/listening';
import { WRITING_TASKS } from '../data/exam/writing';
import { SPEAKING_TASKS } from '../data/exam/speaking';
import { passesDelf, readingNeededToPass, toOutOf25 } from '../data/exam/rubric';
import type { DelfLevel, MockExamResult } from '../types/exam';

// A mock paper in the order of the real one: listening, then writing, then
// speaking (reading isn't in the app). Times are the official section lengths.

export const MOCK_MINUTES: Record<DelfLevel, { listening: number; writing: number }> = {
  a1: { listening: 20, writing: 30 },
  a2: { listening: 25, writing: 45 },
  b1: { listening: 25, writing: 45 },
  b2: { listening: 30, writing: 60 },
};

/** The DELF level to suggest from a placement-test CEFR result. */
export function delfLevelFromPlacement(cefr: string | undefined): DelfLevel {
  const l = cefr?.toLowerCase() ?? '';
  if (l.startsWith('b2') || l.startsWith('c')) return 'b2';
  if (l.startsWith('b1')) return 'b1';
  if (l.startsWith('a2')) return 'a2';
  return 'a1';
}

/** The real papers have about four listening exercises; A2 writing is two texts. */
const LISTENING_COUNT = 4;
const WRITING_COUNT: Record<DelfLevel, number> = { a1: 1, a2: 2, b1: 1, b2: 1 };

export interface MockPaper {
  level: DelfLevel;
  listeningDocIds: string[];
  writingTaskIds: string[];
  speakingTaskId: string;
}

function pick<T>(items: T[], n: number, random: () => number): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) out.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
  return out;
}

/** Draws a paper, preferring items the learner hasn't seen in earlier mocks. */
export function pickMockPaper(level: DelfLevel, previous: MockExamResult[] = [], random: () => number = Math.random): MockPaper {
  const seen = new Set(previous.flatMap(r => [...r.listeningDocIds, ...r.writingTaskIds, r.speakingTaskId]));
  const fresh = <T extends { id: string }>(items: T[], n: number) => {
    const unseen = items.filter(i => !seen.has(i.id));
    const chosen = pick(unseen, n, random);
    return [...chosen, ...pick(items.filter(i => !chosen.includes(i)), n - chosen.length, random)];
  };
  const listening = fresh(LISTENING_DOCS.filter(d => d.level === level), LISTENING_COUNT);
  const writing = fresh(WRITING_TASKS.filter(t => t.level === level), WRITING_COUNT[level]);
  const speaking = fresh(SPEAKING_TASKS.filter(t => t.level === level), 1);
  return {
    level,
    // Keep the paper's order: shorter, easier documents first, as on the day.
    listeningDocIds: LISTENING_DOCS.filter(d => listening.includes(d)).map(d => d.id),
    writingTaskIds: writing.map(t => t.id),
    speakingTaskId: speaking[0]?.id ?? '',
  };
}

export function listeningScore(correct: number, total: number): number {
  return toOutOf25(correct, total);
}

/** Several writing tasks (A2) share the section's 25 points in proportion to their maxima. */
export function writingScore(scores: { score: number; maxScore: number }[]): number {
  return toOutOf25(scores.reduce((s, e) => s + e.score, 0), scores.reduce((s, e) => s + e.maxScore, 0));
}

export function mockTotal(result: Pick<MockExamResult, 'listening' | 'writing' | 'speaking' | 'reading'>): number {
  return result.listening.score + result.writing.score + result.speaking.score + (result.reading ?? 0);
}

export type MockVerdict =
  | { kind: 'pass' | 'fail'; total: number }
  | { kind: 'needs-reading'; total: number; readingNeeded: number }
  | { kind: 'cannot-pass'; total: number };

export function mockVerdict(result: Pick<MockExamResult, 'listening' | 'writing' | 'speaking' | 'reading'>): MockVerdict {
  const three = [result.listening.score, result.writing.score, result.speaking.score];
  const total = mockTotal(result);
  if (result.reading !== null) return { kind: passesDelf([...three, result.reading]) ? 'pass' : 'fail', total };
  const needed = readingNeededToPass(three);
  return needed === null ? { kind: 'cannot-pass', total } : { kind: 'needs-reading', total, readingNeeded: needed };
}
