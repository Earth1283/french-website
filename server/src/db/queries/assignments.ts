import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';

export interface AssignmentRow {
  id: string;
  class_id: string;
  content_id: string;
  assigned_at: string;
  due_at: string | null;
  visible: number;
}

export function createAssignment(classId: string, contentId: string, dueAt: string | null): AssignmentRow {
  const id = randomUUID();
  db.prepare(
    'INSERT INTO assignments (id, class_id, content_id, due_at) VALUES (?, ?, ?, ?)'
  ).run(id, classId, contentId, dueAt);
  return getAssignmentById(id)!;
}

export function listAssignmentsByClass(classId: string): AssignmentRow[] {
  return db
    .prepare('SELECT * FROM assignments WHERE class_id = ? ORDER BY assigned_at DESC')
    .all(classId) as AssignmentRow[];
}

export function getAssignmentById(id: string): AssignmentRow | undefined {
  return db.prepare('SELECT * FROM assignments WHERE id = ?').get(id) as AssignmentRow | undefined;
}

export function deleteAssignment(id: string): void {
  db.prepare('DELETE FROM assignments WHERE id = ?').run(id);
}

export interface StudentAssignmentRow extends AssignmentRow {
  title: string;
  kind: 'lesson' | 'quiz';
  completed: number;
  score: number | null;
}

export function listAssignmentsForStudent(studentId: string, classId: string): StudentAssignmentRow[] {
  return db
    .prepare(
      `SELECT a.*, c.title AS title, c.kind AS kind,
              CASE WHEN att.completed_at IS NOT NULL THEN 1 ELSE 0 END AS completed,
              att.score AS score
       FROM assignments a
       JOIN content_items c ON c.id = a.content_id
       LEFT JOIN attempts att ON att.assignment_id = a.id AND att.student_id = ?
       WHERE a.class_id = ? AND a.visible = 1
       ORDER BY a.assigned_at DESC`
    )
    .all(studentId, classId) as StudentAssignmentRow[];
}
