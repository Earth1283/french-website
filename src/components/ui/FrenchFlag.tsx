interface FrenchFlagProps {
  size?: number;
  className?: string;
}

/** French tricolore as SVG — the 🇫🇷 emoji renders as flat "FR" text on Windows. */
export function FrenchFlag({ size = 24, className }: FrenchFlagProps) {
  const height = Math.round((size * 2) / 3);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 3 2"
      className={className}
      role="img"
      aria-label="French flag"
    >
      <rect width="1" height="2" fill="#0055A4" />
      <rect x="1" width="1" height="2" fill="#FFFFFF" />
      <rect x="2" width="1" height="2" fill="#EF4135" />
    </svg>
  );
}
