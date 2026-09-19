import { randomUUID } from 'node:crypto';
import { prepare } from '../connection.js';

export interface FlagRow {
  id: string;
  student_id: string;
  assignment_id: string;
  question_index: number;
  reason: string;
  created_at: string;
  resolved_at: string | null;
}

export function createFlag(studentId: string, assignmentId: string, questionIndex: number, reason: string): FlagRow {
  const id = randomUUID();
  prepare(
    'INSERT INTO flags (id, student_id, assignment_id, question_index, reason) VALUES (?, ?, ?, ?, ?)'
  ).run(id, studentId, assignmentId, questionIndex, reason);
  return getFlagById(id)!;
}

export function getFlagById(id: string): FlagRow | undefined {
  return prepare('SELECT * FROM flags WHERE id = ?').get(id) as FlagRow | undefined;
}

export interface FlagWithContext extends FlagRow {
  studentName: string;
  contentTitle: string;
}

export function listFlagsForAssignment(assignmentId: string): FlagWithContext[] {
  return prepare(
      `SELECT f.*, s.name AS studentName, c.title AS contentTitle
       FROM flags f
       JOIN students s ON s.id = f.student_id
       JOIN assignments a ON a.id = f.assignment_id
       JOIN content_items c ON c.id = a.content_id
       WHERE f.assignment_id = ?
       ORDER BY f.created_at DESC`
    )
    .all(assignmentId) as FlagWithContext[];
}

export function listFlagsForClass(classId: string): FlagWithContext[] {
  return prepare(
      `SELECT f.*, s.name AS studentName, c.title AS contentTitle
       FROM flags f
       JOIN students s ON s.id = f.student_id
       JOIN assignments a ON a.id = f.assignment_id
       JOIN content_items c ON c.id = a.content_id
       WHERE a.class_id = ?
       ORDER BY f.resolved_at IS NOT NULL, f.created_at DESC`
    )
    .all(classId) as FlagWithContext[];
}

export function countUnresolvedFlagsByAssignment(classId: string): Record<string, number> {
  const rows = prepare(
      `SELECT f.assignment_id AS assignmentId, COUNT(*) AS n
       FROM flags f
       JOIN assignments a ON a.id = f.assignment_id
       WHERE a.class_id = ? AND f.resolved_at IS NULL
       GROUP BY f.assignment_id`
    )
    .all(classId) as Array<{ assignmentId: string; n: number }>;
  return Object.fromEntries(rows.map((r) => [r.assignmentId, r.n]));
}

export function resolveFlag(id: string): FlagRow | undefined {
  prepare("UPDATE flags SET resolved_at = datetime('now') WHERE id = ?").run(id);
  return getFlagById(id);
}
