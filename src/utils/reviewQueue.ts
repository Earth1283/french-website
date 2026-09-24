import type { Lesson, SRSCard, Unit, VocabItem } from '../types';
import { UNITS } from '../data/units';
import { pickReviewSession, vocabKey, type ReviewSession } from './srs';
import { todayString } from './streak';

export interface ReviewEntry {
  key: string;
  unit: Unit;
  lesson: Lesson;
  vocab: VocabItem;
}

export function buildReviewSession(
  completedLessons: string[],
  srsData: Record<string, SRSCard>,
  today = todayString(),
): ReviewSession<ReviewEntry> {
  const completed = new Set(completedLessons);
  const candidates = UNITS.flatMap(unit =>
    unit.lessons
      .filter(lesson => completed.has(lesson.id))
      .flatMap(lesson => lesson.vocab.map((vocab, idx) => {
        const key = vocabKey(lesson.id, idx);
        return { item: { key, unit, lesson, vocab }, card: srsData[key] };
      })),
  );
  const introducedToday = Object.values(srsData).filter(c => c.introduced === today).length;
  return pickReviewSession(candidates, introducedToday, today);
}
