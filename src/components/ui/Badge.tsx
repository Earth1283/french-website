interface BadgeProps {
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
}

export function Badge({ emoji, name, description, earned }: BadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3.5 transition-all ${earned ? '' : 'opacity-45 grayscale'}`}
      style={{
        backgroundColor: earned ? 'var(--bg-card)' : 'var(--bg-inset)',
        border: earned ? '1px solid var(--hairline)' : '1px dashed var(--border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: earned ? 'var(--shadow-1)' : 'none',
      }}
    >
      <span
        className="text-2xl w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0"
        style={{ backgroundColor: earned ? 'var(--accent-tint)' : 'transparent' }}
      >
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-primary">{name}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {earned && (
        <span
          className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--success)' }}
        >
          ✓
        </span>
      )}
    </div>
  );
}
