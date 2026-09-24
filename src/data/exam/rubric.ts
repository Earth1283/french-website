import type { DelfLevel, RubricBand, RubricCriterionId, WritingEvaluation } from '../../types/exam';

// The DELF production écrite grids (current format) score five criteria, each
// on four performance bands. Only the points per band change by level:
//   A1 (exercise 2): 0 / 0.5 / 2 / 3      → 15
//   A2 (per exercise): 0 / 0.5 / 1.5 / 2.5 → 12.5
//   B1, B2:          0 / 1 / 3 / 5         → 25
// A text under half the required word count scores 0 on every criterion.
// Descriptors below are short English paraphrases, not the official wording.

export interface RubricCriterion {
  id: RubricCriterionId;
  labelFr: string;
  labelEn: string;
  /** What the "at level" band looks like, in plain English. */
  atLevel: string;
}

export const RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'task',
    labelFr: 'Réalisation de la tâche',
    labelEn: 'Task completion',
    atLevel: 'Does what the task asks: every requested point is covered, in the requested format.',
  },
  {
    id: 'coherence',
    labelFr: 'Cohérence et cohésion',
    labelEn: 'Coherence and cohesion',
    atLevel: 'Ideas follow a clear order and are linked with connectors; punctuation and layout help the reader.',
  },
  {
    id: 'sociolinguistic',
    labelFr: 'Adéquation sociolinguistique',
    labelEn: 'Register and politeness',
    atLevel: 'Greetings, sign-off and tu/vous suit the reader and the situation.',
  },
  {
    id: 'lexicon',
    labelFr: 'Lexique',
    labelEn: 'Vocabulary and spelling',
    atLevel: 'Vocabulary is broad enough for the topic, varied, and mostly spelled correctly.',
  },
  {
    id: 'morphosyntax',
    labelFr: 'Morphosyntaxe',
    labelEn: 'Grammar',
    atLevel: 'Sentence structures, agreements and tenses are controlled for the level.',
  },
];

export const BAND_LABELS: Record<RubricBand, string> = {
  0: 'Not answered / insufficient',
  1: 'Below the level',
  2: 'At the level',
  3: 'Above the level',
};

export const BAND_POINTS: Record<DelfLevel, [number, number, number, number]> = {
  a1: [0, 0.5, 2, 3],
  a2: [0, 0.5, 1.5, 2.5],
  b1: [0, 1, 3, 5],
  b2: [0, 1, 3, 5],
};

export function bandLabel(level: DelfLevel, band: RubricBand): string {
  if (band === 2) return `${level.toUpperCase()}`;
  if (band === 3) return `${level.toUpperCase()}+`;
  return BAND_LABELS[band];
}

export function maxWritingScore(level: DelfLevel): number {
  return BAND_POINTS[level][3] * RUBRIC_CRITERIA.length;
}

/** DELF counts a word as anything between two spaces: "c'est" is one word, "a-t-il" is one word. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(token => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Under half the expected length there is not enough to assess, and the grid gives 0 throughout. */
export function isTooShortToAssess(wordCount: number, minWords: number): boolean {
  return wordCount < minWords / 2;
}

export function scoreBands(level: DelfLevel, bands: Record<RubricCriterionId, RubricBand>): number {
  return RUBRIC_CRITERIA.reduce((sum, c) => sum + BAND_POINTS[level][bands[c.id]], 0);
}

export function clampBand(value: unknown): RubricBand {
  const n = typeof value === 'number' ? Math.round(value) : Number.NaN;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(3, n)) as RubricBand;
}

export function buildEvaluation(
  level: DelfLevel,
  source: WritingEvaluation['source'],
  rawBands: Partial<Record<RubricCriterionId, unknown>>,
  wordCount: number,
  minWords: number,
  extras: Pick<WritingEvaluation, 'comments' | 'summary' | 'corrections'> = { comments: {} },
): WritingEvaluation {
  const tooShort = isTooShortToAssess(wordCount, minWords);
  const bands = Object.fromEntries(
    RUBRIC_CRITERIA.map(c => [c.id, tooShort ? 0 : clampBand(rawBands[c.id])]),
  ) as Record<RubricCriterionId, RubricBand>;
  return {
    source,
    bands,
    score: scoreBands(level, bands),
    maxScore: maxWritingScore(level),
    tooShort,
    ...extras,
  };
}

/** Official pass mark is 50/100 overall with at least 5/25 per skill; a section score is shown out of 25. */
export function toOutOf25(score: number, max: number): number {
  return max === 0 ? 0 : Math.round((score / max) * 25 * 2) / 2;
}
