import { useEffect, useRef, useState } from 'react';
import { Timer, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { countWords, isTooShortToAssess } from '../../data/exam/rubric';

// Most learners write on an English keyboard; these are the characters French
// text needs that such a keyboard can't type directly.
const FRENCH_CHARS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'ô', 'î', 'ï', 'ë', 'œ', 'É', 'À', 'Ç', '«', '»', '’'];

interface WritingWorkspaceProps {
  minWords: number;
  timeMinutes: number;
  initialText?: string;
  onDraftChange?: (text: string) => void;
  onSubmit: (text: string, secondsSpent: number) => void;
  submitting?: boolean;
  submitLabel?: string;
}

function formatClock(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '−' : '';
  const s = Math.abs(totalSeconds);
  return `${sign}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function WritingWorkspace({
  minWords,
  timeMinutes,
  initialText = '',
  onDraftChange,
  onSubmit,
  submitting = false,
  submitLabel = 'Submit for marking',
}: WritingWorkspaceProps) {
  const [text, setText] = useState(initialText);
  const [timed, setTimed] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(initialText.length > 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // The clock starts on the first keystroke rather than on page load.
  useEffect(() => {
    if (!started || submitting) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [started, submitting]);

  useEffect(() => {
    if (!onDraftChange) return;
    const id = setTimeout(() => onDraftChange(text), 400);
    return () => clearTimeout(id);
  }, [text, onDraftChange]);

  function update(value: string) {
    setText(value);
    if (!started && value.length > 0) setStarted(true);
  }

  function insert(ch: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = text.slice(0, start) + ch + text.slice(end);
    update(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + ch.length, start + ch.length);
    });
  }

  const words = countWords(text);
  const remaining = timeMinutes * 60 - elapsed;
  const tooShort = isTooShortToAssess(words, minWords);
  const wordColor = words >= minWords ? 'var(--success)' : tooShort ? 'var(--danger)' : 'var(--gold)';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs">
          <span className="chip" style={{ color: wordColor }} aria-live="polite">
            {words} / {minWords} mots
          </span>
          {tooShort && words > 0 && (
            <span className="text-muted">Under {Math.ceil(minWords / 2)} words scores 0 on the real grid</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {timed && (
            <span
              className="chip flex items-center gap-1"
              style={{ color: remaining < 0 ? 'var(--danger)' : remaining < 300 ? 'var(--gold)' : undefined }}
              aria-label="Time remaining"
            >
              <Timer size={12} /> {started ? formatClock(remaining) : `${timeMinutes}:00`}
            </span>
          )}
          <label className="text-xs text-muted flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} /> Timed
          </label>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => update(e.target.value)}
        disabled={submitting}
        rows={Math.min(22, Math.max(8, Math.round(minWords / 12)))}
        lang="fr"
        spellCheck={false}
        placeholder="Écrivez votre texte ici…"
        aria-label="Your text"
        className="ios-input text-[0.95rem] leading-relaxed w-full"
        style={{ resize: 'vertical', fontFamily: 'inherit' }}
      />

      <div className="flex flex-wrap gap-1" aria-label="French characters">
        {FRENCH_CHARS.map(ch => (
          <button
            key={ch}
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => insert(ch)}
            disabled={submitting}
            className="w-8 h-8 text-sm rounded-md cursor-pointer ios-press"
            style={{ backgroundColor: 'var(--bg-inset)', border: '0.5px solid var(--hairline)', color: 'var(--text-primary)' }}
            aria-label={`Insert ${ch}`}
          >
            {ch}
          </button>
        ))}
      </div>

      <Button onClick={() => onSubmit(text.trim(), elapsed)} disabled={submitting || words === 0} className="w-full">
        <Send size={15} /> {submitting ? 'Marking…' : submitLabel}
      </Button>
      <p className="text-[0.7rem] text-muted text-center">
        The spell-checker is off, as it would be on paper.{onDraftChange && ' Your draft is saved on this device as you type.'}
      </p>
    </div>
  );
}
