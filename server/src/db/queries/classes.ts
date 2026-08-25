import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';
import { generateJoinCode } from '../../lib/joinCode.js';

export interface ClassRow {
  id: string;
  teacher_id: string;
  name: string;
  join_code: string;
  archived_at: string | null;
  created_at: string;
}

export function createClass(teacherId: string, name: string): ClassRow {
  const id = randomUUID();
  // Join codes are short and drawn from a decent-sized alphabet, so a
  // collision is rare but not impossible — retry a few times before giving up.
  for (let attempt = 0; attempt < 10; attempt++) {
    const joinCode = generateJoinCode();
    try {
      db.prepare(
        'INSERT INTO classes (id, teacher_id, name, join_code) VALUES (?, ?, ?, ?)'
      ).run(id, teacherId, name, joinCode);
      return getClassById(id)!;
    } catch (err) {
      if (attempt === 9) throw err;
    }
  }
  throw new Error('Failed to allocate a unique join code');
}

export function listClassesByTeacher(teacherId: string): ClassRow[] {
  return db
    .prepare('SELECT * FROM classes WHERE teacher_id = ? ORDER BY created_at DESC')
    .all(teacherId) as ClassRow[];
}

export function getClassById(id: string): ClassRow | undefined {
  return db.prepare('SELECT * FROM classes WHERE id = ?').get(id) as ClassRow | undefined;
}

export function getClassByJoinCode(joinCode: string): ClassRow | undefined {
  return db.prepare('SELECT * FROM classes WHERE join_code = ?').get(joinCode) as ClassRow | undefined;
}

export function updateClass(id: string, fields: { name?: string; archived?: boolean }): ClassRow | undefined {
  if (fields.name !== undefined) {
    db.prepare('UPDATE classes SET name = ? WHERE id = ?').run(fields.name, id);
  }
  if (fields.archived !== undefined) {
    db.prepare('UPDATE classes SET archived_at = ? WHERE id = ?').run(
      fields.archived ? new Date().toISOString() : null,
      id
    );
  }
  return getClassById(id);
}

export function rotateJoinCode(id: string): ClassRow | undefined {
  for (let attempt = 0; attempt < 10; attempt++) {
    const joinCode = generateJoinCode();
    try {
      db.prepare('UPDATE classes SET join_code = ? WHERE id = ?').run(joinCode, id);
      return getClassById(id);
    } catch (err) {
      if (attempt === 9) throw err;
    }
  }
  return getClassById(id);
}

export function listClassesForStudent(studentId: string): ClassRow[] {
  return db
    .prepare(
      `SELECT c.* FROM classes c
       JOIN enrollments e ON e.class_id = c.id
       WHERE e.student_id = ?
       ORDER BY e.joined_at DESC`
    )
    .all(studentId) as ClassRow[];
}

export function isEnrolled(studentId: string, classId: string): boolean {
  const row = db
    .prepare('SELECT 1 FROM enrollments WHERE student_id = ? AND class_id = ?')
    .get(studentId, classId);
  return !!row;
}

export function enrollStudent(studentId: string, classId: string): void {
  db.prepare(
    'INSERT OR IGNORE INTO enrollments (student_id, class_id) VALUES (?, ?)'
  ).run(studentId, classId);
}

export interface RosterEntry {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  completedAssignments: number;
  totalAssignments: number;
  averageScore: number;
}

export function getRoster(classId: string): RosterEntry[] {
  const students = db
    .prepare(
      `SELECT s.id, s.name, s.email, e.joined_at AS joinedAt
       FROM students s
       JOIN enrollments e ON e.student_id = s.id
       WHERE e.class_id = ?
       ORDER BY s.name COLLATE NOCASE`
    )
    .all(classId) as Array<{ id: string; name: string; email: string; joinedAt: string }>;

  const totalAssignments = (
    db.prepare('SELECT COUNT(*) AS n FROM assignments WHERE class_id = ?').get(classId) as { n: number }
  ).n;

  return students.map((s) => {
    const stats = db
      .prepare(
        `SELECT COUNT(*) AS completed, AVG(a.score) AS avgScore
         FROM attempts a
         JOIN assignments asg ON asg.id = a.assignment_id
         WHERE asg.class_id = ? AND a.student_id = ? AND a.completed_at IS NOT NULL`
      )
      .get(classId, s.id) as { completed: number; avgScore: number | null };

    return {
      ...s,
      completedAssignments: stats.completed,
      totalAssignments,
      averageScore: stats.avgScore ?? 0,
    };
  });
}
