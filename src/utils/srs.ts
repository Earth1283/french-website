import type { SRSCard } from '../types';

export function vocabKey(lessonId: string, idx: number): string {
  return `${lessonId}::${idx}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(base: string, days: number): string {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultCard(): SRSCard {
  return { interval: 1, ease: 2.5, nextReview: today(), reps: 0 };
}

export function updateCard(card: SRSCard, correct: boolean): SRSCard {
  if (!correct) {
    return {
      interval: 1,
      ease: Math.max(1.3, card.ease - 0.15),
      nextReview: addDays(today(), 1),
      reps: 0,
    };
  }
  const newReps = card.reps + 1;
  const newInterval =
    newReps === 1 ? 1 : newReps === 2 ? 3 : Math.round(card.interval * card.ease);
  return {
    interval: newInterval,
    ease: Math.min(2.5, card.ease + 0.05),
    nextReview: addDays(today(), newInterval),
    reps: newReps,
  };
}

export function isDue(card: SRSCard): boolean {
  return card.nextReview <= today();
}
