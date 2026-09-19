import Database from 'better-sqlite3';
import { config } from '../config.js';

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
// Under WAL, NORMAL can lose the last few commits on power loss but never
// corrupts the database, and skips an fsync on every write.
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

const statements = new Map<string, Database.Statement>();

// Parsing SQL is a real cost next to an in-process query, and the auth
// middleware alone runs one on every request — so each distinct query text is
// compiled once and reused.
export function prepare(sql: string): Database.Statement {
  let statement = statements.get(sql);
  if (!statement) {
    statement = db.prepare(sql);
    statements.set(sql, statement);
  }
  return statement;
}
