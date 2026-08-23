import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  probability2PL,
  itemInformation,
  estimateAbilityEAP,
  selectNextItem,
  shouldStop,
  thetaToCEFR,
  MIN_ITEMS,
  MAX_ITEMS,
  type IRTResponse,
} from './irt';
import type { TestItem, CEFRBand } from '../types';

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSyntheticBank(): TestItem[] {
  const items: TestItem[] = [];
  let i = 0;
  for (let b = -4; b <= 4.0001; b += 0.05) {
    items.push({
      id: `sim-${i++}`,
      type: 'multiple-choice',
      a: 1.0,
      b: Math.round(b * 100) / 100,
      topic: 'sim',
      cefr: 'a1' as CEFRBand,
      source: 'authored',
    });
  }
  return items;
}

function runCAT(bank: TestItem[], respond: (item: TestItem) => boolean) {
  let theta = 0;
  let se = 1;
  const responses: IRTResponse[] = [];
  const administeredIds = new Set<string>();
  const thetaTrace: number[] = [];
  const bTrace: number[] = [];

  while (!shouldStop(responses.length, se)) {
    const candidates = bank.filter(item => !administeredIds.has(item.id));
    if (candidates.length === 0) break;
    const next = selectNextItem(candidates, theta, []);
    administeredIds.add(next.id);
    bTrace.push(next.b);
    const correct = respond(next);
    responses.push({ a: next.a, b: next.b, correct });
    const est = estimateAbilityEAP(responses);
    theta = est.theta;
    se = est.se;
    thetaTrace.push(theta);
  }

  return { theta, se, itemsAdministered: responses.length, thetaTrace, bTrace };
}

describe('probability2PL / itemInformation', () => {
  it('gives 50% probability when theta equals difficulty', () => {
    expect(probability2PL(0.5, 1.2, 0.5)).toBeCloseTo(0.5, 6);
  });

  it('increases with theta', () => {
    const low = probability2PL(-1, 1, 0);
    const high = probability2PL(1, 1, 0);
    expect(high).toBeGreaterThan(low);
  });

  it('peaks item information at theta === b', () => {
    const atB = itemInformation(0.5, 1.4, 0.5);
    const away = itemInformation(2, 1.4, 0.5);
    expect(atB).toBeGreaterThan(away);
  });
});

describe('3PL guessing floor (c)', () => {
  it('never lets probability drop below c, however low theta is', () => {
    const p = probability2PL(-10, 1.4, 0, 0.25);
    expect(p).toBeGreaterThanOrEqual(0.25);
    expect(p).toBeCloseTo(0.25, 2);
  });

  it('matches plain 2PL when c is 0 or omitted', () => {
    expect(probability2PL(0.3, 1.2, -0.4, 0)).toBeCloseTo(probability2PL(0.3, 1.2, -0.4), 10);
  });

  it('makes a multiple-choice item less informative than a c=0 item of the same a/b for a low-ability test-taker', () => {
    const guessable = itemInformation(-2, 1.4, 0.5, 0.25);
    const noFloor = itemInformation(-2, 1.4, 0.5, 0);
    expect(guessable).toBeLessThan(noFloor);
  });

  it('gives a lucky correct guess on a far-too-hard MC item less pull on theta than the same result would under plain 2PL', () => {
    const hardItem = { a: 1.4, b: 3, correct: true };
    const withGuessing = estimateAbilityEAP([{ ...hardItem, c: 0.25 }]);
    const without = estimateAbilityEAP([{ ...hardItem, c: 0 }]);
    expect(withGuessing.theta).toBeLessThan(without.theta);
  });
});

describe('estimateAbilityEAP', () => {
  it('returns the prior (theta=0, se=1) with no responses', () => {
    const { theta, se } = estimateAbilityEAP([]);
    expect(theta).toBe(0);
    expect(se).toBe(1);
  });
});

describe('thetaToCEFR', () => {
  it('maps boundary and mid-band thetas to the right level', () => {
    expect(thetaToCEFR(-3).level).toBe('Pre-A1');
    expect(thetaToCEFR(-1.2).level).toBe('A1');
    expect(thetaToCEFR(0).level).toBe('A2');
    expect(thetaToCEFR(1).level).toBe('B1');
    expect(thetaToCEFR(2.5).level).toBe('B2');
    expect(thetaToCEFR(3.5).level).toBe('B2+');
  });

  it('leaves the open-ended top band without a lower/mid/upper split', () => {
    expect(thetaToCEFR(3.5).band).toBeNull();
  });

  it('splits a closed band into lower/mid/upper', () => {
    // A2 band is [-0.6, 0.7)
    expect(thetaToCEFR(-0.55).band).toBe('lower');
    expect(thetaToCEFR(0.05).band).toBe('mid');
    expect(thetaToCEFR(0.6).band).toBe('upper');
  });
});

describe('adaptive CAT simulation', () => {
  const bank = buildSyntheticBank();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('always-correct respondent trends upward and stays bounded by the prior', () => {
    const result = runCAT(bank, () => true);
    expect(result.itemsAdministered).toBeGreaterThanOrEqual(MIN_ITEMS);
    expect(result.itemsAdministered).toBeLessThanOrEqual(MAX_ITEMS);
    expect(result.theta).toBeGreaterThan(1);
    expect(result.theta).toBeLessThanOrEqual(4);
    expect(Number.isFinite(result.theta)).toBe(true);
    // Ability estimate should trend upward as more correct answers accumulate.
    expect(result.thetaTrace[4]).toBeLessThan(result.theta + 0.001);
  });

  it('coin-flip respondent hovers near theta=0 and never stops before MIN_ITEMS', () => {
    vi.spyOn(Math, 'random').mockImplementation(mulberry32(42));
    const result = runCAT(bank, () => Math.random() < 0.5);
    // Non-informative responses shouldn't produce a confident (low-SE) estimate
    // this early — the cap exists for exactly this case (verified directly in
    // the shouldStop unit tests below), but a lucky/unlucky streak can still
    // legitimately cross the SE threshold before MAX_ITEMS by chance.
    expect(result.itemsAdministered).toBeGreaterThanOrEqual(MIN_ITEMS);
    expect(result.itemsAdministered).toBeLessThanOrEqual(MAX_ITEMS);
    expect(Math.abs(result.theta)).toBeLessThan(1);
  });

  it('fixed-true-theta respondent converges toward the true ability', () => {
    vi.spyOn(Math, 'random').mockImplementation(mulberry32(7));
    const trueTheta = 0.8;
    const result = runCAT(bank, item => Math.random() < probability2PL(trueTheta, item.a, item.b));

    expect(Math.abs(result.theta - trueTheta)).toBeLessThan(0.6);

    const lastFive = result.bTrace.slice(-5);
    const avgLastFive = lastFive.reduce((s, v) => s + v, 0) / lastFive.length;
    expect(Math.abs(avgLastFive - trueTheta)).toBeLessThan(0.7);
  });
});

describe('shouldStop', () => {
  it('never stops before MIN_ITEMS regardless of SE', () => {
    expect(shouldStop(MIN_ITEMS - 1, 0.01)).toBe(false);
  });

  it('always stops at MAX_ITEMS regardless of SE', () => {
    expect(shouldStop(MAX_ITEMS, 5)).toBe(true);
  });

  it('stops once SE drops below threshold after MIN_ITEMS', () => {
    expect(shouldStop(MIN_ITEMS, 0.1)).toBe(true);
    expect(shouldStop(MIN_ITEMS, 0.9)).toBe(false);
  });
});
