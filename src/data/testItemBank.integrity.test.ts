import { describe, it, expect } from 'vitest';
import { ITEM_BANK, DERIVED_ITEMS, resolveTestItemExercise, getTopicMeta } from './testItemBank';
import { AUTHORED_ITEMS } from './authoredTestItems';

describe('ITEM_BANK integrity', () => {
  it('has unique ids across derived + authored items', () => {
    const seen = new Map<string, number>();
    for (const item of ITEM_BANK) seen.set(item.id, (seen.get(item.id) ?? 0) + 1);
    const dupes = [...seen.entries()].filter(([, n]) => n > 1);
    expect(dupes).toEqual([]);
  });

  it('resolves every item to a live exercise without throwing', () => {
    const broken: string[] = [];
    for (const item of ITEM_BANK) {
      try {
        resolveTestItemExercise(item);
      } catch {
        broken.push(item.id);
      }
    }
    expect(broken).toEqual([]);
  });

  it('gives every item a positive discrimination (a > 0)', () => {
    const bad = ITEM_BANK.filter(i => !(i.a > 0)).map(i => i.id);
    expect(bad).toEqual([]);
  });

  it('has a non-empty prompt and answer for every resolved exercise', () => {
    const bad: string[] = [];
    for (const item of ITEM_BANK) {
      const ex = resolveTestItemExercise(item);
      if (!ex.prompt?.trim() || !ex.answer?.trim()) bad.push(item.id);
    }
    expect(bad).toEqual([]);
  });

  it('gives every multiple-choice item options that include the answer exactly once, with no duplicate options', () => {
    const bad: string[] = [];
    for (const item of ITEM_BANK) {
      const ex = resolveTestItemExercise(item);
      if (ex.type !== 'multiple-choice') continue;
      const options = ex.options ?? [];
      const occurrences = options.filter(o => o === ex.answer).length;
      const unique = new Set(options).size;
      if (options.length < 2 || occurrences !== 1 || unique !== options.length) bad.push(item.id);
    }
    expect(bad).toEqual([]);
  });

  it('maps every authored item topic to display metadata', () => {
    const bad = AUTHORED_ITEMS.filter(i => {
      const meta = getTopicMeta(i.topic);
      return meta.title === i.topic; // fallback path in getTopicMeta echoes the raw id
    }).map(i => i.id);
    expect(bad).toEqual([]);
  });

  it('keeps every derived lesson item resolvable to a real lesson/exercise pair', () => {
    const bad = DERIVED_ITEMS.filter(i => !i.sourceRef).map(i => i.id);
    expect(bad).toEqual([]);
  });

  it('gives every multiple-choice item a guessing floor matching 1/numOptions, and no floor to constructed-response items', () => {
    const bad: string[] = [];
    for (const item of ITEM_BANK) {
      const numOptions = resolveTestItemExercise(item).options?.length ?? 0;
      const expected = item.type === 'multiple-choice' ? 1 / numOptions : undefined;
      if (item.c !== expected) bad.push(item.id);
    }
    expect(bad).toEqual([]);
  });
});
