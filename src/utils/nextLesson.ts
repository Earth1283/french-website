import { UNITS } from '../data/units';
import type { Lesson, Unit } from '../types';

export interface NextUp {
  unit: Unit;
  lesson: Lesson;
}

/**
 * The next lesson the learner should do: the first incomplete lesson in unit
 * order. Skips the locked `slang` unit unless it's unlocked. Returns null when
 * everything is complete. Shared by Home (dashboard) and the ambient Landing.
 */
export function getNextLesson(completedLessons: string[], unit12Unlocked: boolean): NextUp | null {
  for (const unit of UNITS) {
    if (unit.id === 'slang' && !unit12Unlocked) continue;
    for (const lesson of unit.lessons) {
      if (!completedLessons.includes(lesson.id)) {
        return { unit, lesson };
      }
    }
  }
  return null;
}
