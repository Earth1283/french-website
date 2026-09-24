-- Adds 'listening' (a script read aloud in the browser, with questions) and
-- 'writing' (a free-text task a teacher marks with the DELF grid) content
-- kinds. Same table rebuild as 006, since SQLite can't ALTER a CHECK
-- constraint; the runner disables foreign keys around this file.
CREATE TABLE content_items_new (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('lesson', 'quiz', 'reading', 'listening', 'writing')),
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

-- A writing attempt carries the student's text and, once the teacher has
-- marked it, the rubric bands and written feedback. Its score stays NULL
-- until then, so "awaiting review" is simply completed_at set, reviewed_at not.
ALTER TABLE attempts ADD COLUMN submission_text TEXT;
ALTER TABLE attempts ADD COLUMN review_json TEXT;
ALTER TABLE attempts ADD COLUMN reviewed_at TEXT;
