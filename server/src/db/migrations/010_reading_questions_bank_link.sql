ALTER TABLE bank_questions ADD COLUMN reading_id TEXT REFERENCES content_items(id) ON DELETE SET NULL;
ALTER TABLE bank_questions ADD COLUMN page INTEGER;
CREATE INDEX idx_bank_questions_reading ON bank_questions(reading_id);
