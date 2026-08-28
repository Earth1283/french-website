import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type Database from 'better-sqlite3';

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    db.prepare('SELECT name FROM schema_migrations').all().map((row) => (row as { name: string }).name)
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const run = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
    });
    // Foreign keys are off for the duration of the migration (never inside
    // the transaction — SQLite ignores this pragma mid-transaction). A
    // migration that rebuilds a table (e.g. to change a CHECK constraint)
    // has to DROP the old table, and SQLite's DROP TABLE performs an
    // implicit cascading DELETE against every referencing child row when
    // foreign keys are enforced — silently wiping unrelated data. Disabling
    // enforcement for the rebuild avoids that; it's restored immediately
    // after and never applies to normal app operation.
    db.pragma('foreign_keys = OFF');
    try {
      run();
    } finally {
      db.pragma('foreign_keys = ON');
    }
    console.log(`[migrate] applied ${file}`);
  }
}
