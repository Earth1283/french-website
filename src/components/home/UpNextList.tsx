import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { PathStep } from '../../utils/learningPath';

export interface UpNextItem extends PathStep {
  verb: string;
  why: string | null;
}

export function UpNextList({ items }: { items: UpNextItem[] }) {
  return (
    <>
      <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-2">
        <Sparkles size={12} style={{ color: 'var(--accent)' }} />
        <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted">Up next</p>
      </div>
      {items.map(({ unit, lesson, verb, why }, i) => (
        <Link
          key={lesson.id}
          to={`/unit/${unit.slug}/lesson/${lesson.id}`}
          className="no-underline flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]"
          style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
        >
          <span
            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${unit.color} 14%, transparent)` }}
          >
            {unit.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary truncate">{lesson.title}</p>
            <p className="text-[0.68rem] text-muted truncate">{verb} · {why ?? unit.title}</p>
          </div>
          <ChevronRight size={13} className="text-muted flex-shrink-0 opacity-60" />
        </Link>
      ))}
    </>
  );
}
