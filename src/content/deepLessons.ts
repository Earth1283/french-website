import { parseMarkdownPage } from '../utils/markdownPage';
import type { MarkdownPage } from '../utils/markdownPage';

export type { MarkdownPage };

// Long-form teaching content for built-in lessons lives here as plain
// markdown files, NOT as TypeScript data — so it can be read and edited
// without touching application code. Layout:
//
//   src/content/lessons/<unitSlug>/<lessonId>/01-some-slug.md
//   src/content/lessons/<unitSlug>/<lessonId>/02-another-slug.md
//
// Files sort by filename to determine page order. Each file's first line is
// "# Page Title"; everything after is the page body (see parseMarkdownPage).
// A lesson with no matching folder simply has no deep-dive content — the
// flashcard/exercise flow works exactly as before.
const rawFiles = import.meta.glob('/src/content/lessons/*/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const PATH_PATTERN = /\/src\/content\/lessons\/([^/]+)\/([^/]+)\/([^/]+)\.md$/;

const index = new Map<string, Map<string, { filename: string; raw: string }[]>>();

for (const [path, raw] of Object.entries(rawFiles)) {
  const match = path.match(PATH_PATTERN);
  if (!match) continue;
  const [, unitSlug, lessonId, filename] = match;
  if (!index.has(unitSlug)) index.set(unitSlug, new Map());
  const byLesson = index.get(unitSlug)!;
  if (!byLesson.has(lessonId)) byLesson.set(lessonId, []);
  byLesson.get(lessonId)!.push({ filename, raw });
}

for (const byLesson of index.values()) {
  for (const files of byLesson.values()) {
    files.sort((a, b) => a.filename.localeCompare(b.filename));
  }
}

export function getDeepLessonPages(unitSlug: string, lessonId: string): MarkdownPage[] | null {
  const files = index.get(unitSlug)?.get(lessonId);
  if (!files || files.length === 0) return null;
  return files.map((f) => parseMarkdownPage(f.raw));
}

export function hasDeepLesson(unitSlug: string, lessonId: string): boolean {
  return !!index.get(unitSlug)?.get(lessonId)?.length;
}
