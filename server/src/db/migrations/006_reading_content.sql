-- Adds 'reading' as a third content kind (long-form, multi-page lessons
-- whose page text lives as files on disk, not in body_json — see
-- server/src/lib/contentFiles.ts). SQLite can't ALTER a CHECK constraint in
-- place, so the table is rebuilt with the widened constraint and its data
-- copied across. The migration runner disables foreign key enforcement
-- around this file specifically so dropping the old table doesn't cascade
-- into assignments/attempts.
CREATE TABLE content_items_new (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('lesson', 'quiz', 'reading')),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  body_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

INSERT INTO content_items_new SELECT * FROM content_items;

DROP TABLE content_items;
ALTER TABLE content_items_new RENAME TO content_items;

CREATE INDEX idx_content_teacher ON content_items(teacher_id);
