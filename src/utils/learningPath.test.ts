import { describe, it, expect } from 'vitest';
import { buildPath, daysBetween, type PathInput } from './learningPath';
import type { LearnerProfile, LessonMeta, TestResult, Unit } from '../types';

function unit(id: string, lessonCount: number, level: Partial<Pick<Unit, 'isPreA1' | 'isA1' | 'isBeyondA1' | 'isB2'>> = { isA1: true }): Unit {
  return {
    id, slug: id, title: id, emoji: '', tagline: id, funnyDescription: '', color: '', accentColor: '',
    isA1: false, isBeyondA1: false, ...level,
    lessons: Array.from({ length: lessonCount }, (_, i) => ({
      id: `${id}-${i + 1}`, title: `${id} ${i + 1}`, subtitle: '', xpReward: 10, vocab: [],
      exercises: [{ type: 'fill-blank' as const, prompt: '', answer: '' }],
    })),
  };
}

function tagged(trip: number, fun: number, prereqs: string[] = []): LessonMeta {
  return {
    cefr: 'a1', skills: ['vocabulary'], prereqs,
    goalWeight: { trip, moving: 0, exam: 0, fun } as LessonMeta['goalWeight'],
  };
}

const UNITS = [unit('basics', 1, { isPreA1: true }), unit('food', 2), unit('cinema', 1, { isBeyondA1: true })];
const META: Record<string, LessonMeta> = {
  'basics-1': tagged(1, 1),
  'food-1': tagged(3, 1),
  'food-2': tagged(2, 1, ['food-1']),
  'cinema-1': tagged(0, 3),
};

const profile = (p: Partial<LearnerProfile>): LearnerProfile => ({ goals: [], targetDate: null, priorLevel: 'none', ...p });

function ids(input: Partial<PathInput>): string[] {
  return path(input).steps.map(s => s.lesson.id);
}

function path(input: Partial<PathInput>) {
  return buildPath({
    profile: null, completedLessons: [], unit12Unlocked: true, today: '2026-09-18',
    units: UNITS, meta: META, ...input,
  });
}

function testResult(theta: number, topicBreakdown: TestResult['topicBreakdown'] = {}): TestResult {
  return {
    id: 't', date: '2026-09-01', theta, se: 0.3, cefrLevel: 'A2', cefrBand: 'mid',
    itemsAdministered: 30, correctCount: 25, topicBreakdown, responses: [],
  };
}

describe('buildPath', () => {
  it('follows curriculum order without goals', () => {
    expect(ids({})).toEqual(['basics-1', 'food-1', 'food-2', 'cinema-1']);
    expect(path({}).steps.every(s => s.reason === 'next')).toBe(true);
  });

  it('skips completed lessons', () => {
    expect(ids({ completedLessons: ['basics-1', 'food-1'] })).toEqual(['food-2', 'cinema-1']);
  });

  it('puts lessons essential for the chosen goal first', () => {
    const p = path({ profile: profile({ goals: ['fun'] }) });
    expect(p.steps[0]).toMatchObject({ lesson: { id: 'cinema-1' }, reason: 'essential', goal: 'fun' });
  });

  it('weighs a lesson by its most relevant goal when several are chosen', () => {
    expect(ids({ profile: profile({ goals: ['trip', 'fun'] }) }).slice(0, 2).sort()).toEqual(['cinema-1', 'food-1']);
  });

  it('pulls prerequisites forward and labels them as foundations', () => {
    const overrides = { ...META, 'food-1': tagged(0, 0), 'food-2': tagged(3, 0, ['food-1']) };
    const p = path({ profile: profile({ goals: ['trip'] }), meta: overrides });
    expect(p.steps.slice(0, 2).map(s => [s.lesson.id, s.reason])).toEqual([['food-1', 'foundation'], ['food-2', 'essential']]);
  });

  it('defers low-priority lessons when the target date is close, keeping needed prerequisites', () => {
    const overrides = { ...META, 'food-1': tagged(1, 0), 'food-2': tagged(3, 0, ['food-1']) };
    const p = path({ profile: profile({ goals: ['trip'], targetDate: '2026-09-28' }), meta: overrides });
    expect(p.steps.map(s => s.lesson.id)).toEqual(['food-1', 'food-2']);
    expect(p.deferredLessonCount).toBe(2);
    expect(p.daysUntilTarget).toBe(10);
  });

  it('ignores a target date in the past', () => {
    const p = path({ profile: profile({ goals: ['trip'], targetDate: '2026-01-01' }) });
    expect(p.deferredLessonCount).toBe(0);
    expect(p.daysUntilTarget).toBeNull();
  });

  it('moves pre-A1 basics to the back for learners who know some French', () => {
    const order = ids({ profile: profile({ goals: ['trip'], priorLevel: 'some' }) });
    expect(order.indexOf('basics-1')).toBe(order.length - 2);
  });

  it('skips units a strong placement test shows the learner already knows', () => {
    const p = path({ latestTest: testResult(3) });
    expect(p.testedOutUnitIds).toEqual(['basics', 'food']);
    expect(p.steps.map(s => s.lesson.id)).toEqual(['cinema-1']);
  });

  it('does not test out a unit the learner visibly struggled with on the test', () => {
    const p = path({ latestTest: testResult(3, { food: { correct: 0, total: 2 } }) });
    expect(p.testedOutUnitIds).toEqual(['basics']);
  });

  it('keeps a high-priority lesson waiting until easier relevant lessons are within one band', () => {
    const units = [...UNITS, unit('debate', 1, { isB2: true })];
    const overrides = { ...META, 'debate-1': { ...tagged(3, 0), cefr: 'b2' as const } };
    const order = ids({ profile: profile({ goals: ['trip'] }), units, meta: overrides });
    expect(order.indexOf('debate-1')).toBeGreaterThan(order.indexOf('food-2'));
  });

  it('leaves the locked slang unit out', () => {
    const units = [...UNITS, unit('slang', 1, { isBeyondA1: true })];
    expect(ids({ units, unit12Unlocked: false })).not.toContain('slang-1');
    expect(ids({ units, unit12Unlocked: true })).toContain('slang-1');
  });
});

describe('daysBetween', () => {
  it('counts calendar days', () => {
    expect(daysBetween('2026-09-18', '2026-09-18')).toBe(0);
    expect(daysBetween('2026-09-18', '2026-10-18')).toBe(30);
  });
});
