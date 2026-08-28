import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const EXAMPLES: { syntax: string; result: string }[] = [
  { syntax: '# Page title', result: 'First line of every page. Becomes the page heading — required once per page.' },
  { syntax: '## A section heading', result: 'Breaks a long page into subsections.' },
  { syntax: '*Bonjour*', result: "Italics automatically get the site's red serif \"French word\" accent styling." },
  { syntax: '**important**', result: 'Bold.' },
  { syntax: '> A cultural note goes here.', result: 'Renders as a highlighted callout box — good for asides and warnings.' },
  { syntax: '| French | English |\n| --- | --- |\n| chat | cat |', result: 'A table — useful for conjugations or vocab grids. Scrolls horizontally on narrow screens.' },
  { syntax: '[link text](https://example.com)', result: 'A link.' },
  { syntax: '- one\n- two', result: 'A bulleted list (also works with 1. 2. for numbered).' },
];

export function MarkdownFormattingGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="inset-group">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inset-row w-full justify-between cursor-pointer"
        style={{ background: 'transparent', border: 'none' }}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-primary">
          <HelpCircle size={14} style={{ color: 'var(--accent)' }} /> Formatting guide
        </span>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      {open && (
        <div className="p-4 pt-0 space-y-3 inset-divider">
          <p className="text-xs text-muted leading-relaxed pt-3">
            Each page is plain markdown — the first line must be a <code>{'# Title'}</code>, everything after it is
            the page body. Click into a page below and a small floating toolbar appears near your cursor for quick
            formatting; drag its handle to pin it in place, or just type the syntax directly.
          </p>
          <div className="space-y-2">
            {EXAMPLES.map((ex) => (
              <div key={ex.syntax} className="grid gap-1 sm:grid-cols-2 sm:gap-3 text-xs">
                <code
                  className="px-2 py-1.5 rounded-md whitespace-pre-wrap leading-relaxed"
                  style={{
                    backgroundColor: 'var(--bg-inset)',
                    color: 'var(--accent)',
                    fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
                  }}
                >
                  {ex.syntax}
                </code>
                <span className="text-secondary leading-relaxed self-center">{ex.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
