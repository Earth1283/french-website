import { describe, expect, it } from 'vitest';
import {
  attentionReason,
  describeDue,
  describeLastActive,
  dueDateInputToIso,
  isOverdue,
  isoToDueDateInput,
} from './classroomDates';
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

  it('picks the most pressing reason a student needs attention', () => {
    const base = { lastActiveAt: '2026-10-21 08:00:00', averageScore: 90, completedAssignments: 2, totalAssignments: 3 };
    expect(attentionReason(base, now)).toBeNull();
    expect(attentionReason({ ...base, completedAssignments: 0, lastActiveAt: null, averageScore: 0 }, now)).toBe('not-started');
    expect(attentionReason({ ...base, lastActiveAt: '2026-10-01 08:00:00' }, now)).toBe('inactive');
    expect(attentionReason({ ...base, averageScore: 40 }, now)).toBe('struggling');
  });

  it('does not nag about an empty class or a student who finished everything', () => {
    expect(attentionReason({ lastActiveAt: null, averageScore: 0, completedAssignments: 0, totalAssignments: 0 }, now)).toBeNull();
    expect(
      attentionReason({ lastActiveAt: '2026-09-01 08:00:00', averageScore: 95, completedAssignments: 3, totalAssignments: 3 }, now)
    ).toBeNull();
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
