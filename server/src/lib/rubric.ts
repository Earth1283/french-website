// Mirrors src/data/exam/rubric.ts on the frontend: the DELF production écrite
// grid scores five criteria on four bands, with points per band set by level.
// test/writing.test.ts checks the two stay in agreement.

export type DelfLevel = 'a1' | 'a2' | 'b1' | 'b2';
export const RUBRIC_CRITERION_IDS = ['task', 'coherence', 'sociolinguistic', 'lexicon', 'morphosyntax'] as const;
export type RubricCriterionId = (typeof RUBRIC_CRITERION_IDS)[number];
export type RubricBands = Record<RubricCriterionId, number>;

export const BAND_POINTS: Record<DelfLevel, [number, number, number, number]> = {
  a1: [0, 0.5, 2, 3],
  a2: [0, 0.5, 1.5, 2.5],
  b1: [0, 1, 3, 5],
  b2: [0, 1, 3, 5],
};

export function maxWritingScore(level: DelfLevel): number {
  return BAND_POINTS[level][3] * RUBRIC_CRITERION_IDS.length;
}

export function scoreBands(level: DelfLevel, bands: RubricBands): number {
  return RUBRIC_CRITERION_IDS.reduce((sum, id) => sum + BAND_POINTS[level][bands[id]], 0);
}

/** The attempt score is stored as a percentage, like every other content kind. */
export function bandsToPercent(level: DelfLevel, bands: RubricBands): number {
  return Math.round((scoreBands(level, bands) / maxWritingScore(level)) * 100);
}

/** DELF counts a word as anything between two spaces. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}
