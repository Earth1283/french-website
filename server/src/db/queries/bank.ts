import { randomUUID } from 'node:crypto';
import { db, prepare } from '../connection.js';

interface BankRow {
  id: string;
  teacher_id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation';
  prompt: string;
  answer: string;
  options_json: string | null;
  hint: string | null;
  tags_json: string;
  reading_id: string | null;
  page: number | null;
  reading_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankQuestion {
  id: string;
  type: BankRow['type'];
  prompt: string;
  answer: string;
  options?: string[];
  hint?: string;
  tags: string[];
  readingId: string | null;
  readingTitle: string | null;
  page: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BankQuestionInput {
  type: BankRow['type'];
  prompt: string;
  answer: string;
  options?: string[];
  hint?: string;
  tags: string[];
  readingId?: string | null;
  page?: number | null;
}

// A question points at the article it was written for. Deleted articles
// read as unlinked: the question stays in the bank, just without a source.
const SELECT_QUESTION = `SELECT b.*, c.title AS reading_title
  FROM bank_questions b
  LEFT JOIN content_items c ON c.id = b.reading_id AND c.deleted_at IS NULL`;

function toQuestion(row: BankRow): BankQuestion {
  return {
    id: row.id,
    type: row.type,
    prompt: row.prompt,
    answer: row.answer,
    ...(row.options_json ? { options: JSON.parse(row.options_json) as string[] } : {}),
    ...(row.hint ? { hint: row.hint } : {}),
    tags: JSON.parse(row.tags_json) as string[],
    readingId: row.reading_title === null ? null : row.reading_id,
    readingTitle: row.reading_title,
    page: row.reading_title === null ? null : row.page,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fingerprint(q: Pick<BankQuestionInput, 'type' | 'prompt' | 'answer'>): string {
  return `${q.type}\u0000${q.prompt.trim().toLowerCase()}\u0000${q.answer.trim().toLowerCase()}`;
}

export function listBankQuestions(teacherId: string): BankQuestion[] {
  return (
    prepare(`${SELECT_QUESTION} WHERE b.teacher_id = ? ORDER BY b.created_at DESC, b.rowid DESC`).all(teacherId) as BankRow[]
  ).map(toQuestion);
}

export function getBankQuestion(id: string): (BankQuestion & { teacherId: string }) | undefined {
  const row = prepare(`${SELECT_QUESTION} WHERE b.id = ?`).get(id) as BankRow | undefined;
  return row ? { ...toQuestion(row), teacherId: row.teacher_id } : undefined;
}

function insertQuestion(teacherId: string, q: BankQuestionInput): string {
  const id = randomUUID();
  prepare(
    'INSERT INTO bank_questions (id, teacher_id, type, prompt, answer, options_json, hint, tags_json, reading_id, page) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    teacherId,
    q.type,
    q.prompt,
    q.answer,
    q.type === 'multiple-choice' && q.options ? JSON.stringify(q.options) : null,
    q.hint || null,
    JSON.stringify(q.tags),
    q.readingId ?? null,
    q.readingId ? (q.page ?? null) : null
  );
  return id;
}

export function createBankQuestion(teacherId: string, q: BankQuestionInput): BankQuestion {
  return getBankQuestion(insertQuestion(teacherId, q))!;
}

// Questions already in the bank (same type, prompt and answer, ignoring case)
// are skipped, so saving a whole quiz twice doesn't double the bank. A match
// that isn't linked to an article yet picks up the link instead.
export function importBankQuestions(
  teacherId: string,
  questions: BankQuestionInput[]
): { created: BankQuestion[]; skipped: number; linked: number } {
  const existing = new Map(listBankQuestions(teacherId).map((q) => [fingerprint(q), q]));
  const created: string[] = [];
  let skipped = 0;
  let linked = 0;
  db.transaction(() => {
    for (const q of questions) {
      const key = fingerprint(q);
      const match = existing.get(key);
      if (match) {
        // Saving a bank question from an article's editor links it to that article.
        if (!match.readingId && q.readingId) {
          prepare('UPDATE bank_questions SET reading_id = ?, page = ? WHERE id = ?').run(q.readingId, q.page ?? null, match.id);
          existing.set(key, { ...match, readingId: q.readingId });
          linked += 1;
        } else {
          skipped += 1;
        }
        continue;
      }
      created.push(insertQuestion(teacherId, q));
      existing.set(key, { readingId: q.readingId ?? null } as BankQuestion);
    }
  })();
  return { created: created.map((id) => getBankQuestion(id)!), skipped, linked };
}

export function updateBankQuestion(id: string, q: BankQuestionInput): BankQuestion {
  prepare(
    `UPDATE bank_questions SET type = ?, prompt = ?, answer = ?, options_json = ?, hint = ?, tags_json = ?,
       reading_id = ?, page = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    q.type,
    q.prompt,
    q.answer,
    q.type === 'multiple-choice' && q.options ? JSON.stringify(q.options) : null,
    q.hint || null,
    JSON.stringify(q.tags),
    q.readingId ?? null,
    q.readingId ? (q.page ?? null) : null,
    id
  );
  return getBankQuestion(id)!;
}

export function deleteBankQuestions(teacherId: string, ids: string[]): number {
  let removed = 0;
  db.transaction(() => {
    for (const id of ids) {
      removed += prepare('DELETE FROM bank_questions WHERE id = ? AND teacher_id = ?').run(id, teacherId).changes;
    }
  })();
  return removed;
}
