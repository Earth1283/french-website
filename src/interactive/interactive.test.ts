import { describe, it, expect } from 'vitest';
import { UNITS } from '../data/units';
import { INTERACTIVE_LESSON_IDS, loadInteractive } from './registry';
import { englishOrder, frenchOrder } from './sentence';
import { scrambleTiles } from './primitives/TileBuilder';
import type { Sentence } from './types';

const lessonIds = new Set(UNITS.flatMap(u => u.lessons.map(l => l.id)));

function problems(s: Sentence): string[] {
  const out: string[] = [];
  const ids = s.tokens.map(t => t.id);
  if (new Set(ids).size !== ids.length) out.push('duplicate token ids');
  const known = new Set(ids);
  for (const [lang, order] of [['en', s.en], ['fr', s.fr]] as const) {
    if (!order) continue;
    if (new Set(order).size !== order.length) out.push(`${lang} order repeats a token`);
    for (const id of order) if (!known.has(id)) out.push(`${lang} order has unknown id ${id}`);
    const withText = s.tokens.filter(t => t[lang]).map(t => t.id).sort();
    if (JSON.stringify([...order].sort()) !== JSON.stringify(withText)) out.push(`${lang} order must list exactly the tokens with ${lang} text`);
  }
  for (const id of s.focus ?? []) {
    if (!frenchOrder(s).some(t => t.id === id)) out.push(`focus ${id} is not in the French sentence`);
  }
  if (englishOrder(s).length === 0 || frenchOrder(s).length === 0) out.push('empty sentence');
  return out;
}

describe('interactive registry', () => {
  it('only points at real lessons', () => {
    expect(INTERACTIVE_LESSON_IDS.filter(id => !lessonIds.has(id))).toEqual([]);
  });
});

describe.each(INTERACTIVE_LESSON_IDS)('interactive lesson %s', (lessonId) => {
  it('declares the lesson it belongs to', async () => {
    expect((await loadInteractive(lessonId)).lessonId).toBe(lessonId);
  });

  it('has well-formed sentences in every scene', async () => {
    const lesson = await loadInteractive(lessonId);
    expect(lesson.scenes.length).toBeGreaterThan(0);
    const broken = lesson.scenes.flatMap(scene => [
      ...scene.sentences.flatMap((s, i) => problems(s).map(p => `${scene.id}#${i}: ${p}`)),
      ...problems(scene.check).map(p => `${scene.id} check: ${p}`),
    ]);
    expect(broken).toEqual([]);
  });

  it('scrambles every check into a solvable, not-yet-solved order', async () => {
    const lesson = await loadInteractive(lessonId);
    for (const scene of lesson.scenes) {
      const answer = frenchOrder(scene.check);
      const tiles = scrambleTiles(answer);
      expect(tiles.map(t => t.fr).sort()).toEqual(answer.map(t => t.fr).sort());
      expect(tiles.map(t => t.fr).join(' ')).not.toBe(answer.map(t => t.fr).join(' '));
    }
  });
});
