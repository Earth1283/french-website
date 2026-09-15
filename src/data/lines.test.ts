import { describe, expect, it } from 'vitest';
import { LINES, lineFor } from './lines';
import { UNITS } from './units';

describe('line system', () => {
  it('numbers every unit exactly once, 1 to N in display order', () => {
    expect(LINES).toHaveLength(UNITS.length);
    expect(LINES.map(line => line.number)).toEqual(UNITS.map((_, index) => index + 1));
  });

  it('matches the numbering and colours in docs/DESIGN.md §5.2', () => {
    const table = LINES.map(line => `${line.number} ${line.unit.id} ${line.color}`);
    expect(table).toEqual([
      '1 pronunciation var(--line-start-a)',
      '2 building-blocks var(--line-start-b)',
      '3 emergency var(--line-core-a)',
      '4 food var(--line-core-b)',
      '5 directions var(--line-core-c)',
      '6 numbers var(--line-core-a)',
      '7 greetings var(--line-core-b)',
      '8 shopping var(--line-core-c)',
      '9 accommodation var(--line-core-a)',
      '10 medical var(--line-core-b)',
      '11 smalltalk var(--line-core-c)',
      '12 grammar var(--line-core-a)',
      '13 identity var(--line-further-a)',
      '14 weather var(--line-further-b)',
      '15 plans var(--line-further-a)',
      '16 vie-francaise var(--line-further-b)',
      '17 false-friends var(--line-bonus-a)',
      '18 slang var(--line-bonus-b)',
      '19 trains var(--line-bonus-c)',
      '20 culture var(--line-bonus-a)',
      '21 cinema var(--line-bonus-b)',
    ]);
  });

  it('never uses signal red for a line', () => {
    expect(LINES.every(line => !line.color.includes('signal'))).toBe(true);
  });

  it('finds a line by unit or id', () => {
    expect(lineFor('food').number).toBe(4);
    expect(lineFor(UNITS[0]).number).toBe(1);
  });
});
