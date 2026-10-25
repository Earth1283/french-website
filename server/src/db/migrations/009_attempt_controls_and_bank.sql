ALTER TABLE assignments ADD COLUMN max_attempts INTEGER;
ALTER TABLE assignments ADD COLUMN accept_late INTEGER NOT NULL DEFAULT 1;

ALTER TABLE attempts ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 1;

CREATE TABLE assignment_overrides (
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  due_at TEXT,
  extra_attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (assignment_id, student_id)
);

CREATE TABLE bank_questions (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'fill-blank', 'translation')),
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  options_json TEXT,
  hint TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_bank_questions_teacher ON bank_questions(teacher_id);
