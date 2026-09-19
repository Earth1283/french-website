import { randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config.js';

const CONTENT_FILES_DIR = join(config.dataDir, 'content-files');

// contentId is always a server-generated randomUUID (see createContent), so
// it's safe to use directly as a directory name — never user-supplied path
// input.
function readingDir(contentId: string): string {
  return join(CONTENT_FILES_DIR, contentId);
}

function pageFilename(index: number): string {
  return `${String(index + 1).padStart(2, '0')}.md`;
}

// Overwrites the full set of pages for a piece of reading content. Called on
// both create and update, so a teacher removing/reordering pages doesn't
// leave stale page files behind. The new pages are written to a sibling
// staging directory first and swapped in by rename, so a failure or crash
// while writing never leaves the content with half its pages.
export function writeReadingPages(contentId: string, pages: string[]): void {
  const dir = readingDir(contentId);
  const suffix = randomUUID();
  const staging = `${dir}.staging-${suffix}`;
  const replaced = `${dir}.replaced-${suffix}`;
  try {
    mkdirSync(staging, { recursive: true });
    pages.forEach((body, i) => {
      writeFileSync(join(staging, pageFilename(i)), body, 'utf8');
    });
    try {
      renameSync(dir, replaced);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
    renameSync(staging, dir);
  } finally {
    rmSync(staging, { recursive: true, force: true });
    rmSync(replaced, { recursive: true, force: true });
  }
}

export function removeReadingPages(contentId: string): void {
  rmSync(readingDir(contentId), { recursive: true, force: true });
}

export function readReadingPages(contentId: string): string[] {
  const dir = readingDir(contentId);
  let filenames: string[];
  try {
    filenames = readdirSync(dir);
  } catch {
    return [];
  }
  return filenames
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => readFileSync(join(dir, f), 'utf8'));
}
