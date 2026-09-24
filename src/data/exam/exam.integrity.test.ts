import { describe, expect, it } from 'vitest';
import { LISTENING_DOCS } from './listening';
import { WRITING_TASKS } from './writing';
import { RUBRIC_CRITERIA, buildEvaluation, countWords, isTooShortToAssess, maxWritingScore, toOutOf25 } from './rubric';
import type { DelfLevel } from '../../types/exam';

const LEVELS: DelfLevel[] = ['a1', 'a2', 'b1', 'b2'];

describe('listening documents', () => {
  it('have unique ids', () => {
    const ids = LISTENING_DOCS.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cover every level', () => {
    for (const level of LEVELS) {
      expect(LISTENING_DOCS.filter(d => d.level === level).length).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(LISTENING_DOCS.map(d => [d.id, d] as const))('%s is well-formed', (_id, doc) => {
    expect(doc.script.length).toBeGreaterThan(0);
    expect(doc.questions.length).toBeGreaterThanOrEqual(3);
    for (const line of doc.script) expect(line.text.trim().length).toBeGreaterThan(0);
    for (const q of doc.questions) {
      expect(q.prompt.trim()).not.toBe('');
      expect(q.answer.trim()).not.toBe('');
      if (q.type === 'multiple-choice') {
        // The current DELF papers use three-option MCQs.
        expect(q.options).toHaveLength(3);
        expect(new Set(q.options).size).toBe(3);
        expect(q.options).toContain(q.answer);
      } else {
        expect(q.options).toBeUndefined();
      }
    }
  });

  it('only allows a single play for B2 documents', () => {
    for (const doc of LISTENING_DOCS.filter(d => d.plays === 1)) expect(doc.level).toBe('b2');
  });

  it('does not always put the right answer in the same slot', () => {
    const slots = new Set(
      LISTENING_DOCS.flatMap(d => d.questions)
        .filter(q => q.type === 'multiple-choice')
        .map(q => q.options!.indexOf(q.answer)),
    );
    expect(slots.size).toBe(3);
  });
});

describe('writing tasks', () => {
  it('have unique ids', () => {
    const ids = WRITING_TASKS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('use the DELF word minimum for their level', () => {
    const expected: Record<DelfLevel, number> = { a1: 40, a2: 60, b1: 160, b2: 250 };
    for (const task of WRITING_TASKS) expect(task.minWords).toBe(expected[task.level]);
  });

  it.each(WRITING_TASKS.map(t => [t.id, t] as const))('%s has a model answer that meets its own word count', (_id, task) => {
    expect(countWords(task.modelAnswer)).toBeGreaterThanOrEqual(task.minWords);
    expect(task.checklist.length).toBeGreaterThan(0);
    expect(task.consigne).toContain(`${task.minWords} mots minimum`);
  });

  it('cover every level', () => {
    for (const level of LEVELS) {
      expect(WRITING_TASKS.filter(t => t.level === level).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('rubric', () => {
  it('counts words the DELF way (anything between spaces)', () => {
    expect(countWords("C'est l'été, n'est-ce pas ?")).toBe(4);
    expect(countWords('  Bonjour   à tous  \n\n Paul ')).toBe(4);
    expect(countWords('— … !')).toBe(0);
    expect(countWords('')).toBe(0);
  });

  it('matches the official totals per level', () => {
    expect(maxWritingScore('a1')).toBe(15);
    expect(maxWritingScore('a2')).toBe(12.5);
    expect(maxWritingScore('b1')).toBe(25);
    expect(maxWritingScore('b2')).toBe(25);
  });

  it('scores 0 when under half the required length', () => {
    expect(isTooShortToAssess(79, 160)).toBe(true);
    expect(isTooShortToAssess(80, 160)).toBe(false);
    const allTop = Object.fromEntries(RUBRIC_CRITERIA.map(c => [c.id, 3]));
    expect(buildEvaluation('b1', 'ai', allTop, 79, 160).score).toBe(0);
    expect(buildEvaluation('b1', 'ai', allTop, 170, 160).score).toBe(25);
  });

  it('clamps out-of-range bands from an AI response', () => {
    const ev = buildEvaluation('b2', 'ai', { task: 9, coherence: -2, sociolinguistic: 'x', lexicon: 2.4, morphosyntax: 2 }, 300, 250);
    expect(ev.bands).toEqual({ task: 3, coherence: 0, sociolinguistic: 0, lexicon: 2, morphosyntax: 2 });
    expect(ev.score).toBe(5 + 0 + 0 + 3 + 3);
  });

  it('converts to a /25 section score', () => {
    expect(toOutOf25(12.5, 12.5)).toBe(25);
    expect(toOutOf25(7.5, 15)).toBe(12.5);
  });
});
