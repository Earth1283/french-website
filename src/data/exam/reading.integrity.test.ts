import { describe, expect, it } from 'vitest';
import { READING_DOCS, READING_MINUTES } from './reading';
import { pickMockPaper } from '../../utils/mockExam';
import { gradeReading } from '../../utils/readingGrade';
import { countWords } from './rubric';
import type { DelfLevel } from '../../types/exam';

const levels: DelfLevel[] = ['a1', 'a2', 'b1', 'b2'];

describe('reading practice content', () => {
  it('has unique documents and a complete reading selection at every level', () => {
    expect(new Set(READING_DOCS.map(d => d.id)).size).toBe(READING_DOCS.length);
    for (const level of levels) {
      const ids = pickMockPaper(level).readingDocIds;
      expect(ids.length).toBeGreaterThanOrEqual(2);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every(id => READING_DOCS.find(d => d.id === id)?.level === level)).toBe(true);
      expect(READING_DOCS.filter(d => ids.includes(d.id)).reduce((n, d) => n + d.timeMinutes, 0)).toBeLessThanOrEqual(READING_MINUTES[level]);
    }
  });

  it.each(READING_DOCS.map(d => [d.id, d] as const))('%s has usable passages, unambiguous options, and explained answers', (_, doc) => {
    expect(countWords(doc.passage)).toBeGreaterThanOrEqual(doc.level === 'b2' ? 350 : doc.level === 'b1' ? 200 : 65);
    expect(doc.questions.length).toBeGreaterThanOrEqual(4);
    for (const q of doc.questions) {
      expect(q.prompt.trim()).not.toBe('');
      expect(q.answer.trim()).not.toBe('');
      expect(q.explanation?.trim()).toBeTruthy();
      if (q.type === 'multiple-choice') {
        expect(q.options).toHaveLength(3);
        expect(new Set(q.options).size).toBe(3);
        expect(q.options!.filter(o => o === q.answer)).toHaveLength(1);
      }
    }
    expect(gradeReading(doc.questions, doc.questions.map(q => q.answer)).every(Boolean)).toBe(true);
    expect(gradeReading(doc.questions, []).some(Boolean)).toBe(false);
  });
});
