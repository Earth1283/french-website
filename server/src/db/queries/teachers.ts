import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';

export interface TeacherRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  token_version: number;
  created_at: string;
}

export function countTeachers(): number {
  const row = db.prepare('SELECT COUNT(*) AS n FROM teachers').get() as { n: number };
  return row.n;
}

export function createTeacher(name: string, email: string, passwordHash: string): TeacherRow {
  const id = randomUUID();
  db.prepare(
    'INSERT INTO teachers (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, name, email, passwordHash);
  return getTeacherById(id)!;
}

export function getTeacherByEmail(email: string): TeacherRow | undefined {
  return db.prepare('SELECT * FROM teachers WHERE email = ?').get(email) as TeacherRow | undefined;
}

export function getTeacherById(id: string): TeacherRow | undefined {
  return db.prepare('SELECT * FROM teachers WHERE id = ?').get(id) as TeacherRow | undefined;
}
