import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bold, GripVertical, Heading1, Heading2, Heading3, Italic, Link2, Quote, Table, X } from 'lucide-react';
import { getCaretCoordinates } from '../../utils/caretCoordinates';

const HEADING_LEVELS = [
  { hashes: '#', icon: Heading1, label: 'Heading 1' },
  { hashes: '##', icon: Heading2, label: 'Heading 2' },
  { hashes: '###', icon: Heading3, label: 'Heading 3' },
];

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface Point {
  top: number;
  left: number;
}

const TOOLBAR_GAP = 44;
const TOOLBAR_WIDTH_ESTIMATE = 230;

function clampToViewport({ top, left }: Point): Point {
  return {
    top: Math.min(Math.max(top, 8), window.innerHeight - 44),
    left: Math.min(Math.max(left, 8), window.innerWidth - TOOLBAR_WIDTH_ESTIMATE),
  };
}

// A markdown <textarea> with a floating formatting toolbar: it appears
// anchored above the caret/selection (bubble-menu style), and can be
// dragged by its handle to a fixed spot — once dragged it stops following
// the caret and stays put until dismissed, acting as a small docked palette
// instead. Selection-affecting actions restore focus + selection afterward
// so formatting can be applied repeatedly without re-clicking into the text.
export function MarkdownField({ value, onChange, placeholder, rows = 8 }: MarkdownFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [position, setPosition] = useState<Point | null>(null);
  const [pinned, setPinned] = useState(false);
  const hideTimeout = useRef<number | null>(null);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; start: Point } | null>(null);
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);
  const headingMenuTimeout = useRef<number | null>(null);

  function openHeadingMenu() {
    if (headingMenuTimeout.current) window.clearTimeout(headingMenuTimeout.current);
    setHeadingMenuOpen(true);
  }
  function scheduleCloseHeadingMenu() {
    headingMenuTimeout.current = window.setTimeout(() => setHeadingMenuOpen(false), 150);
  }

  function anchorToCaret() {
    const el = textareaRef.current;
    if (!el || pinned) return;
    const caret = getCaretCoordinates(el, el.selectionStart);
    setPosition(clampToViewport({ top: caret.top - TOOLBAR_GAP, left: caret.left }));
  }

  function handleFocus() {
    if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
    anchorToCaret();
  }

  function handleBlur() {
    if (pinned) return;
    hideTimeout.current = window.setTimeout(() => setPosition(null), 150);
  }

  // Reposition on window scroll so the bubble tracks the caret's screen
  // position; skipped once pinned, since a pinned toolbar deliberately
  // ignores the caret.
  useEffect(() => {
    if (!position || pinned) return;
    const onScroll = () => anchorToCaret();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, pinned]);

  function handleDragStart(e: React.PointerEvent) {
    e.preventDefault();
    if (!position) return;
    setPinned(true);
    dragOrigin.current = { pointerX: e.clientX, pointerY: e.clientY, start: position };

    function onMove(ev: PointerEvent) {
      if (!dragOrigin.current) return;
      const { pointerX, pointerY, start } = dragOrigin.current;
      setPosition(clampToViewport({ top: start.top + (ev.clientY - pointerY), left: start.left + (ev.clientX - pointerX) }));
    }
    function onUp() {
      dragOrigin.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function wrapSelection(marker: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end);
    onChange(value.slice(0, start) + marker + selected + marker + value.slice(end));
    const newStart = start + marker.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newStart + selected.length);
    });
  }

  function prefixLines(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const blockStart = value.lastIndexOf('\n', start - 1) + 1;
    const nextNewline = value.indexOf('\n', end);
    const blockEnd = nextNewline === -1 ? value.length : nextNewline;
    const block = value.slice(blockStart, blockEnd);
    const prefixed = block
      .split('\n')
      .map((line) => (line.startsWith(prefix) ? line : prefix + line))
      .join('\n');
    onChange(value.slice(0, blockStart) + prefixed + value.slice(blockEnd));
    const delta = prefixed.length - block.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + delta);
    });
  }

  // Unlike prefixLines, this replaces any heading markup a line already has
  // rather than stacking onto it — switching a line from H1 to H2 shouldn't
  // leave "## # Title" behind.
  function applyHeading(hashes: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const blockStart = value.lastIndexOf('\n', start - 1) + 1;
    const nextNewline = value.indexOf('\n', end);
    const blockEnd = nextNewline === -1 ? value.length : nextNewline;
    const block = value.slice(blockStart, blockEnd);
    const prefix = `${hashes} `;
    const restyled = block
      .split('\n')
      .map((line) => prefix + line.replace(/^#{1,6}\s*/, ''))
      .join('\n');
    onChange(value.slice(0, blockStart) + restyled + value.slice(blockEnd));
    const delta = restyled.length - block.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + delta);
    });
    setHeadingMenuOpen(false);
  }

  function applyLink() {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const label = value.slice(start, end) || 'link text';
    const snippet = `[${label}](url)`;
    onChange(value.slice(0, start) + snippet + value.slice(end));
    const urlStart = start + label.length + 3;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(urlStart, urlStart + 3);
    });
  }

  function insertTable() {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start } = el;
    const leading = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    const snippet = `${leading}\n| Header | Header |\n| --- | --- |\n| Cell | Cell |\n\n`;
    onChange(value.slice(0, start) + snippet + value.slice(start));
    const pos = start + snippet.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  const preHeadingButtons = [
    { icon: Bold, label: 'Bold', onClick: () => wrapSelection('**') },
    { icon: Italic, label: 'Italic — French-word accent style', onClick: () => wrapSelection('*') },
  ];
  const postHeadingButtons = [
    { icon: Quote, label: 'Callout / quote', onClick: () => prefixLines('> ') },
    { icon: Link2, label: 'Link', onClick: applyLink },
    { icon: Table, label: 'Table', onClick: insertTable },
  ];

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={anchorToCaret}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        className="ios-input py-2 text-sm font-mono resize-y"
      />
      {position &&
        createPortal(
          <div
            className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-full"
            style={{
              top: position.top,
              left: position.left,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-2)',
            }}
          >
            <button
              onPointerDown={handleDragStart}
              aria-label="Move toolbar"
              title="Drag to pin the toolbar here"
              className="w-5 h-5 flex items-center justify-center cursor-grab active:cursor-grabbing flex-shrink-0"
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', touchAction: 'none' }}
            >
              <GripVertical size={13} />
            </button>
            <div className="w-px h-4 flex-shrink-0" style={{ backgroundColor: 'var(--hairline)' }} />
            {preHeadingButtons.map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClick}
                aria-label={label}
                title={label}
                className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0 hover:bg-[var(--bg-card-hover)]"
                style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
              >
                <Icon size={14} />
              </button>
            ))}
            <div
              className="relative flex-shrink-0"
              onMouseEnter={openHeadingMenu}
              onMouseLeave={scheduleCloseHeadingMenu}
            >
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHeading('##')}
                aria-label="Heading (hover for H1–H3)"
                title="Heading — hover for levels"
                className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0 hover:bg-[var(--bg-card-hover)]"
                style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
              >
                <Heading2 size={14} />
              </button>
              {headingMenuOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex flex-col gap-0.5 p-1 rounded-xl z-10"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-2)' }}
                >
                  {HEADING_LEVELS.map(({ hashes, icon: Icon, label }) => (
                    <button
                      key={label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyHeading(hashes)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap hover:bg-[var(--bg-card-hover)]"
                      style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {postHeadingButtons.map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClick}
                aria-label={label}
                title={label}
                className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0 hover:bg-[var(--bg-card-hover)]"
                style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
              >
                <Icon size={14} />
              </button>
            ))}
            {pinned && (
              <>
                <div className="w-px h-4 flex-shrink-0" style={{ backgroundColor: 'var(--hairline)' }} />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPinned(false);
                    setPosition(null);
                  }}
                  aria-label="Unpin toolbar"
                  title="Unpin — go back to following the cursor"
                  className="w-6 h-6 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0 hover:bg-[var(--bg-card-hover)]"
                  style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
