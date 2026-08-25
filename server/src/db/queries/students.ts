import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  token_version: number;
  created_at: string;
}

export function createStudent(name: string, email: string, passwordHash: string): StudentRow {
  const id = randomUUID();
  db.prepare(
    'INSERT INTO students (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, name, email, passwordHash);
  return getStudentById(id)!;
}

export function getStudentByEmail(email: string): StudentRow | undefined {
  return db.prepare('SELECT * FROM students WHERE email = ?').get(email) as StudentRow | undefined;
}

export function getStudentById(id: string): StudentRow | undefined {
  return db.prepare('SELECT * FROM students WHERE id = ?').get(id) as StudentRow | undefined;
}
