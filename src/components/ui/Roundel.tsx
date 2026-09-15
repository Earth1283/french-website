import { lineStyle } from '../../data/lines';
import type { Line } from '../../data/lines';

const SIZE_CLASS = {
  sm: 'roundel--sm',
  md: '',
  lg: 'roundel--lg',
  xl: 'roundel--xl',
} as const;

interface RoundelProps {
  line: Line;
  size?: keyof typeof SIZE_CLASS;
  locked?: boolean;
  className?: string;
}

export function Roundel({ line, size = 'md', locked = false, className }: RoundelProps) {
  const classes = ['roundel', SIZE_CLASS[size], locked && 'roundel--locked', className].filter(Boolean).join(' ');
  return (
    <span role="img" aria-label={`Line ${line.number}${locked ? ', locked' : ''}`} className={classes} style={lineStyle(line)}>
      <span aria-hidden="true">{line.number}</span>
    </span>
  );
}
