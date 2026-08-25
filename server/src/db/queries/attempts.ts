import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';

export interface AttemptRow {
  id: string;
  student_id: string;
  assignment_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  xp_earned: number | null;
  responses_json: string;
}

export interface AttemptResponse {
  index: number;
  correct: boolean;
  answerGiven?: string;
}

export function recordAttempt(
  studentId: string,
  assignmentId: string,
  responses: AttemptResponse[],
  score: number,
  xpEarned: number
): AttemptRow {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO attempts (id, student_id, assignment_id, completed_at, score, xp_earned, responses_json)
     VALUES (?, ?, ?, datetime('now'), ?, ?, ?)`
  ).run(id, studentId, assignmentId, score, xpEarned, JSON.stringify(responses));
  return getAttemptById(id)!;
}

export function getAttemptById(id: string): AttemptRow | undefined {
  return db.prepare('SELECT * FROM attempts WHERE id = ?').get(id) as AttemptRow | undefined;
}

export function listAttemptsForStudent(studentId: string): AttemptRow[] {
  return db
    .prepare('SELECT * FROM attempts WHERE student_id = ? ORDER BY started_at DESC')
    .all(studentId) as AttemptRow[];
}

export function listAttemptsForStudentInClass(studentId: string, classId: string): AttemptRow[] {
  return db
    .prepare(
      `SELECT att.* FROM attempts att
       JOIN assignments a ON a.id = att.assignment_id
       WHERE att.student_id = ? AND a.class_id = ?
       ORDER BY att.started_at DESC`
    )
    .all(studentId, classId) as AttemptRow[];
}

export interface QuestionStat {
  index: number;
  correctCount: number;
  wrongCount: number;
  totalCount: number;
}

// responses_json is a JSON blob per attempt rather than normalized rows, so
// per-question tallying happens here in JS instead of in SQL.
export function getQuestionStatsForAssignment(assignmentId: string): QuestionStat[] {
  const rows = db
    .prepare("SELECT responses_json FROM attempts WHERE assignment_id = ? AND completed_at IS NOT NULL")
    .all(assignmentId) as Array<{ responses_json: string }>;

  const tally = new Map<number, { correct: number; wrong: number }>();
  for (const row of rows) {
    const responses = JSON.parse(row.responses_json) as AttemptResponse[];
    for (const r of responses) {
      const entry = tally.get(r.index) ?? { correct: 0, wrong: 0 };
      if (r.correct) entry.correct += 1;
      else entry.wrong += 1;
      tally.set(r.index, entry);
    }
  }

  return [...tally.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, { correct, wrong }]) => ({
      index,
      correctCount: correct,
      wrongCount: wrong,
      totalCount: correct + wrong,
    }));
}
