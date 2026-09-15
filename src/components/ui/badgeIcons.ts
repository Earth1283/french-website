import { Award, Compass, Croissant, Drama, GraduationCap, HeartPulse, Landmark, Languages } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const BADGE_ICONS: Record<string, LucideIcon> = {
  'croissant-rookie': Croissant,
  'direction-seeker': Compass,
  'false-friend-spotter': Drama,
  'first-aid': HeartPulse,
  'polyglot-apprentice': Languages,
  'a1-certified': GraduationCap,
  'certified-parisien': Landmark,
};

const STAMP_TILTS = [-4, 3, -2, 5, -5, 2, -3];

export function badgeIcon(badgeId: string): LucideIcon {
  return BADGE_ICONS[badgeId] ?? Award;
}

export function stampTilt(index: number): number {
  return STAMP_TILTS[index % STAMP_TILTS.length];
}
