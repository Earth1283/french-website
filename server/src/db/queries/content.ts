import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';
import type { ContentBody } from '../../lib/validation.js';

export interface ContentRow {
  id: string;
  teacher_id: string;
  kind: 'lesson' | 'quiz';
  title: string;
  subtitle: string;
  body_json: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function createContent(
  teacherId: string,
  title: string,
  subtitle: string,
  body: ContentBody
): ContentRow {
  const id = randomUUID();
  db.prepare(
    'INSERT INTO content_items (id, teacher_id, kind, title, subtitle, body_json) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, teacherId, body.kind, title, subtitle, JSON.stringify(body));
  return getContentById(id)!;
}

// Excludes soft-deleted content — this is the "content library" listing.
// Historical assignments/results still resolve deleted content via
// getContentById directly, so deleting content never breaks past attempts.
export function listContentByTeacher(teacherId: string): ContentRow[] {
  return db
    .prepare('SELECT * FROM content_items WHERE teacher_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC')
    .all(teacherId) as ContentRow[];
}

export function getContentById(id: string): ContentRow | undefined {
  return db.prepare('SELECT * FROM content_items WHERE id = ?').get(id) as ContentRow | undefined;
}

export function updateContent(
  id: string,
  fields: { title?: string; subtitle?: string; body?: ContentBody }
): ContentRow | undefined {
  if (fields.title !== undefined) {
    db.prepare('UPDATE content_items SET title = ? WHERE id = ?').run(fields.title, id);
  }
  if (fields.subtitle !== undefined) {
    db.prepare('UPDATE content_items SET subtitle = ? WHERE id = ?').run(fields.subtitle, id);
  }
  if (fields.body !== undefined) {
    db.prepare('UPDATE content_items SET kind = ?, body_json = ? WHERE id = ?').run(
      fields.body.kind,
      JSON.stringify(fields.body),
      id
    );
  }
  db.prepare("UPDATE content_items SET updated_at = datetime('now') WHERE id = ?").run(id);
  return getContentById(id);
}

// Soft delete — content that's already been assigned may have attempt
// history depending on it (via ON DELETE CASCADE from assignments), so a
// hard delete would silently destroy students' completed work.
export function deleteContent(id: string): void {
  db.prepare("UPDATE content_items SET deleted_at = datetime('now') WHERE id = ?").run(id);
}
