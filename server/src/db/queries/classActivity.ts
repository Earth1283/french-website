import { prepare } from '../connection.js';
import type { ActivityInput } from '../../lib/classInsights.js';

export function getClassActivity(classId: string): ActivityInput {
  const students = prepare(
    `SELECT s.id, s.name, s.email, e.joined_at AS joinedAt
     FROM enrollments e JOIN students s ON s.id = e.student_id
     WHERE e.class_id = ?
     ORDER BY s.name COLLATE NOCASE`
  ).all(classId) as ActivityInput['students'];

  const assignments = (
    prepare(
      `SELECT a.id, c.title, c.kind, a.due_at AS dueAt, a.max_attempts AS maxAttempts, a.accept_late AS acceptLate
       FROM assignments a JOIN content_items c ON c.id = a.content_id
       WHERE a.class_id = ? AND a.visible = 1
       ORDER BY a.assigned_at DESC`
    ).all(classId) as Array<Omit<ActivityInput['assignments'][number], 'acceptLate'> & { acceptLate: number }>
  ).map((a) => ({ ...a, acceptLate: !!a.acceptLate }));

  const attempts = (
    prepare(
      `SELECT att.student_id AS studentId, att.assignment_id AS assignmentId, att.completed_at AS completedAt,
              att.score AS score, att.submission_text IS NOT NULL AS hasSubmissionText, att.attempt_count AS attemptCount
       FROM attempts att
       JOIN assignments a ON a.id = att.assignment_id
       JOIN enrollments e ON e.student_id = att.student_id AND e.class_id = a.class_id
       WHERE a.class_id = ?`
    ).all(classId) as Array<Omit<ActivityInput['attempts'][number], 'hasSubmissionText'> & { hasSubmissionText: number }>
  ).map((a) => ({ ...a, hasSubmissionText: !!a.hasSubmissionText }));

  const overrides = prepare(
    `SELECT o.student_id AS studentId, o.assignment_id AS assignmentId, o.due_at AS dueAt, o.extra_attempts AS extraAttempts
     FROM assignment_overrides o JOIN assignments a ON a.id = o.assignment_id
     WHERE a.class_id = ?`
  ).all(classId) as ActivityInput['overrides'];

  return { students, assignments, attempts, overrides };
}
