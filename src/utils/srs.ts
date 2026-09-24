import type { SRSCard } from '../types';
import { addDays, todayString } from './streak';

export const MIN_EASE = 1.3;
export const MAX_EASE = 3;
/** An interval this long counts as a well-learned card. */
export const MATURE_INTERVAL_DAYS = 21;
export const NEW_CARDS_PER_DAY = 10;
export const REVIEWS_PER_SESSION = 40;

export function vocabKey(lessonId: string, idx: number): string {
  return `${lessonId}::${idx}`;
}

export function defaultCard(): SRSCard {
  return { interval: 1, ease: 2.5, nextReview: todayString(), reps: 0, lapses: 0, introduced: todayString() };
}

export function updateCard(card: SRSCard, correct: boolean): SRSCard {
  const today = todayString();
  if (!correct) {
    return {
      interval: 1,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      nextReview: addDays(today, 1),
      reps: 0,
      lapses: (card.lapses ?? 0) + (card.reps > 0 ? 1 : 0),
      introduced: card.introduced,
    };
  }
  const reps = card.reps + 1;
  const interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.max(card.interval + 1, Math.round(card.interval * card.ease));
  return {
    interval,
    ease: Math.min(MAX_EASE, card.ease + 0.1),
    nextReview: addDays(today, interval),
    reps,
    lapses: card.lapses ?? 0,
    introduced: card.introduced,
  };
}

export function isDue(card: SRSCard, today = todayString()): boolean {
  return card.nextReview <= today;
}

export interface ReviewCandidate<T> {
  item: T;
  /** Undefined when the card has never been reviewed. */
  card?: SRSCard;
}

export interface ReviewSession<T> {
  items: T[];
  /** Due or new cards left out to keep the session manageable. */
  deferred: number;
}

/**
 * Picks today's cards: due cards first, most overdue first, then a limited
 * number of new ones (fewer if some were already introduced today).
 */
export function pickReviewSession<T>(
  candidates: ReviewCandidate<T>[],
  introducedToday: number,
  today = todayString(),
  limits = { newPerDay: NEW_CARDS_PER_DAY, reviews: REVIEWS_PER_SESSION },
): ReviewSession<T> {
  const due = candidates
    .filter((c): c is ReviewCandidate<T> & { card: SRSCard } => !!c.card && isDue(c.card, today))
    .sort((a, b) => a.card.nextReview.localeCompare(b.card.nextReview));
  const fresh = candidates.filter(c => !c.card);

  const newAllowance = Math.max(0, limits.newPerDay - introducedToday);
  const items = [...due.slice(0, limits.reviews), ...fresh.slice(0, newAllowance)].map(c => c.item);
  return { items, deferred: due.length + fresh.length - items.length };
}
