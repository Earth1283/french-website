import { randomUUID } from 'node:crypto';
import { db } from '../connection.js';
import { readReadingPages, writeReadingPages } from '../../lib/contentFiles.js';
import type { ContentBody } from '../../lib/validation.js';

export interface ContentRow {
  id: string;
  teacher_id: string;
  kind: 'lesson' | 'quiz' | 'reading';
  title: string;
  subtitle: string;
  body_json: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Reading content's page text is never written into body_json — only a
// small manifest (page count, xp, gradability) is. The pages themselves
// live as files on disk (see contentFiles.ts) and are read back in by
// hydrateContentBody. Other content kinds store their full body as-is.
function bodyToStoredJson(body: ContentBody): string {
  if (body.kind === 'reading') {
    return JSON.stringify({ kind: 'reading', xpReward: body.xpReward, gradable: body.gradable, pageCount: body.pages.length });
  }
  return JSON.stringify(body);
}

export function createContent(
  teacherId: string,
  title: string,
  subtitle: string,
  body: ContentBody
): ContentRow {
  const id = randomUUID();
  if (body.kind === 'reading') writeReadingPages(id, body.pages);
  db.prepare(
    'INSERT INTO content_items (id, teacher_id, kind, title, subtitle, body_json) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, teacherId, body.kind, title, subtitle, bodyToStoredJson(body));
  return getContentById(id)!;
}

// Reconstructs the full content body a client needs to render/edit,
// reading reading-kind page text off disk. Use this instead of
// JSON.parse(row.body_json) anywhere the actual body (not just metadata) is
// needed — the raw row's body_json only has a manifest for reading content.
export function hydrateContentBody(row: ContentRow): ContentBody {
  const parsed = JSON.parse(row.body_json) as ContentBody;
  if (parsed.kind === 'reading') {
    return { ...parsed, pages: readReadingPages(row.id) };
  }
  return parsed;
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
    if (fields.body.kind === 'reading') writeReadingPages(id, fields.body.pages);
    db.prepare('UPDATE content_items SET kind = ?, body_json = ? WHERE id = ?').run(
      fields.body.kind,
      bodyToStoredJson(fields.body),
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
