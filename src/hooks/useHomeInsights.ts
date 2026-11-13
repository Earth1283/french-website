import { useNotebookStore } from '../stores/notebookStore';
import { useMemo } from 'react';
import { UNITS } from '../data/units';
import { buildReviewSession } from '../utils/reviewQueue';
import { todayString } from '../utils/streak';
import type { SRSCard } from '../types';

export function useHomeInsights({
  completedLessons,
  srsData,
  bookmarkedLessons,
}: {
  completedLessons: string[];
  srsData: Record<string, SRSCard>;
  bookmarkedLessons: string[];
}) {
  const mistakes = useNotebookStore(s => s.mistakes);
  const { dueCount, nextReviewDate } = useMemo(() => {
    const today = todayString();
    const dueCount = buildReviewSession(completedLessons, srsData, today, mistakes).items.length;
    const upcoming = Object.entries(srsData)
      .filter(([key, card]) => (completedLessons.includes(key.split('::')[0]) || mistakes.some(m => m.inReview && !m.resolved && key === `mistake::${m.id}`)) && card.nextReview > today)
      .map(([, card]) => card.nextReview);
    const nextReviewDate = upcoming.length > 0 ? upcoming.reduce((a, b) => (a < b ? a : b)) : null;
    return { dueCount, nextReviewDate };
  }, [completedLessons, srsData, mistakes]);

  const bookmarkDetails = useMemo(() => {
    return bookmarkedLessons.flatMap(lessonId => {
      for (const unit of UNITS) {
        const lesson = unit.lessons.find(l => l.id === lessonId);
        if (lesson) return [{ unit, lesson }];
      }
      return [];
    });
  }, [bookmarkedLessons]);

  return { dueCount, nextReviewDate, bookmarkDetails };
}
