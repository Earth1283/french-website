interface MeterProps {
  percent: number;
  label?: string;
  className?: string;
}

const clamp = (percent: number) => Math.max(0, Math.min(100, percent));

export function Meter({ percent, label, className = 'meter' }: MeterProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width={clamp(percent)} height="10" />
    </svg>
  );
}
