import { describe, it, expect } from 'vitest';
import { LESSON_META } from './lessonMeta';
import { UNITS } from './units';

const lessonIds = UNITS.flatMap(u => u.lessons.map(l => l.id));

describe('LESSON_META integrity', () => {
  it('tags exactly the built-in lessons', () => {
    expect(Object.keys(LESSON_META).sort()).toEqual([...lessonIds].sort());
  });

  it('only references lessons that exist as prerequisites', () => {
    const known = new Set(lessonIds);
    const broken = Object.entries(LESSON_META).flatMap(([id, m]) =>
      m.prereqs.filter(p => !known.has(p)).map(p => `${id} → ${p}`)
    );
    expect(broken).toEqual([]);
  });

  it('has an acyclic prerequisite graph', () => {
    const state = new Map<string, 'visiting' | 'done'>();
    const cycles: string[] = [];
    const visit = (id: string, trail: string[]) => {
      if (state.get(id) === 'done') return;
      if (state.get(id) === 'visiting') { cycles.push([...trail, id].join(' → ')); return; }
      state.set(id, 'visiting');
      LESSON_META[id]?.prereqs.forEach(p => visit(p, [...trail, id]));
      state.set(id, 'done');
    };
    lessonIds.forEach(id => visit(id, []));
    expect(cycles).toEqual([]);
  });

  it('marks every lesson essential or useful for at least one goal', () => {
    const irrelevant = Object.entries(LESSON_META)
      .filter(([, m]) => Math.max(...Object.values(m.goalWeight)) < 2)
      .map(([id]) => id);
    expect(irrelevant).toEqual([]);
  });
});
