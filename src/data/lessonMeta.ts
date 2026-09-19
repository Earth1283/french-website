import type { LessonMeta } from '../types';

export const LESSON_META: Record<string, LessonMeta> = {
  'pronunciation-1': {
    cefr: 'pre-a1',
    skills: ['pronunciation', 'listening'],
    prereqs: [],
    goalWeight: { trip: 2, moving: 2, exam: 3, fun: 2 },
  },
  'pronunciation-2': {
    cefr: 'pre-a1',
    skills: ['pronunciation', 'reading'],
    prereqs: ['pronunciation-1'],
    goalWeight: { trip: 1, moving: 1, exam: 2, fun: 0 },
  },
  'pronunciation-3': {
    cefr: 'pre-a1',
    skills: ['pronunciation', 'listening'],
    prereqs: ['pronunciation-1'],
    goalWeight: { trip: 1, moving: 0, exam: 2, fun: 0 },
  },
  'building-blocks-1': {
    cefr: 'pre-a1',
    skills: ['vocabulary', 'reading'],
    prereqs: [],
    goalWeight: { trip: 1, moving: 1, exam: 2, fun: 1 },
  },
  'building-blocks-2': {
    cefr: 'pre-a1',
    skills: ['vocabulary'],
    prereqs: [],
    goalWeight: { trip: 2, moving: 2, exam: 2, fun: 0 },
  },
  'building-blocks-3': {
    cefr: 'pre-a1',
    skills: ['vocabulary', 'numbers'],
    prereqs: ['building-blocks-2'],
    goalWeight: { trip: 1, moving: 2, exam: 1, fun: 0 },
  },
  'building-blocks-4': {
    cefr: 'pre-a1',
    skills: ['grammar', 'reading'],
    prereqs: ['building-blocks-1'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'emergency-1': {
    cefr: 'a1',
    skills: ['speaking', 'listening'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 1, exam: 1, fun: 0 },
  },
  'emergency-2': {
    cefr: 'a1',
    skills: ['numbers', 'listening'],
    prereqs: ['emergency-1'],
    goalWeight: { trip: 3, moving: 0, exam: 0, fun: 0 },
  },
  'food-1': {
    cefr: 'a1',
    skills: ['speaking', 'vocabulary'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 2, exam: 1, fun: 2 },
  },
  'food-2': {
    cefr: 'a1',
    skills: ['speaking', 'vocabulary', 'grammar'],
    prereqs: ['food-1'],
    goalWeight: { trip: 3, moving: 2, exam: 2, fun: 2 },
  },
  'food-3': {
    cefr: 'a1',
    skills: ['vocabulary', 'speaking'],
    prereqs: ['food-1'],
    goalWeight: { trip: 3, moving: 1, exam: 1, fun: 2 },
  },
  'directions-1': {
    cefr: 'a1',
    skills: ['speaking', 'listening'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 2, exam: 1, fun: 0 },
  },
  'directions-2': {
    cefr: 'a1',
    skills: ['speaking', 'vocabulary'],
    prereqs: ['directions-1', 'numbers-1'],
    goalWeight: { trip: 3, moving: 2, exam: 1, fun: 0 },
  },
  'numbers-1': {
    cefr: 'a1',
    skills: ['numbers'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 2, exam: 3, fun: 1 },
  },
  'numbers-2': {
    cefr: 'a1',
    skills: ['numbers', 'grammar'],
    prereqs: ['numbers-1'],
    goalWeight: { trip: 2, moving: 1, exam: 3, fun: 0 },
  },
  'numbers-3': {
    cefr: 'a1',
    skills: ['numbers', 'vocabulary'],
    prereqs: ['numbers-1'],
    goalWeight: { trip: 2, moving: 1, exam: 2, fun: 1 },
  },
  'greetings-1': {
    cefr: 'a1',
    skills: ['speaking', 'listening'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 3, exam: 3, fun: 3 },
  },
  'greetings-2': {
    cefr: 'a1',
    skills: ['speaking', 'vocabulary'],
    prereqs: ['greetings-1'],
    goalWeight: { trip: 3, moving: 3, exam: 2, fun: 2 },
  },
  'greetings-3': {
    cefr: 'a1',
    skills: ['speaking', 'vocabulary'],
    prereqs: ['greetings-1'],
    goalWeight: { trip: 3, moving: 3, exam: 2, fun: 1 },
  },
  'shopping-1': {
    cefr: 'a1',
    skills: ['vocabulary', 'speaking'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 2, exam: 1, fun: 1 },
  },
  'shopping-2': {
    cefr: 'a1',
    skills: ['vocabulary', 'listening'],
    prereqs: ['shopping-1'],
    goalWeight: { trip: 3, moving: 2, exam: 1, fun: 0 },
  },
  'accommodation-1': {
    cefr: 'a1',
    skills: ['vocabulary', 'speaking'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 1, exam: 1, fun: 0 },
  },
  'accommodation-2': {
    cefr: 'a1',
    skills: ['vocabulary', 'speaking'],
    prereqs: ['accommodation-1'],
    goalWeight: { trip: 2, moving: 2, exam: 1, fun: 0 },
  },
  'accommodation-3': {
    cefr: 'a1',
    skills: ['vocabulary', 'speaking'],
    prereqs: ['accommodation-1'],
    goalWeight: { trip: 2, moving: 1, exam: 1, fun: 0 },
  },
  'medical-1': {
    cefr: 'a1',
    skills: ['vocabulary', 'listening'],
    prereqs: [],
    goalWeight: { trip: 3, moving: 2, exam: 1, fun: 0 },
  },
  'medical-2': {
    cefr: 'a1',
    skills: ['vocabulary', 'listening'],
    prereqs: ['medical-1'],
    goalWeight: { trip: 3, moving: 2, exam: 1, fun: 0 },
  },
  'medical-3': {
    cefr: 'a1',
    skills: ['speaking', 'listening'],
    prereqs: ['medical-1'],
    goalWeight: { trip: 3, moving: 1, exam: 0, fun: 0 },
  },
  'smalltalk-1': {
    cefr: 'a1',
    skills: ['vocabulary', 'speaking'],
    prereqs: [],
    goalWeight: { trip: 2, moving: 2, exam: 1, fun: 2 },
  },
  'smalltalk-2': {
    cefr: 'a1',
    skills: ['vocabulary', 'speaking'],
    prereqs: [],
    goalWeight: { trip: 1, moving: 2, exam: 1, fun: 2 },
  },
  'identity-1': {
    cefr: 'a1',
    skills: ['vocabulary', 'grammar'],
    prereqs: [],
    goalWeight: { trip: 2, moving: 3, exam: 3, fun: 1 },
  },
  'identity-2': {
    cefr: 'a1',
    skills: ['vocabulary', 'grammar'],
    prereqs: ['identity-1'],
    goalWeight: { trip: 1, moving: 3, exam: 2, fun: 1 },
  },
  'identity-3': {
    cefr: 'a2',
    skills: ['vocabulary', 'grammar'],
    prereqs: ['identity-1'],
    goalWeight: { trip: 0, moving: 3, exam: 1, fun: 1 },
  },
  'weather-1': {
    cefr: 'a1',
    skills: ['vocabulary', 'listening'],
    prereqs: [],
    goalWeight: { trip: 2, moving: 2, exam: 1, fun: 1 },
  },
  'weather-2': {
    cefr: 'a2',
    skills: ['vocabulary', 'listening'],
    prereqs: ['weather-1'],
    goalWeight: { trip: 1, moving: 2, exam: 1, fun: 1 },
  },
  'plans-1': {
    cefr: 'a1',
    skills: ['numbers', 'vocabulary'],
    prereqs: ['numbers-1'],
    goalWeight: { trip: 2, moving: 2, exam: 2, fun: 0 },
  },
  'plans-2': {
    cefr: 'a2',
    skills: ['vocabulary', 'speaking'],
    prereqs: ['plans-1'],
    goalWeight: { trip: 2, moving: 3, exam: 1, fun: 1 },
  },
  'plans-3': {
    cefr: 'a2',
    skills: ['vocabulary', 'speaking'],
    prereqs: ['plans-1'],
    goalWeight: { trip: 2, moving: 2, exam: 1, fun: 1 },
  },
  'vie-francaise-1': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: [],
    goalWeight: { trip: 1, moving: 3, exam: 0, fun: 3 },
  },
  'vie-francaise-2': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: [],
    goalWeight: { trip: 1, moving: 3, exam: 0, fun: 2 },
  },
  'vie-francaise-3': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: [],
    goalWeight: { trip: 0, moving: 3, exam: 0, fun: 3 },
  },
  'false-friends-1': {
    cefr: 'a2',
    skills: ['vocabulary', 'reading'],
    prereqs: [],
    goalWeight: { trip: 0, moving: 1, exam: 2, fun: 2 },
  },
  'grammar-1': {
    cefr: 'a1',
    skills: ['grammar', 'vocabulary'],
    prereqs: [],
    goalWeight: { trip: 0, moving: 2, exam: 3, fun: 1 },
  },
  'grammar-2': {
    cefr: 'a1',
    skills: ['grammar', 'vocabulary'],
    prereqs: ['grammar-1'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'grammar-3': {
    cefr: 'a1',
    skills: ['grammar', 'vocabulary'],
    prereqs: ['grammar-1', 'grammar-2'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'slang-1': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: [],
    goalWeight: { trip: 0, moving: 1, exam: 0, fun: 3 },
  },
  'slang-2': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: ['slang-1'],
    goalWeight: { trip: 0, moving: 0, exam: 0, fun: 3 },
  },
  'trains-1': {
    cefr: 'a2',
    skills: ['vocabulary', 'speaking'],
    prereqs: ['numbers-2'],
    goalWeight: { trip: 2, moving: 2, exam: 1, fun: 0 },
  },
  'trains-2': {
    cefr: 'a2',
    skills: ['vocabulary', 'listening'],
    prereqs: ['trains-1'],
    goalWeight: { trip: 2, moving: 1, exam: 0, fun: 0 },
  },
  'culture-1': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: [],
    goalWeight: { trip: 2, moving: 3, exam: 1, fun: 2 },
  },
  'culture-2': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: ['culture-1'],
    goalWeight: { trip: 1, moving: 3, exam: 0, fun: 1 },
  },
  'culture-3': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: [],
    goalWeight: { trip: 2, moving: 2, exam: 1, fun: 2 },
  },
  'cinema-1': {
    cefr: 'a2',
    skills: ['vocabulary', 'speaking'],
    prereqs: [],
    goalWeight: { trip: 1, moving: 1, exam: 0, fun: 3 },
  },
  'cinema-2': {
    cefr: 'a2',
    skills: ['vocabulary', 'culture'],
    prereqs: ['cinema-1'],
    goalWeight: { trip: 0, moving: 1, exam: 0, fun: 3 },
  },
  'connectors-1': {
    cefr: 'a2', skills: ['grammar', 'speaking'], prereqs: ['grammar-3'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'connectors-2': {
    cefr: 'a2', skills: ['grammar', 'speaking'], prereqs: ['connectors-1'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'connectors-3': {
    cefr: 'b1', skills: ['grammar', 'reading', 'speaking'], prereqs: ['connectors-1'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 2 },
  },
  'past-tenses-1': {
    cefr: 'a2', skills: ['grammar', 'speaking'], prereqs: ['grammar-2'],
    goalWeight: { trip: 2, moving: 2, exam: 3, fun: 1 },
  },
  'past-tenses-2': {
    cefr: 'a2', skills: ['grammar', 'speaking'], prereqs: ['past-tenses-1'],
    goalWeight: { trip: 2, moving: 2, exam: 3, fun: 1 },
  },
  'past-tenses-3': {
    cefr: 'b1', skills: ['grammar', 'listening'], prereqs: ['past-tenses-2'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 2 },
  },
  'pronouns-1': {
    cefr: 'a2', skills: ['grammar', 'speaking'], prereqs: ['past-tenses-1'],
    goalWeight: { trip: 1, moving: 3, exam: 3, fun: 1 },
  },
  'pronouns-2': {
    cefr: 'b1', skills: ['grammar', 'speaking'], prereqs: ['pronouns-1'],
    goalWeight: { trip: 1, moving: 3, exam: 2, fun: 2 },
  },
  'pronouns-3': {
    cefr: 'b1', skills: ['grammar', 'reading'], prereqs: ['pronouns-1'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'pronouns-4': {
    cefr: 'a2', skills: ['grammar', 'reading'], prereqs: ['pronouns-1'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'b1-narration-1': {
    cefr: 'b1', skills: ['grammar', 'speaking'], prereqs: ['past-tenses-3'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 2 },
  },
  'b1-narration-2': {
    cefr: 'b1', skills: ['grammar', 'speaking'], prereqs: ['b1-narration-1'],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 2 },
  },
  'b1-narration-3': {
    cefr: 'b1', skills: ['speaking', 'listening', 'culture'], prereqs: ['b1-narration-2'],
    goalWeight: { trip: 1, moving: 2, exam: 2, fun: 3 },
  },
  'b1-opinions-1': {
    cefr: 'b1', skills: ['grammar', 'speaking'], prereqs: [],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 2 },
  },
  'b1-opinions-2': {
    cefr: 'b1', skills: ['speaking', 'culture'], prereqs: ['b1-opinions-1'],
    goalWeight: { trip: 1, moving: 2, exam: 2, fun: 3 },
  },
  'b1-opinions-3': {
    cefr: 'b1', skills: ['grammar', 'vocabulary'], prereqs: ['b1-opinions-1', 'connectors-2'],
    goalWeight: { trip: 0, moving: 2, exam: 3, fun: 1 },
  },
  'b1-hypothetical-1': {
    cefr: 'b1', skills: ['grammar', 'speaking'], prereqs: [],
    goalWeight: { trip: 1, moving: 2, exam: 3, fun: 1 },
  },
  'b1-hypothetical-2': {
    cefr: 'b1', skills: ['grammar', 'speaking'], prereqs: ['b1-hypothetical-1'],
    goalWeight: { trip: 3, moving: 2, exam: 2, fun: 1 },
  },
  'b1-hypothetical-3': {
    cefr: 'b1', skills: ['grammar', 'reading'], prereqs: ['b1-hypothetical-2', 'past-tenses-3'],
    goalWeight: { trip: 1, moving: 1, exam: 3, fun: 2 },
  },
  'b1-workplace-1': {
    cefr: 'b1', skills: ['reading', 'grammar', 'culture'], prereqs: [],
    goalWeight: { trip: 0, moving: 3, exam: 2, fun: 1 },
  },
  'b1-workplace-2': {
    cefr: 'b1', skills: ['listening', 'speaking', 'culture'], prereqs: ['b1-hypothetical-2'],
    goalWeight: { trip: 0, moving: 3, exam: 2, fun: 1 },
  },
  'b1-workplace-3': {
    cefr: 'b1', skills: ['speaking', 'grammar', 'vocabulary'], prereqs: [],
    goalWeight: { trip: 0, moving: 3, exam: 3, fun: 0 },
  },
  'b2-subjunctive-1': {
    cefr: 'b2', skills: ['grammar', 'reading'], prereqs: ['grammar-3'],
    goalWeight: { trip: 0, moving: 2, exam: 3, fun: 1 },
  },
  'b2-subjunctive-2': {
    cefr: 'b2', skills: ['grammar', 'speaking'], prereqs: ['b2-subjunctive-1'],
    goalWeight: { trip: 0, moving: 2, exam: 3, fun: 1 },
  },
  'b2-subjunctive-3': {
    cefr: 'b2', skills: ['grammar', 'reading'], prereqs: ['b2-subjunctive-2'],
    goalWeight: { trip: 0, moving: 2, exam: 3, fun: 2 },
  },
  'b2-argumentation-1': {
    cefr: 'b2', skills: ['grammar', 'reading'], prereqs: ['connectors-3'],
    goalWeight: { trip: 0, moving: 1, exam: 3, fun: 2 },
  },
  'b2-argumentation-2': {
    cefr: 'b2', skills: ['grammar', 'speaking'], prereqs: ['b2-argumentation-1', 'b2-subjunctive-2'],
    goalWeight: { trip: 0, moving: 1, exam: 3, fun: 2 },
  },
  'b2-argumentation-3': {
    cefr: 'b2', skills: ['speaking', 'culture'], prereqs: ['b2-argumentation-2'],
    goalWeight: { trip: 0, moving: 2, exam: 3, fun: 2 },
  },
  'b2-register-1': {
    cefr: 'b2', skills: ['vocabulary', 'culture'], prereqs: [],
    goalWeight: { trip: 1, moving: 3, exam: 2, fun: 2 },
  },
  'b2-register-2': {
    cefr: 'b2', skills: ['listening', 'speaking'], prereqs: [],
    goalWeight: { trip: 1, moving: 3, exam: 1, fun: 3 },
  },
  'b2-register-3': {
    cefr: 'b2', skills: ['grammar', 'reading'], prereqs: ['b2-register-1'],
    goalWeight: { trip: 0, moving: 2, exam: 3, fun: 1 },
  },
  'b2-idiomatic-1': {
    cefr: 'b2', skills: ['vocabulary', 'culture'], prereqs: [],
    goalWeight: { trip: 1, moving: 2, exam: 2, fun: 3 },
  },
  'b2-idiomatic-2': {
    cefr: 'b2', skills: ['vocabulary', 'speaking'], prereqs: ['b2-idiomatic-1'],
    goalWeight: { trip: 1, moving: 2, exam: 2, fun: 3 },
  },
  'b2-idiomatic-3': {
    cefr: 'b2', skills: ['vocabulary', 'speaking'], prereqs: ['b2-idiomatic-2'],
    goalWeight: { trip: 1, moving: 2, exam: 2, fun: 3 },
  },
};
