import { randomUUID } from 'node:crypto';
import { prepare } from '../connection.js';

export interface AnnouncementRow {
  id: string;
  class_id: string;
  title: string;
  body: string;
  pinned: number;
  created_at: string;
}

export function createAnnouncement(classId: string, title: string, body: string, pinned: boolean): AnnouncementRow {
  const id = randomUUID();
  prepare('INSERT INTO announcements (id, class_id, title, body, pinned) VALUES (?, ?, ?, ?, ?)').run(
    id,
    classId,
    title,
    body,
    pinned ? 1 : 0
  );
  return getAnnouncementById(id)!;
}

export function getAnnouncementById(id: string): AnnouncementRow | undefined {
  return prepare('SELECT * FROM announcements WHERE id = ?').get(id) as AnnouncementRow | undefined;
}

export function listAnnouncementsByClass(classId: string): AnnouncementRow[] {
  return prepare(
    'SELECT * FROM announcements WHERE class_id = ? ORDER BY pinned DESC, created_at DESC, rowid DESC'
  ).all(classId) as AnnouncementRow[];
}

export function updateAnnouncement(id: string, fields: { pinned?: boolean }): AnnouncementRow | undefined {
  if (fields.pinned !== undefined) {
    prepare('UPDATE announcements SET pinned = ? WHERE id = ?').run(fields.pinned ? 1 : 0, id);
  }
  return getAnnouncementById(id);
}

export function deleteAnnouncement(id: string): void {
  prepare('DELETE FROM announcements WHERE id = ?').run(id);
}
