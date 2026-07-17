import type { CEFRBand, Exercise, ExerciseType, TestItem, Unit } from '../types';
import { UNITS } from './units';
import { AUTHORED_ITEMS } from './authoredTestItems';

const SYNTHETIC_TOPIC_META: Record<string, { emoji: string; title: string; color: string }> = {
  'b1-opinions': { emoji: '💭', title: 'Opinions & Nuance', color: '#8B5CF6' },
  'b1-hypothetical': { emoji: '🔮', title: 'Hypotheticals & Conditional', color: '#0EA5E9' },
  'b1-narration': { emoji: '📖', title: 'Past Tense Narration', color: '#F59E0B' },
  'b1-workplace': { emoji: '💼', title: 'Workplace French', color: '#457B9D' },
  'b1-media': { emoji: '📰', title: 'News & Media', color: '#E76F51' },
  'b1-abstract': { emoji: '🧩', title: 'Abstract & Idiomatic', color: '#2A9D8F' },
};

/** Topic metadata for the results/breakdown UI — real units resolve directly, synthetic B1 topics fall back to a local map. */
export function getTopicMeta(topicId: string): { emoji: string; title: string; color: string; unitSlug?: string } {
  const unit = UNITS.find(u => u.id === topicId);
  if (unit) return { emoji: unit.emoji, title: unit.title, color: unit.color, unitSlug: unit.slug };
  const synthetic = SYNTHETIC_TOPIC_META[topicId];
  if (synthetic) return synthetic;
  return { emoji: '📌', title: topicId, color: 'var(--accent)' };
}

// Existing lesson content has no true B1 material — isBeyondA1 units ("false
// friends", "slang", "trains", "culture", "cinema") sit at the harder end of
// A2, not real B1 (that gap is exactly why AUTHORED_ITEMS exists).
function getUnitCEFR(unit: Unit): CEFRBand {
  if (unit.isPreA1) return 'pre-a1';
  if (unit.isA1) return 'a1';
  return 'a2';
}

function estimateSeedDifficulty(unit: Unit, lessonIndexInUnit: number, totalLessonsInUnit: number, type: ExerciseType): number {
  const base = unit.isPreA1 ? -2.2 : unit.isA1 ? -0.6 : unit.isA1A2 ? 0.4 : unit.isBeyondA1 ? 1.3 : 0;
  const positionBump = 0.15 * (lessonIndexInUnit / totalLessonsInUnit);
  const typeBump = type === 'translation' ? 0.3 : type === 'fill-blank' ? 0.1 : 0;
  return base + positionBump + typeBump;
}

function buildDerivedItems(): TestItem[] {
  const items: TestItem[] = [];
  for (const unit of UNITS) {
    const total = unit.lessons.length;
    unit.lessons.forEach((lesson, lessonIndexInUnit) => {
      lesson.exercises.forEach((exercise, exerciseIndex) => {
        items.push({
          id: `lesson-${lesson.id}-${exerciseIndex}`,
          type: exercise.type,
          a: 1.0,
          b: estimateSeedDifficulty(unit, lessonIndexInUnit, total, exercise.type),
          topic: unit.id,
          cefr: getUnitCEFR(unit),
          source: 'lesson',
          sourceRef: { lessonId: lesson.id, exerciseIndex },
        });
      });
    });
  }
  return items;
}

/** All 171 existing lesson exercises, wrapped with IRT metadata. Resolved to their live `Exercise` at runtime — see `resolveTestItemExercise` — so edits to lesson content never desync from the bank. */
export const DERIVED_ITEMS: TestItem[] = buildDerivedItems();

export const ITEM_BANK: TestItem[] = [...DERIVED_ITEMS, ...AUTHORED_ITEMS];

/** Resolves a TestItem to the `Exercise` shape the existing lesson components (`MultipleChoice`/`FillInBlank`/`TranslationChallenge`) expect. */
export function resolveTestItemExercise(item: TestItem): Exercise {
  if (item.source === 'authored') {
    return {
      type: item.type,
      prompt: item.prompt ?? '',
      answer: item.answer ?? '',
      options: item.options,
      hint: item.hint,
    };
  }

  if (item.sourceRef) {
    for (const unit of UNITS) {
      const lesson = unit.lessons.find(l => l.id === item.sourceRef!.lessonId);
      if (lesson) return lesson.exercises[item.sourceRef!.exerciseIndex];
    }
  }

  throw new Error(`resolveTestItemExercise: could not resolve item "${item.id}"`);
}
