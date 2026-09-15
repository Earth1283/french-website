import type { CSSProperties } from 'react';
import type { Unit } from '../types';
import { UNITS } from './units';

export type LevelId = 'start' | 'core' | 'further' | 'bonus';

export interface Level {
  id: LevelId;
  name: string;
  tag: string;
  shades: string[];
}

export interface Line {
  unit: Unit;
  number: number;
  level: Level;
  color: string;
}

export const LEVELS: Level[] = [
  { id: 'start', name: 'Getting started', tag: 'Pre-A1', shades: ['start-a', 'start-b'] },
  { id: 'core', name: 'Core French', tag: 'A1', shades: ['core-a', 'core-b', 'core-c'] },
  { id: 'further', name: 'Going further', tag: 'A1–A2', shades: ['further-a', 'further-b'] },
  { id: 'bonus', name: 'Bonus', tag: 'Bonus', shades: ['bonus-a', 'bonus-b', 'bonus-c'] },
];

export function levelOf(unit: Unit): LevelId {
  if (unit.isPreA1) return 'start';
  if (unit.isA1) return 'core';
  if (unit.isA1A2) return 'further';
  return 'bonus';
}

export const LINES: Line[] = LEVELS
  .flatMap(level =>
    UNITS.filter(unit => levelOf(unit) === level.id).map((unit, index) => ({
      unit,
      level,
      color: `var(--line-${level.shades[index % level.shades.length]})`,
    })),
  )
  .map((line, index) => ({ ...line, number: index + 1 }));

const LINE_BY_UNIT = new Map(LINES.map(line => [line.unit.id, line]));

export function lineFor(unit: Unit | string): Line {
  const id = typeof unit === 'string' ? unit : unit.id;
  const line = LINE_BY_UNIT.get(id);
  if (!line) throw new Error(`No line for unit "${id}"`);
  return line;
}

export function lineStyle(line: Line): CSSProperties {
  return { '--line': line.color } as CSSProperties;
}

export function levelStyle(level: Level): CSSProperties {
  return { '--line': `var(--line-${level.shades[0]})` } as CSSProperties;
}
