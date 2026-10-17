export function GroupLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="section-label flex items-center gap-1.5">
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      {title}
    </div>
  );
}

export function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inset-row justify-between">
      <div>
        <p className="text-sm font-semibold text-primary">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

