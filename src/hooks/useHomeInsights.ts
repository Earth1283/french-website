import { useMemo } from 'react';
import { UNITS } from '../data/units';
import { vocabKey, defaultCard, isDue } from '../utils/srs';
import type { SRSCard } from '../types';

export function useHomeInsights({
  completedLessons,
  unit12Unlocked,
  srsData,
  bookmarkedLessons,
}: {
  completedLessons: string[];
  unit12Unlocked: boolean;
  srsData: Record<string, SRSCard>;
  bookmarkedLessons: string[];
}) {
  const nextUp = useMemo(() => {
    for (const unit of UNITS) {
      if (unit.id === 'slang' && !unit12Unlocked) continue;
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return { unit, lesson };
        }
      }
    }
    return null;
  }, [completedLessons, unit12Unlocked]);

  const todoItems = useMemo(() => {
    if (completedLessons.length === 0) return [];
    type Item = { unit: (typeof UNITS)[0]; lesson: (typeof UNITS)[0]['lessons'][0]; verb: string };
    const items: Item[] = [];

    for (const unit of UNITS) {
      if (unit.id === 'slang' && !unit12Unlocked) continue;
      const doneCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
      if (doneCount > 0 && doneCount < unit.lessons.length) {
        const next = unit.lessons.find(l => !completedLessons.includes(l.id));
        if (next) items.push({ unit, lesson: next, verb: 'Finish' });
      }
      if (items.length >= 3) break;
    }

    if (items.length < 3 && nextUp) {
      const alreadyListed = items.some(i => i.lesson.id === nextUp.lesson.id);
      if (!alreadyListed) items.push({ unit: nextUp.unit, lesson: nextUp.lesson, verb: 'Start' });
    }

    return items.slice(0, 3);
  }, [completedLessons, unit12Unlocked, nextUp]);

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

  // Lessons the user struggles with: completed, with at least one card below ease 2.0
  const weakSpots = useMemo(() => {
    if (completedLessons.length === 0) return [];
    type Spot = { unit: (typeof UNITS)[0]; lesson: (typeof UNITS)[0]['lessons'][0]; avgEase: number };
    const spots: Spot[] = [];
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) continue;
        const eases = lesson.vocab.map((_, idx) => (srsData[vocabKey(lesson.id, idx)] ?? defaultCard()).ease);
        const avg = eases.reduce((a, b) => a + b, 0) / eases.length;
        if (avg < 2.1) spots.push({ unit, lesson, avgEase: avg });
      }
    }
    return spots.sort((a, b) => a.avgEase - b.avgEase).slice(0, 3);
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

  return { nextUp, todoItems, dueCount, nextReviewDate, weakSpots, bookmarkDetails };
}
