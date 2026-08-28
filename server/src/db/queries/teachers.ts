import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';

export interface TeacherRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  token_version: number;
  created_at: string;
  recovery_code_hash: string | null;
}

export function countTeachers(): number {
  const row = db.prepare('SELECT COUNT(*) AS n FROM teachers').get() as { n: number };
  return row.n;
}

export function createTeacher(name: string, email: string, passwordHash: string, recoveryCodeHash: string): TeacherRow {
  const id = randomUUID();
  db.prepare(
    'INSERT INTO teachers (id, name, email, password_hash, recovery_code_hash) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, email, passwordHash, recoveryCodeHash);
  return getTeacherById(id)!;
}

export function getTeacherByEmail(email: string): TeacherRow | undefined {
  return db.prepare('SELECT * FROM teachers WHERE email = ?').get(email) as TeacherRow | undefined;
}

export function getTeacherById(id: string): TeacherRow | undefined {
  return db.prepare('SELECT * FROM teachers WHERE id = ?').get(id) as TeacherRow | undefined;
}

// Bumping token_version invalidates every outstanding login for this
// account, which is the right default whenever a password changes.
export function updateTeacherPassword(id: string, passwordHash: string): void {
  db.prepare('UPDATE teachers SET password_hash = ?, token_version = token_version + 1 WHERE id = ?').run(
    passwordHash,
    id
  );
}

// The recovery code is single-use — resetting a password (or explicitly
// regenerating) always issues a fresh one and invalidates the old.
export function updateTeacherRecoveryCodeHash(id: string, recoveryCodeHash: string): void {
  db.prepare('UPDATE teachers SET recovery_code_hash = ? WHERE id = ?').run(recoveryCodeHash, id);
}
