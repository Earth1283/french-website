import type { CEFRBand, ExerciseType, Unit } from '../types';

// isBeyondA1 units ("false friends", "slang", "trains", "culture", "cinema")
// sit at the harder end of A2, not real B1+. Bridge units span A2→B1 and are
// seeded as B1 so the placement test treats them as the step up.
export function getUnitCEFR(unit: Unit): CEFRBand {
  if (unit.isPreA1) return 'pre-a1';
  if (unit.isA1) return 'a1';
  if (unit.isB2) return 'b2';
  if (unit.isB1 || unit.isBridge) return 'b1';
  return 'a2';
}

function baseDifficulty(unit: Unit): number {
  if (unit.isPreA1) return -2.2;
  if (unit.isA1) return -0.6;
  if (unit.isA1A2) return 0.4;
  if (unit.isBridge) return 0.9;
  if (unit.isBeyondA1) return 1.3;
  if (unit.isB1) return 1.6;
  if (unit.isB2) return 2.4;
  return 0;
}

export function estimateSeedDifficulty(unit: Unit, lessonIndexInUnit: number, totalLessonsInUnit: number, type: ExerciseType): number {
  const positionBump = 0.15 * (lessonIndexInUnit / totalLessonsInUnit);
  const typeBump = type === 'translation' ? 0.3 : type === 'fill-blank' ? 0.1 : 0;
  return baseDifficulty(unit) + positionBump + typeBump;
}
