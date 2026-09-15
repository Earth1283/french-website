import type { LucideIcon } from 'lucide-react';

interface BadgeProps {
  icon: LucideIcon;
  name: string;
  description: string;
  earned: boolean;
  tilt: number;
}

function getTiltClass(tilt: number, earned: boolean): string {
  if (!earned) return '';
  if (tilt <= -4) return '-rotate-6';
  if (tilt === -3 || tilt === -2) return '-rotate-3';
  if (tilt === 2 || tilt === 3) return 'rotate-3';
  if (tilt >= 4) return 'rotate-6';
  return '';
}

export function Badge({ icon: Icon, name, description, earned, tilt }: BadgeProps) {
  const tiltClass = getTiltClass(tilt, earned);

  return (
    <div className={['pstamp', !earned && 'pstamp--locked', tiltClass].filter(Boolean).join(' ')}>
      <Icon size={24} aria-hidden="true" />
      <p className="pstamp__name">{name}</p>
      <p className="pstamp__desc">{description}</p>
      <span className="sr-only">{earned ? 'Earned' : 'Not yet earned'}</span>
    </div>
  );
}
