import { describe, it, expect } from 'vitest';
import { exerciseKey, getFixUps, isUnitTestedOut, lessonMastery, type MasteryEvidence } from './mastery';
import { vocabKey } from './srs';
import { UNITS } from '../data/units';
import type { ExerciseStat, TestResult } from '../types';

const grammar = UNITS.find(u => u.id === 'grammar')!;
const [gender, etreAvoir] = grammar.lessons;

function statsFor(lessonId: string, count: number, stat: ExerciseStat): Record<string, ExerciseStat> {
  return Object.fromEntries(Array.from({ length: count }, (_, i) => [exerciseKey(lessonId, i), stat]));
}

const missed: ExerciseStat = { attempts: 1, correct: 0, lastCorrect: false };
const recovered: ExerciseStat = { attempts: 3, correct: 1, lastCorrect: true };
const none: MasteryEvidence = { exerciseStats: {}, srsData: {} };
const noPrereqs = () => [];

describe('lessonMastery', () => {
  it('falls back to an even prior without evidence', () => {
    expect(lessonMastery(gender, none)).toMatchObject({ score: 0.5, evidence: 0 });
  });

  it('drops when exercises are missed', () => {
    const m = lessonMastery(gender, { ...none, exerciseStats: statsFor(gender.id, gender.exercises.length, missed) });
    expect(m.score).toBeLessThan(0.3);
    expect(m.lastExerciseMisses).toBe(gender.exercises.length);
  });

  it('weights the latest attempt over old misses', () => {
    const m = lessonMastery(gender, { ...none, exerciseStats: statsFor(gender.id, gender.exercises.length, recovered) });
    expect(m.score).toBeGreaterThan(0.6);
  });

  it('counts struggling flashcards and placement-test misses', () => {
    const srsData = { [vocabKey(gender.id, 0)]: { interval: 1, ease: 1.3, nextReview: '2026-09-18', reps: 0 } };
    const latestTest = {
      theta: 0, se: 1, topicBreakdown: {},
      responses: [{ itemId: `lesson-${gender.id}-0`, topic: 'grammar', correct: false, thetaAtTime: 0, a: 1, b: 0 }],
    } as unknown as TestResult;
    const m = lessonMastery(gender, { exerciseStats: {}, srsData, latestTest });
    expect(m.evidence).toBe(1.5);
    expect(m.weakVocabCards).toBe(1);
    expect(m.score).toBeLessThan(0.5);
  });
});

describe('getFixUps', () => {
  it('suggests completed lessons the learner is shaky on', () => {
    const fixUps = getFixUps([gender.id], { ...none, exerciseStats: statsFor(gender.id, gender.exercises.length, missed) }, noPrereqs);
    expect(fixUps).toHaveLength(1);
    expect(fixUps[0].lesson.id).toBe(gender.id);
    expect(fixUps[0].reason).toMatch(/^Missed \d exercises? last time$/);
  });

  it('ignores lessons that are not completed yet', () => {
    expect(getFixUps([], { ...none, exerciseStats: statsFor(gender.id, gender.exercises.length, missed) }, noPrereqs)).toEqual([]);
  });

  it('routes to a weak foundation lesson instead of the lesson built on it', () => {
    const exerciseStats = {
      ...statsFor(gender.id, gender.exercises.length, missed),
      ...statsFor(etreAvoir.id, etreAvoir.exercises.length, missed),
    };
    const prereqsOf = (id: string) => (id === etreAvoir.id ? [gender.id] : []);
    const fixUps = getFixUps([gender.id, etreAvoir.id], { ...none, exerciseStats }, prereqsOf);
    expect(fixUps.map(f => f.lesson.id)).toEqual([gender.id]);
  });
});

describe('isUnitTestedOut', () => {
  const result = (theta: number) => ({ theta, se: 0.3, topicBreakdown: {}, responses: [] }) as unknown as TestResult;

  it('needs a placement test', () => {
    expect(isUnitTestedOut(grammar, undefined)).toBe(false);
  });

  it('tests out only when ability comfortably exceeds the unit', () => {
    expect(isUnitTestedOut(grammar, result(-1))).toBe(false);
    expect(isUnitTestedOut(grammar, result(3))).toBe(true);
  });
});
