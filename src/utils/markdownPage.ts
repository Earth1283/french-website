export interface MarkdownPage {
  title: string;
  body: string;
}

// Shared convention for both built-in course content (src/content/lessons)
// and teacher-authored reading content (stored as files on the classroom
// server): a page's first line is "# Title", everything after is the body.
// No frontmatter/YAML — plain markdown stays trivial to hand-edit.
export function parseMarkdownPage(raw: string): MarkdownPage {
  const trimmed = raw.trim();
  const newlineIndex = trimmed.indexOf('\n');
  const firstLine = newlineIndex === -1 ? trimmed : trimmed.slice(0, newlineIndex);
  const rest = newlineIndex === -1 ? '' : trimmed.slice(newlineIndex + 1).trim();

  if (firstLine.startsWith('# ')) {
    return { title: firstLine.slice(2).trim(), body: rest };
  }
  return { title: '', body: trimmed };
}
