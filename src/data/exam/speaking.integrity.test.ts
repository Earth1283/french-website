import { describe, expect, it } from 'vitest';
import { SPEAKING_FORMAT, SPEAKING_TASKS } from './speaking';
import type { DelfLevel } from '../../types/exam';

const LEVELS: DelfLevel[] = ['a1', 'a2', 'b1', 'b2'];

describe('speaking tasks', () => {
  it('have unique ids', () => {
    const ids = SPEAKING_TASKS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cover every level', () => {
    for (const level of LEVELS) {
      expect(SPEAKING_TASKS.filter(t => t.level === level).length).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(SPEAKING_TASKS.map(t => [t.id, t] as const))('%s follows its level\'s format', (_id, task) => {
    expect(task.id.startsWith(`${task.level}-oral-`)).toBe(true);
    expect(task.parts.map(p => p.kind)).toEqual(SPEAKING_FORMAT[task.level]);
    for (const part of task.parts) {
      expect(part.title.trim()).not.toBe('');
      expect(part.consigne.trim()).not.toBe('');
      expect(part.instructionsEn.trim()).not.toBe('');
      expect(part.speakMinutes).toBeGreaterThan(0);
      expect(part.checklist.length).toBeGreaterThanOrEqual(2);
      expect(part.usefulPhrases.length).toBeGreaterThanOrEqual(3);
      expect(part.modelAnswer.trim().length).toBeGreaterThan(80);
      for (const line of part.examinerLines) expect(line.trim()).not.toBe('');
    }
  });

  it('gives the examiner something to say in interview, role-play and debate parts', () => {
    for (const part of SPEAKING_TASKS.flatMap(t => t.parts)) {
      if (part.kind === 'entretien' || part.kind === 'interaction' || part.kind === 'debat') {
        expect(part.examinerLines.length).toBeGreaterThanOrEqual(3);
      }
      if (part.kind === 'monologue' || part.kind === 'point-de-vue' || part.kind === 'echange') {
        expect(part.examinerLines).toEqual([]);
      }
    }
  });

  it('has cue cards only for the A1 échange and a document for every point de vue', () => {
    for (const part of SPEAKING_TASKS.flatMap(t => t.parts)) {
      if (part.kind === 'echange') expect(part.cueCards?.length ?? 0).toBeGreaterThanOrEqual(5);
      else expect(part.cueCards).toBeUndefined();
      if (part.kind === 'point-de-vue') expect(part.document?.trim().length ?? 0).toBeGreaterThan(200);
    }
  });

  it('uses the official preparation times', () => {
    for (const task of SPEAKING_TASKS) {
      const prep = task.parts.reduce((sum, p) => sum + p.prepMinutes, 0);
      expect(prep).toBe(task.level === 'b2' ? 30 : 10);
    }
  });
});
