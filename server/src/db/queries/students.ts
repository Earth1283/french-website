import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  token_version: number;
  created_at: string;
  recovery_code_hash: string | null;
}

export function createStudent(name: string, email: string, passwordHash: string, recoveryCodeHash: string): StudentRow {
  const id = randomUUID();
  db.prepare(
    'INSERT INTO students (id, name, email, password_hash, recovery_code_hash) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, email, passwordHash, recoveryCodeHash);
  return getStudentById(id)!;
}

export function getStudentByEmail(email: string): StudentRow | undefined {
  return db.prepare('SELECT * FROM students WHERE email = ?').get(email) as StudentRow | undefined;
}

export function getStudentById(id: string): StudentRow | undefined {
  return db.prepare('SELECT * FROM students WHERE id = ?').get(id) as StudentRow | undefined;
}

export function updateStudentPassword(id: string, passwordHash: string): void {
  db.prepare('UPDATE students SET password_hash = ?, token_version = token_version + 1 WHERE id = ?').run(
    passwordHash,
    id
  );
}

export function updateStudentRecoveryCodeHash(id: string, recoveryCodeHash: string): void {
  db.prepare('UPDATE students SET recovery_code_hash = ? WHERE id = ?').run(recoveryCodeHash, id);
}
