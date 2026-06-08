interface BadgeProps {
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
}

export function Badge({ emoji, name, description, earned }: BadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        earned
          ? 'bg-[--bg-card] border-[--border] opacity-100'
          : 'bg-[--bg] border-dashed border-[--border] opacity-50 grayscale'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-semibold text-sm text-[--text-primary]">{name}</p>
        <p className="text-xs text-[--text-muted]">{description}</p>
      </div>
      {earned && <span className="ml-auto text-xs font-bold text-[--success]">✓</span>}
    </div>
  );
}
