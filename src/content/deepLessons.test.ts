import { describe, expect, it } from 'vitest';
import { UNITS } from '../data/units';
import { getDeepLessonPages } from './deepLessons';

const expandedLessons = [
  ['pronunciation', 'pronunciation-1'],
  ['emergency', 'emergency-1'],
  ['food', 'food-2'],
  ['directions', 'directions-1'],
  ['numbers', 'numbers-2'],
  ['grammar', 'grammar-2'],
  ['grammar', 'grammar-3'],
] as const;

describe('built-in deep lesson curriculum', () => {
  it.each(expandedLessons)('%s/%s has four substantial reading chapters', (unitSlug, lessonId) => {
    const unit = UNITS.find((candidate) => candidate.slug === unitSlug);
    expect(unit?.lessons.some((lesson) => lesson.id === lessonId)).toBe(true);

    const pages = getDeepLessonPages(unitSlug, lessonId);
    expect(pages).toHaveLength(4);

    for (const page of pages ?? []) {
      expect(page.title.length).toBeGreaterThan(10);
      expect(page.body.split(/\s+/).filter(Boolean).length).toBeGreaterThan(200);
    }
  });
});
