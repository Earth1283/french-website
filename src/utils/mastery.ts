import type { ExerciseStat, Lesson, SRSCard, TestResult, Unit } from '../types';
import { UNITS } from '../data/units';
import { estimateSeedDifficulty } from '../data/unitDifficulty';
import { probability2PL } from './irt';
import { MATURE_INTERVAL_DAYS, vocabKey } from './srs';
import { daysBetween, todayString } from './streak';

const TEST_OUT_PROBABILITY = 0.85;
const TEST_OUT_MIN_TOPIC_ACCURACY = 2 / 3;
const WEAK_SCORE = 0.6;
const MIN_WEAK_EVIDENCE = 2;
const VOCAB_WEIGHT = 0.5;

export function exerciseKey(lessonId: string, exerciseIndex: number): string {
  return `${lessonId}::${exerciseIndex}`;
}

export interface MasteryEvidence {
  exerciseStats: Record<string, ExerciseStat>;
  srsData: Record<string, SRSCard>;
  latestTest?: TestResult;
  /** Defaults to today; lets overdue cards count for less. */
  today?: string;
}

export interface LessonMastery {
  /** Beta-posterior estimate of how reliably the learner gets this lesson right, 0–1. */
  score: number;
  /** Total weight of observations behind the score; 0 means it's just the prior. */
  evidence: number;
  lastExerciseMisses: number;
  weakVocabCards: number;
}

/**
 * How well a card is remembered, 0–1: how long it has stayed remembered
 * (interval, capped at MATURE_INTERVAL_DAYS), discounted for past lapses and
 * for however long it has sat overdue. A card failed on its latest review is 0.
 */
export function cardStrength(card: SRSCard, today: string): number {
  if (card.reps === 0) return 0;
  const lapsePenalty = 1 / (1 + 0.25 * (card.lapses ?? 0));
  const overdueDays = Math.max(0, daysBetween(card.nextReview, today));
  const forgetting = 1 / (1 + overdueDays / Math.max(card.interval, 1));
  return Math.min(1, card.interval / MATURE_INTERVAL_DAYS) * lapsePenalty * forgetting;
}

function isWeakCard(card: SRSCard): boolean {
  return card.reps === 0 || ((card.lapses ?? 0) >= 2 && card.interval < MATURE_INTERVAL_DAYS);
}

export function lessonMastery(lesson: Lesson, { exerciseStats, srsData, latestTest, today = todayString() }: MasteryEvidence): LessonMastery {
  let successes = 0;
  let weight = 0;
  let lastExerciseMisses = 0;
  let weakVocabCards = 0;

  lesson.exercises.forEach((_, idx) => {
    const stat = exerciseStats[exerciseKey(lesson.id, idx)];
    if (!stat || stat.attempts === 0) return;
    successes += 0.7 * (stat.lastCorrect ? 1 : 0) + 0.3 * (stat.correct / stat.attempts);
    weight += 1;
    if (!stat.lastCorrect) lastExerciseMisses++;
  });

  lesson.vocab.forEach((_, idx) => {
    const card = srsData[vocabKey(lesson.id, idx)];
    if (!card) return;
    successes += VOCAB_WEIGHT * cardStrength(card, today);
    weight += VOCAB_WEIGHT;
    if (isWeakCard(card)) weakVocabCards++;
  });

  const testItemPrefix = `lesson-${lesson.id}-`;
  latestTest?.responses.forEach(r => {
    if (!r.itemId.startsWith(testItemPrefix)) return;
    successes += r.correct ? 1 : 0;
    weight += 1;
  });

  return {
    score: (successes + 1) / (weight + 2),
    evidence: weight,
    lastExerciseMisses,
    weakVocabCards,
  };
}

/**
 * A unit counts as tested out when a conservative ability estimate (θ − SE)
 * predicts the learner would get its exercises right at least 85% of the
 * time, and the test didn't directly catch them struggling on it.
 */
export function isUnitTestedOut(unit: Unit, latestTest: TestResult | undefined): boolean {
  if (!latestTest) return false;

  const conservativeTheta = latestTest.theta - latestTest.se;
  const predictions = unit.lessons.flatMap((lesson, lessonIdx) =>
    lesson.exercises.map(ex => {
      const b = estimateSeedDifficulty(unit, lessonIdx, unit.lessons.length, ex.type);
      const c = ex.type === 'multiple-choice' ? 1 / (ex.options?.length ?? 4) : 0;
      return probability2PL(conservativeTheta, 1, b, c);
    })
  );
  if (predictions.length === 0) return false;
  const expected = predictions.reduce((a, b) => a + b, 0) / predictions.length;

  const seen = latestTest.topicBreakdown[unit.id];
  const seenAccuracyOk = !seen || seen.total === 0 || seen.correct / seen.total >= TEST_OUT_MIN_TOPIC_ACCURACY;

  return expected >= TEST_OUT_PROBABILITY && seenAccuracyOk;
}

export interface FixUp {
  unit: Unit;
  lesson: Lesson;
  reason: string;
  score: number;
}

function findLesson(lessonId: string): { unit: Unit; lesson: Lesson } | undefined {
  for (const unit of UNITS) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return undefined;
}

function describeWeakness(m: LessonMastery): string {
  if (m.lastExerciseMisses > 0) {
    return `Missed ${m.lastExerciseMisses} exercise${m.lastExerciseMisses !== 1 ? 's' : ''} last time`;
  }
  if (m.weakVocabCards > 0) {
    return `${m.weakVocabCards} flashcard${m.weakVocabCards !== 1 ? 's' : ''} keep slipping`;
  }
  return 'Missed on the placement test';
}

function isWeak(m: LessonMastery): boolean {
  return m.evidence >= MIN_WEAK_EVIDENCE && m.score < WEAK_SCORE;
}

/**
 * Completed lessons the learner is shaky on, weakest first. When a weak
 * lesson builds on another lesson that is itself weak or was never done,
 * the fix-up points at that foundation instead.
 */
export function getFixUps(
  completedLessons: string[],
  evidence: MasteryEvidence,
  prereqsOf: (lessonId: string) => string[],
  limit = 3,
): FixUp[] {
  const completed = new Set(completedLessons);
  const byLessonId = new Map<string, FixUp>();

  for (const unit of UNITS) {
    for (const lesson of unit.lessons) {
      if (!completed.has(lesson.id)) continue;
      const mastery = lessonMastery(lesson, evidence);
      if (!isWeak(mastery)) continue;

      const shakyFoundation = prereqsOf(lesson.id)
        .map(findLesson)
        .find(found => found && (!completed.has(found.lesson.id) || isWeak(lessonMastery(found.lesson, evidence))));

      const fixUp: FixUp = shakyFoundation
        ? { ...shakyFoundation, reason: `Foundation for “${lesson.title}”`, score: mastery.score }
        : { unit, lesson, reason: describeWeakness(mastery), score: mastery.score };

      const existing = byLessonId.get(fixUp.lesson.id);
      if (!existing || fixUp.score < existing.score) byLessonId.set(fixUp.lesson.id, fixUp);
    }
  }

  return [...byLessonId.values()].sort((a, b) => a.score - b.score).slice(0, limit);
}
