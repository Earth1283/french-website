import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import type { Express } from 'express';

export async function createTestApp(): Promise<{ app: Express; db: Database.Database }> {
  const dir = mkdtempSync(join(tmpdir(), 'classroom-test-'));
  process.env.DATA_DIR = dir;
  process.env.DB_PATH = join(dir, 'test.sqlite3');
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.CORS_ORIGIN = '*';
  process.env.TEACHER_SIGNUP_CODE = 'test-invite-code';
  process.env.TLS_CERT_PATH = '';
  process.env.TLS_KEY_PATH = '';

  const { app } = await import('../src/app.js');
  const { db } = await import('../src/db/connection.js');
  const { runMigrations } = await import('../src/db/migrate.js');
  runMigrations(db);
  return { app, db };
}

export function resetDb(db: Database.Database): void {
  db.exec(`
    DELETE FROM attempts;
    DELETE FROM assignments;
    DELETE FROM content_items;
    DELETE FROM enrollments;
    DELETE FROM classes;
    DELETE FROM students;
    DELETE FROM teachers;
  `);
}
