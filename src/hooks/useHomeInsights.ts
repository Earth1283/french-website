import { useMemo } from 'react';
import { UNITS } from '../data/units';
import { vocabKey, defaultCard, isDue } from '../utils/srs';
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
    let count = 0;
    let earliest: string | null = null;
    const today = new Date().toISOString().slice(0, 10);
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) continue;
        lesson.vocab.forEach((_, idx) => {
          const card = srsData[vocabKey(lesson.id, idx)] ?? defaultCard();
          if (isDue(card)) {
            count++;
          } else if (card.nextReview > today) {
            if (!earliest || card.nextReview < earliest) earliest = card.nextReview;
          }
        });
      }
    }
    return { dueCount: count, nextReviewDate: earliest };
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
