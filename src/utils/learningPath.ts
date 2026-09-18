import type { CEFRBand, LearnerGoal, LearnerProfile, Lesson, LessonMeta, TestResult, Unit } from '../types';
import { UNITS } from '../data/units';
import { LESSON_META } from '../data/lessonMeta';
import { getUnitCEFR } from '../data/unitDifficulty';
import { isUnitTestedOut } from './mastery';

export type PathReason = 'essential' | 'foundation' | 'next';

export interface PathStep {
  unit: Unit;
  lesson: Lesson;
  reason: PathReason;
  /** The chosen goal this lesson is essential for, when reason is 'essential'. */
  goal?: LearnerGoal;
}

export interface LearningPath {
  steps: PathStep[];
  testedOutUnitIds: string[];
  /** Lessons left out until after the learner's target date. */
  deferredLessonCount: number;
  daysUntilTarget: number | null;
}

export interface PathInput {
  profile: LearnerProfile | null;
  completedLessons: string[];
  unit12Unlocked: boolean;
  latestTest?: TestResult;
  today: string;
  units?: Unit[];
  meta?: Record<string, LessonMeta>;
}

const CEFR_RANK: Record<CEFRBand, number> = { 'pre-a1': 0, a1: 1, a2: 2, b1: 3, b2: 4 };
const SURVIVAL_WINDOW_DAYS = 21;
const FOCUS_WINDOW_DAYS = 60;

export const GOAL_LABELS: Record<LearnerGoal, string> = {
  trip: 'a trip',
  moving: 'moving to France',
  exam: 'a class or exam',
  fun: 'fun',
};

export function describeStep(step: PathStep): string | null {
  if (step.reason === 'essential' && step.goal) return `Essential for ${GOAL_LABELS[step.goal]}`;
  if (step.reason === 'foundation') return 'Builds a foundation you need';
  return null;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86_400_000);
}

function minimumWeightFor(daysUntilTarget: number | null): number {
  if (daysUntilTarget === null) return 0;
  if (daysUntilTarget <= SURVIVAL_WINDOW_DAYS) return 2;
  if (daysUntilTarget <= FOCUS_WINDOW_DAYS) return 1;
  return 0;
}

interface Candidate {
  unit: Unit;
  lesson: Lesson;
  order: number;
  cefr: CEFRBand;
  prereqs: string[];
  weight: number;
  priority: number;
  essentialFor?: LearnerGoal;
}

/**
 * Orders every unfinished lesson for this learner. Goals decide what matters
 * most (a lesson counts as much as its most relevant chosen goal), a near
 * target date trims the path to what matters in time, placement-test results
 * skip units the learner already knows, and prerequisites always come first —
 * pulled forward with the priority of the lesson that needs them. No lesson
 * jumps more than one CEFR band above the easiest relevant lesson still left.
 *
 * With no goals it reproduces the plain curriculum order.
 */
export function buildPath({
  profile,
  completedLessons,
  unit12Unlocked,
  latestTest,
  today,
  units = UNITS,
  meta = LESSON_META,
}: PathInput): LearningPath {
  const completed = new Set(completedLessons);
  const goals = profile?.goals ?? [];
  const personalized = goals.length > 0;

  const rawDays = profile?.targetDate ? daysBetween(today, profile.targetDate) : null;
  const daysUntilTarget = rawDays !== null && rawDays >= 0 ? rawDays : null;
  const minWeight = personalized ? minimumWeightFor(daysUntilTarget) : 0;

  const testedOutUnitIds = units
    .filter(u => u.lessons.some(l => !completed.has(l.id)) && isUnitTestedOut(u, latestTest))
    .map(u => u.id);
  const testedOut = new Set(testedOutUnitIds);

  const pending = new Map<string, Candidate>();
  let order = 0;
  for (const unit of units) {
    const locked = unit.id === 'slang' && !unit12Unlocked;
    for (const lesson of unit.lessons) {
      order++;
      if (locked || completed.has(lesson.id) || testedOut.has(unit.id)) continue;
      const m = meta[lesson.id];
      const weight = personalized && m ? Math.max(...goals.map(g => m.goalWeight[g])) : 1;
      const deprioritizeBasics = profile?.priorLevel === 'some' && unit.isPreA1;
      pending.set(lesson.id, {
        unit,
        lesson,
        order,
        cefr: m?.cefr ?? getUnitCEFR(unit),
        prereqs: (m?.prereqs ?? []).filter(id => !completed.has(id)),
        weight,
        priority: deprioritizeBasics ? weight - 1 : weight,
        essentialFor: m && goals.find(g => m.goalWeight[g] === 3),
      });
    }
  }

  const included = new Map<string, Candidate>();
  const include = (c: Candidate) => {
    if (included.has(c.lesson.id)) return;
    included.set(c.lesson.id, c);
    c.prereqs.forEach(id => { const p = pending.get(id); if (p) include(p); });
  };
  pending.forEach(c => { if (c.weight >= minWeight) include(c); });

  const ownPriority = new Map([...included].map(([id, c]) => [id, c.priority]));
  let changed = true;
  while (changed) {
    changed = false;
    included.forEach(c => c.prereqs.forEach(id => {
      const p = included.get(id);
      if (p && p.priority < c.priority) { p.priority = c.priority; changed = true; }
    }));
  }

  const inOrder = (a: Candidate, b: Candidate) =>
    b.priority - a.priority
    || (personalized ? CEFR_RANK[a.cefr] - CEFR_RANK[b.cefr] : 0)
    || a.order - b.order;

  const remaining = [...included.values()].sort(inOrder);
  const done = new Set<string>();
  const steps: PathStep[] = [];
  const isReady = (c: Candidate) => c.prereqs.every(id => done.has(id) || !included.has(id));
  while (remaining.length > 0) {
    const levelFloor = Math.min(...remaining.filter(c => c.weight >= 1).map(c => CEFR_RANK[c.cefr]));
    const withinReach = (c: Candidate) => CEFR_RANK[c.cefr] <= levelFloor + 1;
    const pick = [(c: Candidate) => isReady(c) && withinReach(c), isReady]
      .map(accept => remaining.findIndex(accept))
      .find(idx => idx !== -1) ?? 0;
    const [next] = remaining.splice(pick, 1);
    done.add(next.lesson.id);
    const reason: PathReason = !personalized ? 'next'
      : next.priority > ownPriority.get(next.lesson.id)! ? 'foundation'
      : next.essentialFor ? 'essential'
      : 'next';
    steps.push({ unit: next.unit, lesson: next.lesson, reason, goal: reason === 'essential' ? next.essentialFor : undefined });
  }

  return {
    steps,
    testedOutUnitIds,
    deferredLessonCount: pending.size - included.size,
    daysUntilTarget,
  };
}
