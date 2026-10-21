import { describe, expect, it } from 'vitest';
import { listeningScore, mockVerdict, pickMockPaper, writingScore } from './mockExam';
import { LISTENING_DOCS } from '../data/exam/listening';
import { passesDelf, readingNeededToPass } from '../data/exam/rubric';
import type { DelfLevel, MockExamResult } from '../types/exam';

const LEVELS: DelfLevel[] = ['a1', 'a2', 'b1', 'b2'];

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const section = (score: number) => ({ score, source: 'auto' as const });

describe('pickMockPaper', () => {
  it.each(LEVELS)('draws a complete %s paper from that level only', level => {
    const paper = pickMockPaper(level, [], seeded(7));
    expect(paper.listeningDocIds.length).toBeGreaterThanOrEqual(3);
    expect(paper.writingTaskIds).toHaveLength(level === 'a2' ? 2 : 1);
    expect(new Set(paper.writingTaskIds).size).toBe(paper.writingTaskIds.length);
    expect(paper.speakingTaskId.startsWith(`${level}-oral-`)).toBe(true);
    for (const id of paper.listeningDocIds) expect(LISTENING_DOCS.find(d => d.id === id)?.level).toBe(level);
  });

  it('prefers items not used in an earlier mock', () => {
    const first = pickMockPaper('b1', [], seeded(1));
    const previous = [{ ...first, id: 'm1', date: '', listening: section(0), writing: section(0), speaking: section(0), reading: null }] as MockExamResult[];
    const second = pickMockPaper('b1', previous, seeded(2));
    expect(second.speakingTaskId).not.toBe(first.speakingTaskId);
  });
});

describe('scoring', () => {
  it('scales listening and pooled writing to 25', () => {
    expect(listeningScore(9, 12)).toBe(19);
    expect(writingScore([{ score: 10, maxScore: 12.5 }, { score: 5, maxScore: 12.5 }])).toBe(15);
  });

  it('applies the pass mark and the per-section minimum', () => {
    expect(passesDelf([12.5, 12.5, 12.5, 12.5])).toBe(true);
    expect(passesDelf([25, 25, 25, 4.5])).toBe(false);
    expect(passesDelf([12, 12, 12, 12])).toBe(false);
  });

  it('says what reading score is still needed', () => {
    expect(readingNeededToPass([15, 15, 15])).toBe(5);
    expect(readingNeededToPass([10, 10, 10])).toBe(20);
    expect(readingNeededToPass([5, 5, 5])).toBeNull();
    expect(readingNeededToPass([25, 25, 4])).toBeNull();
  });

  it('gives a verdict with or without a reading score', () => {
    const base = { listening: section(15), writing: section(12), speaking: section(13) };
    expect(mockVerdict({ ...base, reading: null })).toEqual({ kind: 'needs-reading', total: 40, readingNeeded: 10 });
    expect(mockVerdict({ ...base, reading: 10 })).toEqual({ kind: 'pass', total: 50 });
    expect(mockVerdict({ ...base, reading: 9.5 })).toEqual({ kind: 'fail', total: 49.5 });
    expect(mockVerdict({ ...base, speaking: section(3), reading: null }).kind).toBe('cannot-pass');
  });
});
