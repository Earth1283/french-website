import type { Exercise, TestItem } from '../types';
import { UNITS } from './units';
import { estimateSeedDifficulty, getUnitCEFR } from './unitDifficulty';
import { AUTHORED_ITEMS } from './authoredTestItems';

const SYNTHETIC_TOPIC_META: Record<string, { emoji: string; title: string; color: string }> = {
  'b1-media': { emoji: '📰', title: 'News & Media', color: '#E76F51' },
  'b1-abstract': { emoji: '🧩', title: 'Abstract & Idiomatic', color: '#2A9D8F' },
  'b2-syntax': { emoji: '🔗', title: 'Advanced Syntax & Relative Clauses', color: '#6D6875' },
  'b2-abstract-issues': { emoji: '🌐', title: 'Society & Global Issues', color: '#219EBC' },
  'housing': { emoji: '🏠', title: 'Housing & Apartments', color: '#FB8B24' },
  'hobbies': { emoji: '🎸', title: 'Hobbies & Leisure', color: '#5F0F40' },
  'everyday-health': { emoji: '🩺', title: 'Everyday Health & Wellbeing', color: '#0B6E4F' },
  'transport': { emoji: '🚌', title: 'Transport & Travel Basics', color: '#3A86FF' },
  'b1-travel': { emoji: '✈️', title: 'Travel Logistics', color: '#FFB703' },
  'b1-environment': { emoji: '♻️', title: 'Environment & Society', color: '#588157' },
  'b1-technology': { emoji: '💻', title: 'Everyday Technology', color: '#4361EE' },
  'b2-literature-arts': { emoji: '🖋️', title: 'Literature & the Arts', color: '#7209B7' },
  'b2-politics-economy': { emoji: '🏛️', title: 'Politics & Economy', color: '#003566' },
  'b2-science-technology': { emoji: '🔬', title: 'Science & Technology', color: '#0077B6' },
  'b2-philosophy-ethics': { emoji: '🧠', title: 'Philosophy & Ethics', color: '#5A189A' },
  'b2-professional-nuance': { emoji: '📈', title: 'Professional Nuance', color: '#264653' },
  'b2-culture-society': { emoji: '🕊️', title: 'Culture & Society', color: '#9D4EDD' },
};

/** Topic metadata for the results/breakdown UI — real units resolve directly, synthetic B1 topics fall back to a local map. */
export function getTopicMeta(topicId: string): { emoji: string; title: string; color: string; unitSlug?: string } {
  const unit = UNITS.find(u => u.id === topicId);
  if (unit) return { emoji: unit.emoji, title: unit.title, color: unit.color, unitSlug: unit.slug };
  const synthetic = SYNTHETIC_TOPIC_META[topicId];
  if (synthetic) return synthetic;
  return { emoji: '📌', title: topicId, color: 'var(--accent)' };
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

/** Every built-in lesson exercise, wrapped with IRT metadata. Resolved to their live `Exercise` at runtime — see `resolveTestItemExercise` — so edits to lesson content never desync from the bank. */
export const DERIVED_ITEMS: TestItem[] = buildDerivedItems();

// A guessing floor (3PL "c") only applies to multiple-choice items — a lucky
// guess among N options succeeds ~1/N of the time regardless of ability.
// Constructed-response items (fill-blank, translation) have no such floor.
export const ITEM_BANK: TestItem[] = [...DERIVED_ITEMS, ...AUTHORED_ITEMS].map(item => {
  if (item.type !== 'multiple-choice') return item;
  const numOptions = resolveTestItemExercise(item).options?.length ?? 4;
  return { ...item, c: 1 / numOptions };
});

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
