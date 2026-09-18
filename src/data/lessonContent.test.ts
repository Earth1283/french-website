import { describe, it, expect } from 'vitest';
import { UNITS } from './units';
import { getDeepLessonPages } from '../content/deepLessons';

const allLessons = UNITS.flatMap(unit => unit.lessons.map(lesson => ({ unit, lesson })));
const advancedLessons = allLessons.filter(({ unit }) => unit.isBridge || unit.isB1 || unit.isB2);

describe('lesson content', () => {
  it('uses unique lesson ids', () => {
    const ids = allLessons.map(({ lesson }) => lesson.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('gives every multiple-choice exercise an answer among distinct options', () => {
    const broken = allLessons.flatMap(({ lesson }) =>
      lesson.exercises
        .map((ex, i) => ({ ex, ref: `${lesson.id}#${i}` }))
        .filter(({ ex }) => ex.type === 'multiple-choice')
        .filter(({ ex }) => !ex.options?.includes(ex.answer) || new Set(ex.options).size !== ex.options.length)
        .map(({ ref }) => ref)
    );
    expect(broken).toEqual([]);
  });

  it('marks the gap in every fill-in-the-blank prompt', () => {
    const broken = allLessons.flatMap(({ lesson }) =>
      lesson.exercises.flatMap((ex, i) => (ex.type === 'fill-blank' && !ex.prompt.includes('___') ? [`${lesson.id}#${i}`] : []))
    );
    expect(broken).toEqual([]);
  });
});

describe.each(advancedLessons.map(({ unit, lesson }) => [lesson.id, unit.slug, lesson] as const))(
  'advanced lesson %s',
  (_id, unitSlug, lesson) => {
    it('has enough material to practise and measure', () => {
      expect(lesson.vocab.length).toBeGreaterThanOrEqual(7);
      expect(lesson.exercises).toHaveLength(6);
      const types = lesson.exercises.map(ex => ex.type);
      expect(types.filter(t => t === 'multiple-choice')).toHaveLength(2);
      expect(types.filter(t => t === 'fill-blank')).toHaveLength(2);
      expect(types.filter(t => t === 'translation')).toHaveLength(2);
    });

    it('keeps typed answers short enough to grade', () => {
      const long = lesson.exercises.filter(ex => ex.type !== 'multiple-choice' && ex.answer.split(/\s+/).length > 9);
      expect(long.map(ex => ex.answer)).toEqual([]);
      expect(lesson.exercises.filter(ex => /[()/·]/.test(ex.type === 'multiple-choice' ? '' : ex.answer))).toEqual([]);
    });

    it('has four substantial reading chapters', () => {
      const pages = getDeepLessonPages(unitSlug, lesson.id);
      expect(pages).toHaveLength(4);
      for (const page of pages ?? []) {
        expect(page.title.length).toBeGreaterThan(10);
        expect(page.body.split(/\s+/).filter(Boolean).length).toBeGreaterThan(300);
      }
    });
  },
);
