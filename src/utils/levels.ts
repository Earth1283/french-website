// XP required to *reach* each level (index = level - 1)
const THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1850, 2500];

export const LEVEL_NAMES: Record<number, string> = {
  1:  'Touriste',
  2:  'Survivant',
  3:  'Débrouillard',
  4:  'Voyageur',
  5:  'Habitué',
  6:  'Parisien en herbe',
  7:  'Connaisseur',
  8:  'Bilingue en devenir',
  9:  'Fluent-ish',
  10: 'Certifié Croissant',
};

export const MAX_LEVEL = THRESHOLDS.length;

export function xpToLevel(xp: number): number {
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export interface LevelProgress {
  level: number;
  name: string;
  currentLevelXP: number; // XP earned within this level
  levelSpan: number;       // total XP needed to complete this level
  isMaxLevel: boolean;
}

export function getLevelProgress(xp: number): LevelProgress {
  const level = xpToLevel(xp);
  const isMaxLevel = level >= MAX_LEVEL;
  const floorXP = THRESHOLDS[level - 1] ?? 0;
  const ceilXP = THRESHOLDS[level] ?? floorXP;
  return {
    level,
    name: LEVEL_NAMES[level] ?? 'Légende',
    currentLevelXP: xp - floorXP,
    levelSpan: isMaxLevel ? 1 : ceilXP - floorXP,
    isMaxLevel,
  };
}
