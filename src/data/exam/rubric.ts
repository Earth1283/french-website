import type {
  DelfLevel, RubricBand, RubricCriterionId, SpeakingCriterionId, SpeakingEvaluation, WritingEvaluation,
} from '../../types/exam';

// The DELF production écrite grids (current format) score five criteria, each
// on four performance bands. Only the points per band change by level:
//   A1 (exercise 2): 0 / 0.5 / 2 / 3      → 15
//   A2 (per exercise): 0 / 0.5 / 1.5 / 2.5 → 12.5
//   B1, B2:          0 / 1 / 3 / 5         → 25
// A text under half the required word count scores 0 on every criterion.
// Descriptors below are short English paraphrases, not the official wording.

export interface RubricCriterion<Id extends string = RubricCriterionId> {
  id: Id;
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

// ─── Grids, so one scorecard can show either paper ───────────────────────────

export interface RubricGrid<Id extends string = string> {
  title: string;
  criteria: RubricCriterion<Id>[];
  points: readonly [number, number, number, number];
}

export function writingGrid(level: DelfLevel): RubricGrid<RubricCriterionId> {
  return { title: `Grille DELF ${level.toUpperCase()} · écrit`, criteria: RUBRIC_CRITERIA, points: BAND_POINTS[level] };
}

// ─── Production orale ────────────────────────────────────────────────────────
// The official speaking grids mix part-specific criteria with a shared
// linguistic grid (lexique, morphosyntaxe, phonologie). This app folds them
// into five criteria on the same four bands, 5 points each, for /25 at every
// level. Descriptors are plain-English paraphrases, not the official wording.

export const SPEAKING_CRITERIA: RubricCriterion<SpeakingCriterionId>[] = [
  {
    id: 'task',
    labelFr: 'Réalisation des tâches',
    labelEn: 'Task completion',
    atLevel: 'Does what each part asks: answers the questions, asks them, carries the role-play through, presents a point of view.',
  },
  {
    id: 'interaction',
    labelFr: 'Interaction et cohérence',
    labelEn: 'Interaction and coherence',
    atLevel: 'Reacts to the examiner, keeps the exchange going, and links ideas so they are easy to follow.',
  },
  {
    id: 'lexicon',
    labelFr: 'Lexique',
    labelEn: 'Vocabulary',
    atLevel: 'Vocabulary is broad and precise enough for the topics, with few words that block understanding.',
  },
  {
    id: 'morphosyntax',
    labelFr: 'Morphosyntaxe',
    labelEn: 'Grammar',
    atLevel: 'Sentence structures and verb forms are controlled for the level.',
  },
  {
    id: 'phonology',
    labelFr: 'Phonologie',
    labelEn: 'Pronunciation',
    atLevel: 'Sounds, liaisons and intonation are clear enough to follow without effort.',
  },
];

export const SPEAKING_BAND_POINTS = [0, 1, 3, 5] as const;

export const MAX_SPEAKING_SCORE = SPEAKING_BAND_POINTS[3] * SPEAKING_CRITERIA.length;

export function speakingGrid(level: DelfLevel): RubricGrid<SpeakingCriterionId> {
  return { title: `Grille DELF ${level.toUpperCase()} · oral`, criteria: SPEAKING_CRITERIA, points: SPEAKING_BAND_POINTS };
}

/** Under a quarter of the expected speaking time there is not enough to assess. */
export function isSpeechTooShort(secondsSpoken: number, expectedSeconds: number): boolean {
  return secondsSpoken < expectedSeconds / 4;
}

export function buildSpeakingEvaluation(
  source: SpeakingEvaluation['source'],
  rawBands: Partial<Record<SpeakingCriterionId, unknown>>,
  secondsSpoken: number,
  expectedSeconds: number,
  extras: Pick<SpeakingEvaluation, 'comments' | 'summary' | 'corrections' | 'transcripts'> = { comments: {} },
): SpeakingEvaluation {
  const tooShort = isSpeechTooShort(secondsSpoken, expectedSeconds);
  const bands = Object.fromEntries(
    SPEAKING_CRITERIA.map(c => [c.id, tooShort ? 0 : clampBand(rawBands[c.id])]),
  ) as Record<SpeakingCriterionId, RubricBand>;
  return {
    source,
    bands,
    score: SPEAKING_CRITERIA.reduce((sum, c) => sum + SPEAKING_BAND_POINTS[bands[c.id]], 0),
    maxScore: MAX_SPEAKING_SCORE,
    tooShort,
    ...extras,
  };
}

// ─── Whole paper ─────────────────────────────────────────────────────────────

export const PASS_MARK = 50;
export const SECTION_MINIMUM = 5;

/** The reading score needed to pass, given the other three sections; null if they already rule a pass out. */
export function readingNeededToPass(otherSections: number[]): number | null {
  if (otherSections.some(s => s < SECTION_MINIMUM)) return null;
  const needed = Math.max(SECTION_MINIMUM, PASS_MARK - otherSections.reduce((a, b) => a + b, 0));
  return needed > 25 ? null : needed;
}

export function passesDelf(sections: number[]): boolean {
  return sections.length === 4
    && sections.every(s => s >= SECTION_MINIMUM)
    && sections.reduce((a, b) => a + b, 0) >= PASS_MARK;
}
