import { describe, expect, it } from 'vitest';
import { UNITS } from '../data/units';
import { hasInteractive } from '../interactive/registry';
import { getDeepLessonPages } from './deepLessons';

const readLessons = UNITS.flatMap(unit =>
  unit.lessons.filter(lesson => !hasInteractive(lesson.id)).map(lesson => [unit.slug, lesson.id] as const),
);

describe('built-in deep lesson curriculum', () => {
  it.each(readLessons)('%s/%s has four substantial reading chapters', (unitSlug, lessonId) => {
    const pages = getDeepLessonPages(unitSlug, lessonId);
    expect(pages).toHaveLength(4);

    for (const page of pages ?? []) {
      expect(page.title.length).toBeGreaterThan(10);
      expect(page.body.split(/\s+/).filter(Boolean).length).toBeGreaterThan(200);
    }
  });
});
