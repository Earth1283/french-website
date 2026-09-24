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
  const { dueCount, nextReviewDate } = useMemo(() => {
    if (completedLessons.length === 0) return { dueCount: 0, nextReviewDate: null };
    const today = todayString();
    const dueCount = buildReviewSession(completedLessons, srsData, today).items.length;
    const upcoming = Object.entries(srsData)
      .filter(([key, card]) => completedLessons.includes(key.split('::')[0]) && card.nextReview > today)
      .map(([, card]) => card.nextReview);
    const nextReviewDate = upcoming.length > 0 ? upcoming.reduce((a, b) => (a < b ? a : b)) : null;
    return { dueCount, nextReviewDate };
  }, [completedLessons, srsData]);

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
