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
