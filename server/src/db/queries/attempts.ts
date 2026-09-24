import { randomUUID } from 'node:crypto';
import { prepare } from '../connection.js';

export interface AttemptRow {
  id: string;
  student_id: string;
  assignment_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  xp_earned: number | null;
  responses_json: string;
  submission_text: string | null;
  review_json: string | null;
  reviewed_at: string | null;
}

export interface AttemptResponse {
  index: number;
  correct: boolean;
  answerGiven?: string;
}

// One attempt per (student, assignment) — a retake replaces the previous
// attempt in place (enforced by a unique index) rather than adding a second
// row, so roster counts and per-question stats can't double-count a redo.
// A resubmitted essay clears the old review: the teacher marks the new text.
export function recordAttempt(
  studentId: string,
  assignmentId: string,
  responses: AttemptResponse[],
  score: number | null,
  xpEarned: number,
  submissionText: string | null = null
): AttemptRow {
  const id = randomUUID();
  prepare(
    `INSERT INTO attempts (id, student_id, assignment_id, completed_at, score, xp_earned, responses_json, submission_text)
     VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?)
     ON CONFLICT(student_id, assignment_id) DO UPDATE SET
       completed_at = excluded.completed_at,
       score = excluded.score,
       xp_earned = excluded.xp_earned,
       responses_json = excluded.responses_json,
       submission_text = excluded.submission_text,
       review_json = NULL,
       reviewed_at = NULL`
  ).run(id, studentId, assignmentId, score, xpEarned, JSON.stringify(responses), submissionText);
  return getAttemptForStudentAssignment(studentId, assignmentId)!;
}

export interface WritingReview {
  bands: Record<string, number>;
  feedback: string;
}

export function reviewAttempt(attemptId: string, score: number, review: WritingReview): AttemptRow {
  prepare(
    `UPDATE attempts SET score = ?, review_json = ?, reviewed_at = datetime('now') WHERE id = ?`
  ).run(score, JSON.stringify(review), attemptId);
  return getAttemptById(attemptId)!;
}

export interface SubmissionRow extends AttemptRow {
  studentName: string;
}

export function listSubmissionsForAssignment(assignmentId: string): SubmissionRow[] {
  return prepare(
    `SELECT att.*, s.name AS studentName
     FROM attempts att
     JOIN students s ON s.id = att.student_id
     WHERE att.assignment_id = ? AND att.completed_at IS NOT NULL AND att.submission_text IS NOT NULL
     ORDER BY att.reviewed_at IS NOT NULL, att.completed_at DESC`
  ).all(assignmentId) as SubmissionRow[];
}

export function getAttemptById(id: string): AttemptRow | undefined {
  return prepare('SELECT * FROM attempts WHERE id = ?').get(id) as AttemptRow | undefined;
}

export function getAttemptForStudentAssignment(studentId: string, assignmentId: string): AttemptRow | undefined {
  return prepare('SELECT * FROM attempts WHERE student_id = ? AND assignment_id = ?')
    .get(studentId, assignmentId) as AttemptRow | undefined;
}

export function listAttemptsForStudent(studentId: string): AttemptRow[] {
  return prepare('SELECT * FROM attempts WHERE student_id = ? ORDER BY started_at DESC')
    .all(studentId) as AttemptRow[];
}

export function listAttemptsForStudentInClass(studentId: string, classId: string): AttemptRow[] {
  return prepare(
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
// SQLite's json_each unpacks it and the tallying still happens in SQL.
export function getQuestionStatsForAssignment(assignmentId: string): QuestionStat[] {
  return prepare(
    `SELECT CAST(json_extract(r.value, '$.index') AS INTEGER) AS "index",
            SUM(json_extract(r.value, '$.correct')) AS correctCount,
            COUNT(*) - SUM(json_extract(r.value, '$.correct')) AS wrongCount,
            COUNT(*) AS totalCount
     FROM attempts att, json_each(att.responses_json) r
     WHERE att.assignment_id = ? AND att.completed_at IS NOT NULL
     GROUP BY "index"
     ORDER BY "index"`
  ).all(assignmentId) as QuestionStat[];
}
