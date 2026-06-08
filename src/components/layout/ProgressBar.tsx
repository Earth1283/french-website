interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, color, height = 6, showLabel = false, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[--text-muted] mb-1">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{
            width: `${pct}%`,
            backgroundColor: color ?? 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
