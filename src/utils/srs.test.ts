import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultCard, pickReviewSession, updateCard, isDue } from './srs';
import { addDays, todayString } from './streak';
import type { SRSCard } from '../types';

const card = (over: Partial<SRSCard>): SRSCard => ({ interval: 1, ease: 2.5, nextReview: '2026-09-24', reps: 1, ...over });

describe('updateCard', () => {
  it('stretches intervals and lets ease grow with success', () => {
    let c = defaultCard();
    const intervals: number[] = [];
    for (let i = 0; i < 5; i++) { c = updateCard(c, true); intervals.push(c.interval); }
    expect(intervals.slice(0, 3)).toEqual([1, 3, 8]);
    expect(intervals[4]).toBeGreaterThan(intervals[3] * 2.5);
    expect(c.ease).toBeGreaterThan(2.5);
  });

  it('resets after a miss, lowers ease and records the lapse', () => {
    const remembered = updateCard(updateCard(defaultCard(), true), true);
    const lapsed = updateCard(remembered, false);
    expect(lapsed).toMatchObject({ interval: 1, reps: 0, lapses: 1 });
    expect(lapsed.ease).toBeLessThan(remembered.ease);
    expect(lapsed.nextReview).toBe(addDays(todayString(), 1));
  });

  it('does not count a miss on a never-remembered card as a lapse', () => {
    expect(updateCard(defaultCard(), false).lapses).toBe(0);
  });
});

describe('local dates', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('schedules "tomorrow" relative to the local calendar day', () => {
    vi.setSystemTime(new Date(2026, 8, 24, 23, 30)); // 11:30 pm local
    expect(todayString()).toBe('2026-09-24');
    expect(updateCard(defaultCard(), false).nextReview).toBe('2026-09-25');
    expect(isDue(card({ nextReview: '2026-09-25' }))).toBe(false);
  });
});

describe('pickReviewSession', () => {
  const today = '2026-09-24';
  const newCards = Array.from({ length: 25 }, (_, i) => ({ item: `new${i}` }));

  it('caps new cards per day', () => {
    expect(pickReviewSession(newCards, 0, today).items).toHaveLength(10);
    expect(pickReviewSession(newCards, 4, today).items).toHaveLength(6);
    expect(pickReviewSession(newCards, 12, today).items).toHaveLength(0);
  });

  it('puts the most overdue cards first and reports what was deferred', () => {
    const due = [
      { item: 'recent', card: card({ nextReview: '2026-09-23' }) },
      { item: 'oldest', card: card({ nextReview: '2026-09-01' }) },
      { item: 'later', card: card({ nextReview: '2026-10-01' }) },
    ];
    const session = pickReviewSession([...due, ...newCards], 0, today, { newPerDay: 2, reviews: 1 });
    expect(session.items).toEqual(['oldest', 'new0', 'new1']);
    expect(session.deferred).toBe(1 + 23);
  });
});
