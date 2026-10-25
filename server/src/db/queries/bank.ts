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
}

function toQuestion(row: BankRow): BankQuestion {
  return {
    id: row.id,
    type: row.type,
    prompt: row.prompt,
    answer: row.answer,
    ...(row.options_json ? { options: JSON.parse(row.options_json) as string[] } : {}),
    ...(row.hint ? { hint: row.hint } : {}),
    tags: JSON.parse(row.tags_json) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fingerprint(q: Pick<BankQuestionInput, 'type' | 'prompt' | 'answer'>): string {
  return `${q.type}\u0000${q.prompt.trim().toLowerCase()}\u0000${q.answer.trim().toLowerCase()}`;
}

export function listBankQuestions(teacherId: string): BankQuestion[] {
  return (
    prepare('SELECT * FROM bank_questions WHERE teacher_id = ? ORDER BY created_at DESC, rowid DESC').all(teacherId) as BankRow[]
  ).map(toQuestion);
}

export function getBankQuestion(id: string): (BankQuestion & { teacherId: string }) | undefined {
  const row = prepare('SELECT * FROM bank_questions WHERE id = ?').get(id) as BankRow | undefined;
  return row ? { ...toQuestion(row), teacherId: row.teacher_id } : undefined;
}

function insertQuestion(teacherId: string, q: BankQuestionInput): string {
  const id = randomUUID();
  prepare(
    'INSERT INTO bank_questions (id, teacher_id, type, prompt, answer, options_json, hint, tags_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    teacherId,
    q.type,
    q.prompt,
    q.answer,
    q.type === 'multiple-choice' && q.options ? JSON.stringify(q.options) : null,
    q.hint || null,
    JSON.stringify(q.tags)
  );
  return id;
}

export function createBankQuestion(teacherId: string, q: BankQuestionInput): BankQuestion {
  return getBankQuestion(insertQuestion(teacherId, q))!;
}

// Questions already in the bank (same type, prompt and answer, ignoring case)
// are skipped, so saving a whole quiz twice doesn't double the bank.
export function importBankQuestions(
  teacherId: string,
  questions: BankQuestionInput[]
): { created: BankQuestion[]; skipped: number } {
  const seen = new Set(listBankQuestions(teacherId).map(fingerprint));
  const created: string[] = [];
  let skipped = 0;
  db.transaction(() => {
    for (const q of questions) {
      const key = fingerprint(q);
      if (seen.has(key)) {
        skipped += 1;
        continue;
      }
      seen.add(key);
      created.push(insertQuestion(teacherId, q));
    }
  })();
  return { created: created.map((id) => getBankQuestion(id)!), skipped };
}

export function updateBankQuestion(id: string, q: BankQuestionInput): BankQuestion {
  prepare(
    `UPDATE bank_questions SET type = ?, prompt = ?, answer = ?, options_json = ?, hint = ?, tags_json = ?,
       updated_at = datetime('now') WHERE id = ?`
  ).run(
    q.type,
    q.prompt,
    q.answer,
    q.type === 'multiple-choice' && q.options ? JSON.stringify(q.options) : null,
    q.hint || null,
    JSON.stringify(q.tags),
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
