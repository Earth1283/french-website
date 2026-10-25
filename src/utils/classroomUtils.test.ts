import { describe, expect, it } from 'vitest';
import {
  describeDue,
  describeLastActive,
  dueDateInputToIso,
  isOverdue,
  isoToDueDateInput,
} from './classroomDates';
import { describeAttemptLimit, describeAttemptsLeft, filterBank, tagsFromInput, weakestKind } from './classroomAttention';
import { buildGradebookCsv, escapeCsvCell } from './gradebookCsv';
import type { GradebookResponse } from '../types/classroom';

const now = new Date('2026-10-22T12:00:00Z');

describe('due dates', () => {
  it('round-trips a date input through an end-of-day ISO timestamp', () => {
    const iso = dueDateInputToIso('2026-11-03');
    expect(iso).not.toBeNull();
    expect(isoToDueDateInput(iso)).toBe('2026-11-03');
  });

  it('treats an empty input as no due date', () => {
    expect(dueDateInputToIso('')).toBeNull();
    expect(isoToDueDateInput(null)).toBe('');
  });

  it('flags only past due dates as overdue', () => {
    expect(isOverdue('2026-10-21T12:00:00Z', now)).toBe(true);
    expect(isOverdue('2026-10-23T12:00:00Z', now)).toBe(false);
    expect(isOverdue(null, now)).toBe(false);
  });

  it('describes how close the deadline is', () => {
    expect(describeDue('2026-10-22T20:00:00Z', now)).toBe('Due today');
    expect(describeDue('2026-10-23T20:00:00Z', now)).toBe('Due tomorrow');
    expect(describeDue('2026-10-19T12:00:00Z', now)).toBe('Overdue by 3 days');
    expect(describeDue('2026-10-21T11:00:00Z', now)).toBe('Overdue by 1 day');
  });
});

describe('student activity', () => {
  it('reads SQLite timestamps as UTC', () => {
    expect(describeLastActive('2026-10-22 08:00:00', now)).toBe('Active today');
    expect(describeLastActive('2026-10-21 08:00:00', now)).toBe('Active yesterday');
    expect(describeLastActive('2026-10-12 08:00:00', now)).toBe('Active 10 days ago');
    expect(describeLastActive(null, now)).toBe('No activity yet');
  });
});

describe('gradebook csv', () => {
  it('quotes cells that contain commas, quotes or newlines', () => {
    expect(escapeCsvCell('plain')).toBe('plain');
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('neutralises spreadsheet formulas in student-controlled text', () => {
    expect(escapeCsvCell('=HYPERLINK("http://evil")')).toBe('"\'=HYPERLINK(""http://evil"")"');
    expect(escapeCsvCell('+1')).toBe("'+1");
  });

  it('lays out one row per student with a column per assignment', () => {
    const gradebook: GradebookResponse = {
      assignments: [
        { id: 'a1', title: 'Quiz, week 1', kind: 'quiz', due_at: null },
        { id: 'a2', title: 'Essay', kind: 'writing', due_at: null },
      ],
      roster: [
        { id: 's1', name: 'Alex', email: 'alex@example.com', joinedAt: '', completedAssignments: 2, totalAssignments: 2, averageScore: 87.5, lastActiveAt: null, awaitingReview: 1 },
        { id: 's2', name: 'Bo', email: 'bo@example.com', joinedAt: '', completedAssignments: 0, totalAssignments: 2, averageScore: 0, lastActiveAt: null, awaitingReview: 0 },
      ],
      cells: [
        { studentId: 's1', assignmentId: 'a1', completed: true, score: 87.5 },
        { studentId: 's1', assignmentId: 'a2', completed: true, score: null },
      ],
    };
    expect(buildGradebookCsv(gradebook).split('\r\n')).toEqual([
      'Student,Email,"Quiz, week 1",Essay,Average',
      'Alex,alex@example.com,88,Submitted,88',
      'Bo,bo@example.com,,,',
    ]);
  });
});

describe('attempt wording', () => {
  it('describes limits and what is left', () => {
    expect(describeAttemptLimit(null)).toBe('Unlimited attempts');
    expect(describeAttemptLimit(1)).toBe('1 attempt');
    expect(describeAttemptLimit(3)).toBe('3 attempts');
    expect(describeAttemptsLeft(null)).toBeNull();
    expect(describeAttemptsLeft(0)).toBe('no attempts left');
    expect(describeAttemptsLeft(1)).toBe('1 attempt left');
    expect(describeAttemptsLeft(2)).toBe('2 attempts left');
  });

  it('names the weakest kind only when there is a real gap', () => {
    expect(weakestKind([{ kind: 'quiz', averageScore: 90 }])).toBeNull();
    expect(weakestKind([{ kind: 'quiz', averageScore: 70 }, { kind: 'lesson', averageScore: 70 }])).toBeNull();
    expect(weakestKind([{ kind: 'quiz', averageScore: 90 }, { kind: 'listening', averageScore: 50 }])).toBe('listening');
  });
});

describe('question bank helpers', () => {
  it('normalises comma-separated tags', () => {
    expect(tagsFromInput(' Verbs, food ,verbs,, ')).toEqual(['verbs', 'food']);
    expect(tagsFromInput('')).toEqual([]);
  });

  it('filters by tag and by text in the prompt or answer', () => {
    const bank = [
      { prompt: 'Bonjour means?', answer: 'Hello', tags: ['greetings'] },
      { prompt: 'Je ___ français', answer: 'parle', tags: ['verbs'] },
    ];
    expect(filterBank(bank, '', null)).toHaveLength(2);
    expect(filterBank(bank, '', 'verbs')).toEqual([bank[1]]);
    expect(filterBank(bank, 'HELLO', null)).toEqual([bank[0]]);
    expect(filterBank(bank, 'je', 'greetings')).toEqual([]);
  });
});
