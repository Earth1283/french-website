import { ChevronDown, ChevronUp } from 'lucide-react';
import { TestResultBreakdown } from './TestResultBreakdown';
import type { TestResult } from '../../types';

interface AttemptRowProps {
  result: TestResult;
  delta: number | null;
  expanded: boolean;
  onToggle: () => void;
}

export function AttemptRow({ result, delta, expanded, onToggle }: AttemptRowProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div>
          <p className="text-sm font-semibold text-primary">{result.cefrLevel}</p>
          <p className="text-xs text-muted">
            {new Date(result.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {delta !== null && (
            <span className="text-xs font-semibold" style={{ color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
            </span>
          )}
          {expanded ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-4">
          <TestResultBreakdown result={result} compact />
        </div>
      )}
    </div>
  );
}
