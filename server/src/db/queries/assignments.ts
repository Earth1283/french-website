import { randomUUID } from 'node:crypto';
import { prepare } from '../connection.js';
import type { ContentRow } from './content.js';

export interface AssignmentRow {
  id: string;
  class_id: string;
  content_id: string;
  assigned_at: string;
  due_at: string | null;
  visible: number;
  max_attempts: number | null;
  accept_late: number;
}

export interface NewAssignmentOptions {
  dueAt?: string | null;
  maxAttempts?: number | null;
  acceptLate?: boolean;
  visible?: boolean;
}

export function createAssignment(classId: string, contentId: string, options: NewAssignmentOptions = {}): AssignmentRow {
  const id = randomUUID();
  prepare(
    'INSERT INTO assignments (id, class_id, content_id, due_at, max_attempts, accept_late, visible) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    classId,
    contentId,
    options.dueAt ?? null,
    options.maxAttempts ?? null,
    options.acceptLate === false ? 0 : 1,
    options.visible === false ? 0 : 1
  );
  return getAssignmentById(id)!;
}

export function isContentAssignedToClass(classId: string, contentId: string): boolean {
  return !!prepare('SELECT 1 FROM assignments WHERE class_id = ? AND content_id = ?').get(classId, contentId);
}

export interface ClassAssignmentRow extends AssignmentRow {
  title: string;
  kind: ContentRow['kind'];
}

export function listAssignmentsByClass(classId: string): ClassAssignmentRow[] {
  return prepare(
    `SELECT a.*, c.title AS title, c.kind AS kind
     FROM assignments a
     JOIN content_items c ON c.id = a.content_id
     WHERE a.class_id = ?
     ORDER BY a.assigned_at DESC`
  ).all(classId) as ClassAssignmentRow[];
}

export function getAssignmentById(id: string): AssignmentRow | undefined {
  return prepare('SELECT * FROM assignments WHERE id = ?').get(id) as AssignmentRow | undefined;
}

export function updateAssignment(
  id: string,
  fields: { dueAt?: string | null; visible?: boolean; maxAttempts?: number | null; acceptLate?: boolean }
): AssignmentRow | undefined {
  if (fields.dueAt !== undefined) {
    prepare('UPDATE assignments SET due_at = ? WHERE id = ?').run(fields.dueAt, id);
  }
  if (fields.visible !== undefined) {
    prepare('UPDATE assignments SET visible = ? WHERE id = ?').run(fields.visible ? 1 : 0, id);
  }
  if (fields.maxAttempts !== undefined) {
    prepare('UPDATE assignments SET max_attempts = ? WHERE id = ?').run(fields.maxAttempts, id);
  }
  if (fields.acceptLate !== undefined) {
    prepare('UPDATE assignments SET accept_late = ? WHERE id = ?').run(fields.acceptLate ? 1 : 0, id);
  }
  return getAssignmentById(id);
}

export interface OverrideRow {
  assignment_id: string;
  student_id: string;
  due_at: string | null;
  extra_attempts: number;
}

export function getOverride(assignmentId: string, studentId: string): OverrideRow | undefined {
  return prepare('SELECT * FROM assignment_overrides WHERE assignment_id = ? AND student_id = ?')
    .get(assignmentId, studentId) as OverrideRow | undefined;
}

export function upsertOverride(
  assignmentId: string,
  studentId: string,
  fields: { dueAt?: string | null; extraAttempts?: number }
): OverrideRow {
  const current = getOverride(assignmentId, studentId);
  const dueAt = fields.dueAt !== undefined ? fields.dueAt : (current?.due_at ?? null);
  const extra = fields.extraAttempts ?? current?.extra_attempts ?? 0;
  prepare(
    `INSERT INTO assignment_overrides (assignment_id, student_id, due_at, extra_attempts) VALUES (?, ?, ?, ?)
     ON CONFLICT(assignment_id, student_id) DO UPDATE SET due_at = excluded.due_at, extra_attempts = excluded.extra_attempts`
  ).run(assignmentId, studentId, dueAt, extra);
  return getOverride(assignmentId, studentId)!;
}

export function deleteOverride(assignmentId: string, studentId: string): void {
  prepare('DELETE FROM assignment_overrides WHERE assignment_id = ? AND student_id = ?').run(assignmentId, studentId);
}

export function deleteAssignment(id: string): void {
  prepare('DELETE FROM assignments WHERE id = ?').run(id);
}

export interface StudentAssignmentRow extends AssignmentRow {
  title: string;
  kind: ContentRow['kind'];
  completed: number;
  score: number | null;
  attempt_count: number;
  override_due_at: string | null;
  override_extra_attempts: number;
}

export function listAssignmentsForStudent(studentId: string, classId: string): StudentAssignmentRow[] {
  return prepare(
      `SELECT a.*, c.title AS title, c.kind AS kind,
              CASE WHEN att.completed_at IS NOT NULL THEN 1 ELSE 0 END AS completed,
              att.score AS score,
              COALESCE(att.attempt_count, 0) AS attempt_count,
              o.due_at AS override_due_at,
              COALESCE(o.extra_attempts, 0) AS override_extra_attempts
       FROM assignments a
       JOIN content_items c ON c.id = a.content_id
       LEFT JOIN attempts att ON att.assignment_id = a.id AND att.student_id = @studentId
       LEFT JOIN assignment_overrides o ON o.assignment_id = a.id AND o.student_id = @studentId
       WHERE a.class_id = @classId AND a.visible = 1
       ORDER BY a.assigned_at DESC`
    )
    .all({ studentId, classId }) as StudentAssignmentRow[];
}
