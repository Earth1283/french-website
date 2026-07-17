import type { TestItem, CEFRBand } from '../types';

export interface IRTResponse {
  a: number;
  b: number;
  correct: boolean;
}

export const MIN_ITEMS = 25;
export const MAX_ITEMS = 40;
export const SE_STOP_THRESHOLD = 0.35;

const GRID_MIN = -4;
const GRID_MAX = 4;
const GRID_STEP = 0.1;

// Fixed quadrature grid for EAP estimation — 81 points from -4 to 4.
const THETA_GRID: number[] = [];
for (let t = GRID_MIN; t <= GRID_MAX + 1e-9; t += GRID_STEP) {
  THETA_GRID.push(Math.round(t * 10) / 10);
}
const GRID_PRIOR = THETA_GRID.map(t => normalPDF(t));

function normalPDF(x: number, mean = 0, sd = 1): number {
  const z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

/** 2PL probability of a correct response at ability `theta` for an item with discrimination `a` and difficulty `b`. */
export function probability2PL(theta: number, a: number, b: number): number {
  return 1 / (1 + Math.exp(-a * (theta - b)));
}

/** Fisher information of an item at ability `theta` — higher means the item is more informative there. */
export function itemInformation(theta: number, a: number, b: number): number {
  const p = probability2PL(theta, a, b);
  return a * a * p * (1 - p);
}

/**
 * Bayesian Expected-A-Posteriori ability estimate over a fixed quadrature grid
 * with a standard normal prior. Recomputed from scratch each call — trivial
 * cost at <=40 responses x 81 grid points. Bounded by construction (unlike
 * MLE, which diverges on all-correct/all-wrong streaks).
 */
export function estimateAbilityEAP(responses: IRTResponse[]): { theta: number; se: number } {
  if (responses.length === 0) return { theta: 0, se: 1 };

  const likelihoods = THETA_GRID.map(t =>
    responses.reduce((lik, r) => {
      const p = probability2PL(t, r.a, r.b);
      return lik * (r.correct ? p : 1 - p);
    }, 1)
  );

  const unnormalized = THETA_GRID.map((_, i) => GRID_PRIOR[i] * likelihoods[i]);
  const totalMass = unnormalized.reduce((s, v) => s + v, 0);
  const posterior = totalMass > 0
    ? unnormalized.map(v => v / totalMass)
    : GRID_PRIOR.map(p => p / GRID_PRIOR.reduce((s, v) => s + v, 0));

  const theta = THETA_GRID.reduce((s, t, i) => s + t * posterior[i], 0);
  const variance = THETA_GRID.reduce((s, t, i) => s + (t - theta) ** 2 * posterior[i], 0);
  return { theta, se: Math.sqrt(variance) };
}

/**
 * Picks the next item to administer: ranks unadministered candidates by
 * information at the current theta, then picks randomly among the top 5 (so
 * repeat attempts see varied sequences) with a soft preference against topics
 * that appeared in the last couple of selections.
 */
export function selectNextItem(candidates: TestItem[], theta: number, recentTopics: string[] = []): TestItem {
  if (candidates.length === 0) throw new Error('selectNextItem: no candidates remaining');

  const ranked = candidates
    .map(item => ({ item, info: itemInformation(theta, item.a, item.b) }))
    .sort((x, y) => y.info - x.info);

  const topPool = ranked.slice(0, Math.min(5, ranked.length));
  const fresh = topPool.filter(x => !recentTopics.includes(x.item.topic));
  const pool = fresh.length > 0 ? fresh : topPool;

  return pool[Math.floor(Math.random() * pool.length)].item;
}

/** Stop once the ability estimate is precise enough (SE below threshold), within a 25-40 item session. */
export function shouldStop(itemsAdministered: number, se: number): boolean {
  if (itemsAdministered >= MAX_ITEMS) return true;
  return itemsAdministered >= MIN_ITEMS && se < SE_STOP_THRESHOLD;
}

interface CEFRCut {
  level: string;
  min: number;
  max: number;
}

// Cut points on the theta (logit) scale. The top band is deliberately left
// open-ended ("B1+") rather than claiming B2/C1 precision the content can't
// back up — see src/data/testItemBank.ts for the coverage this reflects.
const CEFR_CUTS: CEFRCut[] = [
  { level: 'Pre-A1', min: -Infinity, max: -1.8 },
  { level: 'A1', min: -1.8, max: -0.6 },
  { level: 'A2', min: -0.6, max: 0.7 },
  { level: 'B1', min: 0.7, max: 1.8 },
  { level: 'B1+', min: 1.8, max: Infinity },
];

export function thetaToCEFR(theta: number): { level: string; band: 'lower' | 'mid' | 'upper' | null } {
  const bucket = CEFR_CUTS.find(c => theta >= c.min && theta < c.max) ?? CEFR_CUTS[CEFR_CUTS.length - 1];

  if (!Number.isFinite(bucket.min) || !Number.isFinite(bucket.max)) {
    return { level: bucket.level, band: null };
  }

  const span = bucket.max - bucket.min;
  const pos = (theta - bucket.min) / span;
  const band = pos < 1 / 3 ? 'lower' : pos < 2 / 3 ? 'mid' : 'upper';
  return { level: bucket.level, band };
}

export function cefrBandToLabel(cefr: CEFRBand): string {
  switch (cefr) {
    case 'pre-a1': return 'Pre-A1';
    case 'a1': return 'A1';
    case 'a2': return 'A2';
    case 'b1': return 'B1';
  }
}
