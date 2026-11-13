import type { SRSCard, VocabItem } from '../types';
import type { Mistake } from '../types/notebook';
import { UNITS } from '../data/units';
import { pickReviewSession, vocabKey, type ReviewSession } from './srs';
import { todayString } from './streak';

export interface ReviewEntry {
  key: string;
  lessonTitle: string;
  unitEmoji: string;
  mistakeId?: string;
  produce?: boolean;
  context?: string;
  vocab: VocabItem;
}

export function buildReviewSession(
  completedLessons: string[],
  srsData: Record<string, SRSCard>,
  today = todayString(),
  mistakes: Mistake[] = [],
): ReviewSession<ReviewEntry> {
  const completed = new Set(completedLessons);
  const candidates: { item: ReviewEntry; card?: SRSCard }[] = UNITS.flatMap(unit =>
    unit.lessons
      .filter(lesson => completed.has(lesson.id))
      .flatMap(lesson => lesson.vocab.map((vocab, idx) => {
        const key = vocabKey(lesson.id, idx);
        return { item: { key, lessonTitle: lesson.title, unitEmoji: unit.emoji, vocab }, card: srsData[key] };
      })),
  );
  for (const mistake of mistakes.filter(m => m.inReview && !m.resolved)) {
    const key = `mistake::${mistake.id}`;
    candidates.push({ item: {
      key, lessonTitle: 'Mistakes notebook', unitEmoji: '📓', mistakeId: mistake.id, produce: true, context: mistake.context,
      vocab: { french: mistake.corrected, english: mistake.prompt, pronunciation: '', funnyNote: mistake.explanation },
    }, card: srsData[key] });
  }
  const introducedToday = Object.values(srsData).filter(c => c.introduced === today).length;
  return pickReviewSession(candidates, introducedToday, today);
}
